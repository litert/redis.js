// tslint:disable: no-console

import * as Redis from "../lib";
import * as L from "@litert/core";

(async () => {

    const cli = Redis.createCommandClient("127.0.0.1", 6373);
    const sub = Redis.createSubscriberClient("127.0.0.1", 6373);

    await sub.connect();

    await sub.auth("hello");

    sub.on("message", function(c, d, p): void {

        console.log(`Channel: ${c}, Data: ${d.toString()}`);
    });

    await sub.subscribe(["hello"]);

    await cli.connect();
    await cli.auth("hello");

    console.log(await cli.ping(""));
    console.log(await cli.set("a", "123"));
    console.log(await cli.incr("a", 23));
    console.log(await cli.incrByFloat("a", 23.4));
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

    const pipeline = await cli.pipeline();

    // Multi Mode
    await pipeline.multi();
    await pipeline.get("a");

    await pipeline.set("ccc", "g");

    await pipeline.mGet(["a", "ccc"]);

    await pipeline.hSet("h", "name", "Mick");
    await pipeline.hMSet("h", {
        "age": 123,
        "title": "Mr."
    });

    await pipeline.hMGet("h", ["age", "title"]);
    await pipeline.hGetAll("h");
    console.log(JSON.stringify(await pipeline.scan(0), null, 2));

    await pipeline.incr("a", 123);

    console.log(JSON.stringify(await pipeline.exec(), null, 2));

    // Pipeline Mode
    await pipeline.get("a");

    await pipeline.set("ccc", "g");

    await pipeline.mGet(["a", "ccc"]);

    await pipeline.hSet("h", "name", "Mick");
    await pipeline.hMSet("h", {
        "age": 123,
        "title": "Mr."
    });

    await pipeline.hMGet("h", ["age", "title"]);
    await pipeline.hGetAll("h");
    console.log(JSON.stringify(await pipeline.scan(0), null, 2));

    await pipeline.incr("a", 123);

    console.log(JSON.stringify(await pipeline.exec(), null, 2));

    await pipeline.shutdown();

    await cli.shutdown();
    await sub.shutdown();

})();
