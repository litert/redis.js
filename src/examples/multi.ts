/**
 * Copyright 2020 Angus.Fenying <fenying@litert.org>
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

// tslint:disable: no-console

import * as Redis from "../lib";

(async () => {

    const cli = Redis.createCommandClient({});

    await cli.connect();

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

    await pipeline.command("HGETALL", ["h"]);

    console.log(JSON.stringify(await pipeline.exec(), null, 2));

    await pipeline.close();

    await cli.close();

})();
