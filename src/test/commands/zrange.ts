import { test } from 'node:test';
import * as Assert from 'node:assert';
import { cmdCli } from '../common';

const TEST_KEY_PREFIX = 'test_zrange_';

test('Command For zRangeWithScores', async (t) => {

    await cmdCli.del([...await cmdCli.keys(`${TEST_KEY_PREFIX}*`), 'any']);

    await t.test('Add multiple members to sorted set', async () => {

        Assert.strictEqual(await cmdCli.zAdd(`${TEST_KEY_PREFIX}myset`, 1, 'one'), true);
        Assert.strictEqual(await cmdCli.zAdd(`${TEST_KEY_PREFIX}myset`, 2, 'two'), true);
        Assert.strictEqual(await cmdCli.zAdd(`${TEST_KEY_PREFIX}myset`, 3, 'three'), true);
        Assert.strictEqual(await cmdCli.zAdd(`${TEST_KEY_PREFIX}myset`, 4, 'four'), true);
        Assert.strictEqual(await cmdCli.zAdd(`${TEST_KEY_PREFIX}myset`, 5, 'five'), true);

    });

    await t.test('Get range by index with scores', async () => {

        const result = await cmdCli.zRangeWithScores(`${TEST_KEY_PREFIX}myset`, 0, 2);

        Assert.deepEqual(result, [
            { 'member': 'one', 'score': 1 },
            { 'member': 'two', 'score': 2 },
            { 'member': 'three', 'score': 3 }
        ]);

    });

    await t.test('Get range by index with scores in reverse order', async () => {

        const result = await cmdCli.zRangeWithScores(`${TEST_KEY_PREFIX}myset`, 0, 2, { 'rev': true });

        Assert.deepEqual(result, [
            { 'member': 'five', 'score': 5 },
            { 'member': 'four', 'score': 4 },
            { 'member': 'three', 'score': 3 }
        ]);

    });

    await t.test('Get range by score', async () => {

        const result = await cmdCli.zRangeWithScores(`${TEST_KEY_PREFIX}myset`, 2, 4, { 'by': 'SCORE' });

        Assert.deepEqual(result, [
            { 'member': 'two', 'score': 2 },
            { 'member': 'three', 'score': 3 },
            { 'member': 'four', 'score': 4 }
        ]);

    });

    await t.test('Get range by score with LIMIT', async () => {

        const result = await cmdCli.zRangeWithScores(`${TEST_KEY_PREFIX}myset`, 1, 5, {
            'by': 'SCORE',
            'offset': 1,
            'count': 2
        });

        Assert.deepEqual(result, [
            { 'member': 'two', 'score': 2 },
            { 'member': 'three', 'score': 3 }
        ]);

    });

    await t.test('Get range by score in reverse order with LIMIT', async () => {

        const result = await cmdCli.zRangeWithScores(`${TEST_KEY_PREFIX}myset`, 5, 1, {
            'by': 'SCORE',
            'rev': true,
            'offset': 0,
            'count': 2
        });

        Assert.deepEqual(result, [
            { 'member': 'five', 'score': 5 },
            { 'member': 'four', 'score': 4 }
        ]);

    });

    await t.test('Get range with negative indices', async () => {

        const result = await cmdCli.zRangeWithScores(`${TEST_KEY_PREFIX}myset`, -3, -1);

        Assert.deepEqual(result, [
            { 'member': 'three', 'score': 3 },
            { 'member': 'four', 'score': 4 },
            { 'member': 'five', 'score': 5 }
        ]);

    });

    await t.test('Get all members with scores', async () => {

        const result = await cmdCli.zRangeWithScores(`${TEST_KEY_PREFIX}myset`, 0, -1);

        Assert.deepEqual(result, [
            { 'member': 'one', 'score': 1 },
            { 'member': 'two', 'score': 2 },
            { 'member': 'three', 'score': 3 },
            { 'member': 'four', 'score': 4 },
            { 'member': 'five', 'score': 5 }
        ]);

    });

    await t.test('Get range with Buffer version', async () => {

        const result = await cmdCli.zRangeWithScores$(`${TEST_KEY_PREFIX}myset`, 0, 1);

        Assert.strictEqual(result.length, 2);
        Assert.strictEqual(result[0].member.toString(), 'one');
        Assert.strictEqual(result[0].score, 1);
        Assert.strictEqual(result[1].member.toString(), 'two');
        Assert.strictEqual(result[1].score, 2);

    });

    await t.test('Get empty range', async () => {

        const result = await cmdCli.zRangeWithScores(`${TEST_KEY_PREFIX}myset`, 10, 20);

        Assert.deepEqual(result, []);

    });

    await t.test('Clean up test data', async () => {

        const deleted = await cmdCli.del(`${TEST_KEY_PREFIX}myset`);
        Assert.strictEqual(deleted, 1);

    });

});

test.after(async () => {

    await cmdCli.close();
});
