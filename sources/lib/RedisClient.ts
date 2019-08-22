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
import * as Abstract from "./Abstract";
import { IDictionary as Dict } from "@litert/core";
import ItemKey = Abstract.ItemKey;
import StringValue = Abstract.StringValue;
import ListItem = Abstract.ListItem;
import ProtocolClient from "./ProtocolClient";
import SubscriberClient from "./SubscriberClient";
import * as Network from "./Network";
import { Readable } from "stream";

export class RedisClient
extends ProtocolClient
implements Abstract.RedisClient {

    private _password!: string;

    private _database!: number;

    private _subscriber!: SubscriberClient;

    private _listeners!: Dict<Array<Abstract.SubscriptionCallback | Readable>>;

    public constructor(
        connection: Net.Socket,
        host: string,
        port: number,
        createDecoder: Abstract.DecoderFactory,
        createEncoder: Abstract.EncoderFactory
    ) {

        super(connection, host, port, createDecoder, createEncoder);

        this._database = 0;
    }

    protected async _initializeSubscriber(): Promise<void> {

        this._listeners = {};

        this._subscriber = new SubscriberClient(
            await Network.createTCPConnection(this._host, this._port),
            this._host,
            this._port,
            this._decoderFactory,
            this._encoderFactory,
            this._password
        );

        if (this._password) {

            await this._subscriber.execute("AUTH", this._password);
        }

        this._subscriber.on("message", this._onMessage.bind(this))
        .on("error", (e) => this.emit("error", e));
    }

    protected _onMessage(
        subject: string,
        message: Buffer,
        pattern?: string
    ): void {

        let listenerList = this._listeners[subject] ||
                    (pattern && this._listeners[pattern]);

        if (!listenerList) {

            this.emit("uncaught_message", subject, message, pattern);
            return;
        }

        for (let listener of listenerList) {

            if (listener instanceof Readable) {

                listener.push({
                    subject,
                    message
                });
            }
            else {

                listener(subject, message);
            }
        }
    }

    public listen(
        subject: string,
        callback?: Abstract.SubscriptionCallback
    ): any {

        let fn: Abstract.SubscriptionCallback | Readable;
        fn = callback || new Readable({
            "objectMode": true,
            "read"() {}
        });

        if (!this._listeners[subject]) {

            this._listeners[subject] = [fn];
        }
        else {

            this._listeners[subject].push(fn);
        }

        if (fn !== callback) {

            return fn;
        }
    }

    public unlisten(
        subject: string,
        callback: Abstract.SubscriptionCallback | Readable
    ): this {

        let list = this._listeners[subject];

        if (!list) {

            return this;
        }

        let pos = list.indexOf(callback);

        if (pos !== -1) {

            list.splice(pos, 1);
        }

        return this;
    }

    protected async _onReconnected(): Promise<void> {

        if (this._password) {

            /**
             * Cache all imcoming commands before authentication completed.
             */
            this._forcePipeline();

            await this.executeNow(
                "AUTH", this._password
            );
        }

        if (this._database) {

            /**
             * Cache all imcoming commands before authentication completed.
             */
            this._forcePipeline();

            await this.executeNow(
                "SELECT", this._database.toString()
            );
        }

        return super._onReconnected();
    }

    public async exists(key: ItemKey): Promise<boolean> {

        return 1 === await this.execute<number>("EXISTS", key);
    }

    public async hExists(key: ItemKey, field: ItemKey): Promise<boolean> {

        return 1 === await this.execute<number>("HEXISTS", key, field);
    }

    public del(...keys: ItemKey[]): Promise<number> {

        return this.execute<number>("DEL", ...keys);
    }

    public dbSize(): Promise<number> {

        return this.execute<number>("DBSIZE");
    }

    public hDel(key: ItemKey, ...fields: ItemKey[]): Promise<number> {

        return this.execute<number>("HDEL", key, ...fields);
    }

    public get(key: ItemKey): Promise<Buffer> {

        return this.execute<Buffer>("GET", key);
    }

    public hGet(key: ItemKey, field: ItemKey): Promise<Buffer> {

        return this.execute<Buffer>("HGET", key, field);
    }

    public hLen(key: ItemKey): Promise<number> {

        return this.execute<number>("HLEN", key);
    }

    public async hKeys(key: ItemKey): Promise<ItemKey[]> {

        let ret: ItemKey[] = [];

        for (let item of await this.execute<ListItem>(
            "HKEYS", key
        )) {

            ret.push(item[1].toString());
        }

        return ret;
    }

    public async hVals(key: ItemKey): Promise<Buffer[]> {

        let ret: Buffer[] = [];

        for (let item of await this.execute<ListItem>(
            "HVALS", key
        )) {

            ret.push(item[1]);
        }

        return ret;
    }

    public async set(key: ItemKey, value: StringValue): Promise<void> {

        await this.execute<Buffer>(
            "SET", key, value
        );
    }

    public hStrLen(key: ItemKey, field: ItemKey): Promise<number> {

        return this.execute<number>("HSTRLEN", key, field);
    }

    public hSet(
        key: ItemKey,
        field: ItemKey,
        value: StringValue
    ): Promise<number> {

        return this.execute<number>(
            "HSET", key, field, value
        );
    }

    public async hSetNX(
        key: ItemKey,
        field: ItemKey,
        value: StringValue
    ): Promise<boolean> {

        return 1 === await this.execute<number>(
            "HSETNX", key, field, value
        );
    }

    public async rename(key: ItemKey, newKey: ItemKey): Promise<void> {

        await this.execute<Buffer>(
            "RENAME", key, newKey
        );
    }

    public async renameEx(key: ItemKey, newKey: ItemKey): Promise<boolean> {

        return 1 === await this.execute<number>(
            "RENAMEEX", key, newKey
        );
    }

    public touch(key1: ItemKey, key2: ItemKey): Promise<number> {

        return this.execute<number>(
            "TOUCH", key1, key2
        );
    }

    public async setNX(key: ItemKey, value: StringValue): Promise<boolean> {

        return 1 === await this.execute<number>(
            "SETNX", key, value
        );
    }

    public ping(payload?: StringValue): Promise<Buffer> {

        if (payload) {

            return this.execute<Buffer>(
                "PING", payload
            );
        }

        return this.execute<Buffer>("PING");
    }

    public echo(payload: StringValue): Promise<Buffer> {

        return this.execute<Buffer>(
            "ECHO", payload
        );
    }

    public async auth(value: string): Promise<void> {

        await this.execute("AUTH", value);
        this._password = value;
    }

    public async setEX(
        key: ItemKey,
        value: StringValue,
        ttl: number
    ): Promise<void> {

        await this.execute<Buffer>(
            "SETEX", key, ttl.toString(), value
        );
    }

    public async pSetEX(
        key: ItemKey,
        value: StringValue,
        ttl: number
    ): Promise<boolean> {

        return (await this.execute<Buffer>(
            "PSETEX", key, ttl.toString(), value
        )).toString() === "OK";
    }

    public async keys(format: StringValue): Promise<ItemKey[]> {

        let ret: ItemKey[] = [];

        for (let item of await this.execute<ListItem>("KEYS", format)) {

            ret.push(item[1].toString());
        }

        return ret;
    }

    public async incr(key: ItemKey, step?: number): Promise<number> {

        if (step !== undefined) {

            if (Number.isInteger(step)) {

                return this.execute<number>(
                    "INCRBY",
                    key,
                    step.toString()
                );
            }

            let result = await this.execute<Buffer | number>(
                "INCRBYFLOAT",
                key,
                step.toString()
            );

            if (typeof result === "number") {

                return result;
            }

            return parseFloat(result.toString());
        }

        return this.execute<number>("INCR", key);
    }

    public async hIncr(
        key: ItemKey,
        field: ItemKey,
        step?: number
    ): Promise<number> {

        if (step !== undefined) {

            if (Number.isInteger(step)) {

                return this.execute<number>(
                    "HINCRBY",
                    key,
                    field,
                    step.toString()
                );
            }

            let result = await this.execute<Buffer | number>(
                "HINCRBYFLOAT",
                key,
                field,
                step.toString()
            );

            if (typeof result === "number") {

                return result;
            }

            return parseFloat(result.toString());
        }

        return this.execute<number>("HINCRBY", key, field, "1");
    }

    public async hDecr(
        key: ItemKey,
        field: ItemKey,
        step?: number
    ): Promise<number> {

        if (step !== undefined) {

            if (Number.isInteger(step)) {

                return this.execute<number>(
                    "HINCRBY",
                    key,
                    field,
                    (-step).toString()
                );
            }

            let result = await this.execute<Buffer | number>(
                "HINCRBYFLOAT",
                key,
                field,
                (-step).toString()
            );

            if (typeof result === "number") {

                return result;
            }

            return parseFloat(result.toString());
        }

        return this.execute<number>("HINCRBY", key, field, "-1");
    }

    public append(key: ItemKey, value: StringValue): Promise<number> {

        return this.execute<number>("APPEND", key, value);
    }

    public async decr(key: ItemKey, step?: number): Promise<number> {

        if (step !== undefined) {

            if (Number.isInteger(step)) {

                return this.execute<number>(
                    "DECRBY",
                    key,
                    step.toString()
                );
            }

            let result = await this.execute<Buffer | number>(
                "INCRBYFLOAT",
                key,
                (-step).toString()
            );

            if (typeof result === "number") {

                return result;
            }

            return parseFloat(result.toString());
        }

        return this.execute<number>("DECR", key);
    }

    public strLen(key: ItemKey): Promise<number> {

        return this.execute<number>("STRLEN", key);
    }

    public async expire(key: ItemKey, ttl: number): Promise<boolean> {

        return 1 === await this.execute<number>(
            "EXPIRE",
            key,
            ttl.toString()
        );
    }

    public async pExpire(key: ItemKey, ttl: number): Promise<boolean> {

        return 1 === await this.execute<number>(
            "PEXPIRE",
            key,
            ttl.toString()
        );
    }

    public async persist(key: ItemKey): Promise<boolean> {

        return 1 === await this.execute<number>(
            "PERSIST",
            key
        );
    }

    public ttl(key: ItemKey): Promise<number> {

        return this.execute<number>("TTL", key);
    }

    public pTTL(key: ItemKey): Promise<number> {

        return this.execute<number>("PTTL", key);
    }

    public async type(key: ItemKey): Promise<string> {

        return (await this.execute<Buffer>("TYPE", key)).toString();
    }

    public async randomKey(): Promise<ItemKey> {

        let ret = await this.execute<Buffer>("RANDOMKEY");

        return ret ? ret.toString() : <any> null;
    }

    public async select(index: number): Promise<void> {

        await this.execute<Buffer>("SELECT", index.toString());

        this._database = index;
    }

    public async swapDB(db1: number, db2: number): Promise<void> {

        await this.execute<Buffer>(
            "SWAPDB", db1.toString(), db2.toString()
        );
    }

    public async move(
        key: ItemKey,
        targetDB: number
    ): Promise<boolean> {

        return 1 === await this.execute<number>(
            "MOVE",
            key,
            targetDB.toString()
        );
    }

    public async expireAt(
        key: ItemKey,
        time: number | Date
    ): Promise<boolean> {

        return 1 === await this.execute<number>(
            "EXPIREAT",
            key,
            ((typeof time === "number" ?
                time : time.getTime()
            ) / 1000).toString()
        );
    }

    public async pExpireAt(
        key: ItemKey,
        time: number | Date
    ): Promise<boolean> {

        return 1 === await this.execute<number>(
            "PEXPIREAT",
            key,
            (typeof time === "number" ? time : time.getTime()).toString()
        );
    }

    public async mSet(
        keySet: Dict<StringValue>
    ): Promise<void> {

        let keys: StringValue[] = [];

        for (let key in keySet) {

            keys.push(key);
            keys.push(keySet[key]);
        }

        await this.execute("MSET", ...keys);
    }

    public async hMSet(
        key: ItemKey,
        fieldSet: Dict<StringValue>
    ): Promise<void> {

        let els: StringValue[] = [];

        for (let field in fieldSet) {

            els.push(field);
            els.push(fieldSet[field]);
        }

        await this.execute("HMSET", key, ...els);
    }

    public async mSetNX(
        keySet: Dict<StringValue>
    ): Promise<boolean> {

        let keys: StringValue[] = [];

        for (let key in keySet) {

            keys.push(key);
            keys.push(keySet[key]);
        }

        return 1 === await this.execute<number>("MSETNX", ...keys);
    }

    public async mGet(keys: ItemKey[]): Promise<Dict<Buffer>> {

        let ret: Dict<Buffer> = {};

        let data = await this.execute<Buffer[]>(
            "MGET",
            ...keys
        );

        for (let i = 0; i < keys.length; i++) {

            ret[keys[i]] = <any> data[i][1];
        }

        return ret;
    }

    public async hMGet(
        key: ItemKey,
        fields: ItemKey[]
    ): Promise<Dict<Buffer>> {

        let ret: Dict<Buffer> = {};

        let data = await this.execute<Buffer[]>(
            "HMGET",
            key,
            ...fields
        );

        for (let i = 0; i < fields.length; i++) {

            ret[fields[i]] = <any> data[i][1];
        }

        return ret;
    }

    public async hGetAll(
        key: ItemKey
    ): Promise<Dict<Buffer>> {

        let ret: Dict<Buffer> = {};

        let data = await this.execute<Abstract.ListItem[]>(
            "HGETALL",
            key
        );

        for (let i = 0; i < data.length; i += 2) {

            let field = data[i][1];

            if (typeof field !== "string") {

                field = field.toString();
            }

            ret[field] = <any> data[i + 1][1];
        }

        return ret;
    }

    public lPush(key: ItemKey, ...values: StringValue[]): Promise<number> {

        return this.execute<number>("LPUSH", key, ...values);
    }

    public rPush(key: ItemKey, ...values: StringValue[]): Promise<number> {

        return this.execute<number>("RPUSH", key, ...values);
    }

    public lPushX(key: ItemKey, value: StringValue): Promise<number> {

        return this.execute<number>("LPUSHX", key, value);
    }

    public rPushX(key: ItemKey, value: StringValue): Promise<number> {

        return this.execute<number>("RPUSHX", key, value);
    }

    public lPop(key: ItemKey): Abstract.AsyncNullable<Buffer> {

        return this.execute<Buffer>("LPOP", key);
    }

    public rPop(key: ItemKey): Abstract.AsyncNullable<Buffer> {

        return this.execute<Buffer>("RPOP", key);
    }

    public async lSet(
        key: ItemKey,
        index: number,
        value: StringValue
    ): Promise<void> {

        await this.execute("LSET", key, index.toString(), value);
    }

    public lInsertAfter(
        key: ItemKey,
        value: StringValue,
        pivot: StringValue
    ): Promise<number> {

        return this.execute<number>(
            "LINSERT", key, "AFTER", pivot, value
        );
    }

    public lInsertBefore(
        key: ItemKey,
        value: StringValue,
        pivot: StringValue
    ): Promise<number> {

        return this.execute<number>(
            "LINSERT", key, "BEFORE", pivot, value
        );
    }

    public lLen(
        key: ItemKey
    ): Promise<number> {

        return this.execute<number>(
            "LLEN", key
        );
    }

    public lRem(
        key: ItemKey,
        count: number,
        match: StringValue
    ): Promise<number> {

        return this.execute<number>(
            "LREM", key, count.toString(), match
        );
    }

    public async lTrim(
        key: ItemKey,
        start: number,
        end: number
    ): Promise<void> {

        await this.execute(
            "LTRIM", key, start.toString(), end.toString()
        );
    }

    public async lRange(
        key: ItemKey,
        start: number,
        end: number
    ): Promise<Buffer[]> {

        let ret: Buffer[] = [];

        for (let item of await this.execute<ListItem[]>(
            "LRANGE", key, start.toString(), end.toString()
        )) {

            ret.push(item[1]);
        }

        return ret;
    }

    public lIndex(
        key: ItemKey,
        index: number
    ): Abstract.AsyncNullable<Buffer> {

        return this.execute<Buffer>(
            "LINDEX", key, index.toString()
        );
    }

    public rPopLPush(
        source: ItemKey,
        target: ItemKey
    ): Abstract.AsyncNullable<Buffer> {

        return this.execute<Buffer>(
            "RPOPLPUSH", source, target
        );
    }

    public async hScan(
        key: ItemKey,
        cursor?: number,
        match?: ItemKey,
        count?: number
    ): Promise<Abstract.ScanResult<Dict<Buffer>>> {

        if (cursor === undefined) {

            cursor = 0;
        }

        let req: StringValue[] = [key, cursor.toString()];

        if (match !== undefined) {

            req.push("MATCH");
            req.push(match);
        }

        if (count !== undefined) {

            req.push("COUNT");
            req.push(count.toString());
        }

        let ret: Abstract.ScanResult<Dict<Buffer>> = {
            "next": 0,
            "keys": {}
        };

        let data = await this.execute<ListItem[]>("HSCAN", ...req);

        ret.next = parseInt(data[0][1].toString());

        data = data[1][1];

        for (let i = 0; i < data.length; i += 2) {

            ret.keys[data[i][1].toString()] = data[i + 1][1];
        }

        return ret;
    }

    public async scan(
        cursor?: number,
        match?: ItemKey,
        count?: number
    ): Promise<Abstract.ScanResult> {

        if (cursor === undefined) {

            cursor = 0;
        }

        let req: StringValue[] = [cursor.toString()];

        if (match !== undefined) {

            req.push("MATCH");
            req.push(match);
        }

        if (count !== undefined) {

            req.push("COUNT");
            req.push(count.toString());
        }

        let ret: Abstract.ScanResult = {
            "next": 0,
            "keys": []
        };

        let data = await this.execute<ListItem[]>("SCAN", ...req);

        ret.next = parseInt(data[0][1].toString());

        for (let item of data[1][1]) {

            ret.keys.push(item[1].toString());
        }

        return ret;
    }

    public wait(clients: number, timeout: number = 0): Promise<number> {

        return this.execute<number>(
            "WAIT", clients.toString(), timeout.toString()
        );
    }

    public pfAdd(key: ItemKey, ...values: StringValue[]): Promise<number> {

        return this.execute<number>(
            "PFADD", key, ...values
        );
    }

    public pfCount(key: ItemKey): Promise<number> {

        return this.execute<number>(
            "PFCOUNT", key
        );
    }

    public async pfMerge(
        target: ItemKey,
        ...keys: StringValue[]
    ): Promise<void> {

        await this.execute(
            "PFMERGE", target, ...keys
        );
    }

    public async flushDB(async?: boolean): Promise<void> {

        if (async) {

            await this.execute("FLUSHDB", "ASYNC");
            return;
        }

        await this.execute("FLUSHDB");
    }

    public async flushAll(async?: boolean): Promise<void> {

        if (async) {

            await this.execute("FLUSHALL", "ASYNC");
            return;
        }

        await this.execute("FLUSHALL");
    }

    public async eval(
        script: StringValue,
        keys: StringValue[],
        args: StringValue[]
    ): Promise<any> {

        let data = await this.execute<any>(
            "EVAL", script, keys.length.toString(), ...keys, ...args
        );

        if (typeof data === "number") {

            return data;
        }

        if (Array.isArray(data)) {

            let ret: any[] = [];

            for (let item of data) {

                ret.push(item[1]);
            }
        }

        return data;
    }

    public async evalSHA(
        sha1: StringValue,
        keys: StringValue[],
        args: StringValue[]
    ): Promise<any> {

        let data = await this.execute<any>(
            "EVALSHA", sha1, keys.length.toString(), ...keys, ...args
        );

        if (typeof data === "number") {

            return data;
        }

        if (Array.isArray(data)) {

            let ret: any[] = [];

            for (let item of data) {

                ret.push(item[1]);
            }
        }

        return data;
    }

    public async scriptExists(...sha1: string[]): Promise<Dict<Boolean>> {

        let ret: Dict<boolean> = {};

        let data = await this.execute<ListItem[]>(
            "SCRIPT", "EXISTS", ...sha1
        );

        for (let i = 0; i < data.length; i++) {

            ret[sha1[i].toString()] = data[i][1] ? true : false;
        }

        return ret;
    }

    public async scriptFlush(): Promise<void> {

        await this.execute("SCRIPT", "FLUSH");
    }

    public async scriptKill(): Promise<void> {

        await this.execute("SCRIPT", "KILL");
    }

    public async scriptLoad(script: StringValue): Promise<string> {

        return (await this.execute<Buffer>(
            "SCRIPT", "LOAD", script
        )).toString();
    }

    public async time(): Promise<Abstract.TimeResult> {

        let ret: Dict<number> = {};

        let data = await this.execute<ListItem[]>("TIME");

        ret.seconds = data[0][1];

        ret.microSeconds = data[1][1];

        return <any> ret;
    }

    public sAdd(key: ItemKey, ...values: StringValue[]): Promise<number> {

        return this.execute<number>("SADD", key, ...values);
    }

    public sCard(key: ItemKey): Promise<number> {

        return this.execute<number>("SCARD", key);
    }

    public async sDiff(...keys: ItemKey[]): Promise<Buffer[]> {

        let data = await this.execute<ListItem[]>("SDIFF", ...keys);

        let ret: Buffer[] = [];

        for (let item of data) {

            ret.push(item[1]);
        }

        return ret;
    }

    public sDiffStore(target: ItemKey, ...keys: ItemKey[]): Promise<number> {

        return this.execute<number>(
            "SDIFFSTORE", target, ...keys
        );
    }

    public async sInter(...keys: ItemKey[]): Promise<Buffer[]> {

        let data = await this.execute<ListItem[]>("SINTER", ...keys);

        let ret: Buffer[] = [];

        for (let item of data) {

            ret.push(item[1]);
        }

        return ret;
    }

    public sInterStore(target: ItemKey, ...keys: ItemKey[]): Promise<number> {

        return this.execute<number>(
            "SINTERSTORE", target, ...keys
        );
    }

    public async sIsMember(key: ItemKey, value: StringValue): Promise<boolean> {

        return 1 === await this.execute<number>(
            "SISMEMBER", key, value
        );
    }

    public async sMembers(key: ItemKey): Promise<Buffer[]> {

        let data = await this.execute<ListItem[]>("SMEMBERS", key);

        let ret: Buffer[] = [];

        for (let item of data) {

            ret.push(item[1]);
        }

        return ret;
    }

    public async sMove(
        source: ItemKey,
        target: ItemKey,
        value: StringValue
    ): Promise<boolean> {

        return 1 === await this.execute<number>(
            "SMOVE",
            source,
            target,
            value
        );
    }

    public sPop(key: ItemKey, count?: number): Promise<Buffer> {

        if (count !== undefined) {

            return this.execute<Buffer>("SPOP", key, count.toString());
        }

        return this.execute<Buffer>("SPOP", key);
    }

    public sRandMember(key: ItemKey): Promise<Buffer> {

        return this.execute<Buffer>("SRANDMEMBER", key);
    }

    public sRem(key: ItemKey, ...values: StringValue[]): Promise<number> {

        return this.execute<number>("SREM", key, ...values);
    }

    public async sScan(
        key: ItemKey,
        cursor?: number,
        match?: ItemKey,
        count?: number
    ): Promise<Abstract.ScanResult<Buffer[]>> {

        if (cursor === undefined) {

            cursor = 0;
        }

        let req: StringValue[] = [cursor.toString()];

        if (match !== undefined) {

            req.push("MATCH");
            req.push(match);
        }

        if (count !== undefined) {

            req.push("COUNT");
            req.push(count.toString());
        }

        let ret: Abstract.ScanResult<Buffer[]> = {
            "next": 0,
            "keys": []
        };

        let data = await this.execute<ListItem[]>("SSCAN", ...req);

        ret.next = parseInt(data[0][1].toString());

        for (let item of data[1][1]) {

            ret.keys.push(item[1]);
        }

        return ret;
    }

    public async sUnion(...keys: ItemKey[]): Promise<Buffer[]> {

        let data = await this.execute<ListItem[]>("SUNION", ...keys);

        let ret: Buffer[] = [];

        for (let item of data) {

            ret.push(item[1]);
        }

        return ret;
    }

    public sUnionStore(target: ItemKey, ...keys: ItemKey[]): Promise<number> {

        return this.execute<number>(
            "SUNIONSTORE", target, ...keys
        );
    }

    public async pSubscribe(...patterns: string[]): Promise<string[]> {

        if (!this._subscriber) {

            await this._initializeSubscriber();
        }

        return this._subscriber.pSubscribe(
            ...patterns
        );
    }

    public publish(subject: string, message: StringValue): Promise<number> {

        return this.execute<number>(
            "PUBLISH", subject, message
        );
    }

    public async subscribe(...subjects: string[]): Promise<string[]> {

        if (!this._subscriber) {

            await this._initializeSubscriber();
        }

        return this._subscriber.subscribe(
            ...subjects
        );
    }

    public unsubscribe(...subjects: string[]): Promise<string[]> {

        if (!this._subscriber) {

            return Promise.resolve<string[]>([]);
        }

        return this._subscriber.unsubscribe(
            ...subjects
        );
    }

    public async close(): Promise<void> {

        if (this._subscriber) {

            await Promise.all([super.close(), this._subscriber.close()]);
            delete this._subscriber;
        }

        return super.close();
    }

}

export default RedisClient;
