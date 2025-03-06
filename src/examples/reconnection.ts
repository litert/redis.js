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

function sleep(ms: number): Promise<void> {

    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

(async () => {

    const cli = Redis.createCommandClient({})
        .on('ready', () => { console.log('command client connected'); })
        .on('close', () => { console.log('command client closed'); });

    await cli.connect();
    // await cli.auth("hello");
    await cli.flushAll();

    console.log(await Promise.all([
        cli.time(),
        cli.time(),
        cli.secTime(),
        cli.msTime(),
        cli.usTime(),
    ]));
    await cli.set('a', 'b');

    console.log(await cli.copy('a', 'c'));
    console.log(await cli.copy('a', 'c'));
    console.log(await cli.copy('a', 'c', null, true));
    console.log(await cli.copy('a', 'c', 1));
    console.log(await cli.copy('a', 'c', 1, true));

    console.log(await cli.swapDB(1, 0));

    console.log(await cli.get('a'));

    console.log(await cli.swapDB(1, 0));

    console.log('Now, restart redis server in 3 seconds...');

    await sleep(3000);

    console.log(await cli.get('a'));

    const sub = Redis.createSubscriberClient({})
        .on('ready', () => { console.log('subscriber connected'); })
        .on('message', (ch, data) => { console.log(ch, '->', data.toString()); })
        .on('close', () => { console.log('subscriber closed'); });

    await sub.subscribe('cccc');

    await cli.publish('cccc', 'hello1');

    console.log('Now, restart redis server in 3 seconds...');

    await sleep(3000);

    await cli.publish('cccc', 'hello2');

    await sleep(3000);

    await cli.close();

    await sub.close();

})().catch(console.error);
