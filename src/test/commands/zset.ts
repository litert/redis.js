import { test } from 'node:test';
import * as Assert from 'node:assert';
import { cmdCli } from '../common';

test('Command For Z-Set', async (t) => {

    await cmdCli.del('test_z_set');

    await t.test('Add one member', async () => {

        Assert.equal(await cmdCli.zAdd('test_z_set', 100, 'z100'), true);
        Assert.equal(await cmdCli.zAdd('test_z_set', 100, 'z100'), false);
        Assert.equal(await cmdCli.zAdd('test_z_set', 99, 'z99'), true);
        Assert.equal(await cmdCli.zAdd('test_z_set', 97, 'z97'), true);
        Assert.equal(await cmdCli.zAdd('test_z_set', 95, 'z95'), true);
        Assert.equal(await cmdCli.zAdd('test_z_set', 91, 'z91'), true);
    });

    await t.test('Remove members', async () => {

        Assert.equal(await cmdCli.zRem('test_z_set', ['z99', 'z95']), 2);
        Assert.equal(await cmdCli.zRem('test_z_set', ['z97']), 1);
        Assert.equal(await cmdCli.zRem('test_z_set', ['z97']), 0);
    });

    await t.test('Get members', async () => {

        const list = await cmdCli.zRangeWithScores('test_z_set', 0, 3);

        Assert.equal(list.length, 2);
        Assert.equal(list.find(i => i.member === 'z91')?.score, 91);
        Assert.equal(list.find(i => i.member === 'z100')?.score, 100);
    });
});

test.after(async () => {

    await cmdCli.close();
});
