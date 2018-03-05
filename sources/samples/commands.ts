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
// tslint:disable:no-console

import * as libRedis from "../";

async function sleep(ms: number): Promise<void> {

    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

(async () => {

    let client!: libRedis.RedisClient;

    try {

        client = await libRedis.createRedisClient({
            "host": "127.0.0.1"
        });

        let result: any;

        await client.auth("redis-password");

        result = await client.ping();

        console.log(result);

        result = await client.ping("HI");

        console.log(result.toString());

        await sleep(5000);

        while (1) {

            try {

                result = await client.ping("d");

                console.log(result);

                break;
            }
            catch (e) {

                console.error(e.toString());
                console.error(libRedis.ClientStatus[client.status]);
            }

            await sleep(1000);
        }

        result = await client.set("d", "hello");

        console.log(result);

        result = await client.set("a", "world");

        console.log(result);

        result = await client.set("c", "123");

        await client.mSet({
            "x1": "hello",
            "x2": "world",
            "x3": "test"
        });

        console.log(result);

        result = await client.mGet(["x1", "b", "x2", "x3", "e"]);

        await client.hMSet("ax", {
            "a": "asads",
            "b": "ccalsd",
            "c": "dasdas",
            "x": "123"
        });

        result = await client.hMGet("ax", ["a", "b", "c", "d"]);

        console.log(result);

        result = await client.hGetAll("ax");

        console.log(result);

        result = await client.hGet("ax", "c");

        console.log(result.toString());

        result = await client.setNX("c", "123");

        console.log(result);

        result = await client.strLen("a");

        console.log(result);

        result = await client.decr("c", 3);

        console.log(result);

        result = await client.decr("c", 5.5);

        console.log(result);

        result = await client.hLen("ax");

        console.log(result);

        result = await client.hLen("bx");

        console.log(result);

        result = await client.randomKey();

        console.log(result);

        result = await client.keys("*");

        console.log(result);

        result = await client.hKeys("ax");

        console.log(result);

        result = await client.hVals("ax");

        console.log(result.map((x: Buffer) => x.toString()));

        result = await client.hKeys("b");

        console.log(result.map((x: Buffer) => x.toString()));

        result = await client.hIncr("ax", "x");

        console.log(result);

        result = await client.hIncr("ax", "x", 5);

        console.log(result);

        result = await client.hIncr("ax", "x", 5.5);

        console.log(result);

        result = await client.hDecr("ax", "x", 5.5);

        console.log(result);

        result = await client.hDecr("ax", "x", 5);

        console.log(result);

        result = await client.hDecr("ax", "x");

        console.log(result);

        result = await client.scan(0, undefined, 1000);

        console.log(result);

        result = await client.hScan("ax");

        console.log(result);

        await client.close();
    }
    catch (e) {

        console.error(e.toString());

        if (client) {

            await client.close();
        }
    }

})().catch((e) => console.error(e));
