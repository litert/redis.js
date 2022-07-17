/**
 * Copyright 2022 Angus.Fenying <fenying@litert.org>
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

import * as Redis from '../lib';

(async () => {

    const cli = Redis.createCommandClient({});

    await cli.connect();

    await cli.flushAll();

    await cli.select(3);

    const pipeline = await cli.pipeline();

    pipeline.set('ccc', 'g');

    pipeline.hSet('h', 'age', 'ggg');

    pipeline.hGet('h', 'age');

    console.log(JSON.stringify(await pipeline.exec(), null, 2));

    pipeline.set('ccc', 'a');

    pipeline.hSet('h', 'age', 'xxx');

    pipeline.hGet('h', 'age');

    console.log(JSON.stringify(await pipeline.exec(), null, 2));

    await pipeline.close();

    console.log(await cli.get('ccc'));

    await cli.close();

})().catch((e) => { console.error(e); });
