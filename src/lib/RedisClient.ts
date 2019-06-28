// tslint:disable: no-unused-expression
import * as C from "./Common";
import * as U from "./Utils";
import { BaseClient } from "./BaseClient";

export class RedisCommandClient
extends BaseClient
implements C.ICommandClient {

    public constructor(
        host: string,
        port: number,
        _decoder: C.IDecoder,
        _encoder: C.IEncoder
    ) {

        super(host, port, _decoder, _encoder);
    }

    public strLen(k: string): Promise<number> {

        return this.command("STRLEN", [k]);
    }

    public append(k: string, v: string | Buffer): Promise<number> {

        return this.command("APPEND", [k, v]);
    }

    public async incr(k: string, step: number = 1): Promise<number> {

        return this.command("INCRBY", [k, step]);
    }

    public async incrByFloat(k: string, s: number): Promise<number> {

        return parseFloat(await this.command("INCRBYFLOAT", [k, s]));
    }

    public async decr(k: string, step: number = 1): Promise<number> {

        return this.command("DECRBY", [k, step]);
    }

    public async decrByFloat(k: string, step: number): Promise<number> {

        return parseFloat(await this.command("INCRBYFLOAT", [k, -step]));
    }

    public async ping(text?: string): Promise<string> {

        const ret = await this.command("PING", text ? [text] : []);

        return (typeof ret === "string") ? ret : ret.toString();
    }

    public del(k: string[]): Promise<number> {

        return this.command("DEL", k);
    }

    public unlink(k: string[]): Promise<number> {

        return this.command("UNLINK", k);
    }

    public ttl(k: string): Promise<number> {

        return this.command("TTL", [k]);
    }

    public pTTL(k: string): Promise<number> {

        return this.command("PTTL", [k]);
    }

    public async expire(k: string, ttl: number): Promise<boolean> {

        return 1 === await this.command("EXPIRE", [k, ttl]);
    }

    public async expireAt(k: string, ts: number): Promise<boolean> {

        return 1 === await this.command("EXPIREAT", [k, ts]);
    }

    public async pExpire(k: string, ttl: number): Promise<boolean> {

        return 1 === await this.command("PEXPIRE", [k, ttl]);
    }

    public async pExpireAt(k: string, ts: number): Promise<boolean> {

        return 1 === await this.command("PEXPIREAT", [k, ts]);
    }

    public async persist(key: string): Promise<boolean> {

        return 1 === await this.command("PERSIST", [key]);
    }

    public async get(k: string): Promise<string | null> {

        const ret = await this.command("GET", [k]);

        return ret ? ret.toString() : null;
    }

    public get$(k: string): Promise<Buffer | null> {

        return this.command("GET", [k]);
    }

    public async set(k: string, v: string | Buffer, ttl?: number): Promise<boolean> {

        return "OK" === await this.command("SET", ttl ? [k, v, "EX", ttl] : [k, v]);
    }

    public async pSetEx(k: string, v: string | Buffer, ttl: number): Promise<boolean> {

        return "OK" === await this.command("SET", [k, v, "PX", ttl]);
    }

    public async setEX(k: string, v: string | Buffer, ttl: number): Promise<boolean> {

        return "OK" === await this.command("SET", [k, v, "EX", ttl]);
    }

    public async replace(k: string, v: string | Buffer, ttl: number): Promise<boolean> {

        return "OK" === await this.command("SET", [k, v, "EX", ttl, "XX"]);
    }

    public async pReplace(k: string, v: string | Buffer, ttl: number): Promise<boolean> {

        return "OK" === await this.command("SET", [k, v, "PX", ttl, "XX"]);
    }

    public async setNX(k: string, v: string | Buffer, ttl?: number): Promise<boolean> {

        return "OK" === await this.command("SET", ttl ? [k, v, "EX", ttl, "NX"] : [k, v, "NX"]);
    }

    public async pSetNX(k: string, v: string | Buffer, ttl?: number): Promise<boolean> {

        return "OK" === await this.command("SET", ttl ? [k, v, "PX", ttl, "NX"] : [k, v, "NX"]);
    }

    public async getSet(k: string, v: string | Buffer): Promise<string | null> {

        const ret = await this.command("GETSET", [k, v]);

        return ret ? ret.toString() : null;
    }

    public getSet$(k: string, v: Buffer): Promise<Buffer | null> {

        return this.command("GETSET", [k, v]);
    }

    public async exists(k: string): Promise<boolean> {

        return 1 === await this.command("EXISTS", [k]);
    }

    public async type(k: string): Promise<string> {

        return (await this.command("TYPE", [k])).toString();
    }

    public async move(key: string, db: number): Promise<boolean> {

        return 1 === await this.command("MOVE", [key, db]);
    }

    public async randomKey(): Promise<string | null> {

        const ret = await this.command("RANDOMKEY", []);

        return ret ? ret.toString() : null;
    }

    public async rename(from: string, to: string): Promise<void> {

        await this.command("RENAME", [from, to]);
    }

    public async renameNX(from: string, to: string): Promise<boolean> {

        return 1 === await this.command("RENAMENX", [from, to]);
    }

    public async select(db: number): Promise<void> {

        await this.command("SELECT", [db]);
    }

    public hDel(k: string, f: string[]): Promise<number> {

        return this.command("HDEL", [k, ...f]);
    }

    public async hGet(k: string, f: string): Promise<string | null> {

        const ret = await this.command("HGET", [k, f]);

        return ret ? ret.toString() : null;
    }

    public hGet$(k: string, f: string): Promise<Buffer | null> {

        return this.command("HGET", [k, f]);
    }

    public async hGetAll(k: string): Promise<Record<string, string | null>> {

        return U.pairList2NullableStringDict(await this.command("HGETALL", [k]));
    }

    public async hGetAll$(k: string): Promise<Record<string, Buffer | null>> {

        return U.pairList2NullableBufferDict(await this.command("HGETALL", [k]));
    }

    public async hSet(k: string, f: string, v: string | Buffer): Promise<boolean> {

        return 1 === await this.command("HSET", [k, f, v]);
    }

    public async hSetNX(k: string, f: string, v: string | Buffer): Promise<boolean> {

        return 1 === await this.command("HSETNX", [k, f, v]);
    }

    public async hExists(k: string, f: string): Promise<boolean> {

        return 1 === await this.command("HEXISTS", [k, f]);
    }

    public async keys(pattern: string): Promise<string[]> {

        return (await this.command("KEYS", [pattern])).map((x: [number, Buffer]) => x[1].toString());
    }

    public dump(k: string): Promise<Buffer | null> {

        return this.command("DUMP", [k]);
    }

    public async restore(
        key: string,
        value: Buffer,
        ttl: number = 0,
        replace: boolean = false,
        absTTL: boolean = false,
        freq?: number,
        idleTime?: number
    ): Promise<void> {

        const req: any[] = [key, ttl, value];

        replace && req.push("REPLACE");
        absTTL && req.push("ABSTTL");
        idleTime && req.push("IDLETIME", idleTime);
        freq && req.push("FREQ", freq);

        await this.command("RESTORE", req);
    }

    public touch(keys: string[]): Promise<number> {

        return this.command("TOUCH", keys);
    }

    public async mGet(keys: string[]): Promise<Record<string, string | null>> {

        const data: Array<[number, Buffer]> = await this.command("MGET", keys);

        const ret: Record<string, string | null> = {};

        for (let i = 0; i < keys.length; i++) {

            ret[keys[i]] = data[i][1] ? data[i][1].toString() : null;
        }

        return ret;
    }

    public async mGet$(keys: string[]): Promise<Record<string, Buffer | null>> {

        const data: Array<[number, Buffer]> = await this.command("MGET", keys);

        const ret: Record<string, Buffer | null> = {};

        for (let i = 0; i < keys.length; i++) {

            ret[keys[i]] = data[i][1];
        }

        return ret;
    }

    public async mSet(kv: Record<string, string | Buffer>): Promise<void> {

        const req: any[] = [];

        for (const k in kv) {

            req.push(k, kv[k]);
        }

        await this.command("MSET", req);
    }

    public async mSetNX(kv: Record<string, string | Buffer>): Promise<boolean> {

        const req: any[] = [];

        for (const k in kv) {

            req.push(k, kv[k]);
        }

        return 1 === await this.command("MSETNX", req);
    }

    public async hIncr(k: string, f: string, s: number = 1): Promise<number> {

        return this.command("HINCRBY", [k, f, s]);
    }

    public async hIncrByFloat(k: string, f: string, s: number): Promise<number> {

        return parseFloat(await this.command("HINCRBYFLOAT", [k, f, s]));
    }

    public async hDecr(k: string, f: string, s: number = 1): Promise<number> {

        return this.command("HINCRBY", [k, f, -s]);
    }

    public async hDecrByFloat(k: string, f: string, s: number = 1): Promise<number> {

        return parseFloat(await this.command("HINCRBYFLOAT", [k, f, -s]));
    }

    public async hKeys(k: string): Promise<string[]> {

        return (await this.command("HKEYS", [k])).map((x: [number, Buffer]) => x[1].toString());
    }

    public async hVals(k: string): Promise<string[]> {

        return (await this.command("HVALS", [k])).map((x: [number, Buffer]) => x[1].toString());
    }

    public async hVals$(k: string): Promise<Buffer[]> {

        return (await this.command("HVALS", [k])).map((x: [number, Buffer]) => x[1]);
    }

    public hLen(k: string): Promise<number> {

        return this.command("HLEN", [k]);
    }

    public async hMGet(key: string, fields: string[]): Promise<Record<string, string | null>> {

        const data: Array<[number, Buffer]> = await this.command("HMGET", [key, ...fields]);

        const ret: Record<string, string | null> = {};

        for (let i = 0; i < fields.length; i++) {

            ret[fields[i]] = data[i] ? data[i][1].toString() : null;
        }

        return ret;
    }

    public async hMGet$(key: string, fields: string[]): Promise<Record<string, Buffer | null>> {

        const data: Array<[number, Buffer]> = await this.command("HMGET", [key, ...fields]);

        const ret: Record<string, Buffer | null> = {};

        for (let i = 0; i < fields.length; i++) {

            ret[fields[i]] = data[i][1];
        }

        return ret;
    }

    public async hMSet(k: string, fv: Record<string, string | Buffer>): Promise<void> {

        const req: any[] = [k];

        for (const f in fv) {

            req.push(f, fv[f]);
        }

        await this.command("HMSET", req);
    }

    public hStrLen(k: string, f: string): Promise<number> {

        return this.command("HSTRLEN", [k, f]);
    }

    public async scan(cur: number, p?: string, cn?: number): Promise<C.IScanResult<string>> {

        const args: any[] = [cur];

        p && args.push("MATCH", p);
        cn && args.push("COUNT", cn);

        const data = await this.command("SCAN", args);

        return {
            "nextCursor": parseInt(data[0][1].toString()),
            "items": data[1][1].map((x: [number, Buffer]) => x[1].toString())
        };
    }

    public async hScan(k: string, c: number, p?: string, cn?: number): Promise<C.IScanResult<string>> {

        const req: any[] = [k, c];

        p && req.push("MATCH", p);
        cn && req.push("COUNT", cn);

        const data = await this.command("HSCAN", req);

        return {
            "nextCursor": parseInt(data[0][1].toString()),
            "items": data[1][1].map((x: [number, Buffer]) => x[1].toString())
        };
    }

    public sAdd(k: string, vs: Array<string | Buffer>): Promise<number> {

        return this.command("SADD", [k, ...vs]);
    }

    public sCard(key: string): Promise<number> {

        return this.command("SCARD", [key]);
    }

    public async sDiff(k: string[]): Promise<string[]> {

        return (await this.command("SDIFF", k)).map((x: [number, Buffer]) => x[1].toString());
    }

    public async sDiff$(k: string[]): Promise<Buffer[]> {

        return (await this.command("SDIFF", k)).map((x: [number, Buffer]) => x[1]);
    }

    public sDiffStore(k: string[], t: string): Promise<number> {

        return this.command("SDIFFSTORE", [t, ...k]);
    }

    public async sInter(k: string[]): Promise<string[]> {

        return (await this.command("SINTER", k)).map((x: [number, Buffer]) => x[1].toString());
    }

    public async sInter$(k: string[]): Promise<Buffer[]> {

        return (await this.command("SINTER", k)).map((x: [number, Buffer]) => x[1]);
    }

    public sInterStore(k: string[], t: string): Promise<number> {

        return this.command("SINTERSTORE", [t, ...k]);
    }

    public async sUnion(k: string[]): Promise<string[]> {

        return (await this.command("SUNION", k)).map((x: [number, Buffer]) => x[1].toString());
    }

    public async sUnion$(k: string[]): Promise<Buffer[]> {

        return (await this.command("SUNION", k)).map((x: [number, Buffer]) => x[1]);
    }

    public sUnionStore(k: string[], t: string): Promise<number> {

        return this.command("SUNIONSTORE", [t, ...k]);
    }

    public async sIsMember(k: string, v: string | Buffer): Promise<boolean> {

        return 1 === await this.command("SISMEMBER", [k, v]);
    }

    public async sMembers(k: string): Promise<string[]> {

        return (await this.command("SMEMBERS", [k])).map((x: [number, Buffer]) => x[1].toString());
    }

    public async sMembers$(k: string): Promise<Buffer[]> {

        return (await this.command("SMEMBERS", [k])).map((x: [number, Buffer]) => x[1]);
    }

    public async sMove(f: string, t: string, v: string | Buffer): Promise<boolean> {

        return await this.command("SMOVE", [f, t, v]);
    }

    public async sPop(k: string, c: number = 1): Promise<string[]> {

        const ret = await this.command("SPOP", [k, c]);

        return ret ? ret.map((x: [number, Buffer]) => x[1].toString()) : [];
    }

    public async sPop$(k: string, c: number = 1): Promise<Buffer[]> {

        const ret = await this.command("SPOP", [k, c]);

        return ret ? ret.map((x: [number, Buffer]) => x[1]) : [];
    }

    public async sRandMember(k: string, c: number = 1): Promise<string[]> {

        const ret = await this.command("SRANDMEMBER", [k, c]);

        return ret ? ret.map((x: [number, Buffer]) => x[1].toString()) : [];
    }

    public async sRandMember$(k: string, c: number = 1): Promise<Buffer[]> {

        const ret = await this.command("SRANDMEMBER", [k, c]);

        return ret ? ret.map((x: [number, Buffer]) => x[1]) : [];
    }

    public sRem(k: string, v: Array<string | Buffer>): Promise<number> {

        return this.command("SREM", [k, v]);
    }

    public async sScan(k: string, c: number, p?: string, cn?: number): Promise<C.IScanResult<string>> {

        const req: any[] = [k, c];

        p && req.push("MATCH", p);
        cn && req.push("COUNT", cn);

        const data = await this.command("SSCAN", req);

        return {
            "nextCursor": parseInt(data[0][1].toString()),
            "items": data[1][1].map((x: [number, Buffer]) => x[1].toString())
        };
    }

    public async sScan$(k: string, c: number, p?: Buffer, cn?: number): Promise<C.IScanResult<Buffer>> {

        const req: any[] = [k, c];

        p && req.push("MATCH", p);
        cn && req.push("COUNT", cn);

        const data = await this.command("SSCAN", req);

        return {
            "nextCursor": data[0],
            "items": data[1]
        };
    }

    public async bLPop(keys: string[], timeout: number): Promise<Record<string, string>> {

        const data: Array<[number, Buffer]> = await this.command("BLPOP", [...keys, timeout]);

        const ret: Record<string, string> = {};

        if (!data) {

            return ret;
        }

        for (let i = 0; i < data.length; i += 2) {

            ret[data[i][1].toString()] = data[i + 1][1].toString();
        }

        return ret;
    }

    public async bLPop$(keys: string[], timeout: number): Promise<Record<string, Buffer>> {

        const data: Array<[number, Buffer]> = await this.command("BLPOP", [...keys, timeout]);

        const ret: Record<string, Buffer> = {};

        if (!data) {

            return ret;
        }

        for (let i = 0; i < data.length; i += 2) {

            ret[data[i][1].toString()] = data[i + 1][1];
        }

        return ret;
    }

    public async bRPop(keys: string[], timeout: number): Promise<Record<string, string>> {

        const data: Array<[number, Buffer]> = await this.command("BRPOP", [...keys, timeout]);

        const ret: Record<string, string> = {};

        if (!data) {

            return ret;
        }

        for (let i = 0; i < data.length; i += 2) {

            ret[data[i][1].toString()] = data[i + 1][1].toString();
        }

        return ret;
    }

    public async bRPop$(keys: string[], timeout: number): Promise<Record<string, Buffer>> {

        const data: Array<[number, Buffer]> = await this.command("BRPOP", [...keys, timeout]);

        const ret: Record<string, Buffer> = {};

        if (!data) {

            return ret;
        }

        for (let i = 0; i < data.length; i += 2) {

            ret[data[i][1].toString()] = data[i + 1][1];
        }

        return ret;
    }

    public async bRPopLPush(from: string, to: string, timeout: number): Promise<string | null> {

        const data = await this.command("BRPOPLPUSH", [from, to, timeout]);

        return data ? data.toString() : null;
    }

    public bRPopLPush$(from: string, to: string, timeout: number): Promise<Buffer | null> {

        return this.command("BRPOPLPUSH", [from, to, timeout]);
    }

    public async lIndex(k: string, i: number): Promise<string | null> {

        const data = await this.command("LINDEX", [k, i]);

        return data ? data.toString() : null;
    }

    public lIndex$(k: string, i: number): Promise<Buffer | null> {

        return this.command("LINDEX", [k, i]);
    }

    public lInsertBefore(k: string, p: string, v: string | Buffer): Promise<number> {

        return this.command("LINSERT", [k, "BEFORE", p, v]);
    }

    public lInsertAfter(k: string, p: string, v: string | Buffer): Promise<number> {

        return this.command("LINSERT", [k, "AFTER", p, v]);
    }

    public lLen(k: string): Promise<number> {

        return this.command("LLEN", [k]);
    }

    public async lPop(k: string): Promise<string | null> {

        const data = await this.command("LPOP", [k]);

        return data ? data.toString() : null;
    }

    public async lPop$(k: string): Promise<Buffer | null> {

        return this.command("LPOP", [k]);
    }

    public lPush(k: string, v: Array<string | Buffer>): Promise<number> {

        return this.command("LPUSH", [k, ...v]);
    }

    public lPushX(k: string, v: Array<string | Buffer>): Promise<number> {

        return this.command("LPUSHX", [k, ...v]);
    }

    public async lRange(k: string, start: number, stop: number): Promise<string[]> {

        return (await this.command("LRANGE", [k, start, stop])).map((x: [number, Buffer]) => x[1].toString());
    }

    public async lRange$(k: string, start: number, stop: number): Promise<Buffer[]> {

        return (await this.command("LRANGE", [k, start, stop])).map((x: [number, Buffer]) => x[1]);
    }

    public lRem(key: string, value: string | Buffer, count: number): Promise<number> {

        return this.command("LREM", [key, count, value]);
    }

    public async lSet(key: string, value: string | Buffer, index: number): Promise<void> {

        await this.command("LSET", [key, index, value]);
    }

    public async lTrim(key: string, start: number, stop: number): Promise<void> {

        await this.command("LTRIM", [key, start, stop]);
    }

    public async rPop(k: string): Promise<string | null> {

        const data = await this.command("RPOP", [k]);

        return data ? data.toString() : null;
    }

    public async rPop$(k: string): Promise<Buffer | null> {

        return this.command("RPOP", [k]);
    }

    public rPush(k: string, v: Array<string | Buffer>): Promise<number> {

        return this.command("RPUSH", [k, ...v]);
    }

    public rPushX(k: string, v: Array<string | Buffer>): Promise<number> {

        return this.command("RPUSHX", [k, ...v]);
    }

    public async pfAdd(k: string, v: Array<string | Buffer>): Promise<boolean> {

        return 1 === await this.command("PFADD", [k, ...v]);
    }

    public pfCount(k: string): Promise<number> {

        return this.command("PFCOUNT", [k]);
    }

    public async pfMerge(keys: string[], target: string): Promise<void> {

        await this.command("PFMERGE", [target, ...keys]);
    }

    public async rPopLPush(from: string, to: string): Promise<string> {

        const ret = await this.command("RPOPLPUSH", [from, to]);

        return ret ? ret.toString() : null;
    }

    public rPopLPush$(from: string, to: string): Promise<Buffer> {

        return this.command("RPOPLPUSH", [from, to]);
    }

    public publish(channel: string, data: Buffer | string): Promise<number> {

        return this.command("PUBLISH", [channel, data]);
    }

    public async pubSubChannels(p?: string): Promise<string[]> {

        return (await this.command("PUBSUB", p ? ["CHANNELS", p] : ["CHANNELS"])).map(
            (x: [number, Buffer]) => x[1].toString()
        );
    }

    public async pubSubNumSub(channels: string[]): Promise<Record<string, number>> {

        const ret: Record<string, number> = {};

        const data = await this.command("PUBSUB", ["NUMSUB", ...channels]);

        for (let i = 0; i < data.length; i += 2) {

            ret[data[i][1].toString()] = data[i + 1][1];
        }

        return ret;
    }

    public pubSubNumPat(): Promise<number> {

        return this.command("PUBSUB", ["NUMPAT"]);
    }
}
