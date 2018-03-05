/*
   +----------------------------------------------------------------------+
   | LiteRT Redis.js Library                                              |
   +----------------------------------------------------------------------+
   | Copyright (c) 2007-2018 Fenying Studio                               |
   +----------------------------------------------------------------------+
   | This source file is subject to version 2.0 of the Apache license,    |
   | that is bundled with this package in the file LICENSE, and is        |
   | available through the world-wide-web at the following url:           |
   | https://github.com/litert/redis.js/blob/master/LICENSE               |
   +----------------------------------------------------------------------+
   | Authors: Angus Fenying <fenying@litert.org>                          |
   +----------------------------------------------------------------------+
 */
import * as Net from "net";
import * as Core from "@litert/core";
import * as Abstract from "./Abstract";
import Exception from "./Exception";
import * as Constants from "./Constants";
import * as LibEvent from "events";
import * as Network from "./Network";

interface PipeBuffer {

    "data": Buffer;

    "waiter": Core.RawPromise<any, Exception>;
}

export class ProtocolClient
extends LibEvent.EventEmitter
implements Abstract.ProtocolClient {

    protected _status: Abstract.ClientStatus;

    protected _conn!: Net.Socket;

    protected _decoder!: Abstract.Decoder;

    protected _encoder!: Abstract.Encoder;

    protected _port: number;

    protected _host: string;

    protected _pipelining: Abstract.PipelineMode;

    protected _waiters!: Array<Core.RawPromise<any, Exception>>;

    private _buffers!: PipeBuffer[];

    protected _decoderFactory: Abstract.DecoderFactory;

    protected _encoderFactory: Abstract.EncoderFactory;

    public constructor(
        connection: Net.Socket,
        host: string,
        port: number,
        createDecoder: Abstract.DecoderFactory,
        createEncoder: Abstract.EncoderFactory
    ) {

        super();

        this._decoderFactory = createDecoder;
        this._encoderFactory = createEncoder;
        this._pipelining = Abstract.PipelineMode.OFF;
        this._host = host;
        this._port = port;
        this._status = Abstract.ClientStatus.NORMAL;
        this._conn = connection;
        this._encoder = createEncoder();
        this._decoder = createDecoder();
        this._waiters = [];

        this._prepareConnection();
    }

    public get status(): Abstract.ClientStatus {

        return this._status;
    }

    public get host(): string {

        return this._host;
    }

    public get port(): number {

        return this._port;
    }

    public isIdle(): boolean {

        return this._waiters.length === 0;
    }

    public startPipeline(): this {

        if (this._pipelining === Abstract.PipelineMode.OFF) {

            this._pipelining = Abstract.PipelineMode.ON;
            this._buffers = [];
        }

        return this;
    }

    /**
     * Set pipeline to FORCE mode, so that only _stopPipeline method could
     * shut it down.
     */
    protected _forcePipeline(): this {

        this._pipelining = Abstract.PipelineMode.FORCED;

        if (!this._buffers) {

            this._buffers = [];
        }

        return this;
    }

    /**
     * Turn off the pipeline mode, if it's turned on outsides the client.
     */
    public endPipeline(): this {

        if (this._status !== Abstract.ClientStatus.NORMAL ||
            this._pipelining === Abstract.PipelineMode.FORCED
        ) {

            return this;
        }

        return this._stopPipeline();
    }

    /**
     * Turn off the pipeline mode.
     */
    public _stopPipeline(): this {

        if (this._pipelining !== Abstract.PipelineMode.OFF) {

            for (let buf of this._buffers) {

                this._conn.write(buf.data);
                this._waiters.push(buf.waiter);
            }

            this._buffers = [];

            this._pipelining = Abstract.PipelineMode.OFF;
        }

        return this;
    }

    public get pipelineMode(): Abstract.PipelineMode {

        return this._pipelining;
    }

    /**
     * Auto reply the data when command response is parsed.
     *
     * @param type Type of response data.
     * @param data The response data.
     */
    protected _onDecodedData(type: Abstract.DataType, data: any): void {

        let rp = this._waiters.shift();

        if (rp) {

            switch (type) {
            case Abstract.DataType.FAILURE:

                return rp.reject(new Exception(
                    Constants.COMMAND_FAILURE,
                    data.toString()
                ));

            case Abstract.DataType.MESSAGE:

                return rp.resolve(data.toString());

            default:

                return rp.resolve(data);
            }
        }
    }

    protected _prepareConnection(): void {

        this._conn.on("data", this._decoder.update.bind(this._decoder));

        this._conn.on("end", this._onClosed.bind(this));

        this._conn.on("close", this._onClosed.bind(this));

        this._conn.on("error", this._onError.bind(this));

        this._decoder.reset();

        this._decoder.removeAllListeners("data");

        this._decoder.on("data", this._onDecodedData.bind(this));
    }

    protected _onClosed(): void {

        if (this._status === Abstract.ClientStatus.CLOSED ||
            this._status === Abstract.ClientStatus.CONNECTING
        ) {

            return;
        }

        this._conn.destroy();
        delete this._conn;

        /**
         * Clean up all old waiters.
         */
        let waiters = this._waiters;

        this._waiters = [];

        for (let waiter of waiters) {

            waiter.reject(new Exception(
                Constants.NETWORK_FAILURE,
                "Connection to server lost."
            ));
        }

        if (this._status === Abstract.ClientStatus.CLOSING) {

            this._status = Abstract.ClientStatus.CLOSED;
            this.emit("close");
            return;
        }

        this._reconnect();
    }

    protected _reconnect(): void {

        this._status = Abstract.ClientStatus.CONNECTING;

        Network.createTCPConnection(this._host, this._port).then((conn) => {

            if (this._status === Abstract.ClientStatus.CLOSING) {

                conn.destroy();
                this._status = Abstract.ClientStatus.CLOSED;
                return;
            }

            this._conn = conn;
            this._status = Abstract.ClientStatus.NORMAL;
            this._prepareConnection();

            this.emit("reconnected");

            this._onReconnected();

        }).catch((e) => {

            if (this._status === Abstract.ClientStatus.CONNECTING) {

                this._reconnect();
            }
        });
    }

    protected _onReconnected(): void {

        // do something after reconnected event.

        if (this._buffers.length > 0) {

            this._stopPipeline();
        }
    }

    protected _onError(err: NodeJS.ErrnoException): void {

        /**
         * Error ECONNRESET means the connection is closed by peer.
         */
        if (err.code !== "ECONNRESET") {

            /**
             * The socket will be destroyed in error event hereof.
             */
            this.emit("error", new Exception(
                Constants.NETWORK_FAILURE,
                "Network connection failure.",
                err
            ));
        }
        else {

            this._conn.destroy();
        }
    }

    public async execute<T>(
        cmd: string,
        ...values: Array<string | Buffer>
    ): Promise<T> {

        switch (this._status) {
        case Abstract.ClientStatus.CLOSED:
        case Abstract.ClientStatus.CLOSING:

            throw new Exception(
                Constants.NO_CONNECTION,
                "The connection to Redis server lost."
            );

        case Abstract.ClientStatus.CONNECTING:

            this._forcePipeline();
        }

        let ret = new Core.RawPromise<T, Exception>();

        if (this._pipelining !== Abstract.PipelineMode.OFF) {

            this._buffers.push({

                "data": this._encoder.encodeCommand(cmd, values),
                "waiter": ret
            });
        }
        else {

            this._waiters.push(ret);
            this._conn.write(this._encoder.encodeCommand(cmd, values));
        }

        return ret.promise;
    }

    public async executeNow<T>(
        cmd: string,
        ...values: Array<string | Buffer>
    ): Promise<T> {

        switch (this._status) {
        case Abstract.ClientStatus.CLOSED:
        case Abstract.ClientStatus.CLOSING:

            throw new Exception(
                Constants.NO_CONNECTION,
                "The connection to Redis server lost."
            );

        case Abstract.ClientStatus.CONNECTING:

            this.startPipeline();
        }

        let ret = new Core.RawPromise<T, Exception>();

        this._waiters.push(ret);
        this._conn.write(this._encoder.encodeCommand(cmd, values));

        return ret.promise;
    }

    public async close(): Promise<void> {

        /**
         * Onlt this method could set the status to CLOSING.
         */
        if (this._status === Abstract.ClientStatus.NORMAL) {

            let ret = this.execute<string>("QUIT");

            this._status = Abstract.ClientStatus.CLOSING;

            /**
             * The socket will be destroyed in error event hereof.
             */
            try {

                if ("OK" === await ret) {

                    return;
                }
            }
            catch (e) { }

            if (this._conn) {

                this._conn.destroy();
            }
        }

        if (this._status === Abstract.ClientStatus.CONNECTING) {

            this._status = Abstract.ClientStatus.CLOSING;
        }

        return;
    }
}

export default ProtocolClient;
