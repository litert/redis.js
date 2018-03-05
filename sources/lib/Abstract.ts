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
import * as Core from "@litert/core";

import Dict = Core.IDictionary;

export enum PipelineMode {

    /**
     * Pipeline mode is disabled.
     */
    OFF,

    /**
     * Pipeline mode is enabled.
     */
    ON,

    /**
     * It's forced using pipeline.
     */
    FORCED
}

export enum ClientStatus {

    /**
     * When the client is connected to remote server.
     */
    NORMAL,

    /**
     * When the client is trying reconnecting to remote server.
     */
    CONNECTING,

    /**
     * When the client's connection to server is being closed.
     */
    CLOSING,

    /**
     * When the client's connection to server has been kill.
     */
    CLOSED
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

export type ClientErrorEventCallback = (
    this: ProtocolClient,
    e: Core.Exception
) => void;

export interface BaseClient {

    /**
     * The host of remote server.
     */
    "host": string;

    /**
     * The port of remote server.
     */
    "port": number;

    /**
     * The status of client.
     */
    "status": ClientStatus;

    /**
     * Check the status of pipeline mode.
     */
    "pipelineMode": PipelineMode;

    /**
     * Check if the client has no tasks to work with.
     */
    isIdle(): boolean;

    /**
     * Register a handler for clients' error event.
     *
     * @param event Event name
     * @param callback The handler callback for this event.
     */
    on(event: "error", callback: ClientErrorEventCallback): this;

    /**
     * Register a handler for clients' close event.
     *
     * @param event Event name
     * @param callback The handler callback for this event.
     */
    on(event: "close", callback: Function): this;

    /**
     * Register a handler for clients' reconnected event.
     *
     * @param event Event name
     * @param callback The handler callback for this event.
     */
    on(event: "reconnected", callback: Function): this;

    /**
     * Register a handler for clients' other event.
     *
     * @param event Event name
     * @param callback The handler callback for this event.
     */
    on(event: string, callback: Function): this;

    /**
     * Start the pipeline mode.
     */
    startPipeline(): this;

    /**
     * Stop the pipeline mode.
     */
    endPipeline(): this;

    /**
     * Shutdown the client's connection to server.
     */
    close(): Promise<void>;
}

export interface ProtocolClient extends BaseClient {

    /**
     * Send a command to server.
     */
    execute<T>(command: string, ...args: Array<string | Buffer>): Promise<T>;

    /**
     * Send a command to server immediately, ignore pipeline status.
     */
    executeNow<T>(
        command: string,
        ...args: Array<string | Buffer>
    ): Promise<T>;
}

export type DecoderDataCallback = (
    type: DataType,
    data: any
) => void;

export type DecoderErrorCallback = (
    error: Core.Exception
) => void;

export type DecoderFactory = () => Decoder;

export type EncoderFactory = () => Encoder;

export interface Decoder {

    update(data: Buffer): this;

    on(event: "data", callback: DecoderDataCallback): this;

    on(event: "error", callback: DecoderErrorCallback): this;

    on(event: string, callback: Function): this;

    removeAllListeners(event: string): this;

    reset(): this;
}

export type ListItem<T = any> = [
    DataType, T
];

export interface Encoder {

    /**
     * Encode a COMMAND into redis protocol format.
     */
    encodeCommand(
        cmd: string | Buffer,
        values?: Array<string | Buffer>
    ): Buffer;

    /**
     * Encode a FAILURE into redis protocol format.
     */
    encodeFailure(
        failure: string | Buffer
    ): Buffer;

    /**
     * Encode an INTEGER into redis protocol format.
     */
    encodeInteger(
        failure: number
    ): Buffer;

    /**
     * Encode a LIST into redis protocol format.
     */
    encodeList(
        list: ListItem[]
    ): Buffer;

    /**
     * Encode a MESSAGE into redis protocol format.
     */
    encodeMessage(
        message: string | Buffer
    ): Buffer;

    /**
     * Encode a NULL into redis protocol format.
     */
    encodeNull(): Buffer;
}

export type StringValue = string | Buffer;

export type ItemKey = string;

export interface ScanResult<T = ItemKey[]> {

    /**
     * The new cursor for next scanning.
     */
    "next": number;

    /**
     * The result of scanning.
     */
    "keys": T;
}

export interface TimeResult {

    /**
     * The seconds part of time.
     */
    "seconds": number;

    /**
     * The micro-seconds part of time.
     */
    "microSeconds": number;
}

export type Nullable<T> = T | null;

export type AsyncNullable<T> = Promise<Nullable<T>>;

export type AsyncNullableDict<T> = Promise<Dict<Nullable<T>>>;

export type SubscriptionCallback = (subject: string, message: Buffer) => void;

export interface SubscriptionMessage {

    "subject": string;

    "message": Buffer;
}

export interface SubscriptionListener {
    
    on(event: "data", listener: (data: SubscriptionMessage) => void): this;
}

export interface RedisClient extends BaseClient {

    append(key: ItemKey, value: StringValue): Promise<number>;

    auth(value: string): Promise<void>;

    dbSize(): Promise<number>;

    decr(key: ItemKey, step?: number): Promise<number>;

    del(...keys: ItemKey[]): Promise<number>;

    echo(payload: StringValue): Promise<Buffer>;

    eval(
        script: StringValue,
        keys: StringValue[],
        args: StringValue[]
    ): Promise<any>;

    evalSHA(
        sha1: StringValue,
        keys: StringValue[],
        args: StringValue[]
    ): Promise<any>;

    exists(key: ItemKey): Promise<boolean>;

    expire(key: ItemKey, ttl: number): Promise<boolean>;

    expireAt(key: ItemKey, time: number | Date): Promise<boolean>;

    flushAll(async?: boolean): Promise<void>;

    flushDB(async?: boolean): Promise<void>;

    get(key: ItemKey): Promise<Buffer>;

    hDel(key: ItemKey, ...fields: ItemKey[]): Promise<number>;

    hExists(key: ItemKey, field: ItemKey): Promise<boolean>;

    hGet(key: ItemKey, field: ItemKey): AsyncNullable<Buffer>;

    hGetAll(key: ItemKey): AsyncNullableDict<Buffer>;

    hIncr(key: ItemKey, field: ItemKey, step?: number): Promise<number>;

    hDecr(key: ItemKey, field: ItemKey, step?: number): Promise<number>;

    hKeys(key: ItemKey): Promise<ItemKey[]>;

    hLen(key: ItemKey): Promise<number>;

    hMGet(key: ItemKey, fields: ItemKey[]): AsyncNullableDict<Buffer>;

    hMSet(
        key: ItemKey,
        fieldSet: Dict<StringValue>
    ): Promise<void>;

    hScan(
        key: ItemKey,
        cursor?: number,
        match?: ItemKey,
        count?: number
    ): Promise<ScanResult<Dict<Buffer>>>;

    hSet(key: ItemKey, field: ItemKey, value: StringValue): Promise<number>;

    hSetNX(key: ItemKey, field: ItemKey, value: StringValue): Promise<boolean>;

    hStrLen(key: ItemKey, field: ItemKey): Promise<number>;

    hVals(key: ItemKey): Promise<Buffer[]>;

    incr(key: ItemKey, step?: number): Promise<number>;

    keys(format: StringValue): Promise<ItemKey[]>;

    lIndex(key: ItemKey, index: number): AsyncNullable<Buffer>;

    lInsertAfter(
        key: ItemKey,
        value: StringValue,
        pivot: StringValue
    ): Promise<number>;

    lInsertBefore(
        key: ItemKey,
        value: StringValue,
        pivot: StringValue
    ): Promise<number>;

    listen(subject: string): SubscriptionListener;

    listen(subject: string, callback: SubscriptionCallback): void;

    lLen(key: ItemKey): Promise<number>;

    lPop(key: ItemKey): AsyncNullable<Buffer>;

    lPush(key: ItemKey, ...values: StringValue[]): Promise<number>;

    lPushX(key: ItemKey, value: StringValue): Promise<number>;

    lRange(key: ItemKey, start: number, end: number): Promise<Buffer[]>;

    lRem(key: ItemKey, count: number, match: StringValue): Promise<number>;

    lSet(key: ItemKey, index: number, value: StringValue): Promise<void>;

    lTrim(key: ItemKey, start: number, end: number): Promise<void>;

    mGet(keys: ItemKey[]): AsyncNullableDict<Buffer>;

    mSet(
        keySet: Dict<StringValue>
    ): Promise<void>;

    mSetNX(
        keySet: Dict<StringValue>
    ): Promise<boolean>;

    move(key: ItemKey, targetDB: number): Promise<boolean>;

    persist(key: ItemKey): Promise<boolean>;

    pExpire(key: ItemKey, ttl: number): Promise<boolean>;

    pExpireAt(key: ItemKey, time: number | Date): Promise<boolean>;

    pfAdd(key: ItemKey, ...values: StringValue[]): Promise<number>;

    pfCount(key: ItemKey): Promise<number>;

    pfMerge(target: ItemKey, ...keys: StringValue[]): Promise<void>;

    ping(payload?: StringValue): Promise<Buffer>;

    pSubscribe(...patterns: string[]): Promise<string[]>;

    publish(subject: string, message: StringValue): Promise<number>;

    pSetEX(key: ItemKey, value: StringValue, ttl: number): Promise<boolean>;

    pTTL(key: ItemKey): Promise<number>;

    randomKey(): AsyncNullable<ItemKey>;

    renameEx(key: ItemKey, newKey: ItemKey): Promise<boolean>;

    rPop(key: ItemKey): AsyncNullable<Buffer>;

    rPopLPush(source: ItemKey, target: ItemKey): AsyncNullable<Buffer>;

    rPush(key: ItemKey, ...values: StringValue[]): Promise<number>;

    rPushX(key: ItemKey, value: StringValue): Promise<number>;

    sAdd(key: ItemKey, ...values: StringValue[]): Promise<number>;

    scan(
        cursor?: number,
        match?: ItemKey,
        count?: number
    ): Promise<ScanResult>;

    sCard(key: ItemKey): Promise<number>;

    scriptExists(...sha1: string[]): Promise<Dict<Boolean>>;

    scriptFlush(): Promise<void>;

    scriptKill(): Promise<void>;

    scriptLoad(script: StringValue): Promise<string>;

    sDiff(...keys: ItemKey[]): Promise<Buffer[]>;

    sDiffStore(target: ItemKey, ...keys: ItemKey[]): Promise<number>;

    select(index: number): Promise<void>;

    set(key: ItemKey, value: StringValue): Promise<void>;

    setEX(key: ItemKey, value: StringValue, ttl: number): Promise<void>;

    setNX(key: ItemKey, value: StringValue): Promise<boolean>;

    sInter(...keys: ItemKey[]): Promise<Buffer[]>;

    sInterStore(target: ItemKey, ...keys: ItemKey[]): Promise<number>;

    sIsMember(key: ItemKey, value: StringValue): Promise<boolean>;

    sMembers(key: ItemKey): Promise<Buffer[]>;

    sMove(
        source: ItemKey,
        target: ItemKey,
        value: StringValue
    ): Promise<boolean>;

    sPop(key: ItemKey, count?: number): Promise<Buffer>;

    sRandMember(key: ItemKey): Promise<Buffer>;

    sRem(key: ItemKey, ...values: StringValue[]): Promise<number>;

    sScan(
        key: ItemKey,
        cursor?: number,
        match?: ItemKey,
        count?: number
    ): Promise<ScanResult<Buffer[]>>;

    strLen(key: ItemKey): Promise<number>;

    subscribe(...subjects: string[]): Promise<string[]>;

    sUnion(...keys: ItemKey[]): Promise<Buffer[]>;

    sUnionStore(target: ItemKey, ...keys: ItemKey[]): Promise<number>;

    swapDB(db1: number, db2: number): Promise<void>;

    time(): Promise<TimeResult>;

    touch(key1: ItemKey, key2: ItemKey): Promise<number>;

    ttl(key: ItemKey): Promise<number>;

    type(key: ItemKey): Promise<string>;

    unsubscribe(...subjects: string[]): Promise<string[]>;

    wait(clients: number, timeout?: number): Promise<number>;
}
