/**
 * Copyright 2025 Angus.Fenying <fenying@litert.org>
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
/* eslint-disable no-console */
import * as Redis from '../lib';

export async function testZ(): Promise<void> {

    const cli = Redis.createCommandClient({});

    await cli.connect();

    console.log(await cli.zAdd('testZSet', 100, 'z100'));
    console.log(await cli.zAdd('testZSet', 99, 'z99'));
    console.log(await cli.zAdd('testZSet', 97, 'z97'));
    console.log(await cli.zAdd('testZSet', 98, 'z98'));
    console.log(await cli.zAdd('testZSet', 95, 'z95'));
    console.log(await cli.zAdd('testZSet', 39, 'z39'));

    console.log(await cli.zRangeWithScores('testZSet', 0, 3));

    console.log(await cli.zRem('testZSet', ['z39', 'z97']));

    console.log(await cli.zRangeWithScores('testZSet', 0, 3));

    await cli.close();
}

(async () => {

    await testZ();

    return;

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
