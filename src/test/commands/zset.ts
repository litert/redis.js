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

    await t.test('Add multiple members', async () => {

        await cmdCli.del('test_z_set_multi');

        // --- Add multiple members at once ---
        const added = await cmdCli.zAdd('test_z_set_multi', [
            { 'score': 10, 'member': 'm10' },
            { 'score': 20, 'member': 'm20' },
            { 'score': 30, 'member': 'm30' },
        ]);
        Assert.equal(added, 3);

        // --- Add existing members, should return 0 ---
        const addedAgain = await cmdCli.zAdd('test_z_set_multi', [
            { 'score': 10, 'member': 'm10' },
        ]);
        Assert.equal(addedAgain, 0);

        // --- Add with NX mode, only add new elements ---
        const addedNX = await cmdCli.zAdd('test_z_set_multi', [
            { 'score': 40, 'member': 'm40' },
            { 'score': 15, 'member': 'm10' },
        ], { 'mode': 'NX' });
        Assert.equal(addedNX, 1);

        // --- Add with XX mode, only update existing elements ---
        const addedXX = await cmdCli.zAdd('test_z_set_multi', [
            { 'score': 50, 'member': 'm50' },
            { 'score': 25, 'member': 'm20' },
        ], { 'mode': 'XX' });
        Assert.equal(addedXX, 0);

        // --- Add with CH option, return the number of elements changed ---
        const addedCH = await cmdCli.zAdd('test_z_set_multi', [
            { 'score': 35, 'member': 'm30' },
            { 'score': 60, 'member': 'm60' },
        ], { 'ch': true });
        Assert.equal(addedCH, 2);

        // --- Add with GT option, only update if new score is greater ---
        const addedGT = await cmdCli.zAdd('test_z_set_multi', [
            { 'score': 5, 'member': 'm10' },
            { 'score': 100, 'member': 'm60' },
        ], { 'comparison': 'GT', 'ch': true });
        Assert.equal(addedGT, 1);

        // --- Add with LT option, only update if new score is less ---
        const addedLT = await cmdCli.zAdd('test_z_set_multi', [
            { 'score': 1, 'member': 'm10' },
            { 'score': 200, 'member': 'm60' },
        ], { 'comparison': 'LT', 'ch': true });
        Assert.equal(addedLT, 1);

        await cmdCli.del('test_z_set_multi');
    });

    await t.test('Add with INCR option', async () => {

        await cmdCli.del('test_z_set_incr');

        // --- Add a member first ---
        await cmdCli.zAdd('test_z_set_incr', 100, 'member1');

        // --- INCR on existing member, always returns number (never null without conditions) ---
        const newScore = await cmdCli.zAdd('test_z_set_incr', [
            { 'score': 50, 'member': 'member1' },
        ], { 'incr': true });
        Assert.equal(newScore, 150);

        // --- INCR on new member, always returns number (never null without conditions) ---
        const newMemberScore = await cmdCli.zAdd('test_z_set_incr', [
            { 'score': 30, 'member': 'member2' },
        ], { 'incr': true });
        Assert.equal(newMemberScore, 30);

        // --- INCR with negative value on existing member ---
        const decrScore = await cmdCli.zAdd('test_z_set_incr', [
            { 'score': -50, 'member': 'member1' },
        ], { 'incr': true });
        Assert.equal(decrScore, 100);

        // --- INCR with NX on existing member, should return null ---
        const incrNXExisting = await cmdCli.zAdd('test_z_set_incr', [
            { 'score': 10, 'member': 'member1' },
        ], { 'incr': true, 'mode': 'NX' });
        Assert.equal(incrNXExisting, null);

        // --- INCR with NX on new member ---
        const incrNXNew = await cmdCli.zAdd('test_z_set_incr', [
            { 'score': 20, 'member': 'member3' },
        ], { 'incr': true, 'mode': 'NX' });
        Assert.equal(incrNXNew, 20);

        // --- INCR with XX on existing member ---
        const incrXXExisting = await cmdCli.zAdd('test_z_set_incr', [
            { 'score': 5, 'member': 'member1' },
        ], { 'incr': true, 'mode': 'XX' });
        Assert.equal(incrXXExisting, 105);

        // --- INCR with XX on non-existing member, should return null ---
        const incrXXNew = await cmdCli.zAdd('test_z_set_incr', [
            { 'score': 10, 'member': 'member_not_exist' },
        ], { 'incr': true, 'mode': 'XX' });
        Assert.equal(incrXXNew, null);

        // --- INCR with GT, only update if new score is greater ---
        const incrGT = await cmdCli.zAdd('test_z_set_incr', [
            { 'score': -200, 'member': 'member1' },
        ], { 'incr': true, 'comparison': 'GT' });
        Assert.equal(incrGT, null);

        // --- INCR with LT, only update if new score is less ---
        const incrLT = await cmdCli.zAdd('test_z_set_incr', [
            { 'score': -200, 'member': 'member1' },
        ], { 'incr': true, 'comparison': 'LT' });
        Assert.equal(incrLT, -95);

        await cmdCli.del('test_z_set_incr');
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
