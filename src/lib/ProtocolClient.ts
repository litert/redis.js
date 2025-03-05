/* eslint-disable max-lines */
/**
 * Copyright 2024 Angus.Fenying <fenying@litert.org>
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
import { EventEmitter } from 'node:events';
import * as $Net from 'node:net';
import * as E from './Errors';

enum ERequestState {
    PENDING,
    DONE,
    TIMEOUT,
}

interface IQueueItem {

    callback: C.ICallbackA;

    state: ERequestState;

    timeout?: NodeJS.Timeout;
}

interface IQueueBatchItem extends IQueueItem {

    /**
     * How many command responses are expected.
     */
    expected: number;

    result: any[];
}

export class ProtocolClient
    extends EventEmitter
    implements C.IProtocolClient {

    protected readonly _cfg: C.IProtocolClientOptions;

    protected _aclUser!: string;

    protected _passwd!: string;

    protected _db: number = 0;

    private _ready: boolean = false;

    private _executingQueue: IQueueItem[] = [];

    private readonly _decoder: C.IDecoder;

    private readonly _encoder: C.IEncoder;

    public get host(): string {

        return this._cfg.host;
    }

    public get port(): number {

        return this._cfg.port;
    }

    private _socket: $Net.Socket | null = null;

    private _promise4Socket?: Promise<$Net.Socket>;

    public constructor(opts: C.IProtocolClientOptions) {

        super();

        this._cfg = opts;

        this._decoder = opts.decoderFactory();

        this._encoder = opts.encoderFactory();

        switch (this._cfg.mode) {
            case C.EClientMode.SUBSCRIBER: {

                this._decoder.on('data', (type, data): void => {

                    const it = this._executingQueue.shift()!;

                    if (it) {

                        if (it.state !== ERequestState.PENDING) {

                            return;
                        }

                        if (it.timeout) {

                            clearTimeout(it.timeout);
                        }
                    }

                    switch (type) {
                        case C.EDataType.LIST:

                            switch (data[0][1].toString()) {
                                case 'message':

                                    this.emit('message', data[1][1].toString(), data[2][1]);
                                    return;

                                case 'pmessage':

                                    this.emit('message', data[2][1].toString(), data[3][1], data[1][1].toString());
                                    return;

                                default:
                            }

                            it.callback(null, data);
                            break;
                        case C.EDataType.FAILURE:
                            it.callback(new E.E_COMMAND_FAILURE(data.toString()));
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
                        case C.EDataType.STRING:
                            it.callback(null, data);
                            break;
                    }
                });
                break;
            }
            case C.EClientMode.PIPELINE: {

                this._decoder.on('data', (type, data): void => {

                    const i = this._executingQueue[0] as IQueueBatchItem;

                    if (!i.result) {

                        this._executingQueue.shift();

                        if (i.state !== ERequestState.PENDING) {

                            return;
                        }

                        if (i.timeout) {

                            clearTimeout(i.timeout);
                        }

                        switch (type) {
                            case C.EDataType.FAILURE:
                                i.callback(new E.E_COMMAND_FAILURE(data.toString()));
                                break;
                            case C.EDataType.INTEGER:
                                i.callback(null, parseInt(data));
                                break;
                            case C.EDataType.MESSAGE:
                                i.callback(null, data.toString());
                                break;
                            case C.EDataType.NULL:
                                i.callback(null, null);
                                break;
                            case C.EDataType.LIST:
                            case C.EDataType.STRING:
                                i.callback(null, data);
                                break;
                        }

                        return;
                    }

                    const offset = i.result.length - i.expected--;

                    switch (type) {
                        case C.EDataType.FAILURE:
                            i.result[offset] = new E.E_COMMAND_FAILURE(data.toString());
                            break;
                        case C.EDataType.INTEGER:
                            i.result[offset] = parseInt(data);
                            break;
                        case C.EDataType.MESSAGE:
                            i.result[offset] = data.toString();
                            break;
                        case C.EDataType.NULL:
                            i.result[offset] = null;
                            break;
                        case C.EDataType.LIST:
                        case C.EDataType.STRING:
                            i.result[offset] = data;
                            break;
                    }

                    if (!i.expected) {

                        this._executingQueue.shift();

                        if (i.state === ERequestState.PENDING) {

                            i.callback(null, i.result);
                            i.state = ERequestState.DONE;

                            if (i.timeout) {

                                clearTimeout(i.timeout);
                            }
                        }
                    }
                });
                break;
            }
            case C.EClientMode.SIMPLE: {

                this._decoder.on('data', (type, data): void => {

                    const i = this._executingQueue.shift()!;

                    if (i.state !== ERequestState.PENDING) {

                        return;
                    }

                    if (i.timeout) {

                        clearTimeout(i.timeout);
                    }

                    switch (type) {
                        case C.EDataType.FAILURE:
                            i.callback(new E.E_COMMAND_FAILURE(data.toString()));
                            break;
                        case C.EDataType.INTEGER:
                            i.callback(null, parseInt(data));
                            break;
                        case C.EDataType.MESSAGE:
                            i.callback(null, data.toString());
                            break;
                        case C.EDataType.NULL:
                            i.callback(null, null);
                            break;
                        case C.EDataType.LIST:
                        case C.EDataType.STRING:
                            i.callback(null, data);
                            break;
                    }

                });
                break;
            }
        }
    }

    /**
     * Use an existing socket or create a new one.
     */
    protected async _getConnection(): Promise<$Net.Socket> {

        if (this._socket) {

            return this._socket;
        }

        if (this._promise4Socket) {

            return this._promise4Socket;
        }

        return this._promise4Socket = this._redisConnect();
    }

    private async _redisConnect(): Promise<$Net.Socket> {

        try {

            this._socket = (await this._netConnect(this.host, this.port, this._cfg.connectTimeout))
                .on('close', () => {

                    this._socket = null;
                    this._ready = false;
                    this._decoder.reset();

                    const deadItems = this._executingQueue;

                    this._executingQueue = [];

                    /**
                     * Reject all promises of pending commands.
                     */
                    for (const x of deadItems) {

                        try {

                            x.callback(new E.E_CONN_LOST());
                        }
                        catch (e) {

                            this.emit('error', e);
                        }
                    }

                    this.emit('close');
                })
                .on('error', (e: unknown) => {

                    this.emit('error', e);
                })
                .on('data', (data) => this._decoder.update(data));

            if (!this._ready) {

                this._ready = true;

                try {

                    if (this._passwd) {

                        await this.auth(this._passwd, this._aclUser);
                    }

                    if (this._db) {

                        await this.select(this._db);
                    }
                }
                catch (e) {

                    this.close();

                    throw e;
                }

                this.emit('ready');
            }

            return this._socket;
        }
        finally {

            delete this._promise4Socket;
        }
    }

    public async auth(password: string, username?: string): Promise<void> {

        if (username) {

            await this._command('AUTH', [username, password]);

            this._aclUser = username;
        }
        else {

            await this._command('AUTH', [password]);
        }

        this._passwd = password;
    }

    public async select(db: number): Promise<void> {

        await this._command('SELECT', [db]);

        this._db = db;
    }

    /**
     * Create a network socket and make it connect to the server.
     *
     * @param {string} host     The host of server.
     * @param {number} port     The port of server.
     * @param {number} timeout  The timeout for the connecting to server.
     * @returns {Promise<$Net.Socket>}
     */
    private _netConnect(
        host: string,
        port: number,
        timeout: number
    ): Promise<$Net.Socket> {

        return new Promise<$Net.Socket>((resolve, reject) => {

            const socket = new $Net.Socket();

            socket.on('connect', () => {

                // return a clean socket here
                socket.removeAllListeners();
                socket.setTimeout(0);
                resolve(socket);
            });

            socket.on('error', (e) => {

                reject(new E.E_CONNECT_FAILED(e));
            });

            socket.connect(port, host);

            socket.setTimeout(timeout, () => {

                socket.destroy(new E.E_CONNECT_TIMEOUT());
            });
        });
    }

    public connect(cb?: C.ICallbackA<void>): any {

        return this._unifyAsync(async (callback) => {

            await this._getConnection();

            callback(null);

        }, cb);
    }

    public close(cb?: C.ICallbackA<void>): any {

        if (this._socket) {

            this._socket.end();

            if (cb) {

                this.once('close', cb);
            }
        }
        else {

            cb?.();
        }
    }

    /**
     * Make async process same in both callback and promise styles.
     * @param fn    The body of async process
     * @param cb    The optional callback function if not promise style.
     * @returns     Return a promise if cb is not provided.
     */
    private _unifyAsync(fn: (resolve: C.ICallbackA) => Promise<any>, cb?: C.ICallbackA): Promise<any> | undefined {

        if (cb) {

            try {

                fn(cb).catch(cb);
            }
            catch (e) {

                /**
                 * fn() itself may throw an error if not an async function.
                 */
                cb(e);
            }

            return;
        }
        else {

            return new Promise((resolve, reject) => {

                try {

                    fn((e, v?) => {

                        if (e) {

                            reject(e);
                        }
                        else {

                            resolve(v);
                        }

                    }).catch(reject);
                }
                catch (e) {

                    /**
                     * fn() itself may throw an error if not an async function.
                     */
                    reject(e);
                }
            });
        }
    }

    public command(cmd: string, args: any[], cb?: C.ICallbackA): any {

        return this._command(cmd, args, cb);
    }

    protected _checkQueueSize(): void {

        if (this._cfg.queueSize && this._executingQueue.length >= this._cfg.queueSize) {

            if (this._cfg.actionOnQueueFull === 'error') {

                throw new E.E_COMMAND_QUEUE_FULL();
            }

            this._socket!.destroy(new E.E_COMMAND_QUEUE_FULL());
        }
    }

    protected _command(cmd: string, args: any[], cb?: C.ICallbackA): any {

        return this._unifyAsync(async (callback) => {

            this._checkQueueSize();

            const socket = this._socket ?? await this._getConnection();

            socket.write(this._encoder.encodeCommand(cmd, args));

            const handle: IQueueItem = {
                callback,
                state: ERequestState.PENDING,
            };

            this._executingQueue.push(handle);

            if (this._cfg.commandTimeout > 0) {

                this._setTimeoutForRequest(handle, () => new E.E_COMMAND_TIMEOUT({
                    mode: 'mono', cmd, argsQty: args.length
                }));
            }

        }, cb);
    }

    protected _bulkCommands(cmdList: Array<{ cmd: string; args: any[]; }>, cb?: C.ICallbackA): any {

        return this._unifyAsync(async (callback) => {

            this._checkQueueSize();

            const socket = this._socket ?? await this._getConnection();

            socket.write(Buffer.concat(cmdList.map((x) => this._encoder.encodeCommand(x.cmd, x.args))));

            const handle: IQueueBatchItem = {
                callback,
                expected: cmdList.length,
                state: ERequestState.PENDING,
                result: new Array(cmdList.length),
            };

            this._executingQueue.push(handle);

            if (this._cfg.commandTimeout > 0) {

                this._setTimeoutForRequest(handle, () => new E.E_COMMAND_TIMEOUT({
                    mode: 'bulk', cmdQty: handle.expected
                }));
            }

        }, cb);
    }

    protected async _commitExec(qty: number): Promise<any> {

        return this._unifyAsync(async (callback) => {

            const socket = this._socket ?? await this._getConnection();

            socket.write(this._encoder.encodeCommand('EXEC', []));

            const handle: IQueueBatchItem = {
                callback,
                expected: qty,
                state: ERequestState.PENDING,
                result: [],
            };

            this._executingQueue.push(handle);

            if (this._cfg.commandTimeout > 0) {

                this._setTimeoutForRequest(handle, () => new E.E_COMMAND_TIMEOUT({
                    mode: 'bulk', cmdQty: handle.expected
                }));
            }
        });
    }

    private _setTimeoutForRequest(handle: IQueueItem, mkError: () => Error): void {

        handle.timeout = setTimeout(() => {

            delete handle.timeout;

            switch (handle.state) {
                case ERequestState.PENDING:
                    handle.state = ERequestState.TIMEOUT;
                    handle.callback(mkError());
                    break;
                case ERequestState.DONE:
                case ERequestState.TIMEOUT:
                default:
                    break;
            }

        }, this._cfg.commandTimeout);
    }
}
