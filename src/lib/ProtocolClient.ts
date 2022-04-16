/**
 * Copyright 2021 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as C from './Common';
import { Events } from '@litert/observable';
import * as $Net from 'net';
import * as E from './Errors';

interface IQueueItem {

    callback: C.ICallbackA;

    count: number;

    result: any[];
}

interface IPendingQueueItem extends IQueueItem {

    data: Buffer;
}

function wrapPromise<TR = any, TW = any>(
    process: (cb: C.ICallbackA<TR, TW>) => void,
    callback?: C.ICallbackA<TR, TW>,
): Promise<any> | undefined {

    if (callback) {

        process(callback);
        return undefined;
    }
    else {

        return new Promise(
            (resolve, reject) => {
                process(
                    (e: any, r?: any) => {
                        if (e) {
                            reject(e);
                        }
                        else {
                            resolve(r);
                        }
                    }
                );
            }
        );
    }
}

export class ProtocolClient
    extends Events.EventEmitter<C.IProtocolClientEvents>
    implements C.IProtocolClient {

    private _socket!: $Net.Socket;

    private _status: C.EClientStatus = C.EClientStatus.IDLE;

    private _uuidCounter: number = 0;

    private _pendingQueue: IPendingQueueItem[] = [];

    private _executingQueue: IQueueItem[] = [];

    private _sendingQueue: IQueueItem[] = [];

    private readonly _decoder: C.IDecoder;

    private readonly _encoder: C.IEncoder;

    private _ready: boolean = false;

    private readonly _subscribeMode: boolean;

    private readonly _pipelineMode: boolean;

    public readonly host: string;

    public readonly port: number;

    protected _connectTimeout: number;

    protected _commandTimeout: number;

    private _timeoutLocked: boolean = false;

    public constructor(opts: C.IProtocolClientOptions) {

        super();

        this._decoder = opts.decoderFactory();

        this._encoder = opts.encoderFactory();

        this._connectTimeout = opts.connectTimeout;

        this._commandTimeout = opts.commandTimeout;

        this._subscribeMode = opts.subscribeMode;

        this._pipelineMode = opts.pipelineMode;

        this.host = opts.host;

        this.port = opts.port;

        if (this._subscribeMode) {

            this._decoder.on('data', (type, data): void => {

                const it = this._executingQueue.shift()!;

                switch (type) {
                    case C.EDataType.FAILURE:
                        it.callback(new E.E_COMMAND_FAILURE({ 'message': data.toString() }));
                        break;
                    case C.EDataType.INTEGER:
                        it.callback(null, parseInt(data));
                        break;
                    case C.EDataType.MESSAGE:
                        it.callback(null, data.toString());
                        break;
                    case C.EDataType.NULL:
                        it.callback(null, null);
                        break;
                    case C.EDataType.LIST:

                        if (this._subscribeMode) {

                            switch (data[0][1].toString()) {
                                case 'message':

                                    this.emit('message', data[1][1].toString(), data[2][1]);
                                    return;

                                case 'pmessage':

                                    this.emit('message', data[2][1].toString(), data[3][1], data[1][1].toString());
                                    return;

                                default:
                            }
                        }

                        it.callback(null, data);
                        break;

                    case C.EDataType.STRING:
                        it.callback(null, data);
                        break;
                }

                if (!this._executingQueue.length && this._commandTimeout) {

                    this._socket.setTimeout(0);
                }
            });
        }
        else if (this._pipelineMode) {

            this._decoder.on('data', (type, data): void => {

                const item = this._executingQueue[0];

                switch (type) {
                    case C.EDataType.FAILURE:
                        item.result.push(new E.E_COMMAND_FAILURE({ 'message': data.toString() }));
                        break;
                    case C.EDataType.INTEGER:
                        item.result.push(parseInt(data));
                        break;
                    case C.EDataType.MESSAGE:
                        item.result.push(data.toString());
                        break;
                    case C.EDataType.NULL:
                        item.result.push(null);
                        break;
                    case C.EDataType.LIST:
                    case C.EDataType.STRING:
                        item.result.push(data);
                        break;
                }

                if (item.result.length === item.count) {

                    this._executingQueue.shift();
                    item.callback(null, item.result);
                }

                if (!this._executingQueue.length && this._commandTimeout) {

                    this._socket.setTimeout(0);
                }
            });
        }
        else {

            this._decoder.on('data', (type, data): void => {

                const cb = this._executingQueue.shift()!;

                switch (type) {
                    case C.EDataType.FAILURE:
                        cb.callback(new E.E_COMMAND_FAILURE({ 'message': data.toString() }));
                        break;
                    case C.EDataType.INTEGER:
                        cb.callback(null, parseInt(data));
                        break;
                    case C.EDataType.MESSAGE:
                        cb.callback(null, data.toString());
                        break;
                    case C.EDataType.NULL:
                        cb.callback(null, null);
                        break;
                    case C.EDataType.LIST:
                    case C.EDataType.STRING:
                        cb.callback(null, data);
                        break;
                }

                if (!this._executingQueue.length && this._commandTimeout) {

                    this._socket.setTimeout(0);
                }
            });
        }

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

            const helper = function(this: ProtocolClient): void {

                this.removeListener('ready', callback);
                this.removeListener('ready', helper);
                this.removeListener('error', callback);
                this.removeListener('error', helper);
            };

            this.once('ready', callback as any).once('ready', helper);
            this.once('error', callback).once('error', helper);

            this._connect();

        }, cb);
    }

    protected _onConnected(callback: C.ICallbackA): void {

        const queue = this._pendingQueue;

        this._pendingQueue = [];

        for (const x of queue) {

            if (this._socket.writable) {

                this._sendingQueue.push(x);

                this._socket.write(
                    x.data,
                    (e) => {

                        if (e) {

                            callback(e);
                        }
                        else {

                            this._executingQueue.push(this._sendingQueue.shift() as any);
                        }
                    }
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
            case C.EClientStatus.READY:
            case C.EClientStatus.CONNECTING:

                if (this._socket && this._ready) {

                    break;
                }

                return;
        }

        this._socket = $Net.connect({
            host: this.host,
            port: this.port
        });

        this._status = C.EClientStatus.CONNECTING;

        // @ts-expect-error
        this._socket.__uuid = ++this._uuidCounter;

        this._timeoutLocked = false;

        if (this._connectTimeout) {

            this._socket.setTimeout(
                this._connectTimeout,
                () => this._socket.destroy(new E.E_REQUEST_TIMEOUT())
            );
        }

        this._socket.on('connect', () => {

            // @ts-expect-error
            if (this._socket.__uuid !== this._uuidCounter) {

                return;
            }

            this._socket.setTimeout(0);

            this._decoder.reset();

            this._socket.on('data', (data) => this._decoder.update(data));

            this._ready = true;

            this._onConnected((err: unknown): void => {

                if (err) {

                    this.emit('error', err);

                    this._socket.destroy();

                    return;
                }

                this._status = C.EClientStatus.READY;

                this.emit('ready');
            });
        })
            .on('error', (e: any) => {

                // @ts-expect-error
                if (this._socket.__uuid !== this._uuidCounter) {

                    return;
                }

                this.emit('error', e);
            })
            .on('close', () => {

                // @ts-expect-error
                if (this._socket.__uuid !== this._uuidCounter) {

                    return;
                }

                if (!this._ready) {

                    this.emit('close');

                    return;
                }

                for (const x of this._sendingQueue) {

                    try {

                        x.callback(new E.E_CONN_LOST());
                    }
                    catch (e) {

                        this.emit('error', e);
                    }
                }

                for (const x of this._executingQueue) {

                    try {

                        x.callback(new E.E_CONN_LOST());
                    }
                    catch (e) {

                        this.emit('error', e);
                    }
                }

                this._sendingQueue = [];
                this._executingQueue = [];

                switch (this._status) {
                    case C.EClientStatus.IDLE:
                    case C.EClientStatus.CLOSING:
                        this._status = C.EClientStatus.IDLE;
                        this.emit('close');
                        break;
                    case C.EClientStatus.READY:
                        this._status = C.EClientStatus.CONNECTING;
                    // eslint-disable-next-line no-fallthrough
                    case C.EClientStatus.CONNECTING:
                        this.emit('abort');
                        this._connect();
                        break;
                }
            });
    }

    public close(cb?: C.ICallbackA<void>): any {

        return wrapPromise((callback): void => {

            if (this._status === C.EClientStatus.IDLE) {

                callback();
                return;
            }

            this.once('close', callback as any);

            this._close();

        }, cb);
    }

    private _close(): void {

        this._ready = false;

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

            this._sendingQueue.push({ callback, count: 1, result: [] });

            this._socket.write(
                data,
                (e) => {

                    if (e) {
                        callback(e);
                    }
                    else {
                        this._executingQueue.push(this._sendingQueue.shift() as any);
                        this._setTimeout();
                    }
                }
            );

        }, cb);
    }

    protected _sendOnly(cmd: string, args: any[]): Promise<void> {

        return new Promise((resolve, reject) => this._socket.write(
            this._encoder.encodeCommand(cmd, args),
            (e) => {

                if (e) {
                    reject(e);
                }
                else {

                    this._setTimeout();
                    resolve();
                }
            }
        ));
    }

    public command(cmd: string, args: any[], cb?: C.ICallbackA): any {

        return this._command(cmd, args, cb);
    }

    protected _command(cmd: string, args: any[], cb?: C.ICallbackA): any {

        if (this._status === C.EClientStatus.IDLE) {

            throw new E.E_NO_CONN();
        }

        return wrapPromise((callback): void => {

            const data = this._encoder.encodeCommand(cmd, args);

            if (
                this._status !== C.EClientStatus.READY ||
                !this._socket?.writable
            ) {

                this._pendingQueue.push({ data, callback, count: 1, result: [] });
            }
            else {

                this._sendingQueue.push({ callback, count: 1, result: [] });

                this._socket.write(
                    data,
                    (e) => {

                        if (e) {
                            callback(e);
                        }
                        else {
                            this._executingQueue.push(this._sendingQueue.shift() as any);
                            this._setTimeout();
                        }
                    }
                );
            }

        }, cb);
    }

    protected _bulkCommands(cmds: Array<{ cmd: string; args: any[]; }>, cb?: C.ICallbackA): any {

        if (this._status === C.EClientStatus.IDLE) {

            throw new E.E_NO_CONN();
        }

        return wrapPromise((callback): void => {

            const data = Buffer.concat(cmds.map((x) => this._encoder.encodeCommand(x.cmd, x.args)));

            if (
                this._status !== C.EClientStatus.READY ||
                !this._socket?.writable
            ) {

                this._pendingQueue.push({ data, callback, count: cmds.length, result: [] });
            }
            else {

                this._sendingQueue.push({ callback, count: cmds.length, result: [] });

                this._socket.write(
                    data,
                    (e) => {

                        if (e) {
                            callback(e);
                        }
                        else {
                            this._executingQueue.push(this._sendingQueue.shift() as any);
                            this._setTimeout();
                        }
                    }
                );
            }

        }, cb);
    }

    private _setTimeout(): void {

        if (this._commandTimeout && !this._timeoutLocked) {

            this._timeoutLocked = true;
            this._socket.setTimeout(this._commandTimeout, () => this._socket.destroy(new E.E_REQUEST_TIMEOUT()));
        }
    }
}
