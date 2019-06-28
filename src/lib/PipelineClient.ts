// tslint:disable: no-unused-expression
import * as C from "./Common";
import * as CMD from "./Commands";
import { BaseClient } from "./BaseClient";

interface IQueueItem {

    process: undefined | CMD.TProcessor;

    args: any[];
}

export class PipelineClient
extends BaseClient
implements C.IPipelineClient {

    private _queue: IQueueItem[];

    public constructor(
        host: string,
        port: number,
        _decoder: C.IDecoder,
        _encoder: C.IEncoder
    ) {

        super(host, port, _decoder, _encoder);

        this._queue = [];
    }

    public async watch(keys: string[]): Promise<void> {

        await this.command("WATCH", keys);
    }

    public async unwatch(): Promise<void> {

        await this.command("UNWATCH", []);
    }

    public async multi(): Promise<void> {

        await this.command("multi", []);
    }

    public async discard(): Promise<void> {

        await this.command("discard", []);

        this._queue = [];
    }

    public async exec(): Promise<any> {

        const ret: any[] = [];

        if (!this._queue.length) {

            return ret;
        }

        const queue = this._queue;

        this._queue = [];

        const data: Array<[number, any]> = await this.command("EXEC", []);

        for (const item of data) {

            const qi = queue.pop() as IQueueItem;

            if (qi.process === undefined) {

                ret.push(item);
            }
            else if (qi.process === null) {

                ret.push(null);
            }
            else {

                ret.push(qi.process(item, qi.args));
            }
        }

        return ret;
    }

    // <!-- command list starts

    public async append(...args: Parameters<C.ICommandAPIs["append"]>): Promise<void> {

        const req = CMD.COMMANDS.append.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.append.process });
    }

    public async auth(...args: Parameters<C.ICommandAPIs["auth"]>): Promise<void> {

        const req = CMD.COMMANDS.auth.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.auth.process });
    }

    public async ping(...args: Parameters<C.ICommandAPIs["ping"]>): Promise<void> {

        const req = CMD.COMMANDS.ping.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.ping.process });
    }

    public async incr(...args: Parameters<C.ICommandAPIs["incr"]>): Promise<void> {

        const req = CMD.COMMANDS.incr.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.incr.process });
    }

    public async incrByFloat(...args: Parameters<C.ICommandAPIs["incrByFloat"]>): Promise<void> {

        const req = CMD.COMMANDS.incrByFloat.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.incrByFloat.process });
    }

    public async decr(...args: Parameters<C.ICommandAPIs["decr"]>): Promise<void> {

        const req = CMD.COMMANDS.decr.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.decr.process });
    }

    public async decrByFloat(...args: Parameters<C.ICommandAPIs["decrByFloat"]>): Promise<void> {

        const req = CMD.COMMANDS.decrByFloat.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.decrByFloat.process });
    }

    public async del(...args: Parameters<C.ICommandAPIs["del"]>): Promise<void> {

        const req = CMD.COMMANDS.del.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.del.process });
    }

    public async unlink(...args: Parameters<C.ICommandAPIs["unlink"]>): Promise<void> {

        const req = CMD.COMMANDS.unlink.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.unlink.process });
    }

    public async get(...args: Parameters<C.ICommandAPIs["get"]>): Promise<void> {

        const req = CMD.COMMANDS.get.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.get.process });
    }

    public async get$(...args: Parameters<C.ICommandAPIs["get$"]>): Promise<void> {

        const req = CMD.COMMANDS.get$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.get$.process });
    }

    public async getSet(...args: Parameters<C.ICommandAPIs["getSet"]>): Promise<void> {

        const req = CMD.COMMANDS.getSet.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.getSet.process });
    }

    public async getSet$(...args: Parameters<C.ICommandAPIs["getSet$"]>): Promise<void> {

        const req = CMD.COMMANDS.getSet$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.getSet$.process });
    }

    public async set(...args: Parameters<C.ICommandAPIs["set"]>): Promise<void> {

        const req = CMD.COMMANDS.set.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.set.process });
    }

    public async setNX(...args: Parameters<C.ICommandAPIs["setNX"]>): Promise<void> {

        const req = CMD.COMMANDS.setNX.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.setNX.process });
    }

    public async setEX(...args: Parameters<C.ICommandAPIs["setEX"]>): Promise<void> {

        const req = CMD.COMMANDS.setEX.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.setEX.process });
    }

    public async pSetNX(...args: Parameters<C.ICommandAPIs["pSetNX"]>): Promise<void> {

        const req = CMD.COMMANDS.pSetNX.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pSetNX.process });
    }

    public async pSetEx(...args: Parameters<C.ICommandAPIs["pSetEx"]>): Promise<void> {

        const req = CMD.COMMANDS.pSetEx.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pSetEx.process });
    }

    public async replace(...args: Parameters<C.ICommandAPIs["replace"]>): Promise<void> {

        const req = CMD.COMMANDS.replace.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.replace.process });
    }

    public async pReplace(...args: Parameters<C.ICommandAPIs["pReplace"]>): Promise<void> {

        const req = CMD.COMMANDS.pReplace.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pReplace.process });
    }

    public async ttl(...args: Parameters<C.ICommandAPIs["ttl"]>): Promise<void> {

        const req = CMD.COMMANDS.ttl.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.ttl.process });
    }

    public async pTTL(...args: Parameters<C.ICommandAPIs["pTTL"]>): Promise<void> {

        const req = CMD.COMMANDS.pTTL.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pTTL.process });
    }

    public async expire(...args: Parameters<C.ICommandAPIs["expire"]>): Promise<void> {

        const req = CMD.COMMANDS.expire.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.expire.process });
    }

    public async pExpire(...args: Parameters<C.ICommandAPIs["pExpire"]>): Promise<void> {

        const req = CMD.COMMANDS.pExpire.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pExpire.process });
    }

    public async expireAt(...args: Parameters<C.ICommandAPIs["expireAt"]>): Promise<void> {

        const req = CMD.COMMANDS.expireAt.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.expireAt.process });
    }

    public async pExpireAt(...args: Parameters<C.ICommandAPIs["pExpireAt"]>): Promise<void> {

        const req = CMD.COMMANDS.pExpireAt.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pExpireAt.process });
    }

    public async persist(...args: Parameters<C.ICommandAPIs["persist"]>): Promise<void> {

        const req = CMD.COMMANDS.persist.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.persist.process });
    }

    public async exists(...args: Parameters<C.ICommandAPIs["exists"]>): Promise<void> {

        const req = CMD.COMMANDS.exists.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.exists.process });
    }

    public async type(...args: Parameters<C.ICommandAPIs["type"]>): Promise<void> {

        const req = CMD.COMMANDS.type.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.type.process });
    }

    public async move(...args: Parameters<C.ICommandAPIs["move"]>): Promise<void> {

        const req = CMD.COMMANDS.move.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.move.process });
    }

    public async randomKey(...args: Parameters<C.ICommandAPIs["randomKey"]>): Promise<void> {

        const req = CMD.COMMANDS.randomKey.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.randomKey.process });
    }

    public async rename(...args: Parameters<C.ICommandAPIs["rename"]>): Promise<void> {

        const req = CMD.COMMANDS.rename.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rename.process });
    }

    public async renameNX(...args: Parameters<C.ICommandAPIs["renameNX"]>): Promise<void> {

        const req = CMD.COMMANDS.renameNX.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.renameNX.process });
    }

    public async select(...args: Parameters<C.ICommandAPIs["select"]>): Promise<void> {

        const req = CMD.COMMANDS.select.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.select.process });
    }

    public async hDel(...args: Parameters<C.ICommandAPIs["hDel"]>): Promise<void> {

        const req = CMD.COMMANDS.hDel.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hDel.process });
    }

    public async hGet(...args: Parameters<C.ICommandAPIs["hGet"]>): Promise<void> {

        const req = CMD.COMMANDS.hGet.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hGet.process });
    }

    public async hGet$(...args: Parameters<C.ICommandAPIs["hGet$"]>): Promise<void> {

        const req = CMD.COMMANDS.hGet$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hGet$.process });
    }

    public async hSet(...args: Parameters<C.ICommandAPIs["hSet"]>): Promise<void> {

        const req = CMD.COMMANDS.hSet.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hSet.process });
    }

    public async hSetNX(...args: Parameters<C.ICommandAPIs["hSetNX"]>): Promise<void> {

        const req = CMD.COMMANDS.hSetNX.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hSetNX.process });
    }

    public async hExists(...args: Parameters<C.ICommandAPIs["hExists"]>): Promise<void> {

        const req = CMD.COMMANDS.hExists.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hExists.process });
    }

    public async keys(...args: Parameters<C.ICommandAPIs["keys"]>): Promise<void> {

        const req = CMD.COMMANDS.keys.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.keys.process });
    }

    public async dump(...args: Parameters<C.ICommandAPIs["dump"]>): Promise<void> {

        const req = CMD.COMMANDS.dump.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.dump.process });
    }

    public async restore(...args: Parameters<C.ICommandAPIs["restore"]>): Promise<void> {

        const req = CMD.COMMANDS.restore.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.restore.process });
    }

    public async strLen(...args: Parameters<C.ICommandAPIs["strLen"]>): Promise<void> {

        const req = CMD.COMMANDS.strLen.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.strLen.process });
    }

    public async touch(...args: Parameters<C.ICommandAPIs["touch"]>): Promise<void> {

        const req = CMD.COMMANDS.touch.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.touch.process });
    }

    public async mGet(...args: Parameters<C.ICommandAPIs["mGet"]>): Promise<void> {

        const req = CMD.COMMANDS.mGet.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.mGet.process });
    }

    public async mGet$(...args: Parameters<C.ICommandAPIs["mGet$"]>): Promise<void> {

        const req = CMD.COMMANDS.mGet$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.mGet$.process });
    }

    public async mSet(...args: Parameters<C.ICommandAPIs["mSet"]>): Promise<void> {

        const req = CMD.COMMANDS.mSet.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.mSet.process });
    }

    public async mSetNX(...args: Parameters<C.ICommandAPIs["mSetNX"]>): Promise<void> {

        const req = CMD.COMMANDS.mSetNX.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.mSetNX.process });
    }

    public async hIncr(...args: Parameters<C.ICommandAPIs["hIncr"]>): Promise<void> {

        const req = CMD.COMMANDS.hIncr.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hIncr.process });
    }

    public async hIncrByFloat(...args: Parameters<C.ICommandAPIs["hIncrByFloat"]>): Promise<void> {

        const req = CMD.COMMANDS.hIncrByFloat.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hIncrByFloat.process });
    }

    public async hDecr(...args: Parameters<C.ICommandAPIs["hDecr"]>): Promise<void> {

        const req = CMD.COMMANDS.hDecr.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hDecr.process });
    }

    public async hDecrByFloat(...args: Parameters<C.ICommandAPIs["hDecrByFloat"]>): Promise<void> {

        const req = CMD.COMMANDS.hDecrByFloat.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hDecrByFloat.process });
    }

    public async hKeys(...args: Parameters<C.ICommandAPIs["hKeys"]>): Promise<void> {

        const req = CMD.COMMANDS.hKeys.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hKeys.process });
    }

    public async hVals(...args: Parameters<C.ICommandAPIs["hVals"]>): Promise<void> {

        const req = CMD.COMMANDS.hVals.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hVals.process });
    }

    public async hVals$(...args: Parameters<C.ICommandAPIs["hVals$"]>): Promise<void> {

        const req = CMD.COMMANDS.hVals$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hVals$.process });
    }

    public async hLen(...args: Parameters<C.ICommandAPIs["hLen"]>): Promise<void> {

        const req = CMD.COMMANDS.hLen.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hLen.process });
    }

    public async hMGet(...args: Parameters<C.ICommandAPIs["hMGet"]>): Promise<void> {

        const req = CMD.COMMANDS.hMGet.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hMGet.process });
    }

    public async hGetAll(...args: Parameters<C.ICommandAPIs["hGetAll"]>): Promise<void> {

        const req = CMD.COMMANDS.hGetAll.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hGetAll.process });
    }

    public async hGetAll$(...args: Parameters<C.ICommandAPIs["hGetAll$"]>): Promise<void> {

        const req = CMD.COMMANDS.hGetAll$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hGetAll$.process });
    }

    public async hMGet$(...args: Parameters<C.ICommandAPIs["hMGet$"]>): Promise<void> {

        const req = CMD.COMMANDS.hMGet$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hMGet$.process });
    }

    public async hMSet(...args: Parameters<C.ICommandAPIs["hMSet"]>): Promise<void> {

        const req = CMD.COMMANDS.hMSet.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hMSet.process });
    }

    public async hStrLen(...args: Parameters<C.ICommandAPIs["hStrLen"]>): Promise<void> {

        const req = CMD.COMMANDS.hStrLen.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hStrLen.process });
    }

    public async scan(...args: Parameters<C.ICommandAPIs["scan"]>): Promise<void> {

        const req = CMD.COMMANDS.scan.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.scan.process });
    }

    public async hScan(...args: Parameters<C.ICommandAPIs["hScan"]>): Promise<void> {

        const req = CMD.COMMANDS.hScan.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hScan.process });
    }

    public async sAdd(...args: Parameters<C.ICommandAPIs["sAdd"]>): Promise<void> {

        const req = CMD.COMMANDS.sAdd.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sAdd.process });
    }

    public async sCard(...args: Parameters<C.ICommandAPIs["sCard"]>): Promise<void> {

        const req = CMD.COMMANDS.sCard.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sCard.process });
    }

    public async sDiff(...args: Parameters<C.ICommandAPIs["sDiff"]>): Promise<void> {

        const req = CMD.COMMANDS.sDiff.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sDiff.process });
    }

    public async sDiff$(...args: Parameters<C.ICommandAPIs["sDiff$"]>): Promise<void> {

        const req = CMD.COMMANDS.sDiff$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sDiff$.process });
    }

    public async sDiffStore(...args: Parameters<C.ICommandAPIs["sDiffStore"]>): Promise<void> {

        const req = CMD.COMMANDS.sDiffStore.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sDiffStore.process });
    }

    public async sInter(...args: Parameters<C.ICommandAPIs["sInter"]>): Promise<void> {

        const req = CMD.COMMANDS.sInter.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sInter.process });
    }

    public async sInter$(...args: Parameters<C.ICommandAPIs["sInter$"]>): Promise<void> {

        const req = CMD.COMMANDS.sInter$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sInter$.process });
    }

    public async sInterStore(...args: Parameters<C.ICommandAPIs["sInterStore"]>): Promise<void> {

        const req = CMD.COMMANDS.sInterStore.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sInterStore.process });
    }

    public async sUnion(...args: Parameters<C.ICommandAPIs["sUnion"]>): Promise<void> {

        const req = CMD.COMMANDS.sUnion.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sUnion.process });
    }

    public async sUnion$(...args: Parameters<C.ICommandAPIs["sUnion$"]>): Promise<void> {

        const req = CMD.COMMANDS.sUnion$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sUnion$.process });
    }

    public async sUnionStore(...args: Parameters<C.ICommandAPIs["sUnionStore"]>): Promise<void> {

        const req = CMD.COMMANDS.sUnionStore.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sUnionStore.process });
    }

    public async sIsMember(...args: Parameters<C.ICommandAPIs["sIsMember"]>): Promise<void> {

        const req = CMD.COMMANDS.sIsMember.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sIsMember.process });
    }

    public async sMembers(...args: Parameters<C.ICommandAPIs["sMembers"]>): Promise<void> {

        const req = CMD.COMMANDS.sMembers.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sMembers.process });
    }

    public async sMembers$(...args: Parameters<C.ICommandAPIs["sMembers$"]>): Promise<void> {

        const req = CMD.COMMANDS.sMembers$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sMembers$.process });
    }

    public async sMove(...args: Parameters<C.ICommandAPIs["sMove"]>): Promise<void> {

        const req = CMD.COMMANDS.sMove.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sMove.process });
    }

    public async sPop(...args: Parameters<C.ICommandAPIs["sPop"]>): Promise<void> {

        const req = CMD.COMMANDS.sPop.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sPop.process });
    }

    public async sPop$(...args: Parameters<C.ICommandAPIs["sPop$"]>): Promise<void> {

        const req = CMD.COMMANDS.sPop$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sPop$.process });
    }

    public async sRandMember(...args: Parameters<C.ICommandAPIs["sRandMember"]>): Promise<void> {

        const req = CMD.COMMANDS.sRandMember.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sRandMember.process });
    }

    public async sRandMember$(...args: Parameters<C.ICommandAPIs["sRandMember$"]>): Promise<void> {

        const req = CMD.COMMANDS.sRandMember$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sRandMember$.process });
    }

    public async sRem(...args: Parameters<C.ICommandAPIs["sRem"]>): Promise<void> {

        const req = CMD.COMMANDS.sRem.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sRem.process });
    }

    public async sScan(...args: Parameters<C.ICommandAPIs["sScan"]>): Promise<void> {

        const req = CMD.COMMANDS.sScan.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sScan.process });
    }

    public async sScan$(...args: Parameters<C.ICommandAPIs["sScan$"]>): Promise<void> {

        const req = CMD.COMMANDS.sScan$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sScan$.process });
    }

    public async bLPop(...args: Parameters<C.ICommandAPIs["bLPop"]>): Promise<void> {

        const req = CMD.COMMANDS.bLPop.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.bLPop.process });
    }

    public async bLPop$(...args: Parameters<C.ICommandAPIs["bLPop$"]>): Promise<void> {

        const req = CMD.COMMANDS.bLPop$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.bLPop$.process });
    }

    public async bRPop(...args: Parameters<C.ICommandAPIs["bRPop"]>): Promise<void> {

        const req = CMD.COMMANDS.bRPop.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.bRPop.process });
    }

    public async bRPop$(...args: Parameters<C.ICommandAPIs["bRPop$"]>): Promise<void> {

        const req = CMD.COMMANDS.bRPop$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.bRPop$.process });
    }

    public async bRPopLPush(...args: Parameters<C.ICommandAPIs["bRPopLPush"]>): Promise<void> {

        const req = CMD.COMMANDS.bRPopLPush.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.bRPopLPush.process });
    }

    public async bRPopLPush$(...args: Parameters<C.ICommandAPIs["bRPopLPush$"]>): Promise<void> {

        const req = CMD.COMMANDS.bRPopLPush$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.bRPopLPush$.process });
    }

    public async lIndex(...args: Parameters<C.ICommandAPIs["lIndex"]>): Promise<void> {

        const req = CMD.COMMANDS.lIndex.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lIndex.process });
    }

    public async lIndex$(...args: Parameters<C.ICommandAPIs["lIndex$"]>): Promise<void> {

        const req = CMD.COMMANDS.lIndex$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lIndex$.process });
    }

    public async lInsertBefore(...args: Parameters<C.ICommandAPIs["lInsertBefore"]>): Promise<void> {

        const req = CMD.COMMANDS.lInsertBefore.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lInsertBefore.process });
    }

    public async lInsertAfter(...args: Parameters<C.ICommandAPIs["lInsertAfter"]>): Promise<void> {

        const req = CMD.COMMANDS.lInsertAfter.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lInsertAfter.process });
    }

    public async lLen(...args: Parameters<C.ICommandAPIs["lLen"]>): Promise<void> {

        const req = CMD.COMMANDS.lLen.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lLen.process });
    }

    public async lPop(...args: Parameters<C.ICommandAPIs["lPop"]>): Promise<void> {

        const req = CMD.COMMANDS.lPop.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lPop.process });
    }

    public async lPop$(...args: Parameters<C.ICommandAPIs["lPop$"]>): Promise<void> {

        const req = CMD.COMMANDS.lPop$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lPop$.process });
    }

    public async lPush(...args: Parameters<C.ICommandAPIs["lPush"]>): Promise<void> {

        const req = CMD.COMMANDS.lPush.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lPush.process });
    }

    public async lPushX(...args: Parameters<C.ICommandAPIs["lPushX"]>): Promise<void> {

        const req = CMD.COMMANDS.lPushX.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lPushX.process });
    }

    public async lRange(...args: Parameters<C.ICommandAPIs["lRange"]>): Promise<void> {

        const req = CMD.COMMANDS.lRange.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lRange.process });
    }

    public async lRange$(...args: Parameters<C.ICommandAPIs["lRange$"]>): Promise<void> {

        const req = CMD.COMMANDS.lRange$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lRange$.process });
    }

    public async lRem(...args: Parameters<C.ICommandAPIs["lRem"]>): Promise<void> {

        const req = CMD.COMMANDS.lRem.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lRem.process });
    }

    public async lSet(...args: Parameters<C.ICommandAPIs["lSet"]>): Promise<void> {

        const req = CMD.COMMANDS.lSet.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lSet.process });
    }

    public async lTrim(...args: Parameters<C.ICommandAPIs["lTrim"]>): Promise<void> {

        const req = CMD.COMMANDS.lTrim.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lTrim.process });
    }

    public async rPop(...args: Parameters<C.ICommandAPIs["rPop"]>): Promise<void> {

        const req = CMD.COMMANDS.rPop.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rPop.process });
    }

    public async rPop$(...args: Parameters<C.ICommandAPIs["rPop$"]>): Promise<void> {

        const req = CMD.COMMANDS.rPop$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rPop$.process });
    }

    public async rPopLPush(...args: Parameters<C.ICommandAPIs["rPopLPush"]>): Promise<void> {

        const req = CMD.COMMANDS.rPopLPush.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rPopLPush.process });
    }

    public async rPopLPush$(...args: Parameters<C.ICommandAPIs["rPopLPush$"]>): Promise<void> {

        const req = CMD.COMMANDS.rPopLPush$.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rPopLPush$.process });
    }

    public async rPush(...args: Parameters<C.ICommandAPIs["rPush"]>): Promise<void> {

        const req = CMD.COMMANDS.rPush.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rPush.process });
    }

    public async rPushX(...args: Parameters<C.ICommandAPIs["rPushX"]>): Promise<void> {

        const req = CMD.COMMANDS.rPushX.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rPushX.process });
    }

    public async pfAdd(...args: Parameters<C.ICommandAPIs["pfAdd"]>): Promise<void> {

        const req = CMD.COMMANDS.pfAdd.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pfAdd.process });
    }

    public async pfCount(...args: Parameters<C.ICommandAPIs["pfCount"]>): Promise<void> {

        const req = CMD.COMMANDS.pfCount.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pfCount.process });
    }

    public async pfMerge(...args: Parameters<C.ICommandAPIs["pfMerge"]>): Promise<void> {

        const req = CMD.COMMANDS.pfMerge.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pfMerge.process });
    }

    public async publish(...args: Parameters<C.ICommandAPIs["publish"]>): Promise<void> {

        const req = CMD.COMMANDS.publish.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.publish.process });
    }

    public async pubSubChannels(...args: Parameters<C.ICommandAPIs["pubSubChannels"]>): Promise<void> {

        const req = CMD.COMMANDS.pubSubChannels.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pubSubChannels.process });
    }

    public async pubSubNumSub(...args: Parameters<C.ICommandAPIs["pubSubNumSub"]>): Promise<void> {

        const req = CMD.COMMANDS.pubSubNumSub.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pubSubNumSub.process });
    }

    public async pubSubNumPat(...args: Parameters<C.ICommandAPIs["pubSubNumPat"]>): Promise<void> {

        const req = CMD.COMMANDS.pubSubNumPat.prepare(...args);

        await this.command(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pubSubNumPat.process });
    }

    // command list ends -->
}
