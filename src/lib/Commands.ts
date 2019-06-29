// tslint:disable: no-unused-expression
import * as C from "./Common";
import * as U from "./Utils";

export interface IPrepareResult {

    "cmd": string;

    "args": Array<string | Buffer | number>;
}

export type TProcessor = null | ((data: any, args: any[]) => any);

export interface ICommand {

    prepare(...args: any[]): IPrepareResult;

    process?: TProcessor;
}

function isStringOK(data: any): boolean {

    return "OK" === (data && data.toString());
}

function isIntegerOne(data: any): boolean {

    return 1 === data;
}

function createDefaultPreparer(cmd: string): Required<ICommand>["prepare"] {

    return (...args: Array<string | Buffer>) => ({args, cmd});
}

export const COMMANDS: Record<keyof C.ICommandAPIs, ICommand> = {

    /**
     * Command: append
     * @see https://redis.io/commands/append
     */
    "append": { "prepare": createDefaultPreparer("APPEND") },

    /**
     * Command: auth
     * @see https://redis.io/commands/auth
     */
    "auth": { "prepare": createDefaultPreparer("AUTH") },

    /**
     * Command: ping
     * @see https://redis.io/commands/ping
     */
    "ping": {
        prepare(text?: string): IPrepareResult {

            return {
                "cmd": "PING",
                "args": text ? [text] : []
            };
        },
        process(data: any, args: any[]): string {

            return data instanceof Buffer ? data.toString() : data;
        }
    },

    /**
     * Command: incr
     * @see https://redis.io/commands/incr
     */
    "incr": {
        prepare(key: string, step: number): IPrepareResult {

            return {
                "cmd": "INCRBY",
                "args": [key, step]
            };
        }
    },

    /**
     * Command: incrByFloat
     * @see https://redis.io/commands/incrByFloat
     */
    "incrByFloat": {
        prepare(key: string, step: number): IPrepareResult {

            return {
                "cmd": "INCRBYFLOAT",
                "args": [key, step]
            };
        },
        process(data: any, args: any[]): number {
            return parseFloat(data);
        }
    },

    /**
     * Command: decr
     * @see https://redis.io/commands/decr
     */
    "decr": {
        prepare(key: string, step: number): IPrepareResult {

            return {
                "cmd": "DECRBY",
                "args": [key, step]
            };
        }
    },

    /**
     * Command: incrByFloat
     * @see https://redis.io/commands/incrByFloat
     */
    "decrByFloat": {
        prepare(key: string, step: number): IPrepareResult {

            return {
                "cmd": "INCRBYFLOAT",
                "args": [key, -step]
            };
        },
        process(data: any, args: any[]): number {
            return parseFloat(data);
        }
    },

    /**
     * Command: del
     * @see https://redis.io/commands/del
     */
    "del": {
        prepare(keys: C.NonEmptyArray<string>): IPrepareResult {
            return {
                "cmd": "DEL",
                "args": keys
            };
        }
    },

    /**
     * Command: unlink
     * @see https://redis.io/commands/unlink
     */
    "unlink": {
        prepare(keys: C.NonEmptyArray<string>): IPrepareResult {
            return {
                "cmd": "UNLINK",
                "args": keys
            };
        }
    },

    /**
     * Command: get
     * @see https://redis.io/commands/get
     */
    "get": {
        prepare: createDefaultPreparer("GET"),
        process: U.nullableBuffer2String
    },

    /**
     * Command: get
     * @see https://redis.io/commands/get
     */
    "get$": {
        prepare: createDefaultPreparer("GET"),
    },

    /**
     * Command: getSet
     * @see https://redis.io/commands/getSet
     */
    "getSet": {
        prepare: createDefaultPreparer("GETSET"),
        process: U.nullableBuffer2String
    },

    /**
     * Command: getSet
     * @see https://redis.io/commands/getSet
     */
    "getSet$": {
        prepare: createDefaultPreparer("GETSET"),
    },

    /**
     * Command: set
     * @see https://redis.io/commands/set
     */
    "set": {
        prepare: createDefaultPreparer("SET"),
        process: isStringOK
    },

    /**
     * Command: setNX
     * @see https://redis.io/commands/setNX
     */
    "setNX": {
        prepare(k: string, v: string | Buffer, ttl?: number): IPrepareResult {
            return {
                cmd: "SET",
                args: ttl ? [k, v, "EX", ttl, "NX"] : [k, v, "NX"]
            };
        },
        process: isStringOK
    },

    /**
     * Command: setEX
     * @see https://redis.io/commands/setEX
     */
    "setEX": {
        prepare(key: string, value: string | Buffer, ttl: number): IPrepareResult {
            return {
                cmd: "SET",
                args: [key, value, "EX", ttl]
            };
        },
        process: isStringOK
    },

    /**
     * Command: pSetNX
     * @see https://redis.io/commands/pSetNX
     */
    "pSetNX": {
        prepare(key: string, value: string | Buffer, ttl: number): IPrepareResult {
            return {
                cmd: "SET",
                args: [key, value, "PX", ttl, "NX"]
            };
        },
        process: isStringOK
    },

    /**
     * Command: pSetEx
     * @see https://redis.io/commands/pSetEx
     */
    "pSetEx": {
        prepare(key: string, value: string | Buffer, ttl: number): IPrepareResult {
            return {
                cmd: "SET",
                args: [key, value, "PX", ttl]
            };
        },
        process: isStringOK
    },

    /**
     * Command: replace
     * @see https://redis.io/commands/replace
     */
    "replace": {
        prepare(key: string, value: string | Buffer, ttl?: number): IPrepareResult {
            return {
                cmd: "SET",
                args: ttl ? [key, value, "EX", ttl, "XX"] : [key, value, "XX"]
            };
        },
        process: isStringOK
    },

    /**
     * Command: pReplace
     * @see https://redis.io/commands/pReplace
     */
    "pReplace": {
        prepare(key: string, value: string | Buffer, ttl?: number): IPrepareResult {
            return {
                cmd: "SET",
                args: ttl ? [key, value, "PX", ttl, "XX"] : [key, value, "XX"]
            };
        },
        process: isStringOK
    },

    /**
     * Command: ttl
     * @see https://redis.io/commands/ttl
     */
    "ttl": {
        prepare: createDefaultPreparer("TTL")
    },

    /**
     * Command: pTTL
     * @see https://redis.io/commands/pTTL
     */
    "pTTL": {
        prepare: createDefaultPreparer("PTTL")
    },

    /**
     * Command: expire
     * @see https://redis.io/commands/expire
     */
    "expire": {
        prepare: createDefaultPreparer("EXPIRE"),
        process: isIntegerOne
    },

    /**
     * Command: pExpire
     * @see https://redis.io/commands/pExpire
     */
    "pExpire": {
        prepare: createDefaultPreparer("PEXPIRE"),
        process: isIntegerOne
    },

    /**
     * Command: expireAt
     * @see https://redis.io/commands/expireAt
     */
    "expireAt": {
        prepare: createDefaultPreparer("EXPIREAT"),
        process: isIntegerOne
    },

    /**
     * Command: pExpireAt
     * @see https://redis.io/commands/pExpireAt
     */
    "pExpireAt": {
        prepare: createDefaultPreparer("PEXPIREAT"),
        process: isIntegerOne
    },

    /**
     * Command: persist
     * @see https://redis.io/commands/persist
     */
    "persist": {
        prepare: createDefaultPreparer("PERSIST"),
        process: isIntegerOne
    },

    /**
     * Command: exists
     * @see https://redis.io/commands/exists
     */
    "exists": {
        prepare: createDefaultPreparer("EXISTS"),
        process: isIntegerOne
    },

    /**
     * Command: type
     * @see https://redis.io/commands/type
     */
    "type": {
        prepare: createDefaultPreparer("TYPE"),
        process: U.buffer2String
    },

    /**
     * Command: move
     * @see https://redis.io/commands/move
     */
    "move": {
        prepare: createDefaultPreparer("EXISTS"),
        process: isIntegerOne
    },

    /**
     * Command: randomKey
     * @see https://redis.io/commands/randomKey
     */
    "randomKey": {
        prepare: createDefaultPreparer("RANDOMKEY"),
        process: U.buffer2String
    },

    /**
     * Command: rename
     * @see https://redis.io/commands/rename
     */
    "rename": {
        prepare: createDefaultPreparer("RENAME"),
        process: null
    },

    /**
     * Command: renameNX
     * @see https://redis.io/commands/renameNX
     */
    "renameNX": {
        prepare: createDefaultPreparer("RENAMENX"),
        process: isIntegerOne
    },

    /**
     * Command: select
     * @see https://redis.io/commands/select
     */
    "select": {
        prepare: createDefaultPreparer("SELECT"),
        process: null
    },

    /**
     * Command: hDel
     * @see https://redis.io/commands/hDel
     */
    "hDel": {
        prepare(key: string, fields: C.NonEmptyArray<string>): IPrepareResult {
            return {
                cmd: "HDEL",
                args: [key, ...fields]
            };
        }
    },

    /**
     * Command: hGet
     * @see https://redis.io/commands/hGet
     */
    "hGet": {
        prepare: createDefaultPreparer("HGET"),
        process: U.nullableBuffer2String
    },

    /**
     * Command: hGet
     * @see https://redis.io/commands/hGet
     */
    "hGet$": {
        prepare: createDefaultPreparer("HGET")
    },

    /**
     * Command: hSet
     * @see https://redis.io/commands/hSet
     */
    "hSet": {
        prepare: createDefaultPreparer("HSET"),
        process: isIntegerOne
    },

    /**
     * Command: hSetNX
     * @see https://redis.io/commands/hSetNX
     */
    "hSetNX": {
        prepare: createDefaultPreparer("HSETNX"),
        process: isIntegerOne
    },

    /**
     * Command: hExists
     * @see https://redis.io/commands/hExists
     */
    "hExists": {

        prepare: createDefaultPreparer("HEXISTS"),
        process: isIntegerOne
    },

    /**
     * Command: keys
     * @see https://redis.io/commands/keys
     */
    "keys": {
        prepare: createDefaultPreparer("KEYS"),
        process: U.list2StringList
    },

    /**
     * Command: dump
     * @see https://redis.io/commands/dump
     */
    "dump": {
        prepare: createDefaultPreparer("DUMP")
    },

    /**
     * Command: restore
     * @see https://redis.io/commands/restore
     */
    restore: {

        prepare(
            key: string,
            value: Buffer,
            ttl?: number,
            replace?: boolean,
            absTTL?: boolean,
            freq?: number,
            idleTime?: number
        ): IPrepareResult {

            const args: any[] = [key, ttl, value];

            replace && args.push("REPLACE");
            absTTL && args.push("ABSTTL");
            idleTime && args.push("IDLETIME", idleTime);
            freq && args.push("FREQ", freq);

            return {
                cmd: "RESTORE",
                args
            };
        },
        process: null
    },

    /**
     * Command: strLen
     * @see https://redis.io/commands/strLen
     */
    "strLen": {
        prepare: createDefaultPreparer("STRLEN")
    },

    /**
     * Command: touch
     * @see https://redis.io/commands/touch
     */
    "touch": {
        prepare(keys: C.NonEmptyArray<string>): IPrepareResult {
            return {
                cmd: "TOUCH",
                args: keys
            };
        }
    },

    /**
     * Command: mGet
     * @see https://redis.io/commands/mGet
     */
    "mGet": {
        prepare(keys: C.NonEmptyArray<string>): IPrepareResult {
            return {
                cmd: "MGET",
                args: keys
            };
        },
        process(data, args) {

            return U.list2NullableStringDict(args, data);
        }
    },

    /**
     * Command: mGet
     * @see https://redis.io/commands/mGet
     */
    "mGet$": {
        prepare(keys: C.NonEmptyArray<string>): IPrepareResult {
            return {
                cmd: "MGET",
                args: keys
            };
        },
        process(data, args) {

            return U.list2NullableBufferDict(args, data);
        }
    },

    /**
     * Command: mSet
     * @see https://redis.io/commands/mSet
     */
    "mSet": {
        prepare(kv: Record<string, string | Buffer>): IPrepareResult {

            const args: any[] = [];

            for (const k in kv) {

                args.push(k, kv[k]);
            }

            return {

                cmd: "MSET",
                args
            };
        },
        process: null
    },

    /**
     * Command: mSetNX
     * @see https://redis.io/commands/mSetNX
     */
    "mSetNX": {
        prepare(kv: Record<string, string | Buffer>): IPrepareResult {

            const args: any[] = [];

            for (const k in kv) {

                args.push(k, kv[k]);
            }

            return {

                cmd: "MSETNX",
                args
            };
        },
        process: isIntegerOne
    },

    /**
     * Command: hIncr
     * @see https://redis.io/commands/hincrby
     */
    "hIncr": {
        prepare: createDefaultPreparer("HINCRBY")
    },

    /**
     * Command: hIncrByFloat
     * @see https://redis.io/commands/hIncrByFloat
     */
    "hIncrByFloat": {
        prepare: createDefaultPreparer("HINCRBYFLOAT"),
        process: parseFloat
    },

    /**
     * Command: hIncr
     * @see https://redis.io/commands/hincrby
     */
    "hDecr": {
        prepare(key: string, field: string, step: number): IPrepareResult {
            return {
                cmd: "HINCRBY",
                args: [key, field, -step]
            };
        }
    },

    /**
     * Command: hIncrByFloat
     * @see https://redis.io/commands/hIncrByFloat
     */
    "hDecrByFloat": {
        prepare(key: string, field: string, step: number): IPrepareResult {
            return {
                cmd: "HINCRBYFLOAT",
                args: [key, field, -step]
            };
        },
        process: parseFloat
    },

    /**
     * Command: hKeys
     * @see https://redis.io/commands/hKeys
     */
    "hKeys": {
        prepare: createDefaultPreparer("HKEYS"),
        process: U.list2StringList
    },

    /**
     * Command: hVals
     * @see https://redis.io/commands/hVals
     */
    "hVals": {
        prepare: createDefaultPreparer("HVALS"),
        process: U.list2StringList
    },

    /**
     * Command: hVals
     * @see https://redis.io/commands/hVals
     */
    "hVals$": {
        prepare: createDefaultPreparer("HVALS"),
        process: U.list2BufferList
    },

    /**
     * Command: hLen
     * @see https://redis.io/commands/hLen
     */
    "hLen": {
        prepare: createDefaultPreparer("HLEN")
    },

    /**
     * Command: hMGet
     * @see https://redis.io/commands/hMGet
     */
    "hMGet": {
        prepare(key: string, fields: string[]): IPrepareResult {
            return {
                cmd: "HMGET",
                args: [key, ...fields]
            };
        },
        process(data, args) {

            return U.list2NullableStringDict(args[1], data);
        }
    },

    /**
     * Command: hMGet
     * @see https://redis.io/commands/hMGet
     */
    "hMGet$": {
        prepare(key: string, fields: string[]): IPrepareResult {
            return {
                cmd: "HMGET",
                args: [key, ...fields]
            };
        },
        process(data, args) {

            return U.list2NullableBufferDict(args[1], data);
        }
    },

    /**
     * Command: hGetAll
     * @see https://redis.io/commands/hGetAll
     */
    "hGetAll": {
        prepare: createDefaultPreparer("HGETALL"),
        process: U.pairList2NullableStringDict
    },

    /**
     * Command: hGetAll
     * @see https://redis.io/commands/hGetAll
     */
    "hGetAll$": {
        prepare: createDefaultPreparer("HGETALL"),
        process: U.pairList2NullableBufferDict
    },

    /**
     * Command: hMSet
     * @see https://redis.io/commands/hMSet
     */
    "hMSet": {
        prepare(k: string, fv: Record<string, string | Buffer>): IPrepareResult {

            const args: any[] = [k];

            for (const f in fv) {

                args.push(f, fv[f]);
            }

            return {
                cmd: "HMSET",
                args
            };
        },
        process: null
    },

    /**
     * Command: hStrLen
     * @see https://redis.io/commands/hStrLen
     */
    "hStrLen": {
        prepare: createDefaultPreparer("HSTRLEN")
    },

    /**
     * Command: scan
     * @see https://redis.io/commands/scan
     */
    "scan": {
        prepare(cur: number, p?: string, cn?: number): IPrepareResult {

            const args: any[] = [cur];

            p && args.push("MATCH", p);
            cn && args.push("COUNT", cn);

            return {
                cmd: "SCAN",
                args
            };
        },
        process(data: any, args: any[]): C.IScanResult<string> {

            return {
                "nextCursor": parseInt(data[0][1].toString()),
                "items": U.list2StringList(data[1][1])
            };
        }
    },

    /**
     * Command: hScan
     * @see https://redis.io/commands/hScan
     */
    "hScan": {
        prepare(k: string, cur: number, p?: string, cn?: number): IPrepareResult {

            const args: any[] = [k, cur];

            p && args.push("MATCH", p);
            cn && args.push("COUNT", cn);

            return {
                cmd: "HSCAN",
                args
            };
        },
        process(data: any, args: any[]): C.IScanResult<string> {

            return {
                "nextCursor": parseInt(data[0][1].toString()),
                "items": U.list2StringList(data[1][1])
            };
        }
    },

    /**
     * Command: sAdd
     * @see https://redis.io/commands/sAdd
     */
    "sAdd": {
        prepare(key: string, values: Array<string | Buffer>): IPrepareResult {

            return {
                cmd: "SADD",
                args: [key, ...values]
            };
        }
    },

    /**
     * Command: sCard
     * @see https://redis.io/commands/sCard
     */
    "sCard": {
        prepare: createDefaultPreparer("SCARD")
    },

    /**
     * Command: sDiff
     * @see https://redis.io/commands/sDiff
     */
    "sDiff": {
        prepare(keys: C.NonEmptyArray<string>): IPrepareResult {

            return {
                cmd: "SDIFF",
                args: keys
            };
        },
        process: U.list2StringList
    },

    /**
     * Command: sDiff
     * @see https://redis.io/commands/sDiff
     */
    "sDiff$": {
        prepare(keys: C.NonEmptyArray<string>): IPrepareResult {

            return {
                cmd: "SDIFF",
                args: keys
            };
        },
        process: U.list2BufferList
    },

    /**
     * Command: sDiffStore
     * @see https://redis.io/commands/sDiffStore
     */
    "sDiffStore": {
        prepare(keys: C.NonEmptyArray<string>, target: string): IPrepareResult {

            return {
                cmd: "SDIFFSTORE",
                args: [target, ...keys]
            };
        }
    },

    /**
     * Command: sInter
     * @see https://redis.io/commands/sInter
     */
    "sInter": {
        prepare(keys: C.NonEmptyArray<string>): IPrepareResult {

            return {
                cmd: "SINTER",
                args: keys
            };
        },
        process: U.list2StringList
    },

    /**
     * Command: sInter
     * @see https://redis.io/commands/sInter
     */
    "sInter$": {
        prepare(keys: C.NonEmptyArray<string>): IPrepareResult {

            return {
                cmd: "SINTER",
                args: keys
            };
        },
        process: U.list2BufferList
    },

    /**
     * Command: sInterStore
     * @see https://redis.io/commands/sInterStore
     */
    "sInterStore": {
        prepare(keys: C.NonEmptyArray<string>, target: string): IPrepareResult {

            return {
                cmd: "SINTERSTORE",
                args: [target, ...keys]
            };
        }
    },

    /**
     * Command: sUnion
     * @see https://redis.io/commands/sUnion
     */
    "sUnion": {
        prepare(keys: C.NonEmptyArray<string>): IPrepareResult {

            return {
                cmd: "SUNION",
                args: keys
            };
        },
        process: U.list2StringList
    },

    /**
     * Command: sUnion
     * @see https://redis.io/commands/sUnion
     */
    "sUnion$": {
        prepare(keys: C.NonEmptyArray<string>): IPrepareResult {

            return {
                cmd: "SUNION",
                args: keys
            };
        },
        process: U.list2BufferList
    },

    /**
     * Command: sUnionStore
     * @see https://redis.io/commands/sUnionStore
     */
    "sUnionStore": {
        prepare(keys: C.NonEmptyArray<string>, target: string): IPrepareResult {

            return {
                cmd: "SUNIONSTORE",
                args: [target, ...keys]
            };
        }
    },

    /**
     * Command: sIsMember
     * @see https://redis.io/commands/sIsMember
     */
    "sIsMember": {
        prepare: createDefaultPreparer("SISMEMBER"),
        process: isIntegerOne
    },

    /**
     * Command: sMembers
     * @see https://redis.io/commands/sMembers
     */
    "sMembers": {
        prepare: createDefaultPreparer("SMEMBERS"),
        process: U.list2StringList
    },

    /**
     * Command: sMembers
     * @see https://redis.io/commands/sMembers
     */
    "sMembers$": {
        prepare: createDefaultPreparer("SMEMBERS"),
        process: U.list2BufferList
    },

    /**
     * Command: sMove
     * @see https://redis.io/commands/sMove
     */
    "sMove": {
        prepare: createDefaultPreparer("SMOVE"),
        process: isIntegerOne
    },

    /**
     * Command: sPop
     * @see https://redis.io/commands/sPop
     */
    "sPop": {
        prepare: createDefaultPreparer("SPOP"),
        process: U.list2StringList
    },

    /**
     * Command: sPop
     * @see https://redis.io/commands/sPop
     */
    "sPop$": {
        prepare: createDefaultPreparer("SPOP"),
        process: U.list2BufferList
    },

    /**
     * Command: sRandMember
     * @see https://redis.io/commands/sRandMember
     */
    "sRandMember": {
        prepare: createDefaultPreparer("SRANDMEMBER"),
        process: U.list2StringList
    },

    /**
     * Command: sRandMember
     * @see https://redis.io/commands/sRandMember
     */
    "sRandMember$": {
        prepare: createDefaultPreparer("SRANDMEMBER"),
        process: U.list2BufferList
    },

    /**
     * Command: sRem
     * @see https://redis.io/commands/sRem
     */
    "sRem": {
        prepare: createDefaultPreparer("SREM")
    },

    /**
     * Command: sScan
     * @see https://redis.io/commands/sScan
     */
    "sScan": {
        prepare(k: string, cur: number, p?: string, cn?: number): IPrepareResult {

            const args: any[] = [k, cur];

            p && args.push("MATCH", p);
            cn && args.push("COUNT", cn);

            return {
                cmd: "SSCAN",
                args
            };
        },
        process(data: any, args: any[]): C.IScanResult<string> {

            return {
                "nextCursor": parseInt(data[0][1].toString()),
                "items": U.list2StringList(data[1][1])
            };
        }
    },

    /**
     * Command: sScan
     * @see https://redis.io/commands/sScan
     */
    "sScan$": {
        prepare(k: string, cur: number, p?: string, cn?: number): IPrepareResult {

            const args: any[] = [k, cur];

            p && args.push("MATCH", p);
            cn && args.push("COUNT", cn);

            return {
                cmd: "SSCAN",
                args
            };
        },
        process(data: any, args: any[]): C.IScanResult<Buffer> {

            return {
                "nextCursor": parseInt(data[0][1].toString()),
                "items": U.list2BufferList(data[1][1])
            };
        }
    },

    /**
     * Command: bLPop
     * @see https://redis.io/commands/bLPop
     */
    "bLPop": {
        prepare(keys: C.NonEmptyArray<string>, timeout: number): IPrepareResult {

            return {
                cmd: "BLPOP",
                args: [...keys, timeout]
            };
        },
        process: U.pairList2StringDict
    },

    /**
     * Command: bLPop
     * @see https://redis.io/commands/bLPop
     */
    "bLPop$": {
        prepare(keys: C.NonEmptyArray<string>, timeout: number): IPrepareResult {

            return {
                cmd: "BLPOP",
                args: [...keys, timeout]
            };
        },
        process: U.pairList2BufferDict
    },

    /**
     * Command: bRPop
     * @see https://redis.io/commands/bRPop
     */
    "bRPop": {
        prepare(keys: C.NonEmptyArray<string>, timeout: number): IPrepareResult {

            return {
                cmd: "BRPOP",
                args: [...keys, timeout]
            };
        },
        process: U.pairList2StringDict
    },

    /**
     * Command: bRPop
     * @see https://redis.io/commands/bRPop
     */
    "bRPop$": {
        prepare(keys: C.NonEmptyArray<string>, timeout: number): IPrepareResult {

            return {
                cmd: "BRPOP",
                args: [...keys, timeout]
            };
        },
        process: U.pairList2BufferDict
    },

    /**
     * Command: bRPopLPush
     * @see https://redis.io/commands/bRPopLPush
     */
    "bRPopLPush": {
        prepare: createDefaultPreparer("BRPOPLPUSH"),
        process: U.buffer2String
    },

    /**
     * Command: bRPopLPush
     * @see https://redis.io/commands/bRPopLPush
     */
    "bRPopLPush$": {
        prepare: createDefaultPreparer("BRPOPLPUSH")
    },

    /**
     * Command: lIndex
     * @see https://redis.io/commands/lIndex
     */
    "lIndex": {
        prepare: createDefaultPreparer("LINDEX"),
        process: U.buffer2String
    },

    /**
     * Command: lIndex
     * @see https://redis.io/commands/lIndex
     */
    "lIndex$": {
        prepare: createDefaultPreparer("LINDEX")
    },

    /**
     * Command: lInsert
     * @see https://redis.io/commands/lInsert
     */
    "lInsertBefore": {
        prepare(key: string, pivot: string, value: string | Buffer): IPrepareResult {

            return {
                args: [key, "BEFORE", pivot, value],
                cmd: "LINSERT"
            };
        }
    },

    /**
     * Command: lInsert
     * @see https://redis.io/commands/lInsert
     */
    "lInsertAfter": {
        prepare(key: string, pivot: string, value: string | Buffer): IPrepareResult {

            return {
                args: [key, "AFTER", pivot, value],
                cmd: "LINSERT"
            };
        }
    },

    /**
     * Command: lLen
     * @see https://redis.io/commands/lLen
     */
    "lLen": {
        prepare: createDefaultPreparer("LLEN")
    },

    /**
     * Command: lPop
     * @see https://redis.io/commands/lPop
     */
    "lPop": {
        prepare: createDefaultPreparer("LPOP"),
        process: U.buffer2String
    },

    /**
     * Command: lPop
     * @see https://redis.io/commands/lPop
     */
    "lPop$": {
        prepare: createDefaultPreparer("LPOP")
    },

    /**
     * Command: lPush
     * @see https://redis.io/commands/lPush
     */
    "lPush": {
        prepare(key: string, values: Array<string | Buffer>): IPrepareResult {

            return {
                args: [key, ...values],
                cmd: "LPUSH"
            };
        }
    },

    /**
     * Command: lPushX
     * @see https://redis.io/commands/lPushX
     */
    "lPushX": {
        prepare(key: string, values: Array<string | Buffer>): IPrepareResult {

            return {
                args: [key, ...values],
                cmd: "LPUSHX"
            };
        }
    },

    /**
     * Command: lRange
     * @see https://redis.io/commands/lRange
     */
    "lRange": {
        prepare: createDefaultPreparer("LRANGE"),
        process: U.list2StringList
    },

    /**
     * Command: lRange
     * @see https://redis.io/commands/lRange
     */
    "lRange$": {
        prepare: createDefaultPreparer("LRANGE"),
        process: U.list2BufferList
    },

    /**
     * Command: lRem
     * @see https://redis.io/commands/lRem
     */
    "lRem": {
        prepare: createDefaultPreparer("LREM")
    },

    /**
     * Command: lSet
     * @see https://redis.io/commands/lSet
     */
    "lSet": {
        prepare: createDefaultPreparer("LSET"),
        process: null
    },

    /**
     * Command: lTrim
     * @see https://redis.io/commands/lTrim
     */
    "lTrim": {
        prepare: createDefaultPreparer("LTRIM"),
        process: null
    },

    /**
     * Command: rPop
     * @see https://redis.io/commands/rPop
     */
    "rPop": {
        prepare: createDefaultPreparer("RPOP"),
        process: U.buffer2String
    },

    /**
     * Command: rPop
     * @see https://redis.io/commands/rPop
     */
    "rPop$": {
        prepare: createDefaultPreparer("RPOP")
    },

    /**
     * Command: rPopLPush
     * @see https://redis.io/commands/rPopLPush
     */
    "rPopLPush": {
        prepare: createDefaultPreparer("RPOPLPUSH"),
        process: U.buffer2String
    },

    /**
     * Command: rPopLPush
     * @see https://redis.io/commands/rPopLPush
     */
    "rPopLPush$": {
        prepare: createDefaultPreparer("RPOPLPUSH")
    },

    /**
     * Command: rPush
     * @see https://redis.io/commands/rPush
     */
    "rPush": {
        prepare(key: string, values: Array<string | Buffer>): IPrepareResult {

            return {
                args: [key, ...values],
                cmd: "RPUSH"
            };
        }
    },

    /**
     * Command: rPushX
     * @see https://redis.io/commands/rPushX
     */
    "rPushX": {
        prepare(key: string, values: Array<string | Buffer>): IPrepareResult {

            return {
                args: [key, ...values],
                cmd: "RPUSHX"
            };
        }
    },

    /**
     * Command: pfAdd
     * @see https://redis.io/commands/pfAdd
     */
    "pfAdd": {
        prepare(key: string, values: Array<string | Buffer>): IPrepareResult {

            return {
                args: [key, ...values],
                cmd: "PFADD"
            };
        },
        process: isIntegerOne
    },

    /**
     * Command: pfCount
     * @see https://redis.io/commands/pfCount
     */
    "pfCount": {
        prepare: createDefaultPreparer("PFCOUNT")
    },

    /**
     * Command: pfMerge
     * @see https://redis.io/commands/pfMerge
     */
    "pfMerge": {
        prepare(keys: C.NonEmptyArray<string>, target: string): IPrepareResult {

            return {
                args: [target, ...keys],
                cmd: "PFMERGE"
            };
        },
        process: null
    },

    /**
     * Command: publish
     * @see https://redis.io/commands/publish
     */
    "publish": {
        prepare: createDefaultPreparer("PUBLISH")
    },

    "pubSubChannels": {
        prepare(p?: string): IPrepareResult {

            return {
                args: p ? ["CHANNELS", p] : ["CHANNELS"],
                cmd: "PUBSUB"
            };
        },
        process: U.list2StringList
    },

    "pubSubNumSub": {
        prepare(channels: [string, ...string[]]): IPrepareResult {

            return {
                args: ["NUMSUB", ...channels],
                cmd: "PUBSUB"
            };
        },
        process(data: any, args: any[]): Record<string, number> {

            const ret: Record<string, number> = {};

            for (let i = 0; i < data.length; i += 2) {

                ret[data[i][1].toString()] = data[i + 1][1];
            }

            return ret;
        }
    },

    pubSubNumPat: {

        prepare(): IPrepareResult {

            return {
                args: ["NUMPAT"],
                cmd: "PUBSUB"
            };
        }
    }
};
