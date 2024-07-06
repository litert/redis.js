import { test } from 'node:test';
import * as Assert from 'node:assert';
import { cmdCli } from '../common';

const TEST_KEY_PREFIX = 'test_hash_';

test('Command For Hashes', async (t) => {

    await cmdCli.del([...await cmdCli.keys(`${TEST_KEY_PREFIX}*`), 'any']);

    await t.test('Create a hash with one key', async () => {

        Assert.strictEqual(await cmdCli.hSet(`${TEST_KEY_PREFIX}a`, 'key1', 'a'), true);
        Assert.strictEqual(await cmdCli.hSet(`${TEST_KEY_PREFIX}b`, 'key1', 'b'), true);

        Assert.ok(true);
    });

    await t.test('Get value of one key in a hash', async () => {

        Assert.strictEqual(await cmdCli.hGet(`${TEST_KEY_PREFIX}a`, 'key1'), 'a');
        Assert.strictEqual(await cmdCli.hGet(`${TEST_KEY_PREFIX}b`, 'key1'), 'b');
    });

    await t.test('Create a hash with multiple keys', async () => {

        await cmdCli.hMSet(`${TEST_KEY_PREFIX}m1`, {
            'k1': 'x',
            'k2': 'y',
            'k3': 'z'
        });

        Assert.ok(true);
    });

    await t.test('Get values of multiple keys in a hash', async () => {

        Assert.deepStrictEqual(await cmdCli.hMGet(`${TEST_KEY_PREFIX}m1`, ['k1', 'k2']), {
            'k1': 'x',
            'k2': 'y',
        });

        Assert.deepStrictEqual(await cmdCli.hMGet$(`${TEST_KEY_PREFIX}m1`, ['k1', 'k2']), {
            'k1': Buffer.from('x'),
            'k2': Buffer.from('y'),
        });

        Assert.deepStrictEqual(await cmdCli.hMGet(`${TEST_KEY_PREFIX}m1`, ['k1', 'k2', 'k4']), {
            'k1': 'x',
            'k2': 'y',
            'k4': null,
        });

        Assert.deepStrictEqual(await cmdCli.hMGet$(`${TEST_KEY_PREFIX}m1`, ['k1', 'k2', 'k4']), {
            'k1': Buffer.from('x'),
            'k2': Buffer.from('y'),
            'k4': null,
        });
    });

    await t.test('Get values of all keys in a hash', async () => {

        Assert.deepStrictEqual(await cmdCli.hGetAll(`${TEST_KEY_PREFIX}m1`), {
            'k1': 'x',
            'k2': 'y',
            'k3': 'z',
        });
    });
});

test.after(async () => {

    await cmdCli.close();
});
