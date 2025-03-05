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

/* eslint-disable max-lines */

import * as C from './Common';
import * as U from './Utils';
import * as E from './Errors';

export interface IPrepareResult {

    'cmd': string;

    'args': Array<string | Buffer | number>;
}

export type TProcessor = null | ((data: any, args: any[]) => any);

export interface ICommand {

    prepare(...args: any[]): IPrepareResult;

    process?: TProcessor;
}

function isStringOK(data: string | Buffer): data is string {

    return 'OK' === (data?.toString());
}

function isIntegerOne(data: unknown): data is number {

    return 1 === data;
}

function createDefaultPreparer(cmd: string): Required<ICommand>['prepare'] {

    return (...args: Array<string | Buffer>) => ({ args, cmd });
}

export const COMMANDS: Record<keyof C.ICommandAPIs, ICommand> = {

    /**
     * Command: append
     * @see https://redis.io/docs/latest/commands/append
     */
    'append': { 'prepare': createDefaultPreparer('APPEND') },

    /**
     * Command: auth
     * @see https://redis.io/docs/latest/commands/auth
     */
    'auth': { 'prepare': createDefaultPreparer('AUTH') },

    /**
     * Command: ping
     * @see https://redis.io/docs/latest/commands/ping
     */
    'ping': {
        prepare(text?: string): IPrepareResult {

            return {
                'cmd': 'PING',
                'args': text ? [text] : []
            };
        },
        process(data: Buffer | string): string {

            return data instanceof Buffer ? data.toString() : data as string;
        }
    },

    /**
     * Command: hRandField
     * @see https://redis.io/docs/latest/commands/hrandfield
     */
    'hRandField': {
        prepare(key: string, count: number): IPrepareResult {

            return {
                'cmd': 'HRANDFIELD',
                'args': [key, count]
            };
        },
        process: U.list2StringList
    },

    /**
     * Command: hRandField
     * @see https://redis.io/docs/latest/commands/hrandfield
     */
    'hRandField$': {
        prepare(key: string, count: number): IPrepareResult {

            return {
                'cmd': 'HRANDFIELD',
                'args': [key, count]
            };
        },
        process: U.list2BufferList
    },

    /**
     * Command: hRandField
     * @see https://redis.io/docs/latest/commands/hrandfield
     */
    'hRandFieldWithValues': {
        prepare(key: string, count: number): IPrepareResult {

            return {
                'cmd': 'HRANDFIELD',
                'args': [key, count, 'WITHVALUES']
            };
        },
        process: U.pairList2NullableStringDict
    },

    /**
     * Command: hRandField
     * @see https://redis.io/docs/latest/commands/hrandfield
     */
    'hRandFieldWithValues$': {
        prepare(key: string, count: number): IPrepareResult {

            return {
                'cmd': 'HRANDFIELD',
                'args': [key, count, 'WITHVALUES']
            };
        },
        process: U.pairList2NullableBufferDict
    },

    /**
     * Command: incr
     * @see https://redis.io/docs/latest/commands/incr
     */
    'incr': {
        prepare(key: string, step: number = 1): IPrepareResult {

            return {
                'cmd': 'INCRBY',
                'args': [key, step]
            };
        },
        // process: parseInt, // always returning integer
    },

    /**
     * Command: incrByFloat
     * @see https://redis.io/docs/latest/commands/incrbyfloat
     */
    'incrByFloat': {
        prepare(key: string, step: number = 1): IPrepareResult {

            return {
                'cmd': 'INCRBYFLOAT',
                'args': [key, step]
            };
        },
        process: parseFloat,
    },

    /**
     * Command: decr
     * @see https://redis.io/docs/latest/commands/decr
     */
    'decr': {
        prepare(key: string, step: number = 1): IPrepareResult {

            return {
                'cmd': 'DECRBY',
                'args': [key, step]
            };
        },
        // process: parseInt, // always returning integer
    },

    /**
     * Command: incrByFloat
     * @see https://redis.io/docs/latest/commands/incrbyfloat
     */
    'decrByFloat': {
        prepare(key: string, step: number = 1): IPrepareResult {

            return {
                'cmd': 'INCRBYFLOAT',
                'args': [key, -step]
            };
        },
        process: parseFloat,
    },

    /**
     * Command: del
     * @see https://redis.io/docs/latest/commands/del
     */
    'del': {
        prepare(keys: string | string[]): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'DEL',
                    args: keys
                };
            }

            return {
                cmd: 'DEL',
                args: [keys]
            };
        }
    },

    /**
     * Command: unlink
     * @see https://redis.io/docs/latest/commands/unlink
     */
    'unlink': {
        prepare(keys: string | string[]): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'UNLINK',
                    args: keys
                };
            }

            return {
                cmd: 'UNLINK',
                args: [keys]
            };
        }
    },

    /**
     * Command: get
     * @see https://redis.io/docs/latest/commands/get
     */
    'get': {
        prepare: createDefaultPreparer('GET'),
        process: U.nullableBuffer2String
    },

    /**
     * Command: get
     * @see https://redis.io/docs/latest/commands/get
     */
    'get$': {
        prepare: createDefaultPreparer('GET'),
    },

    /**
     * Command: getdel
     * @see https://redis.io/docs/latest/commands/getdel
     */
    'getAndDel': {
        prepare: createDefaultPreparer('GETDEL'),
        process: U.nullableBuffer2String
    },

    /**
     * Command: getdel
     * @see https://redis.io/docs/latest/commands/getdel
     */
    'getAndDel$': {
        prepare: createDefaultPreparer('GETDEL'),
    },

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     */
    'getEx': {
        prepare(key: string, seconds: number): IPrepareResult {
            return {
                'args': [key, 'EX', seconds],
                'cmd': 'GETEX',
            };
        },
        process: U.nullableBuffer2String
    },

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     */
    'getEx$': {
        prepare(key: string, seconds: number): IPrepareResult {
            return {
                'args': [key, 'EX', seconds],
                'cmd': 'GETEX'
            };
        },
    },

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     */
    'getExAt': {
        prepare(key: string, tsInSec: number): IPrepareResult {
            return {
                'args': [key, 'EXAT', tsInSec],
                'cmd': 'GETEX',
            };
        },
        process: U.nullableBuffer2String
    },

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     */
    'getExAt$': {
        prepare(key: string, seconds: number): IPrepareResult {
            return {
                'args': [key, 'EXAT', seconds],
                'cmd': 'GETEX'
            };
        },
    },

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     */
    'getPEx': {
        prepare(key: string, seconds: number): IPrepareResult {
            return {
                'args': [key, 'PX', seconds],
                'cmd': 'GETEX',
            };
        },
        process: U.nullableBuffer2String
    },

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     */
    'getPEx$': {
        prepare(key: string, seconds: number): IPrepareResult {
            return {
                'args': [key, 'PX', seconds],
                'cmd': 'GETEX'
            };
        },
    },

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     */
    'getPExAt': {
        prepare(key: string, tsInSec: number): IPrepareResult {
            return {
                'args': [key, 'PXAT', tsInSec],
                'cmd': 'GETEX',
            };
        },
        process: U.nullableBuffer2String
    },

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     */
    'getPExAt$': {
        prepare(key: string, seconds: number): IPrepareResult {
            return {
                'args': [key, 'PXAT', seconds],
                'cmd': 'GETEX'
            };
        },
    },

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     */
    'getAndPersist': {
        prepare(key: string): IPrepareResult {
            return {
                'args': [key, 'PERSIST'],
                'cmd': 'GETEX',
            };
        },
        process: U.nullableBuffer2String
    },

    /**
     * Command: getex
     * @see https://redis.io/docs/latest/commands/getex
     */
    'getAndPersist$': {
        prepare(key: string): IPrepareResult {
            return {
                'args': [key, 'PERSIST'],
                'cmd': 'GETEX'
            };
        },
    },

    /**
     * Command: getSet
     * @see https://redis.io/docs/latest/commands/getset
     */
    'getSet': {
        prepare: createDefaultPreparer('GETSET'),
        process: U.nullableBuffer2String
    },

    /**
     * Command: getSet
     * @see https://redis.io/docs/latest/commands/getset
     */
    'getSet$': {
        prepare: createDefaultPreparer('GETSET'),
    },

    /**
     * Command: set
     * @see https://redis.io/docs/latest/commands/set
     */
    'set': {
        prepare(k: string, v: string | Buffer, ttl?: number): IPrepareResult {
            return {
                cmd: 'SET',
                args: ttl ? [k, v, 'EX', ttl] : [k, v]
            };
        },
        process: isStringOK
    },

    /**
     * Command: setNX
     * @see https://redis.io/docs/latest/commands/setnx
     */
    'setNX': {
        prepare(k: string, v: string | Buffer, ttl?: number): IPrepareResult {
            return {
                cmd: 'SET',
                args: ttl ? [k, v, 'EX', ttl, 'NX'] : [k, v, 'NX']
            };
        },
        process: isStringOK
    },

    /**
     * Command: setEX
     * @see https://redis.io/docs/latest/commands/setex
     */
    'setEX': {
        prepare(key: string, value: string | Buffer, ttl: number): IPrepareResult {
            return {
                cmd: 'SET',
                args: [key, value, 'EX', ttl]
            };
        },
        process: isStringOK
    },

    /**
     * Command: pSetNX
     * @see https://redis.io/docs/latest/commands/psetnx
     */
    'pSetNX': {
        prepare(key: string, value: string | Buffer, ttl: number): IPrepareResult {
            return {
                cmd: 'SET',
                args: [key, value, 'PX', ttl, 'NX']
            };
        },
        process: isStringOK
    },

    /**
     * Command: pSetEx
     * @see https://redis.io/docs/latest/commands/psetex
     */
    'pSetEx': {
        prepare(key: string, value: string | Buffer, ttl: number): IPrepareResult {
            return {
                cmd: 'SET',
                args: [key, value, 'PX', ttl]
            };
        },
        process: isStringOK
    },

    /**
     * Command: replace
     * @see https://redis.io/docs/latest/commands/replace
     */
    'replace': {
        prepare(key: string, value: string | Buffer, ttl?: number): IPrepareResult {
            return {
                cmd: 'SET',
                args: ttl ? [key, value, 'EX', ttl, 'XX'] : [key, value, 'XX']
            };
        },
        process: isStringOK
    },

    /**
     * Command: pReplace
     * @see https://redis.io/docs/latest/commands/preplace
     */
    'pReplace': {
        prepare(key: string, value: string | Buffer, ttl?: number): IPrepareResult {
            return {
                cmd: 'SET',
                args: ttl ? [key, value, 'PX', ttl, 'XX'] : [key, value, 'XX']
            };
        },
        process: isStringOK
    },

    /**
     * Command: ttl
     * @see https://redis.io/docs/latest/commands/ttl
     */
    'ttl': {
        prepare: createDefaultPreparer('TTL')
    },

    /**
     * Command: pTTL
     * @see https://redis.io/docs/latest/commands/pttl
     */
    'pTTL': {
        prepare: createDefaultPreparer('PTTL')
    },

    /**
     * Command: expire
     * @see https://redis.io/docs/latest/commands/expire
     */
    'expire': {
        prepare: createDefaultPreparer('EXPIRE'),
        process: isIntegerOne
    },

    /**
     * Command: pExpire
     * @see https://redis.io/docs/latest/commands/pexpire
     */
    'pExpire': {
        prepare: createDefaultPreparer('PEXPIRE'),
        process: isIntegerOne
    },

    /**
     * Command: expireAt
     * @see https://redis.io/docs/latest/commands/expireat
     */
    'expireAt': {
        prepare: createDefaultPreparer('EXPIREAT'),
        process: isIntegerOne
    },

    /**
     * Command: pExpireAt
     * @see https://redis.io/docs/latest/commands/pexpireat
     */
    'pExpireAt': {
        prepare: createDefaultPreparer('PEXPIREAT'),
        process: isIntegerOne
    },

    /**
     * Command: persist
     * @see https://redis.io/docs/latest/commands/persist
     */
    'persist': {
        prepare: createDefaultPreparer('PERSIST'),
        process: isIntegerOne
    },

    /**
     * Command: exists
     * @see https://redis.io/docs/latest/commands/exists
     */
    'exists': {
        prepare: createDefaultPreparer('EXISTS'),
        process: isIntegerOne
    },

    /**
     * Command: exists
     * @see https://redis.io/docs/latest/commands/exists
     */
    'mExists': {
        prepare(keys: string[]): IPrepareResult {

            return {
                cmd: 'EXISTS',
                args: keys
            };
        }
    },

    /**
     * Command: type
     * @see https://redis.io/docs/latest/commands/type
     */
    'type': {
        prepare: createDefaultPreparer('TYPE'),
        process: U.buffer2String
    },

    /**
     * Command: move
     * @see https://redis.io/docs/latest/commands/move
     */
    'move': {
        prepare: createDefaultPreparer('MOVE'),
        process: isIntegerOne
    },

    /**
     * Command: swapdb
     * @see https://redis.io/docs/latest/commands/swapdb
     */
    'swapDB': {
        prepare: createDefaultPreparer('SWAPDB'),
        process: isStringOK
    },

    /**
     * Command: copy
     * @see https://redis.io/docs/latest/commands/copy
     */
    'copy': {
        prepare(
            srcKey: string,
            destKey: string,
            destDB: number | null = null,
            overwrite: boolean = false
        ): IPrepareResult {

            const ret: IPrepareResult = {
                cmd: 'COPY',
                args: [srcKey, destKey]
            };

            if (destDB !== null) {

                ret.args.push('DB', destDB);
            }

            if (overwrite) {

                ret.args.push('REPLACE');
            }

            return ret;
        },
        process: isIntegerOne
    },

    /**
     * Command: randomKey
     * @see https://redis.io/docs/latest/commands/randomkey
     */
    'randomKey': {
        prepare: createDefaultPreparer('RANDOMKEY'),
        process: U.buffer2String
    },

    /**
     * Command: rename
     * @see https://redis.io/docs/latest/commands/rename
     */
    'rename': {
        prepare: createDefaultPreparer('RENAME'),
        process: null
    },

    /**
     * Command: renameNX
     * @see https://redis.io/docs/latest/commands/renamenx
     */
    'renameNX': {
        prepare: createDefaultPreparer('RENAMENX'),
        process: isIntegerOne
    },

    /**
     * Command: select
     * @see https://redis.io/docs/latest/commands/select
     */
    'select': {
        prepare: createDefaultPreparer('SELECT'),
        process: null
    },

    /**
     * Command: flushDb
     * @see https://redis.io/docs/latest/commands/flushdb
     */
    'flushDb': {
        prepare(async: boolean = false): IPrepareResult {
            return {
                cmd: 'FLUSHDB',
                args: async ? ['ASYNC'] : []
            };
        },
        process: null
    },

    /**
     * Command: flushAll
     * @see https://redis.io/docs/latest/commands/flushall
     */
    'flushAll': {
        prepare(async: boolean = false): IPrepareResult {
            return {
                cmd: 'FLUSHALL',
                args: async ? ['ASYNC'] : []
            };
        },
        process: null
    },

    /**
     * Command: hDel
     * @see https://redis.io/docs/latest/commands/hdel
     */
    'hDel': {
        prepare(key: string, fields: string | string[]): IPrepareResult {

            if (Array.isArray(fields)) {

                if (!fields.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'HDEL',
                    args: [key, ...fields]
                };
            }

            return {
                cmd: 'HDEL',
                args: [key, fields]
            };
        }
    },

    /**
     * Command: hGet
     * @see https://redis.io/docs/latest/commands/hget
     */
    'hGet': {
        prepare: createDefaultPreparer('HGET'),
        process: U.nullableBuffer2String
    },

    /**
     * Command: hGet
     * @see https://redis.io/docs/latest/commands/hget
     */
    'hGet$': {
        prepare: createDefaultPreparer('HGET')
    },

    /**
     * Command: hSet
     * @see https://redis.io/docs/latest/commands/hset
     */
    'hSet': {
        prepare: createDefaultPreparer('HSET'),
        process: isIntegerOne
    },

    /**
     * Command: hSetNX
     * @see https://redis.io/docs/latest/commands/hsetnx
     */
    'hSetNX': {
        prepare: createDefaultPreparer('HSETNX'),
        process: isIntegerOne
    },

    /**
     * Command: hExists
     * @see https://redis.io/docs/latest/commands/hexists
     */
    'hExists': {

        prepare: createDefaultPreparer('HEXISTS'),
        process: isIntegerOne
    },

    /**
     * Command: keys
     * @see https://redis.io/docs/latest/commands/keys
     */
    'keys': {
        prepare: createDefaultPreparer('KEYS'),
        process: U.list2StringList
    },

    /**
     * Command: dump
     * @see https://redis.io/docs/latest/commands/dump
     */
    'dump': {
        prepare: createDefaultPreparer('DUMP')
    },

    /**
     * Command: restore
     * @see https://redis.io/docs/latest/commands/restore
     */
    'restore': {

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

            if (replace) {

                args.push('REPLACE');
            }

            if (absTTL) {

                args.push('ABSTTL');
            }

            if (idleTime) {

                args.push('IDLETIME', idleTime);
            }

            if (freq) {

                args.push('FREQ', freq);
            }

            return {
                cmd: 'RESTORE',
                args
            };
        },
        process: null
    },

    /**
     * Command: strLen
     * @see https://redis.io/docs/latest/commands/strlen
     */
    'strLen': {
        prepare: createDefaultPreparer('STRLEN')
    },

    /**
     * Command: touch
     * @see https://redis.io/docs/latest/commands/touch
     */
    'touch': {
        prepare(keys: string | string[]): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'TOUCH',
                    args: keys
                };
            }

            return {
                cmd: 'TOUCH',
                args: [keys]
            };
        }
    },

    /**
     * Command: mGet
     * @see https://redis.io/docs/latest/commands/mget
     */
    'mGet': {
        prepare(keys: string | string[]): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'MGET',
                    args: keys
                };
            }

            return {
                cmd: 'MGET',
                args: [keys]
            };
        },
        process(data: Array<[number, Buffer]>, args: any[]): any {

            return U.list2NullableStringDict(args, data);
        }
    },

    /**
     * Command: mGet
     * @see https://redis.io/docs/latest/commands/mget
     */
    'mGet$': {
        prepare(keys: string | string[]): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'MGET',
                    args: keys
                };
            }

            return {
                cmd: 'MGET',
                args: [keys]
            };
        },
        process(data: Array<[number, Buffer]>, args: any[]): any {

            return U.list2NullableBufferDict(args, data);
        }
    },

    /**
     * Command: mSet
     * @see https://redis.io/docs/latest/commands/mset
     */
    'mSet': {
        prepare(kv: Record<string, string | Buffer>): IPrepareResult {

            const args: Array<string | Buffer> = [];

            for (const k in kv) {

                args.push(k, kv[k]);
            }

            return {

                cmd: 'MSET',
                args
            };
        },
        process: null
    },

    /**
     * Command: mSetNX
     * @see https://redis.io/docs/latest/commands/msetnx
     */
    'mSetNX': {
        prepare(kv: Record<string, string | Buffer>): IPrepareResult {

            const args: Array<string | Buffer> = [];

            for (const k in kv) {

                args.push(k, kv[k]);
            }

            return {

                cmd: 'MSETNX',
                args
            };
        },
        process: isIntegerOne
    },

    /**
     * Command: hIncr
     * @see https://redis.io/docs/latest/commands/hincrby
     */
    'hIncr': {
        prepare(key: string, field: string, step: number = 1): IPrepareResult {
            return {
                cmd: 'HINCRBY',
                args: [key, field, step]
            };
        },
        // process: parseInt, // always returning integer
    },

    /**
     * Command: hIncrByFloat
     * @see https://redis.io/docs/latest/commands/hincrbyfloat
     */
    'hIncrByFloat': {
        prepare(key: string, field: string, step: number = 1): IPrepareResult {
            return {
                cmd: 'HINCRBYFLOAT',
                args: [key, field, step]
            };
        },
        process: parseFloat,
    },

    /**
     * Command: hIncr
     * @see https://redis.io/docs/latest/commands/hincrby
     */
    'hDecr': {
        prepare(key: string, field: string, step: number = 1): IPrepareResult {
            return {
                cmd: 'HINCRBY',
                args: [key, field, -step]
            };
        },
        // process: parseInt, // always returning integer
    },

    /**
     * Command: hIncrByFloat
     * @see https://redis.io/docs/latest/commands/hincrbyfloat
     */
    'hDecrByFloat': {
        prepare(key: string, field: string, step: number = 1): IPrepareResult {
            return {
                cmd: 'HINCRBYFLOAT',
                args: [key, field, -step]
            };
        },
        process: parseFloat
    },

    /**
     * Command: hKeys
     * @see https://redis.io/docs/latest/commands/hkeys
     */
    'hKeys': {
        prepare: createDefaultPreparer('HKEYS'),
        process: U.list2StringList
    },

    /**
     * Command: hVals
     * @see https://redis.io/docs/latest/commands/hvals
     */
    'hVals': {
        prepare: createDefaultPreparer('HVALS'),
        process: U.list2StringList
    },

    /**
     * Command: hVals
     * @see https://redis.io/docs/latest/commands/hvals
     */
    'hVals$': {
        prepare: createDefaultPreparer('HVALS'),
        process: U.list2BufferList
    },

    /**
     * Command: hLen
     * @see https://redis.io/docs/latest/commands/hlen
     */
    'hLen': {
        prepare: createDefaultPreparer('HLEN')
    },

    /**
     * Command: hMGet
     * @see https://redis.io/docs/latest/commands/hmget
     */
    'hMGet': {
        prepare(key: string, fields: string | string[]): IPrepareResult {

            if (Array.isArray(fields)) {

                if (!fields.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'HMGET',
                    args: [key, ...fields]
                };
            }

            return {
                cmd: 'HMGET',
                args: [key, fields]
            };
        },
        process(data: Array<[number, Buffer]>, args: any[]): any {

            return U.list2NullableStringDict(args.slice(1), data);
        }
    },

    /**
     * Command: hMGet
     * @see https://redis.io/docs/latest/commands/hmget
     */
    'hMGet$': {
        prepare(key: string, fields: string | string[]): IPrepareResult {

            if (Array.isArray(fields)) {

                if (!fields.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'HMGET',
                    args: [key, ...fields]
                };
            }

            return {
                cmd: 'HMGET',
                args: [key, fields]
            };
        },
        process(data: Array<[number, Buffer]>, args: any[]): any {

            return U.list2NullableBufferDict(args.slice(1), data);
        }
    },

    /**
     * Command: hGetAll
     * @see https://redis.io/docs/latest/commands/hgetall
     */
    'hGetAll': {
        prepare: createDefaultPreparer('HGETALL'),
        process: U.pairList2NullableStringDict
    },

    /**
     * Command: hGetAll
     * @see https://redis.io/docs/latest/commands/hgetall
     */
    'hGetAll$': {
        prepare: createDefaultPreparer('HGETALL'),
        process: U.pairList2NullableBufferDict
    },

    /**
     * Command: hMSet
     * @see https://redis.io/docs/latest/commands/hmset
     */
    'hMSet': {
        prepare(k: string, fv: Record<string, string | Buffer>): IPrepareResult {

            const args: any[] = [k];

            for (const f in fv) {

                args.push(f, fv[f]);
            }

            return {
                cmd: 'HMSET',
                args
            };
        },
        process: null
    },

    /**
     * Command: hStrLen
     * @see https://redis.io/docs/latest/commands/hstrlen
     */
    'hStrLen': {
        prepare: createDefaultPreparer('HSTRLEN')
    },

    /**
     * Command: scan
     * @see https://redis.io/docs/latest/commands/scan
     */
    'scan': {
        prepare(cur: number, p?: string, cn?: number): IPrepareResult {

            const args: any[] = [cur];

            if (p) {

                args.push('MATCH', p);
            }
            if (cn) {

                args.push('COUNT', cn);
            }

            return {
                cmd: 'SCAN',
                args
            };
        },
        process(data: [[number, Buffer], [number, Array<[number, Buffer]>]]): C.IScanResult<string> {

            return {
                'nextCursor': parseInt(data[0][1].toString()),
                'items': U.list2StringList(data[1][1])
            };
        }
    },

    /**
     * Command: hScan
     * @see https://redis.io/docs/latest/commands/hscan
     */
    'hScan': {
        prepare(k: string, cur: number, p?: string, cn?: number): IPrepareResult {

            const args: any[] = [k, cur];

            if (p) {

                args.push('MATCH', p);
            }
            if (cn) {

                args.push('COUNT', cn);
            }

            return {
                cmd: 'HSCAN',
                args
            };
        },
        process(data: [[number, Buffer], [number, Array<[number, Buffer]>]]): C.IScanResult<string> {

            return {
                'nextCursor': parseInt(data[0][1].toString()),
                'items': U.list2StringList(data[1][1])
            };
        }
    },

    /**
     * Command: sAdd
     * @see https://redis.io/docs/latest/commands/sadd
     */
    'sAdd': {
        prepare(key: string, values: Array<string | Buffer>): IPrepareResult {

            return {
                cmd: 'SADD',
                args: [key, ...values]
            };
        }
    },

    /**
     * Command: sCard
     * @see https://redis.io/docs/latest/commands/scard
     */
    'sCard': {
        prepare: createDefaultPreparer('SCARD')
    },

    /**
     * Command: sDiff
     * @see https://redis.io/docs/latest/commands/sdiff
     */
    'sDiff': {
        prepare(keys: string | string[]): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'SDIFF',
                    args: keys
                };
            }

            return {
                cmd: 'SDIFF',
                args: [keys]
            };
        },
        process: U.list2StringList
    },

    /**
     * Command: sDiff
     * @see https://redis.io/docs/latest/commands/sdiff
     */
    'sDiff$': {
        prepare(keys: string | string[]): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'SDIFF',
                    args: keys
                };
            }

            return {
                cmd: 'SDIFF',
                args: [keys]
            };
        },
        process: U.list2BufferList
    },

    /**
     * Command: sDiffStore
     * @see https://redis.io/docs/latest/commands/sdiffstore
     */
    'sDiffStore': {
        prepare(keys: string | string[], target: string): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'SDIFFSTORE',
                    args: [target, ...keys]
                };
            }

            return {
                cmd: 'SDIFFSTORE',
                args: [keys]
            };
        }
    },

    /**
     * Command: sInter
     * @see https://redis.io/docs/latest/commands/sinter
     */
    'sInter': {
        prepare(keys: string | string[]): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'SINTER',
                    args: keys
                };
            }

            return {
                cmd: 'SINTER',
                args: [keys]
            };
        },
        process: U.list2StringList
    },

    /**
     * Command: sInter
     * @see https://redis.io/docs/latest/commands/sinter
     */
    'sInter$': {
        prepare(keys: string | string[]): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'SINTER',
                    args: keys
                };
            }

            return {
                cmd: 'SINTER',
                args: [keys]
            };
        },
        process: U.list2BufferList
    },

    /**
     * Command: sInterStore
     * @see https://redis.io/docs/latest/commands/sinterstore
     */
    'sInterStore': {
        prepare(keys: string | string[], target: string): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'SINTERSTORE',
                    args: [target, ...keys]
                };
            }

            return {
                cmd: 'SINTERSTORE',
                args: [keys]
            };
        }
    },

    /**
     * Command: sUnion
     * @see https://redis.io/docs/latest/commands/sunion
     */
    'sUnion': {
        prepare(keys: string | string[]): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'SUNION',
                    args: keys
                };
            }

            return {
                cmd: 'SUNION',
                args: [keys]
            };
        },
        process: U.list2StringList
    },

    /**
     * Command: sUnion
     * @see https://redis.io/docs/latest/commands/sunion
     */
    'sUnion$': {
        prepare(keys: string | string[]): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'SUNION',
                    args: keys
                };
            }

            return {
                cmd: 'SUNION',
                args: [keys]
            };
        },
        process: U.list2BufferList
    },

    /**
     * Command: sUnionStore
     * @see https://redis.io/docs/latest/commands/sunionstore
     */
    'sUnionStore': {
        prepare(keys: string | string[]): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'SUNIONSTORE',
                    args: keys
                };
            }

            return {
                cmd: 'SUNIONSTORE',
                args: [keys]
            };
        }
    },

    /**
     * Command: sIsMember
     * @see https://redis.io/docs/latest/commands/sismember
     */
    'sIsMember': {
        prepare: createDefaultPreparer('SISMEMBER'),
        process: isIntegerOne
    },

    /**
     * Command: sMembers
     * @see https://redis.io/docs/latest/commands/smembers
     */
    'sMembers': {
        prepare: createDefaultPreparer('SMEMBERS'),
        process: U.list2StringList
    },

    /**
     * Command: sMembers
     * @see https://redis.io/docs/latest/commands/smembers
     */
    'sMembers$': {
        prepare: createDefaultPreparer('SMEMBERS'),
        process: U.list2BufferList
    },

    /**
     * Command: sMove
     * @see https://redis.io/docs/latest/commands/smove
     */
    'sMove': {
        prepare: createDefaultPreparer('SMOVE'),
        process: isIntegerOne
    },

    /**
     * Command: sPop
     * @see https://redis.io/docs/latest/commands/spop
     */
    'sPop': {
        prepare: createDefaultPreparer('SPOP'),
        process: U.list2StringList
    },

    /**
     * Command: sPop
     * @see https://redis.io/docs/latest/commands/spop
     */
    'sPop$': {
        prepare: createDefaultPreparer('SPOP'),
        process: U.list2BufferList
    },

    /**
     * Command: sRandMember
     * @see https://redis.io/docs/latest/commands/srandmember
     */
    'sRandMember': {
        prepare: createDefaultPreparer('SRANDMEMBER'),
        process: U.list2StringList
    },

    /**
     * Command: sRandMember
     * @see https://redis.io/docs/latest/commands/srandmember
     */
    'sRandMember$': {
        prepare: createDefaultPreparer('SRANDMEMBER'),
        process: U.list2BufferList
    },

    /**
     * Command: sRem
     * @see https://redis.io/docs/latest/commands/srem
     */
    'sRem': {
        prepare: (key: string, members: Array<string | Buffer>) => ({ args: [key, ...members], cmd: 'SREM' })
    },

    /**
     * Command: sScan
     * @see https://redis.io/docs/latest/commands/sscan
     */
    'sScan': {
        prepare(k: string, cur: number, p?: string, cn?: number): IPrepareResult {

            const args: any[] = [k, cur];

            if (p) {

                args.push('MATCH', p);
            }
            if (cn) {

                args.push('COUNT', cn);
            }

            return {
                cmd: 'SSCAN',
                args
            };
        },
        process(data: [[number, Buffer], [number, Array<[number, Buffer]>]]): C.IScanResult<string> {

            return {
                'nextCursor': parseInt(data[0][1].toString()),
                'items': U.list2StringList(data[1][1])
            };
        }
    },

    /**
     * Command: sScan
     * @see https://redis.io/docs/latest/commands/sscan
     */
    'sScan$': {
        prepare(k: string, cur: number, p?: string, cn?: number): IPrepareResult {

            const args: any[] = [k, cur];

            if (p) {

                args.push('MATCH', p);
            }
            if (cn) {

                args.push('COUNT', cn);
            }

            return {
                cmd: 'SSCAN',
                args
            };
        },
        process(data: [[number, Buffer], [number, Array<[number, Buffer]>]]): C.IScanResult<string> {

            return {
                'nextCursor': parseInt(data[0][1].toString()),
                'items': U.list2StringList(data[1][1])
            };
        }
    },

    /**
     * Command: bLPop
     * @see https://redis.io/docs/latest/commands/blpop
     */
    'bLPop': {
        prepare(keys: string | string[], timeout: number): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'BLPOP',
                    args: [...keys, timeout]
                };
            }

            return {
                cmd: 'BLPOP',
                args: [keys, timeout]
            };
        },
        process: U.pairList2StringDict
    },

    /**
     * Command: bLPop
     * @see https://redis.io/docs/latest/commands/blpop
     */
    'bLPop$': {
        prepare(keys: string | string[], timeout: number): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'BLPOP',
                    args: [...keys, timeout]
                };
            }

            return {
                cmd: 'BLPOP',
                args: [keys, timeout]
            };
        },
        process: U.pairList2BufferDict
    },

    /**
     * Command: bRPop
     * @see https://redis.io/docs/latest/commands/brpop
     */
    'bRPop': {
        prepare(keys: string | string[], timeout: number): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'BRPOP',
                    args: [...keys, timeout]
                };
            }

            return {
                cmd: 'BRPOP',
                args: [keys, timeout]
            };
        },
        process: U.pairList2StringDict
    },

    /**
     * Command: bRPop
     * @see https://redis.io/docs/latest/commands/brpop
     */
    'bRPop$': {
        prepare(keys: string | string[], timeout: number): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'BRPOP',
                    args: [...keys, timeout]
                };
            }

            return {
                cmd: 'BRPOP',
                args: [keys, timeout]
            };
        },
        process: U.pairList2BufferDict
    },

    /**
     * Command: bRPopLPush
     * @see https://redis.io/docs/latest/commands/brpoplpush
     */
    'bRPopLPush': {
        prepare: createDefaultPreparer('BRPOPLPUSH'),
        process: U.buffer2String
    },

    /**
     * Command: bRPopLPush
     * @see https://redis.io/docs/latest/commands/brpoplpush
     */
    'bRPopLPush$': {
        prepare: createDefaultPreparer('BRPOPLPUSH')
    },

    /**
     * Command: lIndex
     * @see https://redis.io/docs/latest/commands/lindex
     */
    'lIndex': {
        prepare: createDefaultPreparer('LINDEX'),
        process: U.buffer2String
    },

    /**
     * Command: lIndex
     * @see https://redis.io/docs/latest/commands/lindex
     */
    'lIndex$': {
        prepare: createDefaultPreparer('LINDEX')
    },

    /**
     * Command: lInsert
     * @see https://redis.io/docs/latest/commands/linsert
     */
    'lInsertBefore': {
        prepare(key: string, pivot: string, value: string | Buffer): IPrepareResult {

            return {
                args: [key, 'BEFORE', pivot, value],
                cmd: 'LINSERT'
            };
        }
    },

    /**
     * Command: lInsert
     * @see https://redis.io/docs/latest/commands/linsert
     */
    'lInsertAfter': {
        prepare(key: string, pivot: string, value: string | Buffer): IPrepareResult {

            return {
                args: [key, 'AFTER', pivot, value],
                cmd: 'LINSERT'
            };
        }
    },

    /**
     * Command: lLen
     * @see https://redis.io/docs/latest/commands/llen
     */
    'lLen': {
        prepare: createDefaultPreparer('LLEN')
    },

    /**
     * Command: lPop
     * @see https://redis.io/docs/latest/commands/lpop
     */
    'lPop': {
        prepare(key: string, count?: number): IPrepareResult {

            return {
                args: count === undefined ? [key] : [key, count],
                cmd: 'LPOP'
            };
        },
        process(data: any, args: any[]): string | null | string[] {

            switch (args.length) {
                case 1:
                    return data?.toString() ?? null;
                default:
                    return U.list2StringList(data);
            }
        }
    },

    /**
     * Command: lPop
     * @see https://redis.io/docs/latest/commands/lpop
     */
    'lPop$': {
        prepare(key: string, count?: number): IPrepareResult {

            return {
                args: count === undefined ? [key] : [key, count],
                cmd: 'LPOP'
            };
        },
        process(data: any, args: any[]): Buffer | null | Buffer[] {

            switch (args.length) {
                case 1:
                    return data ?? null;
                default:
                    return U.list2BufferList(data);
            }
        }
    },

    /**
     * Command: lPush
     * @see https://redis.io/docs/latest/commands/lpush
     */
    'lPush': {
        prepare(key: string, values: Array<string | Buffer>): IPrepareResult {

            return {
                args: [key, ...values],
                cmd: 'LPUSH'
            };
        }
    },

    /**
     * Command: lPushX
     * @see https://redis.io/docs/latest/commands/lpushx
     */
    'lPushX': {
        prepare(key: string, values: Array<string | Buffer>): IPrepareResult {

            return {
                args: [key, ...values],
                cmd: 'LPUSHX'
            };
        }
    },

    /**
     * Command: lRange
     * @see https://redis.io/docs/latest/commands/lrange
     */
    'lRange': {
        prepare: createDefaultPreparer('LRANGE'),
        process: U.list2StringList
    },

    /**
     * Command: lRange
     * @see https://redis.io/docs/latest/commands/lrange
     */
    'lRange$': {
        prepare: createDefaultPreparer('LRANGE'),
        process: U.list2BufferList
    },

    /**
     * Command: lRem
     * @see https://redis.io/docs/latest/commands/lrem
     */
    'lRem': {
        prepare: createDefaultPreparer('LREM')
    },

    /**
     * Command: lSet
     * @see https://redis.io/docs/latest/commands/lset
     */
    'lSet': {
        prepare: createDefaultPreparer('LSET'),
        process: null
    },

    /**
     * Command: lTrim
     * @see https://redis.io/docs/latest/commands/ltrim
     */
    'lTrim': {
        prepare: createDefaultPreparer('LTRIM'),
        process: null
    },

    /**
     * Command: rPop
     * @see https://redis.io/docs/latest/commands/rpop
     */
    'rPop': {
        prepare(key: string, count?: number): IPrepareResult {

            return {
                args: count === undefined ? [key] : [key, count],
                cmd: 'RPOP'
            };
        },
        process(data: any, args: any[]): string | null | string[] {

            switch (args.length) {
                case 1:
                    return data?.toString() ?? null;
                default:
                    return U.list2StringList(data);
            }
        }
    },

    /**
     * Command: rPop
     * @see https://redis.io/docs/latest/commands/rpop
     */
    'rPop$': {
        prepare(key: string, count?: number): IPrepareResult {

            return {
                args: count === undefined ? [key] : [key, count],
                cmd: 'RPOP'
            };
        },
        process(data: any, args: any[]): Buffer | null | Buffer[] {

            switch (args.length) {
                case 1:
                    return data ?? null;
                default:
                    return U.list2BufferList(data);
            }
        }
    },

    /**
     * Command: rPopLPush
     * @see https://redis.io/docs/latest/commands/rpoplpush
     */
    'rPopLPush': {
        prepare: createDefaultPreparer('RPOPLPUSH'),
        process: U.buffer2String
    },

    /**
     * Command: rPopLPush
     * @see https://redis.io/docs/latest/commands/rpoplpush
     */
    'rPopLPush$': {
        prepare: createDefaultPreparer('RPOPLPUSH')
    },

    /**
     * Command: rPush
     * @see https://redis.io/docs/latest/commands/rpush
     */
    'rPush': {
        prepare(key: string, values: Array<string | Buffer>): IPrepareResult {

            return {
                args: [key, ...values],
                cmd: 'RPUSH'
            };
        }
    },

    /**
     * Command: rPushX
     * @see https://redis.io/docs/latest/commands/rpushx
     */
    'rPushX': {
        prepare(key: string, values: Array<string | Buffer>): IPrepareResult {

            return {
                args: [key, ...values],
                cmd: 'RPUSHX'
            };
        }
    },

    /**
     * Command: lMove
     * @see https://redis.io/docs/latest/commands/lmove
     */
    'lMove': {
        prepare(srcKey: string, destKey: string, srcDir: 'LEFT' | 'RIGHT', destDir: 'LEFT' | 'RIGHT'): IPrepareResult {

            return {
                cmd: 'LMOVE',
                args: [srcKey, destKey, srcDir, destDir]
            };
        },
        process: U.nullableBuffer2String
    },

    /**
     * Command: lMove
     * @see https://redis.io/docs/latest/commands/lmove
     */
    'lMove$': {
        prepare(srcKey: string, destKey: string, srcDir: 'LEFT' | 'RIGHT', destDir: 'LEFT' | 'RIGHT'): IPrepareResult {

            return {
                cmd: 'LMOVE',
                args: [srcKey, destKey, srcDir, destDir]
            };
        }
    },

    /**
     * Command: bLMove
     * @see https://redis.io/docs/latest/commands/blmove
     */
    'bLMove': {
        prepare(srcKey: string, destKey: string, srcDir: 'LEFT' | 'RIGHT', destDir: 'LEFT' | 'RIGHT', timeout: number): IPrepareResult {

            return {
                cmd: 'BLMOVE',
                args: [srcKey, destKey, srcDir, destDir, timeout]
            };
        },
        process: U.nullableBuffer2String
    },

    /**
     * Command: bLMove
     * @see https://redis.io/docs/latest/commands/blmove
     */
    'bLMove$': {
        prepare(srcKey: string, destKey: string, srcDir: 'LEFT' | 'RIGHT', destDir: 'LEFT' | 'RIGHT', timeout: number): IPrepareResult {

            return {
                cmd: 'BLMOVE',
                args: [srcKey, destKey, srcDir, destDir, timeout]
            };
        }
    },

    /**
     * Command: zRem
     * @see https://redis.io/docs/latest/commands/zrem
     */
    'zRem': {
        prepare: (key: string, members: Array<string | Buffer>) => ({ args: [key, ...members], cmd: 'ZREM' })
    },

    /**
     * Command: zAdd
     * @see https://redis.io/docs/latest/commands/zadd
     */
    'zAdd': {
        prepare: createDefaultPreparer('ZADD'),
        process: isIntegerOne
    },

    /**
     * Command: zRange
     * @see https://redis.io/docs/latest/commands/zrange
     */
    'zRangeWithScores': {
        prepare: (key: string, start: number, stop: number) => {

            return {
                'cmd': 'ZRANGE',
                'args': [key, start, stop, 'WITHSCORES']
            };
        },
        process: (items: Array<[number, Buffer]>): Array<{ member: string; score: number; }> => {

            const ret: Array<{ member: string; score: number; }> = [];

            for (let i = 0 ; i < items.length; i = i + 2) {

                ret.push({
                    'member': items[i][1].toString(),
                    'score': parseFloat(items[i + 1][1].toString())
                });
            }

            return ret;
        }
    },

    /**
     * Command: zRange
     * @see https://redis.io/docs/latest/commands/zrange
     */
    'zRangeWithScores$': {
        prepare: (key: string, start: number, stop: number) => {

            return {
                'cmd': 'ZRANGE',
                'args': [key, start, stop, 'WITHSCORES']
            };
        },
        process: (items: Array<[number, Buffer]>): Array<{ member: Buffer; score: number; }> => {

            const ret: Array<{ member: Buffer; score: number; }> = [];

            for (let i = 0 ; i < items.length; i = i + 2) {

                ret.push({
                    'member': items[i][1],
                    'score': parseFloat(items[i + 1][1].toString())
                });
            }

            return ret;
        }
    },

    /**
     * Command: pfAdd
     * @see https://redis.io/docs/latest/commands/pfadd
     */
    'pfAdd': {
        prepare(key: string, values: Array<string | Buffer>): IPrepareResult {

            return {
                args: [key, ...values],
                cmd: 'PFADD'
            };
        },
        process: isIntegerOne
    },

    /**
     * Command: pfCount
     * @see https://redis.io/docs/latest/commands/pfcount
     */
    'pfCount': {
        prepare: createDefaultPreparer('PFCOUNT')
    },

    /**
     * Command: pfMerge
     * @see https://redis.io/docs/latest/commands/pfmerge
     */
    'pfMerge': {
        prepare(keys: string | string[], target: string): IPrepareResult {

            if (Array.isArray(keys)) {

                if (!keys.length) {

                    throw new E.E_INVALID_PARAM();
                }

                return {
                    cmd: 'PFMERGE',
                    args: [target, ...keys]
                };
            }

            return {
                cmd: 'PFMERGE',
                args: [target, keys]
            };
        },
        process: null
    },

    /**
     * Command: publish
     * @see https://redis.io/docs/latest/commands/publish
     */
    'publish': {
        prepare: createDefaultPreparer('PUBLISH')
    },

    'pubSubChannels': {
        prepare(p?: string): IPrepareResult {

            return {
                args: p ? ['CHANNELS', p] : ['CHANNELS'],
                cmd: 'PUBSUB'
            };
        },
        process: U.list2StringList
    },

    'pubSubNumSub': {
        prepare(channels: string[]): IPrepareResult {

            return {
                args: ['NUMSUB', ...channels],
                cmd: 'PUBSUB'
            };
        },
        process(data: Array<[number, Buffer | number]>): Record<string, number> {

            const ret: Record<string, number> = {};

            for (let i = 0; i < data.length; i += 2) {

                ret[data[i][1].toString()] = data[i + 1][1] as number;
            }

            return ret;
        }
    },

    'pubSubNumPat': {

        prepare(): IPrepareResult {

            return {
                args: ['NUMPAT'],
                cmd: 'PUBSUB'
            };
        }
    },

    'scriptLoad': {
        prepare(script: string): IPrepareResult {

            return {
                cmd: 'SCRIPT',
                args: ['LOAD', script]
            };
        },
        process: U.buffer2String
    },

    'scriptKill': {
        prepare(): IPrepareResult {

            return {
                cmd: 'SCRIPT',
                args: ['KILL']
            };
        },
        process: null
    },

    'scriptFlush': {
        prepare(): IPrepareResult {

            return {
                cmd: 'SCRIPT',
                args: ['FLUSH']
            };
        },
        process: null
    },

    'scriptExists': {
        prepare(shaList: string[]): IPrepareResult {

            return {
                cmd: 'SCRIPT',
                args: ['EXISTS', ...shaList]
            };
        }
    },

    'scriptDebug': {
        prepare(enabled: boolean | 'sync'): IPrepareResult {

            return {
                cmd: 'SCRIPT',
                args: ['DEBUG', enabled === false ? 'NO' : enabled === true ? 'YES' : 'SYNC']
            };
        },
        process: null
    },

    'evalSHA': {
        prepare(sha: string, keys: string[], args: Array<string | Buffer>): IPrepareResult {

            return {
                cmd: 'EVALSHA',
                args: [sha, keys.length, ...keys, ...args]
            };
        }
    },

    'eval': {
        prepare(script: string, keys: string[], args: Array<string | Buffer>): IPrepareResult {

            return {
                cmd: 'EVAL',
                args: [script, keys.length, ...keys, ...args]
            };
        }
    },

    /**
     * Command: time
     * @see https://redis.io/docs/latest/commands/time
     */
    'time': {
        prepare(): IPrepareResult {

            return {
                cmd: 'TIME',
                args: []
            };
        },
        process(data: [[number, Buffer], [number, Buffer]]): any {

            return { s: parseInt(data[0][1].toString()), us: parseInt(data[1][1].toString()),  };
        }
    },

    /**
     * Command: time
     * @see https://redis.io/docs/latest/commands/time
     */
    'msTime': {
        prepare(): IPrepareResult {

            return {
                cmd: 'TIME',
                args: []
            };
        },
        process(data: [[number, Buffer], [number, Buffer]]): number {

            return parseInt(data[0][1].toString()) * 1_000 + Math.floor(parseInt(data[1][1].toString()) / 1000);
        }
    },

    /**
     * Command: time
     * @see https://redis.io/docs/latest/commands/time
     */
    'secTime': {
        prepare(): IPrepareResult {

            return {
                cmd: 'TIME',
                args: []
            };
        },
        process(data: [[number, Buffer], [number, Buffer]]): number {

            return parseInt(data[0][1].toString());
        }
    },

    /**
     * Command: time
     * @see https://redis.io/docs/latest/commands/time
     */
    'usTime': {
        prepare(): IPrepareResult {

            return {
                cmd: 'TIME',
                args: []
            };
        },
        process(data: [[number, Buffer], [number, Buffer]]): number {

            return parseInt(data[0][1].toString()) * 1_000_000 + parseInt(data[1][1].toString());
        }
    },

};
