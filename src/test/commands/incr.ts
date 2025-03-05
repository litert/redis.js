import { test } from 'node:test';
import * as Assert from 'node:assert';
import { cmdCli } from '../common';

const TEST_KEY_PREFIX = 'test_incr_';

function getTestKey(k: string): string {

    return `${TEST_KEY_PREFIX}${k}`;
}

test.before(async () => {

    await cmdCli.del([...await cmdCli.keys(`${TEST_KEY_PREFIX}*`), 'any']);
});

test('Command For INCR-like', async (t) => {

    await t.test('INCR', async () => {

        Assert.strictEqual(await cmdCli.incr(getTestKey('a')), 1);
        Assert.strictEqual(await cmdCli.incr(getTestKey('a')), 2);
        Assert.strictEqual(await cmdCli.incr(getTestKey('a'), 2), 4);
        Assert.strictEqual(await cmdCli.incr(getTestKey('a'), -2), 2);
    });

    await t.test('DECR', async () => {

        Assert.strictEqual(await cmdCli.decr(getTestKey('b')), -1);
        Assert.strictEqual(await cmdCli.decr(getTestKey('b')), -2);
        Assert.strictEqual(await cmdCli.decr(getTestKey('b'), 2), -4);
        Assert.strictEqual(await cmdCli.decr(getTestKey('b'), -2), -2);
    });

    await t.test('INCRBYFLOAT', async () => {

        Assert.strictEqual(await cmdCli.incrByFloat(getTestKey('c')), 1);
        Assert.strictEqual(await cmdCli.incrByFloat(getTestKey('c')), 2);
        Assert.strictEqual(await cmdCli.incrByFloat(getTestKey('c'), 2.1), 4.1);
        Assert.strictEqual(await cmdCli.incrByFloat(getTestKey('c'), -2.1), 2);
    });

    await t.test('DECRBYFLOAT', async () => {

        Assert.strictEqual(await cmdCli.decrByFloat(getTestKey('d')), -1);
        Assert.strictEqual(await cmdCli.decrByFloat(getTestKey('d')), -2);
        Assert.strictEqual(await cmdCli.decrByFloat(getTestKey('d'), 2.1), -4.1);
        Assert.strictEqual(await cmdCli.decrByFloat(getTestKey('d'), -2.1), -2);
    });

    await t.test('HINCR', async () => {

        Assert.strictEqual(await cmdCli.hIncr(getTestKey('hash_test'), 'a'), 1);
        Assert.strictEqual(await cmdCli.hIncr(getTestKey('hash_test'), 'a'), 2);
        Assert.strictEqual(await cmdCli.hIncr(getTestKey('hash_test'), 'a', 2), 4);
        Assert.strictEqual(await cmdCli.hIncr(getTestKey('hash_test'), 'a', -2), 2);
    });

    await t.test('HDECR', async () => {

        Assert.strictEqual(await cmdCli.hDecr(getTestKey('hash_test'), 'b'), -1);
        Assert.strictEqual(await cmdCli.hDecr(getTestKey('hash_test'), 'b'), -2);
        Assert.strictEqual(await cmdCli.hDecr(getTestKey('hash_test'), 'b', 2), -4);
        Assert.strictEqual(await cmdCli.hDecr(getTestKey('hash_test'), 'b', -2), -2);
    });

    await t.test('HINCRBYFLOAT', async () => {

        Assert.strictEqual(await cmdCli.hIncrByFloat(getTestKey('hash_test'), 'c'), 1);
        Assert.strictEqual(await cmdCli.hIncrByFloat(getTestKey('hash_test'), 'c'), 2);
        Assert.strictEqual(await cmdCli.hIncrByFloat(getTestKey('hash_test'), 'c', 2.1), 4.1);
        Assert.strictEqual(await cmdCli.hIncrByFloat(getTestKey('hash_test'), 'c', -2.1), 2);
    });

    await t.test('HDECRBYFLOAT', async () => {

        Assert.strictEqual(await cmdCli.hDecrByFloat(getTestKey('hash_test'), 'd'), -1);
        Assert.strictEqual(await cmdCli.hDecrByFloat(getTestKey('hash_test'), 'd'), -2);
        Assert.strictEqual(await cmdCli.hDecrByFloat(getTestKey('hash_test'), 'd', 2.1), -4.1);
        Assert.strictEqual(await cmdCli.hDecrByFloat(getTestKey('hash_test'), 'd', -2.1), -2);
    });
});

test.after(async () => {

    await cmdCli.close();
});
