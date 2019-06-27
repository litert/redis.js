// tslint:disable: no-console

import * as Redis from "../lib";
import * as L from "@litert/core";

(async () => {

    const cli = Redis.createCommandClient("127.0.0.1", 6373);
    const sub = Redis.createSubscriberClient("127.0.0.1", 6373);

    try {

        await cli.connect();
        await sub.connect();

        await cli.auth("hello");
        await sub.auth("hello");

        await sub.subscribe(["hello"]);

        console.log(await cli.set("a", "123"));
        console.log(await cli.get("a"));
        console.log(await cli.mGet(["a", "sada"]));

        await L.Async.sleep(2000);

        let x = cli.set("a", "333");

        console.log(await x);
        await cli.lPush("lll", ["a", "b"]);
        console.log(await cli.lIndex("lll", 1));
        console.log(await cli.lRange("lll", 0, -1));
        console.log(await cli.hMSet("ggg", {
            "a": "3333",
            "bb": "1231232131"
        }));
        console.log(await cli.hMGet("ggg", ["bb", "a"]));
        console.log(await cli.incr("a"));
        console.log(await cli.pubSubChannels());
        console.log(await cli.pubSubNumPat());
        console.log(await cli.pubSubNumSub(["hello"]));
        console.log(await cli.publish("hello", "test"));

        await L.Async.sleep(2000);

        await cli.shutdown();
    }
    catch (e) {

        console.error(e);
    }

    await cli.shutdown();

})();
