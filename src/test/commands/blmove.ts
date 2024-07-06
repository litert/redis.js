import { test } from 'node:test';
import * as Assert from 'node:assert';
import { cmdCli } from '../common';

const TEST_KEY_PREFIX = 'test_blmove_';

test('Command For Lmove/Blmove', async (t) => {

    await cmdCli.del([...await cmdCli.keys(`${TEST_KEY_PREFIX}*`), 'any']);

    await t.test('Append multiple items to the end of mylist', async () => {

        Assert.strictEqual(await cmdCli.rPush(`${TEST_KEY_PREFIX}mylist`, ['one', 'two']), 2);
        Assert.strictEqual(await cmdCli.rPush(`${TEST_KEY_PREFIX}mylist`, ['three', 'four']), 4);

    });

    await t.test('Manipulate mylist using the lMove operation', async () => {

        Assert.strictEqual(await cmdCli.lMove(`${TEST_KEY_PREFIX}mylist`, `${TEST_KEY_PREFIX}myotherlist`, 'RIGHT', 'LEFT'), 'four');

    });

    await t.test('Manipulate mylist using the bLMove operation', async () => {

        Assert.strictEqual(await cmdCli.bLMove(`${TEST_KEY_PREFIX}mylist`, `${TEST_KEY_PREFIX}myotherlist`, 'LEFT', 'RIGHT', 2), 'one');

    });

    await t.test('Detect and remove data from mylist and myotherlist after operations', async () => {

        Assert.deepEqual(await cmdCli.lRange(`${TEST_KEY_PREFIX}mylist`, 0, -1), ['two', 'three']);
        Assert.deepEqual(await cmdCli.lRange(`${TEST_KEY_PREFIX}myotherlist`,0, -1), ['four', 'one']);
        Assert.deepEqual(await cmdCli.lPop(`${TEST_KEY_PREFIX}mylist`, 2), ['two', 'three']);
        Assert.deepEqual(await cmdCli.lPop(`${TEST_KEY_PREFIX}myotherlist`, 2), ['four', 'one']);

    });

    await t.test('Perform the lMove operation on an empty list', async () => {

        Assert.strictEqual(await cmdCli.lMove(`${TEST_KEY_PREFIX}mylist`, `${TEST_KEY_PREFIX}myotherlist`, 'RIGHT', 'LEFT'), null);

    });

    await t.test('Perform the bLMove operation on an empty list', async () => {

        Assert.strictEqual(await cmdCli.bLMove(`${TEST_KEY_PREFIX}mylist`, `${TEST_KEY_PREFIX}myotherlist`, 'LEFT', 'RIGHT', 2), null);

    });

});

test.after(async () => {

    await cmdCli.close();
});