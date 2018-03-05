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

export async function sleep(ms: number): Promise<void> {

    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

(async () => {

    let client!: libRedis.ProtocolClient;

    try {

        client = await libRedis.createProtocolClient({
            "host": "127.0.0.1"
        });

        client.on("error", function(err): void {

            console.log(err);
        });

        let result: any;

        result = await client.execute("AUTH", "redis-password");

        console.log(result);

        result = await client.execute("PING");

        console.log(result);

        result = await client.execute("PING", "HI");

        console.log(result.toString());

        result = await client.execute("SET", "d", "hello");

        console.log(result.toString());

        await sleep(5000);

        while (1) {

            try {

                await client.execute("AUTH", "redis-password");

                result = await client.execute("GET", "d");

                console.log(result);

                break;
            }
            catch (e) {

                console.error(e.toString());
                console.error(libRedis.ClientStatus[client.status]);
            }

            await sleep(1000);
        }

        result = await client.close();

        console.log(result);
    }
    catch (e) {

        console.error(e.toString());

        if (client) {

            await client.close();
        }
    }

})().catch((e) => console.error(e));
