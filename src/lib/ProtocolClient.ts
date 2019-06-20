import * as C from "./Common";
import * as $Events from "@litert/events";
import * as $Net from "net";
import * as E from "./Errors";

interface IWaitQueueItem {

    data: Buffer;

    callback: C.ICallbackA;
}

export class ProtocolClient
extends $Events.EventEmitter<C.IProtocolClientEvents>
implements C.IProtocolClient {

    private _socket!: $Net.Socket;

    private _status: C.EClientStatus = C.EClientStatus.IDLE;

    private _uuidCounter: number = 0;

    private _waitingQueue: IWaitQueueItem[] = [];

    private _execQueue: C.ICallbackA[] = [];

    private _sendingQueue: C.ICallbackA[] = [];

    public constructor(
        public readonly host: string,
        public readonly port: number,
        private _decoder: C.IDecoder,
        private _encoder: C.IEncoder
    ) {
        super();

        this._decoder.on("data", (type, data): void => {

            const cb = this._execQueue.shift() as C.ICallbackA;

            if (type === C.DataType.FAILURE) {

                cb(data.toString());
            }
            else {

                switch (type) {
                case C.DataType.INTEGER:
                    cb(null, parseInt(data));
                    break;
                case C.DataType.MESSAGE:
                    cb(null, data.toString());
                    break;
                case C.DataType.NULL:
                    cb(null, null);
                    break;
                case C.DataType.LIST:
                case C.DataType.STRING:
                    cb(null, data);
                    break;
                }
            }
        });
    }

    public get status(): C.EClientStatus {

        return this._status;
    }

    public connect(cb?: C.ICallbackA<void>): any {

        return wrapPromise((callback): void => {

            if (this._status === C.EClientStatus.READY) {

                callback();

                return;
            }

            this.once("ready", callback as any);

            this._connect();

        }, cb);
    }

    protected _onConnected(callback: C.ICallbackA): void {

        const queue = this._waitingQueue;

        this._waitingQueue = [];

        for (let x of queue) {

            if (this._socket.writable) {

                this._sendingQueue.push(x.callback);

                this._socket.write(
                    x.data,
                    (e) => e ? callback(e) : this._execQueue.push(this._sendingQueue.shift() as any)
                );
            }
        }

        callback();
    }

    private _connect(): void {

        switch (this._status) {

        case C.EClientStatus.CLOSING:
        case C.EClientStatus.IDLE:
            break;
        case C.EClientStatus.CONNECTING:
        case C.EClientStatus.READY:
            return;
        }

        this._socket = $Net.connect({
            host: this.host,
            port: this.port
        });

        // @ts-ignore
        this._socket.__uuid = ++this._uuidCounter;

        this._socket.on("connect", () => {

            // @ts-ignore
            if (this._socket.__uuid !== this._uuidCounter) {

                return;
            }

            this._decoder.reset();

            this._socket.on("data", (data) =>  this._decoder.update(data));

            this._onConnected((): void => {

                this._status = C.EClientStatus.READY;

                this.emit("ready");
            });
        })
        .on("error", (e: any) => {

            // @ts-ignore
            if (this._socket.__uuid !== this._uuidCounter) {

                return;
            }

            this.emit("error", e);
        })
        .on("close", () => {

            // @ts-ignore
            if (this._socket.__uuid !== this._uuidCounter) {

                return;
            }

            const prevSttus = this._status;

            this._status = C.EClientStatus.IDLE;

            for (let x of this._sendingQueue) {

                try {

                    x(new E.E_CONN_LOST());
                }
                catch (e) {

                    this.emit("error", e);
                }
            }

            for (let x of this._execQueue) {

                try {

                    x(new E.E_CONN_LOST());
                }
                catch (e) {

                    this.emit("error", e);
                }
            }

            this._sendingQueue = [];
            this._execQueue = [];

            switch (prevSttus) {
            case C.EClientStatus.CONNECTING:
            case C.EClientStatus.IDLE:
            case C.EClientStatus.CLOSING:
                delete this._socket;
                this.emit("close");
                break;
            case C.EClientStatus.READY:
                this.emit("abort");
                this._connect();
                break;
            }
        });
    }

    public shutdown(cb?: C.ICallbackA<void>): any {

        return wrapPromise((callback): void => {

            if (this._status === C.EClientStatus.IDLE) {

                callback();
                return;
            }

            this.once("close", callback as any);

            this._close();

        }, cb);
    }

    private _close() {

        switch (this._status) {

        case C.EClientStatus.IDLE:
        case C.EClientStatus.CLOSING:
            break;
        case C.EClientStatus.CONNECTING:
        case C.EClientStatus.READY:
            this._socket.end();
            this._status = C.EClientStatus.CLOSING;
            break;
        }
    }

    protected _send(cmd: string, args: any[], cb?: C.ICallbackA): any {

        return wrapPromise((callback): void => {

            const data = this._encoder.encodeCommand(cmd, args);

            this._sendingQueue.push(callback);

            this._socket.write(
                data,
                (e) => e ? callback(e) : this._execQueue.push(this._sendingQueue.shift() as any)
            );

        }, cb);
    }

    public command(cmd: string, args: any[], cb?: C.ICallbackA): any {

        return wrapPromise((callback): void => {

            const data = this._encoder.encodeCommand(cmd, args);

            if (this._status !== C.EClientStatus.READY) {

                this._waitingQueue.push({data, callback});
            }
            else {

                this._sendingQueue.push(callback);

                this._socket.write(
                    data,
                    (e) => e ? callback(e) : this._execQueue.push(this._sendingQueue.shift() as any)
                );
            }

        }, cb);
    }
}

function wrapPromise<R = any, E = any>(
    process: (cb: C.ICallbackA<R, E>) => void,
    callback?: C.ICallbackA<R, E>,
): Promise<any> | void {

    if (callback) {

        process(callback);
    }
    else {

        return new Promise(
            (resolve, reject) => process(
                (e: any, r?: any) => e ? reject(e) : resolve(r)
            )
        );
    }
}
