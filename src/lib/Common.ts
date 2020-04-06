/**
 * Copyright 2020 Angus.Fenying <fenying@litert.org>
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

import { Events } from '@litert/observable';

export type TStringValue = string | Buffer;

export type TResponseType<
    T extends 'list' | 'string' | 'integer' | 'message',
    E
> =
    T extends 'list' ? E[] :
    T extends 'string' ? string | Buffer :
    T extends 'integer' ? number : string;

export interface IProtocolClientEvents extends Events.ICallbackDefinitions {

    aborted(e: unknown): void;

    ready(): void;

    close(): void;

    message(channel: string, data: Buffer, pattern?: string): void;
}

export interface ICallbackA<R = any, E = any> {
    (err?: E): void;
    (err: null, result: R): void;
}

export enum EClientStatus {

    IDLE,
    READY,
    CONNECTING,
    CLOSING
}

/**
 * The client only provides the basic connection and communication over Redis
 * protocol.
 */
export interface IProtocolClient extends Events.IObservable<IProtocolClientEvents> {

    readonly status: EClientStatus;

    /**
     * Start a connection to remote server..
     */
    connect(): Promise<void>;

    connect(callback: ICallbackA<void>): void;

    /**
     * Close the connection to remote server..
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

export enum DataType {

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

export type ListItem<T = any> = [ DataType, T ];

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

export interface IDecoderEvents extends Events.ICallbackDefinitions {

    data(type: DataType, data: any): void;
}

export interface IDecoder extends Events.IObservable<IDecoderEvents> {

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
     * @see https://redis.io/commands/append
     */
    append(key: string, value: string | Buffer): Promise<number>;

    /**
     * Command: auth
     * @see https://redis.io/commands/auth
     */
    auth(password: string): Promise<void>;

    /**
     * Command: ping
     * @see https://redis.io/commands/ping
     */
    ping(text?: string): Promise<string>;

    /**
     * Command: incr
     * @see https://redis.io/commands/incr
     */
    incr(key: string, step?: number): Promise<number>;

    /**
     * Command: incrByFloat
     * @see https://redis.io/commands/incrByFloat
     */
    incrByFloat(key: string, step: number): Promise<number>;

    /**
     * Command: decr
     * @see https://redis.io/commands/decr
     */
    decr(key: string, step?: number): Promise<number>;

    /**
     * Command: incrByFloat
     * @see https://redis.io/commands/incrByFloat
     */
    decrByFloat(key: string, step: number): Promise<number>;

    /**
     * Command: del
     * @see https://redis.io/commands/del
     */
    del(keys: string | string[]): Promise<number>;

    /**
     * Command: unlink
     * @see https://redis.io/commands/unlink
     */
    unlink(keys: string | string[]): Promise<number>;

    /**
     * Command: get
     * @see https://redis.io/commands/get
     */
    get(key: string): Promise<string | null>;

    /**
     * Command: get
     * @see https://redis.io/commands/get
     */
    get$(key: string): Promise<Buffer | null>;

    /**
     * Command: getSet
     * @see https://redis.io/commands/getSet
     */
    getSet(key: string, value: string): Promise<string | null>;

    /**
     * Command: getSet
     * @see https://redis.io/commands/getSet
     */
    getSet$(key: string, value: Buffer): Promise<Buffer | null>;

    /**
     * Command: set
     * @see https://redis.io/commands/set
     */
    set(key: string, value: string | Buffer, ttl?: number): Promise<boolean>;

    /**
     * Command: setNX
     * @see https://redis.io/commands/setNX
     */
    setNX(key: string, value: string | Buffer, ttl?: number): Promise<boolean>;

    /**
     * Command: setEX
     * @see https://redis.io/commands/setEX
     */
    setEX(key: string, value: string | Buffer, ttl: number): Promise<boolean>;

    /**
     * Command: pSetNX
     * @see https://redis.io/commands/pSetNX
     */
    pSetNX(key: string, value: string | Buffer, ttl?: number): Promise<boolean>;

    /**
     * Command: pSetEx
     * @see https://redis.io/commands/pSetEx
     */
    pSetEx(key: string, value: string | Buffer, ttl: number): Promise<boolean>;

    /**
     * Command: replace
     * @see https://redis.io/commands/replace
     */
    replace(key: string, value: string | Buffer, ttl?: number): Promise<boolean>;

    /**
     * Command: pReplace
     * @see https://redis.io/commands/pReplace
     */
    pReplace(key: string, value: string | Buffer, ttl: number): Promise<boolean>;

    /**
     * Command: ttl
     * @see https://redis.io/commands/ttl
     */
    ttl(key: string): Promise<number>;

    /**
     * Command: pTTL
     * @see https://redis.io/commands/pTTL
     */
    pTTL(key: string): Promise<number>;

    /**
     * Command: expire
     * @see https://redis.io/commands/expire
     */
    expire(key: string, ttl: number): Promise<boolean>;

    /**
     * Command: pExpire
     * @see https://redis.io/commands/pExpire
     */
    pExpire(key: string, ttl: number): Promise<boolean>;

    /**
     * Command: expireAt
     * @see https://redis.io/commands/expireAt
     */
    expireAt(key: string, ttl: number): Promise<boolean>;

    /**
     * Command: pExpireAt
     * @see https://redis.io/commands/pExpireAt
     */
    pExpireAt(key: string, ttl: number): Promise<boolean>;

    /**
     * Command: persist
     * @see https://redis.io/commands/persist
     */
    persist(key: string): Promise<boolean>;

    /**
     * Command: exists
     * @see https://redis.io/commands/exists
     */
    exists(key: string): Promise<boolean>;

    /**
     * Command: exists
     * @see https://redis.io/commands/exists
     */
    mExists(keys: string[]): Promise<number>;

    /**
     * Command: type
     * @see https://redis.io/commands/type
     */
    type(key: string): Promise<string>;

    /**
     * Command: move
     * @see https://redis.io/commands/move
     */
    move(key: string, db: number): Promise<boolean>;

    /**
     * Command: randomKey
     * @see https://redis.io/commands/randomKey
     */
    randomKey(): Promise<string | null>;

    /**
     * Command: rename
     * @see https://redis.io/commands/rename
     */
    rename(from: string, to: string): Promise<void>;

    /**
     * Command: renameNX
     * @see https://redis.io/commands/renameNX
     */
    renameNX(from: string, to: string): Promise<boolean>;

    /**
     * Command: select
     * @see https://redis.io/commands/select
     */
    select(db: number): Promise<void>;

    /**
     * Command: flushDb
     * @see https://redis.io/commands/flushDb
     */
    flushDb(async?: boolean): Promise<void>;

    /**
     * Command: flushAll
     * @see https://redis.io/commands/flushAll
     */
    flushAll(async?: boolean): Promise<void>;

    /**
     * Command: hDel
     * @see https://redis.io/commands/hDel
     */
    hDel(key: string, fields: string | string[]): Promise<number>;

    /**
     * Command: hGet
     * @see https://redis.io/commands/hGet
     */
    hGet(key: string, fields: string): Promise<string | null>;

    /**
     * Command: hGet
     * @see https://redis.io/commands/hGet
     */
    hGet$(key: string, field: string): Promise<Buffer | null>;

    /**
     * Command: hSet
     * @see https://redis.io/commands/hSet
     */
    hSet(key: string, field: string, value: string | Buffer): Promise<boolean>;

    /**
     * Command: hSetNX
     * @see https://redis.io/commands/hSetNX
     */
    hSetNX(key: string, field: string, value: string | Buffer): Promise<boolean>;

    /**
     * Command: hExists
     * @see https://redis.io/commands/hExists
     */
    hExists(key: string, field: string): Promise<boolean>;

    /**
     * Command: keys
     * @see https://redis.io/commands/keys
     */
    keys(pattern: string): Promise<string[]>;

    /**
     * Command: dump
     * @see https://redis.io/commands/dump
     */
    dump(key: string): Promise<Buffer | null>;

    /**
     * Command: restore
     * @see https://redis.io/commands/restore
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
     * @see https://redis.io/commands/strLen
     */
    strLen(key: string): Promise<number>;

    /**
     * Command: touch
     * @see https://redis.io/commands/touch
     */
    touch(keys: string | string[]): Promise<number>;

    /**
     * Command: mGet
     * @see https://redis.io/commands/mGet
     */
    mGet(keys: string | string[]): Promise<Record<string, string | null>>;

    /**
     * Command: mGet
     * @see https://redis.io/commands/mGet
     */
    mGet$(key: string | string[]): Promise<Record<string, Buffer | null>>;

    /**
     * Command: mSet
     * @see https://redis.io/commands/mSet
     */
    mSet(kv: Record<string, string | Buffer>): Promise<void>;

    /**
     * Command: mSetNX
     * @see https://redis.io/commands/mSetNX
     */
    mSetNX(kv: Record<string, string | Buffer>): Promise<boolean>;

    /**
     * Command: hIncr
     * @see https://redis.io/commands/hincrby
     */
    hIncr(key: string, field: string, step?: number): Promise<number>;

    /**
     * Command: hIncr
     * @see https://redis.io/commands/hincrbyfloat
     */
    hIncrByFloat(key: string, field: string, step: number): Promise<number>;

    /**
     * Command: hIncr
     * @see https://redis.io/commands/hincrby
     */
    hDecr(key: string, field: string, step?: number): Promise<number>;

    /**
     * Command: hIncr
     * @see https://redis.io/commands/hincrbyfloat
     */
    hDecrByFloat(key: string, field: string, step: number): Promise<number>;

    /**
     * Command: hKeys
     * @see https://redis.io/commands/hKeys
     */
    hKeys(key: string): Promise<string[]>;

    /**
     * Command: hVals
     * @see https://redis.io/commands/hVals
     */
    hVals(key: string): Promise<string[]>;

    /**
     * Command: hVals
     * @see https://redis.io/commands/hVals
     */
    hVals$(key: string): Promise<Buffer[]>;

    /**
     * Command: hLen
     * @see https://redis.io/commands/hLen
     */
    hLen(key: string): Promise<number>;

    /**
     * Command: hMGet
     * @see https://redis.io/commands/hMGet
     */
    hMGet(key: string, fields: string | string[]): Promise<Record<string, string | null>>;

    /**
     * Command: hGetAll
     * @see https://redis.io/commands/hGetAll
     */
    hGetAll(key: string): Promise<Record<string, string | null>>;

    /**
     * Command: hGetAll
     * @see https://redis.io/commands/hGetAll
     */
    hGetAll$(key: string): Promise<Record<string, Buffer | null>>;

    /**
     * Command: hMGet
     * @see https://redis.io/commands/hMGet
     */
    hMGet$(key: string, fields: string | string[]): Promise<Record<string, Buffer | null>>;

    /**
     * Command: hMSet
     * @see https://redis.io/commands/hMSet
     */
    hMSet(key: string, kv: Record<string, string | Buffer | number>): Promise<void>;

    /**
     * Command: hStrLen
     * @see https://redis.io/commands/hStrLen
     */
    hStrLen(key: string, field: string): Promise<number>;

    /**
     * Command: scan
     * @see https://redis.io/commands/scan
     */
    scan(cursor: number, pattern?: string, count?: number): Promise<IScanResult<string>>;

    /**
     * Command: hScan
     * @see https://redis.io/commands/hScan
     */
    hScan(key: string, cursor: number, pattern?: string, count?: number): Promise<IScanResult<string>>;

    /**
     * Command: sAdd
     * @see https://redis.io/commands/sAdd
     */
    sAdd(key: string, values: Array<string | Buffer>): Promise<number>;

    /**
     * Command: sCard
     * @see https://redis.io/commands/sCard
     */
    sCard(key: string): Promise<number>;

    /**
     * Command: sDiff
     * @see https://redis.io/commands/sDiff
     */
    sDiff(key: string | string[]): Promise<string[]>;

    /**
     * Command: sDiff
     * @see https://redis.io/commands/sDiff
     */
    sDiff$(key: string | string[]): Promise<Buffer[]>;

    /**
     * Command: sDiffStore
     * @see https://redis.io/commands/sDiffStore
     */
    sDiffStore(key: string | string[], target: string): Promise<number>;

    /**
     * Command: sInter
     * @see https://redis.io/commands/sInter
     */
    sInter(key: string | string[]): Promise<string[]>;

    /**
     * Command: sInter
     * @see https://redis.io/commands/sInter
     */
    sInter$(key: string | string[]): Promise<Buffer[]>;

    /**
     * Command: sInterStore
     * @see https://redis.io/commands/sInterStore
     */
    sInterStore(key: string | string[], target: string): Promise<number>;

    /**
     * Command: sUnion
     * @see https://redis.io/commands/sUnion
     */
    sUnion(key: string | string[]): Promise<string[]>;

    /**
     * Command: sUnion
     * @see https://redis.io/commands/sUnion
     */
    sUnion$(key: string | string[]): Promise<Buffer[]>;

    /**
     * Command: sUnionStore
     * @see https://redis.io/commands/sUnionStore
     */
    sUnionStore(key: string | string[], target: string): Promise<number>;

    /**
     * Command: sIsMember
     * @see https://redis.io/commands/sIsMember
     */
    sIsMember(key: string, value: string | Buffer): Promise<boolean>;

    /**
     * Command: sMembers
     * @see https://redis.io/commands/sMembers
     */
    sMembers(key: string): Promise<string[]>;

    /**
     * Command: sMembers
     * @see https://redis.io/commands/sMembers
     */
    sMembers$(key: string): Promise<Buffer[]>;

    /**
     * Command: sMove
     * @see https://redis.io/commands/sMove
     */
    sMove(from: string, to: string, value: string | Buffer): Promise<boolean>;

    /**
     * Command: sPop
     * @see https://redis.io/commands/sPop
     */
    sPop(key: string, count?: number): Promise<string[]>;

    /**
     * Command: sPop
     * @see https://redis.io/commands/sPop
     */
    sPop$(key: string, count?: number): Promise<Buffer[]>;

    /**
     * Command: sRandMember
     * @see https://redis.io/commands/sRandMember
     */
    sRandMember(key: string, count?: number): Promise<string[]>;

    /**
     * Command: sRandMember
     * @see https://redis.io/commands/sRandMember
     */
    sRandMember$(key: string, count?: number): Promise<Buffer[]>;

    /**
     * Command: sRem
     * @see https://redis.io/commands/sRem
     */
    sRem(key: string, values: Array<string | Buffer>): Promise<number>;

    /**
     * Command: sScan
     * @see https://redis.io/commands/sScan
     */
    sScan(key: string, cursor: number, pattern?: string, count?: number): Promise<IScanResult<string>>;

    /**
     * Command: sScan
     * @see https://redis.io/commands/sScan
     */
    sScan$(key: string, cursor: number, pattern?: Buffer, count?: number): Promise<IScanResult<Buffer>>;

    /**
     * Command: bLPop
     * @see https://redis.io/commands/bLPop
     */
    bLPop(keys: string | string[], timeout: number): Promise<Record<string, string>>;

    /**
     * Command: bLPop
     * @see https://redis.io/commands/bLPop
     */
    bLPop$(keys: string | string[], timeout: number): Promise<Record<string, Buffer>>;

    /**
     * Command: bRPop
     * @see https://redis.io/commands/bRPop
     */
    bRPop(keys: string | string[], timeout: number): Promise<Record<string, string>>;

    /**
     * Command: bRPop
     * @see https://redis.io/commands/bRPop
     */
    bRPop$(keys: string | string[], timeout: number): Promise<Record<string, Buffer>>;

    /**
     * Command: bRPopLPush
     * @see https://redis.io/commands/bRPopLPush
     */
    bRPopLPush(from: string, to: string, timeout: number): Promise<string | null>;

    /**
     * Command: bRPopLPush
     * @see https://redis.io/commands/bRPopLPush
     */
    bRPopLPush$(from: string, to: string, timeout: number): Promise<Buffer | null>;

    /**
     * Command: lIndex
     * @see https://redis.io/commands/lIndex
     */
    lIndex(key: string, index: number): Promise<string | null>;

    /**
     * Command: lIndex
     * @see https://redis.io/commands/lIndex
     */
    lIndex$(key: string, index: number): Promise<Buffer | null>;

    /**
     * Command: lInsert
     * @see https://redis.io/commands/lInsert
     */
    lInsertBefore(key: string, pivot: string, value: string | Buffer): Promise<number>;

    /**
     * Command: lInsert
     * @see https://redis.io/commands/lInsert
     */
    lInsertAfter(key: string, pivot: string, value: string | Buffer): Promise<number>;

    /**
     * Command: lLen
     * @see https://redis.io/commands/lLen
     */
    lLen(key: string): Promise<number>;

    /**
     * Command: lPop
     * @see https://redis.io/commands/lPop
     */
    lPop(key: string): Promise<string | null>;

    /**
     * Command: lPop
     * @see https://redis.io/commands/lPop
     */
    lPop$(key: string): Promise<Buffer | null>;

    /**
     * Command: lPush
     * @see https://redis.io/commands/lPush
     */
    lPush(key: string, values: Array<string | Buffer>): Promise<number>;

    /**
     * Command: lPushX
     * @see https://redis.io/commands/lPushX
     */
    lPushX(key: string, values: Array<string | Buffer>): Promise<number>;

    /**
     * Command: lRange
     * @see https://redis.io/commands/lRange
     */
    lRange(key: string, start: number, stop: number): Promise<string[]>;

    /**
     * Command: lRange
     * @see https://redis.io/commands/lRange
     */
    lRange$(key: string, start: number, stop: number): Promise<Buffer[]>;

    /**
     * Command: lRem
     * @see https://redis.io/commands/lRem
     */
    lRem(key: string, value: string | Buffer, count: number): Promise<number>;

    /**
     * Command: lSet
     * @see https://redis.io/commands/lSet
     */
    lSet(key: string, value: string | Buffer, index: number): Promise<void>;

    /**
     * Command: lTrim
     * @see https://redis.io/commands/lTrim
     */
    lTrim(key: string, start: number, stop: number): Promise<void>;

    /**
     * Command: rPop
     * @see https://redis.io/commands/rPop
     */
    rPop(key: string): Promise<string | null>;

    /**
     * Command: rPop
     * @see https://redis.io/commands/rPop
     */
    rPop$(key: string): Promise<Buffer | null>;

    /**
     * Command: rPopLPush
     * @see https://redis.io/commands/rPopLPush
     */
    rPopLPush(from: string, to: string): Promise<string>;

    /**
     * Command: rPopLPush
     * @see https://redis.io/commands/rPopLPush
     */
    rPopLPush$(from: string, to: string): Promise<Buffer>;

    /**
     * Command: rPush
     * @see https://redis.io/commands/rPush
     */
    rPush(key: string, values: Array<string | Buffer>): Promise<number>;

    /**
     * Command: rPushX
     * @see https://redis.io/commands/rPushX
     */
    rPushX(key: string, values: Array<string | Buffer>): Promise<number>;

    /**
     * Command: pfAdd
     * @see https://redis.io/commands/pfAdd
     */
    pfAdd(key: string, values: Array<string | Buffer>): Promise<boolean>;

    /**
     * Command: pfCount
     * @see https://redis.io/commands/pfCount
     */
    pfCount(key: string): Promise<number>;

    /**
     * Command: pfMerge
     * @see https://redis.io/commands/pfMerge
     */
    pfMerge(keys: string | string[], target: string): Promise<void>;

    /**
     * Command: publish
     * @see https://redis.io/commands/publish
     */
    publish(channel: string, data: Buffer | string): Promise<number>;

    /**
     * Command: pubsub
     * @see https://redis.io/commands/pubsub
     */
    pubSubChannels(patterns?: string): Promise<string[]>;

    /**
     * Command: pubsub
     * @see https://redis.io/commands/pubsub
     */
    pubSubNumSub(channels: [string, ...string[]]): Promise<Record<string, number>>;

    /**
     * Command: pubsub
     * @see https://redis.io/commands/pubsub
     */
    pubSubNumPat(): Promise<number>;

    /**
     * Command: eval
     * @see https://redis.io/commands/eval
     */
    eval(luaScript: string, keys: string[], args: Array<string | Buffer>): Promise<any>;

    /**
     * Command: evalsha
     * @see https://redis.io/commands/evalsha
     */
    evalSHA(luaScriptSHA: string, keys: string[], args: Array<string | Buffer>): Promise<any>;

    /**
     * Command: script debug
     * @see https://redis.io/commands/script-debug
     */
    scriptDebug(enabled: boolean | 'sync'): Promise<void>;

    /**
     * Command: script exists
     * @see https://redis.io/commands/script-exists
     */
    scriptExists(shaList: string[]): Promise<number>;

    /**
     * Command: script kill
     * @see https://redis.io/commands/script-kill
     */
    scriptKill(): Promise<void>;

    /**
     * Command: script flush
     * @see https://redis.io/commands/script-flush
     */
    scriptFlush(): Promise<void>;

    /**
     * Command: script load
     * @see https://redis.io/commands/script-load
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
     * @see https://redis.io/commands/multi
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
     * @see https://redis.io/commands/auth
     */
    auth(...args: Parameters<ICommandAPIs['auth']>): Promise<void>;

    /**
     * Command: select
     * @see https://redis.io/commands/select
     */
    select(...args: Parameters<ICommandAPIs['select']>): Promise<void>;

    /**
     * Abort all cached commands.
     */
    abort(): void;

    /**
     * Command: exec
     * @see https://redis.io/commands/exec
     */
    exec<T extends any[]>(): Promise<T>;
}

export interface IPipelineClient extends IProtocolClient, IPipelineCommandAPIs, IPipelineClientBase {}

export interface IMultiClientBase {

    /**
     * Command: auth
     * @see https://redis.io/commands/auth
     */
    auth(...args: Parameters<ICommandAPIs['auth']>): Promise<void>;

    /**
     * Command: select
     * @see https://redis.io/commands/select
     */
    select(...args: Parameters<ICommandAPIs['select']>): Promise<void>;

    /**
     * Command: multi
     * @see https://redis.io/commands/multi
     */
    multi(): Promise<void>;

    /**
     * Command: watch
     * @see https://redis.io/commands/watch
     */
    watch(keys: string[]): Promise<void>;

    /**
     * Command: unwatch
     * @see https://redis.io/commands/unwatch
     */
    unwatch(): Promise<void>;

    /**
     * Command: discard
     * @see https://redis.io/commands/discard
     */
    discard(): Promise<void>;

    /**
     * Command: exec
     * @see https://redis.io/commands/exec
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
     * @see https://redis.io/commands/auth
     */
    auth(password: string): Promise<void>;

    /**
     * Command: subscribe
     * @see https://redis.io/commands/subscribe
     */
    subscribe(channels: string | string[]): Promise<void>;

    /**
     * Command: unsubscribe
     * @see https://redis.io/commands/unsubscribe
     */
    unsubscribe(channels: string | string[]): Promise<void>;

    /**
     * Command: psubscribe
     * @see https://redis.io/commands/psubscribe
     */
    pSubscribe(patterns: string | string[]): Promise<void>;

    /**
     * Command: punsubscribe
     * @see https://redis.io/commands/punsubscribe
     */
    pUnsubscribe(patterns: string | string[]): Promise<void>;
}

export type TEncoderFactory = () => IEncoder;

export type TDecoderFactory = () => IDecoder;

export interface IClientOptions {

    host: string;

    port: number;

    encoderFactory: TEncoderFactory;

    decoderFactory: TDecoderFactory;

    /**
     * The timeout for connecting to server.
     *
     * @default 5000ms
     */
    connectTimeout: number;

    /**
     * How long will a command request timeout.
     *
     * @default 3000ms
     */
    commandTimeout: number;
}

export interface IProtocolClientOptions extends IClientOptions {

    subscribeMode: boolean;

    pipelineMode: boolean;
}
