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

    const multi = await cli.multi();

    // Multi Mode
    await multi.multi();
    await multi.get('a');

    await multi.set('ccc', 'g');

    await multi.mGet(['a', 'ccc']);

    await multi.hSet('h', 'name', 'Mick');
    await multi.hMSet('h', {
        'age': 123,
        'title': 'Mr.'
    });

    await multi.hMGet('h', ['age', 'title']);
    await multi.hGetAll('h');
    await multi.scan(0);

    await multi.incr('a', 123);

    await multi.command('HGETALL', ['h']);

    console.log(JSON.stringify(await multi.exec(), null, 2));

    await multi.close();

    await cli.close();

})().catch((e) => { console.error(e); });
