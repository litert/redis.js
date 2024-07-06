/**
 * Copyright 2023 Angus.Fenying <fenying@litert.org>
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

export type IFn<TArgs extends any[], TRet> = (...args: TArgs) => TRet;

export type IVoidFn<TArgs extends any[]> = IFn<TArgs, void>;

export type IfIsOfFn<T, TFn extends IFn<any[], any>, TTrue = T, TFalse = never> = T extends TFn ? TTrue : TFalse;

export interface IEventListener<T extends IDefaultEvents> {

    /**
     * Register a listener for the given event.
     *
     * > Alias for `addListener()`.
     *
     * @param event         The event name.
     * @param listener      The listener function.
     */
    on<TKey extends keyof T>(event: TKey, listener: IfIsOfFn<T[TKey], IVoidFn<any[]>>): this;

    /**
     * Register a listener for the given event.
     *
     * > Alias for `addListener()`.
     *
     * @param event         The event name.
     * @param listener      The listener function.
     */
    on(event: string | symbol, listener: IVoidFn<any[]>): this;

    /**
     * Register a one-time listener for the given event.
     *
     * > The listener is invoked only the next time the event is fired, after which it is removed.
     *
     * @param event         The event name.
     * @param listener      The listener function.
     */
    once<TKey extends keyof T>(event: TKey, listener: IfIsOfFn<T[TKey], IVoidFn<any[]>>): this;

    /**
     * Register a one-time listener for the given event.
     *
     * > The listener is invoked only the next time the event is fired, after which it is removed.
     *
     * @param event         The event name.
     * @param listener      The listener function.
     */
    once(event: string | symbol, listener: IVoidFn<any[]>): this;

    /**
     * Register a listener for the given event.
     *
     * > Alias for `on()`.
     *
     * @param event         The event name.
     * @param listener      The listener function.
     */
    addListener<TKey extends keyof T>(event: TKey, listener: IfIsOfFn<T[TKey], IVoidFn<any[]>>): this;

    /**
     * Register a listener for the given event.
     *
     * > Alias for `on()`.
     *
     * @param event         The event name.
     * @param listener      The listener function.
     */
    addListener(event: string | symbol, listener: IVoidFn<any[]>): this;

    /**
     * Remove the given listener for the given event.
     *
     * > Alias for `off()`.
     *
     * @param event     The event name.
     * @param listener  The listener function.
     */
    removeListener<TKey extends keyof T>(event: TKey, listener: IVoidFn<any[]>): this;

    /**
     * Remove the given listener for the given event.
     *
     * > Alias for `off()`.
     *
     * @param event     The event name.
     * @param listener  The listener function.
     */
    removeListener(event: string | symbol, listener: IVoidFn<any[]>): this;

    /**
     * Remove the given listener for the given event.
     *
     * > Alias for `removeListener()`.
     *
     * @param event     The event name.
     * @param listener  The listener function.
     */
    off<TKey extends keyof T>(event: TKey, listener: IVoidFn<any[]>): this;

    /**
     * Remove the given listener for the given event.
     *
     * > Alias for `removeListener()`.
     *
     * @param event     The event name.
     * @param listener  The listener function.
     */
    off(event: string | symbol, listener: IVoidFn<any[]>): this;

    /**
     * Remove all listeners for the given event.
     *
     * @param event     The event name.
     */
    removeAllListeners(event: keyof T): this;

    /**
     * Remove all listeners for the given event.
     *
     * @param event     The event name.
     */
    removeAllListeners(event: string): this;

    /**
     * Return the number of listeners for the given event.
     *
     * @param event     The event name.
     */
    listenerCount(event: keyof T): number;

    /**
     * Return the number of listeners for the given event.
     *
     * @param event     The event name.
     */
    listenerCount(event: string): number;

    /**
     * Set the maximum number of listeners for the given event.
     *
     * @param n     The new value of maximum listeners number.
     */
    setMaxListeners(n: number): this;
}

export interface IDefaultEvents {

    error(error: unknown): void;
}

export type TStringValue = string | Buffer;

export type TResponseType<
    T extends 'list' | 'string' | 'integer' | 'message',
    TE
> =
    T extends 'list' ? TE[] :
    T extends 'string' ? string | Buffer :
    T extends 'integer' ? number : string;

export interface IProtocolClientEvents extends IDefaultEvents {

    ready(): void;

    close(): void;

    message(channel: string, data: Buffer, pattern?: string): void;
}

export interface ICallbackA<TR = any, TE = any> {
    (err?: TE): void;
    (err: null, result: TR): void;
}

/**
 * The client only provides the basic connection and communication over Redis
 * protocol.
 */
export interface IProtocolClient extends IEventListener<IProtocolClientEvents> {

    /**
     * Start a connection to remote server.
     *
     * > This method is not required anymore, since the command request will always try connecting
     * > to Redis server when there is no available socket.
     */
    connect(): Promise<void>;

    connect(callback: ICallbackA<void>): void;

    /**
     * Close the connection to remote server.
     */
    close(): Promise<void>;

    close(callback: ICallbackA<void>): void;

    /**
     * Send a command to remote server.
     *
     * @param cmd   The command
     * @param args  The arguments of the command.
     */
    command(cmd: string, args: TStringValue[]): Promise<any>;

    command(cmd: string, args: TStringValue[], callback: ICallbackA): void;
}

export enum EDataType {

    /**
     * The type of byte-string.
     */
    STRING,

    /**
     * The type of list.
     */
    LIST,

    /**
     * The type of message.
     */
    MESSAGE,

    /**
     * The type of failure.
     */
    FAILURE,

    /**
     * The type of integer.
     */
    INTEGER,

    /**
     * The type of null.
     */
    NULL
}

export type ListItem<T = any> = [ EDataType, T ];

/**
 * This interface describes the structure of a Redis protocol encoder.
 */
export interface IEncoder {

    /**
     * Encode the NULL.
     */
    encodeNull(): Buffer;

    /**
     * Encode a command request into a binary chunk.
     *
     * @param cmd       The name of COMMAND to be encoded.
     * @param args      The arguments of the command to be encoded.
     */
    encodeCommand(cmd: string | Buffer, args?: Array<string | Buffer>): Buffer;

    /**
     * Encode a binary-string into a string chunk.
     *
     * @param data      The data to be encoded.
     */
    encodeString(data: string | Buffer): Buffer;

    /**
     * Encode a message into a message chunk.
     *
     * @param data      The message to be encoded.
     */
    encodeMessage(data: string | Buffer): Buffer;

    /**
     * Encode a message into a integer chunk.
     *
     * @param val       The integer to be encoded.
     */
    encodeInteger(val: number): Buffer;

    /**
     * Encode a list into a list chunk.
     *
     * @param data      The list to be encoded.
     */
    encodeList(data: ListItem[]): Buffer;
}

export interface IDecoderEvents extends IDefaultEvents {

    data(type: EDataType, data: any): void;
}

export interface IDecoder extends IEventListener<IDecoderEvents> {

    /**
     * Reset the decoder.
     */
    reset(): this;

    /**
     * Write data to the decoding stream.
     *
     * @param data      The new data to be decoded.
     */
    update(data: Buffer): this;
}

export interface IScanResult<T> {

    nextCursor: number;

    items: T[];
}

export interface ICommandAPIs {

    /**
     * Command: append
     * @see https://redis.io/docs/latest/commands/append
     */
    append(key: string, value: string | Buffer): Promise<number>;

    /**
     * Command: auth
     * @see https://redis.io/docs/latest/commands/auth
     */
    auth(password: string, username?: string): Promise<void>;

    /**
     * Command: ping
     * @see https://redis.io/docs/latest/commands/ping
     */
    ping(text?: string): Promise<string>;

    /**
     * Command: time
     *
     * > Return Redis server in 2 parts of seconds and microseconds.
     *
     * @see https://redis.io/docs/latest/commands/time
     */
    time(): Promise<Record<'secPart' | 'usPart', number>>;

    /**
     * Command: time
     *
     * > Return Redis server time as milliseconds.
     *
     * @see https://redis.io/docs/latest/commands/time
     */
    msTime(): Promise<number>;

    /**
     * Command: time
     *
     * > Return Redis server time as seconds.
     *
     * @see https://redis.io/docs/latest/commands/time
     */
    secTime(): Promise<number>;

    /**
     * Command: time
     *
     * > Return Redis server time as microseconds.
     *
     * @see https://redis.io/docs/latest/commands/time
     */
    usTime(): Promise<number>;

    /**
     * Command: incr
     * @see https://redis.io/docs/latest/commands/incr
     */
    incr(key: string, step?: number): Promise<number>;

    /**
     * Command: incrByFloat
     * @see https://redis.io/docs/latest/commands/incrbyfloat
     */
    incrByFloat(key: string, step: number): Promise<number>;

    /**
     * Command: decr
     * @see https://redis.io/docs/latest/commands/decr
     */
    decr(key: string, step?: number): Promise<number>;

    /**
     * Command: incrByFloat
     * @see https://redis.io/docs/latest/commands/incrbyfloat
     */
    decrByFloat(key: string, step: number): Promise<number>;

    /**
     * Command: del
     * @see https://redis.io/docs/latest/commands/del
     */
    del(keys: string | string[]): Promise<number>;

    /**
     * Command: unlink
     * @see https://redis.io/docs/latest/commands/unlink
     */
    unlink(keys: string | string[]): Promise<number>;

    /**
     * Command: get
     * @see https://redis.io/docs/latest/commands/get
     */
    get(key: string): Promise<string | null>;

    /**
     * Command: get
     * @see https://redis.io/docs/latest/commands/get
     */
    get$(key: string): Promise<Buffer | null>;

    /**
     * Command: getdel
     * @see https://redis.io/docs/latest/commands/getdel
     * @since v6.2.0
     */
    getAndDel(key: string): Promise<string | null>;

    /**
     * Command: getdel
     * @see https://redis.io/docs/latest/commands/getdel
     * @since v6.2.0
     */
    getAndDel$(key: string): Promise<Buffer | null>;

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     * @since v6.2.0
     */
    getAndPersist(key: string): Promise<string | null>;

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     * @since v6.2.0
     */
    getAndPersist$(key: string): Promise<Buffer | null>;

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     * @since v6.2.0
     */
    getEx(key: string, ttl: number): Promise<string | null>;

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     * @since v6.2.0
     */
    getEx$(key: string, ttl: number): Promise<Buffer | null>;

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     * @since v6.2.0
     */
    getExAt(key: string, at: number): Promise<string | null>;

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     * @since v6.2.0
     */
    getExAt$(key: string, at: number): Promise<Buffer | null>;

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     * @since v6.2.0
     */
    getPEx(key: string, ttl: number): Promise<string | null>;

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     * @since v6.2.0
     */
    getPEx$(key: string, ttl: number): Promise<Buffer | null>;

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     * @since v6.2.0
     */
    getPExAt(key: string, at: number): Promise<string | null>;

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     * @since v6.2.0
     */
    getPExAt$(key: string, at: number): Promise<Buffer | null>;

    /**
     * Command: getSet
     * @see https://redis.io/docs/latest/commands/getset
     * @deprecated since v6.2.0
     */
    getSet(key: string, value: string): Promise<string | null>;

    /**
     * Command: getSet
     * @see https://redis.io/docs/latest/commands/getset
     * @deprecated since v6.2.0
     */
    getSet$(key: string, value: Buffer): Promise<Buffer | null>;

    /**
     * Command: set
     * @see https://redis.io/docs/latest/commands/set
     */
    set(key: string, value: string | Buffer, ttl?: number): Promise<boolean>;

    /**
     * Command: setNX
     * @see https://redis.io/docs/latest/commands/setnx
     */
    setNX(key: string, value: string | Buffer, ttl?: number): Promise<boolean>;

    /**
     * Command: setEX
     * @see https://redis.io/docs/latest/commands/setex
     */
    setEX(key: string, value: string | Buffer, ttl: number): Promise<boolean>;

    /**
     * Command: pSetNX
     * @see https://redis.io/docs/latest/commands/set
     */
    pSetNX(key: string, value: string | Buffer, ttl?: number): Promise<boolean>;

    /**
     * Command: pSetEx
     * @see https://redis.io/docs/latest/commands/psetex
     */
    pSetEx(key: string, value: string | Buffer, ttl: number): Promise<boolean>;

    /**
     * Command: replace
     * @see https://redis.io/docs/latest/commands/set
     */
    replace(key: string, value: string | Buffer, ttl?: number): Promise<boolean>;

    /**
     * Command: pReplace
     * @see https://redis.io/docs/latest/commands/set
     */
    pReplace(key: string, value: string | Buffer, ttl: number): Promise<boolean>;

    /**
     * Command: ttl
     * @see https://redis.io/docs/latest/commands/ttl
     */
    ttl(key: string): Promise<number>;

    /**
     * Command: pTTL
     * @see https://redis.io/docs/latest/commands/pttl
     */
    pTTL(key: string): Promise<number>;

    /**
     * Command: expire
     * @see https://redis.io/docs/latest/commands/expire
     */
    expire(key: string, ttl: number): Promise<boolean>;

    /**
     * Command: pExpire
     * @see https://redis.io/docs/latest/commands/pexpire
     */
    pExpire(key: string, ttl: number): Promise<boolean>;

    /**
     * Command: expireAt
     * @see https://redis.io/docs/latest/commands/expireat
     */
    expireAt(key: string, ttl: number): Promise<boolean>;

    /**
     * Command: pExpireAt
     * @see https://redis.io/docs/latest/commands/pexpireat
     */
    pExpireAt(key: string, ttl: number): Promise<boolean>;

    /**
     * Command: persist
     * @see https://redis.io/docs/latest/commands/persist
     */
    persist(key: string): Promise<boolean>;

    /**
     * Command: exists
     * @see https://redis.io/docs/latest/commands/exists
     */
    exists(key: string): Promise<boolean>;

    /**
     * Command: exists
     * @see https://redis.io/docs/latest/commands/exists
     */
    mExists(keys: string[]): Promise<number>;

    /**
     * Command: type
     * @see https://redis.io/docs/latest/commands/type
     */
    type(key: string): Promise<string>;

    /**
     * Command: move
     * @see https://redis.io/docs/latest/commands/move
     */
    move(key: string, db: number): Promise<boolean>;

    /**
     * Command: swapdb
     * @see https://redis.io/docs/latest/commands/swapdb
     */
    swapDB(dbA: number, dbB: number): Promise<boolean>;

    /**
     * Command: swapdb
     * @see https://redis.io/docs/latest/commands/swapdb
     *
     * @param destDB    Specify an alternate destination db instead of db selected by current connection.
     * @param overwrite Overwrite existing destination key. [Default: false]
     */
    copy(srcKey: string, destKey: string, destDB?: number | null, overwrite?: boolean): Promise<boolean>;

    /**
     * Command: randomKey
     * @see https://redis.io/docs/latest/commands/randomkey
     */
    randomKey(): Promise<string | null>;

    /**
     * Command: rename
     * @see https://redis.io/docs/latest/commands/rename
     */
    rename(from: string, to: string): Promise<void>;

    /**
     * Command: renameNX
     * @see https://redis.io/docs/latest/commands/renamenx
     */
    renameNX(from: string, to: string): Promise<boolean>;

    /**
     * Command: select
     * @see https://redis.io/docs/latest/commands/select
     */
    select(db: number): Promise<void>;

    /**
     * Command: flushDb
     * @see https://redis.io/docs/latest/commands/flushdb
     */
    flushDb(async?: boolean): Promise<void>;

    /**
     * Command: flushAll
     * @see https://redis.io/docs/latest/commands/flushall
     */
    flushAll(async?: boolean): Promise<void>;

    /**
     * Command: hDel
     * @see https://redis.io/docs/latest/commands/hdel
     */
    hDel(key: string, fields: string | string[]): Promise<number>;

    /**
     * Command: hGet
     * @see https://redis.io/docs/latest/commands/hget
     */
    hGet(key: string, fields: string): Promise<string | null>;

    /**
     * Command: hGet
     * @see https://redis.io/docs/latest/commands/hget
     */
    hGet$(key: string, field: string): Promise<Buffer | null>;

    /**
     * Command: hSet
     * @see https://redis.io/docs/latest/commands/hset
     */
    hSet(key: string, field: string, value: string | Buffer): Promise<boolean>;

    /**
     * Command: hSetNX
     * @see https://redis.io/docs/latest/commands/hsetnx
     */
    hSetNX(key: string, field: string, value: string | Buffer): Promise<boolean>;

    /**
     * Command: hrandfield
     * @see https://redis.io/docs/latest/commands/hrandfield
     */
    hRandField(key: string, count: number): Promise<string[]>;

    /**
     * Command: hrandfield
     * @see https://redis.io/docs/latest/commands/hrandfield
     */
    hRandField$(key: string, count: number): Promise<Buffer[]>;

    /**
     * Command: hrandfield with values returning.
     * @see https://redis.io/docs/latest/commands/hrandfield
     */
    hRandFieldWithValues(key: string, count: number): Promise<Record<string, string>>;

    /**
     * Command: hrandfield with values returning.
     * @see https://redis.io/docs/latest/commands/hrandfield
     */
    hRandFieldWithValues$(key: string, count: number): Promise<Record<string, Buffer>>;

    /**
     * Command: hExists
     * @see https://redis.io/docs/latest/commands/hexists
     */
    hExists(key: string, field: string): Promise<boolean>;

    /**
     * Command: keys
     * @see https://redis.io/docs/latest/commands/keys
     */
    keys(pattern: string): Promise<string[]>;

    /**
     * Command: dump
     * @see https://redis.io/docs/latest/commands/dump
     */
    dump(key: string): Promise<Buffer | null>;

    /**
     * Command: restore
     * @see https://redis.io/docs/latest/commands/restore
     */
    restore(
        key: string,
        value: Buffer,
        ttl?: number,
        replace?: boolean,
        absTTL?: boolean,
        freq?: number,
        idleTime?: number
    ): Promise<void>;

    /**
     * Command: strLen
     * @see https://redis.io/docs/latest/commands/strlen
     */
    strLen(key: string): Promise<number>;

    /**
     * Command: touch
     * @see https://redis.io/docs/latest/commands/touch
     */
    touch(keys: string | string[]): Promise<number>;

    /**
     * Command: mGet
     * @see https://redis.io/docs/latest/commands/mget
     */
    mGet(keys: string | string[]): Promise<Record<string, string | null>>;

    /**
     * Command: mGet
     * @see https://redis.io/docs/latest/commands/mget
     */
    mGet$(key: string | string[]): Promise<Record<string, Buffer | null>>;

    /**
     * Command: mSet
     * @see https://redis.io/docs/latest/commands/mset
     */
    mSet(kv: Record<string, string | Buffer>): Promise<void>;

    /**
     * Command: mSetNX
     * @see https://redis.io/docs/latest/commands/msetnx
     */
    mSetNX(kv: Record<string, string | Buffer>): Promise<boolean>;

    /**
     * Command: hIncr
     * @see https://redis.io/docs/latest/commands/hincrby
     */
    hIncr(key: string, field: string, step?: number): Promise<number>;

    /**
     * Command: hIncr
     * @see https://redis.io/docs/latest/commands/hincrbyfloat
     */
    hIncrByFloat(key: string, field: string, step: number): Promise<number>;

    /**
     * Command: hIncr
     * @see https://redis.io/docs/latest/commands/hincrby
     */
    hDecr(key: string, field: string, step?: number): Promise<number>;

    /**
     * Command: hIncr
     * @see https://redis.io/docs/latest/commands/hincrbyfloat
     */
    hDecrByFloat(key: string, field: string, step: number): Promise<number>;

    /**
     * Command: hKeys
     * @see https://redis.io/docs/latest/commands/hkeys
     */
    hKeys(key: string): Promise<string[]>;

    /**
     * Command: hVals
     * @see https://redis.io/docs/latest/commands/hvals
     */
    hVals(key: string): Promise<string[]>;

    /**
     * Command: hVals
     * @see https://redis.io/docs/latest/commands/hvals
     */
    hVals$(key: string): Promise<Buffer[]>;

    /**
     * Command: hLen
     * @see https://redis.io/docs/latest/commands/hlen
     */
    hLen(key: string): Promise<number>;

    /**
     * Command: hMGet
     * @see https://redis.io/docs/latest/commands/hmget
     */
    hMGet(key: string, fields: string | string[]): Promise<Record<string, string | null>>;

    /**
     * Command: hGetAll
     * @see https://redis.io/docs/latest/commands/hgetall
     */
    hGetAll(key: string): Promise<Record<string, string | null>>;

    /**
     * Command: hGetAll
     * @see https://redis.io/docs/latest/commands/hgetall
     */
    hGetAll$(key: string): Promise<Record<string, Buffer | null>>;

    /**
     * Command: hMGet
     * @see https://redis.io/docs/latest/commands/hmget
     */
    hMGet$(key: string, fields: string | string[]): Promise<Record<string, Buffer | null>>;

    /**
     * Command: hMSet
     * @see https://redis.io/docs/latest/commands/hmset
     */
    hMSet(key: string, kv: Record<string, string | Buffer | number>): Promise<void>;

    /**
     * Command: hStrLen
     * @see https://redis.io/docs/latest/commands/hstrlen
     */
    hStrLen(key: string, field: string): Promise<number>;

    /**
     * Command: scan
     * @see https://redis.io/docs/latest/commands/scan
     */
    scan(cursor: number, pattern?: string, count?: number): Promise<IScanResult<string>>;

    /**
     * Command: hScan
     * @see https://redis.io/docs/latest/commands/hscan
     */
    hScan(key: string, cursor: number, pattern?: string, count?: number): Promise<IScanResult<string>>;

    /**
     * Command: sAdd
     * @see https://redis.io/docs/latest/commands/sadd
     */
    sAdd(key: string, values: Array<string | Buffer>): Promise<number>;

    /**
     * Command: sCard
     * @see https://redis.io/docs/latest/commands/scard
     */
    sCard(key: string): Promise<number>;

    /**
     * Command: sDiff
     * @see https://redis.io/docs/latest/commands/sdiff
     */
    sDiff(key: string | string[]): Promise<string[]>;

    /**
     * Command: sDiff
     * @see https://redis.io/docs/latest/commands/sdiff
     */
    sDiff$(key: string | string[]): Promise<Buffer[]>;

    /**
     * Command: sDiffStore
     * @see https://redis.io/docs/latest/commands/sdiffstore
     */
    sDiffStore(key: string | string[], target: string): Promise<number>;

    /**
     * Command: sInter
     * @see https://redis.io/docs/latest/commands/sinter
     */
    sInter(key: string | string[]): Promise<string[]>;

    /**
     * Command: sInter
     * @see https://redis.io/docs/latest/commands/sinter
     */
    sInter$(key: string | string[]): Promise<Buffer[]>;

    /**
     * Command: sInterStore
     * @see https://redis.io/docs/latest/commands/sinterstore
     */
    sInterStore(key: string | string[], target: string): Promise<number>;

    /**
     * Command: sUnion
     * @see https://redis.io/docs/latest/commands/sunion
     */
    sUnion(key: string | string[]): Promise<string[]>;

    /**
     * Command: sUnion
     * @see https://redis.io/docs/latest/commands/sunion
     */
    sUnion$(key: string | string[]): Promise<Buffer[]>;

    /**
     * Command: sUnionStore
     * @see https://redis.io/docs/latest/commands/sunionstore
     */
    sUnionStore(key: string | string[], target: string): Promise<number>;

    /**
     * Command: sIsMember
     * @see https://redis.io/docs/latest/commands/sismember
     */
    sIsMember(key: string, value: string | Buffer): Promise<boolean>;

    /**
     * Command: sMembers
     * @see https://redis.io/docs/latest/commands/smembers
     */
    sMembers(key: string): Promise<string[]>;

    /**
     * Command: sMembers
     * @see https://redis.io/docs/latest/commands/smembers
     */
    sMembers$(key: string): Promise<Buffer[]>;

    /**
     * Command: sMove
     * @see https://redis.io/docs/latest/commands/smove
     */
    sMove(from: string, to: string, value: string | Buffer): Promise<boolean>;

    /**
     * Command: sPop
     * @see https://redis.io/docs/latest/commands/spop
     */
    sPop(key: string, count?: number): Promise<string[]>;

    /**
     * Command: sPop
     * @see https://redis.io/docs/latest/commands/spop
     */
    sPop$(key: string, count?: number): Promise<Buffer[]>;

    /**
     * Command: sRandMember
     * @see https://redis.io/docs/latest/commands/srandmember
     */
    sRandMember(key: string, count?: number): Promise<string[]>;

    /**
     * Command: sRandMember
     * @see https://redis.io/docs/latest/commands/srandmember
     */
    sRandMember$(key: string, count?: number): Promise<Buffer[]>;

    /**
     * Command: sRem
     * @see https://redis.io/docs/latest/commands/srem
     */
    sRem(key: string, values: Array<string | Buffer>): Promise<number>;

    /**
     * Command: sScan
     * @see https://redis.io/docs/latest/commands/sscan
     */
    sScan(key: string, cursor: number, pattern?: string, count?: number): Promise<IScanResult<string>>;

    /**
     * Command: sScan
     * @see https://redis.io/docs/latest/commands/sscan
     */
    sScan$(key: string, cursor: number, pattern?: Buffer, count?: number): Promise<IScanResult<Buffer>>;

    /**
     * Command: bLPop
     * @see https://redis.io/docs/latest/commands/blpop
     */
    bLPop(keys: string | string[], timeout: number): Promise<Record<string, string>>;

    /**
     * Command: bLPop
     * @see https://redis.io/docs/latest/commands/blpop
     */
    bLPop$(keys: string | string[], timeout: number): Promise<Record<string, Buffer>>;

    /**
     * Command: bRPop
     * @see https://redis.io/docs/latest/commands/brpop
     */
    bRPop(keys: string | string[], timeout: number): Promise<Record<string, string>>;

    /**
     * Command: bRPop
     * @see https://redis.io/docs/latest/commands/brpop
     */
    bRPop$(keys: string | string[], timeout: number): Promise<Record<string, Buffer>>;

    /**
     * Command: bRPopLPush
     * @see https://redis.io/docs/latest/commands/brpoplpush
     */
    bRPopLPush(from: string, to: string, timeout: number): Promise<string | null>;

    /**
     * Command: bRPopLPush
     * @see https://redis.io/docs/latest/commands/brpoplpush
     */
    bRPopLPush$(from: string, to: string, timeout: number): Promise<Buffer | null>;

    /**
     * Command: lIndex
     * @see https://redis.io/docs/latest/commands/lindex
     */
    lIndex(key: string, index: number): Promise<string | null>;

    /**
     * Command: lIndex
     * @see https://redis.io/docs/latest/commands/lindex
     */
    lIndex$(key: string, index: number): Promise<Buffer | null>;

    /**
     * Command: lInsert
     * @see https://redis.io/docs/latest/commands/linsert
     */
    lInsertBefore(key: string, pivot: string, value: string | Buffer): Promise<number>;

    /**
     * Command: lInsert
     * @see https://redis.io/docs/latest/commands/linsert
     */
    lInsertAfter(key: string, pivot: string, value: string | Buffer): Promise<number>;

    /**
     * Command: lLen
     * @see https://redis.io/docs/latest/commands/llen
     */
    lLen(key: string): Promise<number>;

    /**
     * Command: lPop
     * @see https://redis.io/docs/latest/commands/lpop
     */
    lPop(key: string): Promise<string | null>;

    /**
     * Command: lPop
     * @see https://redis.io/docs/latest/commands/lpop
     */
    lPop(key: string, count: number): Promise<string[]>;

    /**
     * Command: lPop
     * @see https://redis.io/docs/latest/commands/lpop
     */
    lPop$(key: string): Promise<Buffer | null>;

    /**
     * Command: lPop
     * @see https://redis.io/docs/latest/commands/lpop
     */
    lPop$(key: string, count: number): Promise<Buffer[]>;

    /**
     * Command: lPush
     * @see https://redis.io/docs/latest/commands/lpush
     */
    lPush(key: string, values: Array<string | Buffer>): Promise<number>;

    /**
     * Command: lPushX
     * @see https://redis.io/docs/latest/commands/lpushx
     */
    lPushX(key: string, values: Array<string | Buffer>): Promise<number>;

    /**
     * Command: lRange
     * @see https://redis.io/docs/latest/commands/lrange
     */
    lRange(key: string, start: number, stop: number): Promise<string[]>;

    /**
     * Command: lRange
     * @see https://redis.io/docs/latest/commands/lrange
     */
    lRange$(key: string, start: number, stop: number): Promise<Buffer[]>;

    /**
     * Command: lRem
     * @see https://redis.io/docs/latest/commands/lrem
     */
    lRem(key: string, value: string | Buffer, count: number): Promise<number>;

    /**
     * Command: lSet
     * @see https://redis.io/docs/latest/commands/lset
     */
    lSet(key: string, value: string | Buffer, index: number): Promise<void>;

    /**
     * Command: lTrim
     * @see https://redis.io/docs/latest/commands/ltrim
     */
    lTrim(key: string, start: number, stop: number): Promise<void>;

    /**
     * Command: rPop
     * @see https://redis.io/docs/latest/commands/rpop
     */
    rPop(key: string): Promise<string | null>;

    /**
     * Command: rPop
     * @see https://redis.io/docs/latest/commands/rpop
     */
    rPop(key: string, count: number): Promise<string[]>;

    /**
     * Command: rPop
     * @see https://redis.io/docs/latest/commands/rpop
     */
    rPop$(key: string): Promise<Buffer | null>;

    /**
     * Command: rPop
     * @see https://redis.io/docs/latest/commands/rpop
     */
    rPop$(key: string, count: number): Promise<Buffer[]>;

    /**
     * Command: rPopLPush
     * @see https://redis.io/docs/latest/commands/rpoplpush
     */
    rPopLPush(from: string, to: string): Promise<string>;

    /**
     * Command: rPopLPush
     * @see https://redis.io/docs/latest/commands/rpoplpush
     */
    rPopLPush$(from: string, to: string): Promise<Buffer>;

    /**
     * Command: rPush
     * @see https://redis.io/docs/latest/commands/rpush
     */
    rPush(key: string, values: Array<string | Buffer>): Promise<number>;

    /**
     * Command: rPushX
     * @see https://redis.io/docs/latest/commands/rpushx
     */
    rPushX(key: string, values: Array<string | Buffer>): Promise<number>;

    /**
     * Command: lMove
     * @see https://redis.io/docs/latest/commands/lmove
     */
    lMove(srcKey: string, destKey: string, srcDir: 'LEFT' | 'RIGHT', destDir: 'LEFT' | 'RIGHT'): Promise<string | null>;

    /**
     * Command: lMove
     * @see https://redis.io/docs/latest/commands/lmove
     */
    lMove$(srcKey: string, destKey: string, srcDir: 'LEFT' | 'RIGHT', destDir: 'LEFT' | 'RIGHT'): Promise<Buffer | null>;

    /**
     * Command: bLMove
     * @see https://redis.io/docs/latest/commands/blmove
     */
    bLMove(srcKey: string, destKey: string, srcDir: 'LEFT' | 'RIGHT', destDir: 'LEFT' | 'RIGHT', timeout: number): Promise<string | null>;

    /**
     * Command: bLMove
     * @see https://redis.io/docs/latest/commands/blmove
     */
    bLMove$(srcKey: string, destKey: string, srcDir: 'LEFT' | 'RIGHT', destDir: 'LEFT' | 'RIGHT', timeout: number): Promise<Buffer | null>;

    /**
     * Command: zAdd
     * @see https://redis.io/docs/latest/commands/zadd
     */
    zAdd(key: string, score: number, member: string | Buffer): Promise<boolean>;

    /**
     * Command: zRem
     * @see https://redis.io/docs/latest/commands/zrem
     */
    zRem(key: string, members: Array<string | Buffer>): Promise<number>;

    /**
     * Command: zRange
     * @see https://redis.io/docs/latest/commands/zrange
     */
    zRangeWithScores(key: string, start: number, stop: number): Promise<Array<{ member: string; score: number; }>>;

    /**
     * Command: zRange
     * @see https://redis.io/docs/latest/commands/zrange
     */
    zRangeWithScores$(key: string, start: number, stop: number): Promise<Array<{ member: Buffer; score: number; }>>;

    /**
     * Command: pfAdd
     * @see https://redis.io/docs/latest/commands/pfadd
     */
    pfAdd(key: string, values: Array<string | Buffer>): Promise<boolean>;

    /**
     * Command: pfCount
     * @see https://redis.io/docs/latest/commands/pfcount
     */
    pfCount(key: string): Promise<number>;

    /**
     * Command: pfMerge
     * @see https://redis.io/docs/latest/commands/pfmerge
     */
    pfMerge(keys: string | string[], target: string): Promise<void>;

    /**
     * Command: publish
     * @see https://redis.io/docs/latest/commands/publish
     */
    publish(channel: string, data: Buffer | string): Promise<number>;

    /**
     * Command: pubsub
     * @see https://redis.io/docs/latest/commands/pubsub
     */
    pubSubChannels(patterns?: string): Promise<string[]>;

    /**
     * Command: pubsub
     * @see https://redis.io/docs/latest/commands/pubsub
     */
    pubSubNumSub(channels: [string, ...string[]]): Promise<Record<string, number>>;

    /**
     * Command: pubsub
     * @see https://redis.io/docs/latest/commands/pubsub
     */
    pubSubNumPat(): Promise<number>;

    /**
     * Command: eval
     * @see https://redis.io/docs/latest/commands/eval
     */
    eval(luaScript: string, keys: string[], args: Array<string | Buffer>): Promise<any>;

    /**
     * Command: evalsha
     * @see https://redis.io/docs/latest/commands/evalsha
     */
    evalSHA(luaScriptSHA: string, keys: string[], args: Array<string | Buffer>): Promise<any>;

    /**
     * Command: script debug
     * @see https://redis.io/docs/latest/commands/script-debug
     */
    scriptDebug(enabled: boolean | 'sync'): Promise<void>;

    /**
     * Command: script exists
     * @see https://redis.io/docs/latest/commands/script-exists
     */
    scriptExists(shaList: string[]): Promise<number>;

    /**
     * Command: script kill
     * @see https://redis.io/docs/latest/commands/script-kill
     */
    scriptKill(): Promise<void>;

    /**
     * Command: script flush
     * @see https://redis.io/docs/latest/commands/script-flush
     */
    scriptFlush(): Promise<void>;

    /**
     * Command: script load
     * @see https://redis.io/docs/latest/commands/script-load
     */
    scriptLoad(script: string): Promise<string>;

}

export interface ICommandClientBase {

    /**
     * Create a client for multi-exec transaction.
     */
    pipeline(): Promise<IPipelineClient>;

    /**
     * Command: multi
     * @see https://redis.io/docs/latest/commands/multi
     */
    multi(): Promise<IMultiClient>;
}

export interface ICommandClient extends IProtocolClient, ICommandAPIs, ICommandClientBase {}

export type IPipelineCommandAPIs = {

    [K in Exclude<keyof ICommandAPIs, 'auth' | 'select'>]: (...args: Parameters<ICommandAPIs[K]>) => void;
};

export interface IPipelineClientBase {

    /**
     * Command: auth
     * @see https://redis.io/docs/latest/commands/auth
     */
    auth(...args: Parameters<ICommandAPIs['auth']>): Promise<void>;

    /**
     * Command: select
     * @see https://redis.io/docs/latest/commands/select
     */
    select(...args: Parameters<ICommandAPIs['select']>): Promise<void>;

    /**
     * Abort all cached commands.
     */
    abort(): void;

    /**
     * Command: exec
     * @see https://redis.io/docs/latest/commands/exec
     */
    exec<T extends any[]>(): Promise<T>;
}

export interface IPipelineClient extends IProtocolClient, IPipelineCommandAPIs, IPipelineClientBase {}

export interface IMultiClientBase {

    /**
     * Command: auth
     * @see https://redis.io/docs/latest/commands/auth
     */
    auth(...args: Parameters<ICommandAPIs['auth']>): Promise<void>;

    /**
     * Command: select
     * @see https://redis.io/docs/latest/commands/select
     */
    select(...args: Parameters<ICommandAPIs['select']>): Promise<void>;

    /**
     * Command: multi
     * @see https://redis.io/docs/latest/commands/multi
     */
    multi(): Promise<void>;

    /**
     * Command: watch
     * @see https://redis.io/docs/latest/commands/watch
     */
    watch(keys: string[]): Promise<void>;

    /**
     * Command: unwatch
     * @see https://redis.io/docs/latest/commands/unwatch
     */
    unwatch(): Promise<void>;

    /**
     * Command: discard
     * @see https://redis.io/docs/latest/commands/discard
     */
    discard(): Promise<void>;

    /**
     * Command: exec
     * @see https://redis.io/docs/latest/commands/exec
     */
    exec<T extends any[]>(): Promise<T>;
}

export type IMultiCommandAPIs = {

    [K in Exclude<keyof ICommandAPIs, 'auth' | 'select'>]: (...args: Parameters<ICommandAPIs[K]>) => Promise<void>;
};

export interface IMultiClient extends IProtocolClient, IMultiCommandAPIs, IMultiClientBase {}

export interface ISubscriberClient extends IProtocolClient {

    /**
     * Command: auth
     * @see https://redis.io/docs/latest/commands/auth
     */
    auth(password: string, username?: string): Promise<void>;

    /**
     * Command: subscribe
     * @see https://redis.io/docs/latest/commands/subscribe
     */
    subscribe(channels: string | string[]): Promise<void>;

    /**
     * Command: unsubscribe
     * @see https://redis.io/docs/latest/commands/unsubscribe
     */
    unsubscribe(channels: string | string[]): Promise<void>;

    /**
     * Command: psubscribe
     * @see https://redis.io/docs/latest/commands/psubscribe
     */
    pSubscribe(patterns: string | string[]): Promise<void>;

    /**
     * Command: punsubscribe
     * @see https://redis.io/docs/latest/commands/punsubscribe
     */
    pUnsubscribe(patterns: string | string[]): Promise<void>;
}

export type TEncoderFactory = () => IEncoder;

export type TDecoderFactory = () => IDecoder;

export interface IClientOptions {

    /**
     * The hostname of Redis server.
     *
     * @default '127.0.0.1'
     */
    'host': string;

    /**
     * The port of Redis server.
     *
     * @default 6379
     */
    'port': number;

    'encoderFactory': TEncoderFactory;

    'decoderFactory': TDecoderFactory;

    /**
     * The timeout for connecting to server.
     *
     * @default 5000ms
     */
    'connectTimeout': number;

    /**
     * How many milliseconds will a command request be timeout after sent.
     *
     * > Set to 0 to disable timeout.
     *
     * @default 0
     */
    'commandTimeout': number;

    /**
     * How many commands could be queued.
     *
     * > Set to 0 if queue size is unlimited.
     *
     * @default 1048576
     */
    'queueSize': number;

    /**
     * What to do if queue is full.
     *
     * @default 'error'
     */
    'actionOnQueueFull': 'kill' | 'error';
}

export enum EClientMode {
    SIMPLE,
    SUBSCRIBER,
    PIPELINE,
}

export interface IProtocolClientOptions extends IClientOptions {

    'mode': EClientMode;
}
