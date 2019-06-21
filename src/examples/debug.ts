// tslint:disable: no-console

import { createProtocolClient } from "../lib";
import * as L from "@litert/core";

(async () => {

    const cli = createProtocolClient("127.0.0.1", 6373);

    try {

        await cli.connect();

        console.log(await cli.command("SET", ["a", "333"]));
        console.log((await cli.command("GET", ["a"])).toString());

        await L.Async.sleep(2000);

        let x = cli.command("SET", ["a", "333"]);

        console.log(await x);
        console.log(await cli.command("INCR", ["a"]));

        await L.Async.sleep(2000);

        await cli.shutdown();
    }
    catch (e) {

        console.error(e);
    }

    await cli.shutdown();

})();
