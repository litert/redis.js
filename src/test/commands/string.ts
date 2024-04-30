import { test } from 'node:test';
import * as Assert from 'node:assert';
import { cmdCli } from '../common';

test('Command For Strings', async (t) => {

    await cmdCli.del([...await cmdCli.keys('test_set_*'), 'any']);

    await t.test('Simply set key and value', async () => {

        Assert.equal(await cmdCli.set('test_set_0', '123'), true);
        Assert.equal(await cmdCli.set('test_set_0', '123'), true);

        Assert.ok(true);
    });

    await t.test('Set if key exists', async () => {

        Assert.equal(await cmdCli.replace('test_set_0', '456'), true);
        Assert.equal(await cmdCli.replace('test_set_2', '456'), false);

        Assert.equal(await cmdCli.replace('test_set_0', '456', 100), true);
        Assert.equal(await cmdCli.replace('test_set_2', '456', 100), false);

        Assert.equal(await cmdCli.pReplace('test_set_0', '456', 100_000), true);
        Assert.equal(await cmdCli.pReplace('test_set_2', '456', 100_000), false);
    });

    await t.test('Set if key does not exist', async () => {

        Assert.equal(await cmdCli.setNX('test_set_3', '456'), true);
        Assert.equal(await cmdCli.setNX('test_set_3', '456'), false);

        Assert.equal(await cmdCli.setNX('test_set_4', '456', 60), true);
        Assert.equal(await cmdCli.setNX('test_set_3', '456', 60), false);

        Assert.equal(await cmdCli.pSetNX('test_set_5', '456', 60_000), true);
        Assert.equal(await cmdCli.pSetNX('test_set_4', '456', 60_000), false);
    });

    await t.test('Set key and value with expiration in seconds', async () => {

        await cmdCli.set('test_set_0', 'value', 60);
        await cmdCli.setEX('test_set_2', 'value', 60);

        Assert.ok(true);
    });

    await t.test('Set key and value with expiration in milliseconds', async () => {

        await cmdCli.pSetEx('test_set_0', 'value', 60_000);

        Assert.ok(true);
    });
});

test.after(async () => {

    await cmdCli.close();
});
