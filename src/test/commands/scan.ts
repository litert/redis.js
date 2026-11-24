import { test } from 'node:test';
import * as Assert from 'node:assert';
import { cmdCli } from '../common';

const TEST_KEY_PREFIX = 'test_scan_';
const hashKey = TEST_KEY_PREFIX + 'hash';
const setKey = TEST_KEY_PREFIX + 'set';
const keys = Array.from({ length: 32 }, (_, i) => TEST_KEY_PREFIX + 'key_' + i);

test('Command For Scan Cursors', async (t) => {

    await cmdCli.del([...keys, hashKey, setKey]);

    await t.test('Scan keys across pages with string cursors', async () => {

        await cmdCli.mSet(Object.fromEntries(keys.map(key => [key, 'value'])));

        const found = new Set<string>();
        let page = await cmdCli.scan('0', TEST_KEY_PREFIX + 'key_*', 1);

        Assert.notStrictEqual(page.nextCursor, '0');

        while (true) {

            Assert.strictEqual(typeof page.nextCursor, 'string');
            for (const key of page.items) {

                found.add(key);
            }

            if (page.nextCursor === '0') {

                break;
            }

            page = await cmdCli.scan(page.nextCursor, TEST_KEY_PREFIX + 'key_*', 1);
        }

        Assert.deepStrictEqual(found, new Set(keys));
    });

    await t.test('Scan a hash and a set to completion', async () => {

        await cmdCli.hSet(hashKey, 'field', 'value');
        await cmdCli.sAdd(setKey, ['member']);

        Assert.deepStrictEqual(await cmdCli.hScan(hashKey, '0'), {
            nextCursor: '0',
            items: ['field', 'value']
        });
        Assert.deepStrictEqual(await cmdCli.sScan(setKey, '0'), {
            nextCursor: '0',
            items: ['member']
        });
        Assert.strictEqual((await cmdCli.sScan$(setKey, '0')).nextCursor, '0');
    });

    await t.test('Accept the largest unsigned 64-bit cursor', async () => {

        const cursor = '18446744073709551615';

        Assert.strictEqual(typeof (await cmdCli.scan(cursor)).nextCursor, 'string');
        Assert.strictEqual(typeof (await cmdCli.hScan(hashKey, cursor)).nextCursor, 'string');
        Assert.strictEqual(typeof (await cmdCli.sScan(setKey, cursor)).nextCursor, 'string');
        Assert.strictEqual(typeof (await cmdCli.sScan$(setKey, cursor)).nextCursor, 'string');
    });
});

test.after(async () => {

    try {

        await cmdCli.del([...keys, hashKey, setKey]);
    }
    finally {

        await cmdCli.close();
    }
});
