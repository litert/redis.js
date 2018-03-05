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

        client.on("error", (e) => {

            console.error(e.toString());
        });

        let result: any;

        await client.auth("redis-password");

        result = await client.ping();

        console.log(result);

        console.log(await client.subscribe("my-speech", "test", "dddd"));

        console.log(await client.pSubscribe("topics:*"));

        client.on("uncaught_message", function(subject: string, data: Buffer, pattern?: string) {

            if (pattern) {

                console.log(`${subject}(Pattern: ${pattern}): ${data.toString()}`);
            }
            else {
                console.log(`${subject}: ${data.toString()}`);
            }
        });

        client.publish("test", "hahahaa");

        let subscriber = client.listen("test");

        subscriber.on("data", function(data) {

            console.log(data.message.toString());
        });

        await sleep(50000);

        await client.close();
    }
    catch (e) {

        console.error(e.toString());

        if (client) {

            await client.close();
        }
    }

})().catch((e) => console.error(e));
