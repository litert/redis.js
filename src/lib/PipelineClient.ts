// tslint:disable: no-unused-expression
import * as C from "./Common";
import * as E from "./Errors";
import * as CMD from "./Commands";
import { BaseClient } from "./BaseClient";

interface IQueueItem {

    cmd: string;

    process: undefined | CMD.TProcessor;

    args: any[];
}

export class PipelineClient
extends BaseClient
implements C.IPipelineClient {

    private _queue: IQueueItem[];

    private _multi: boolean = false;

    public constructor(
        host: string,
        port: number,
        decoder: C.TDecoderFactory,
        encoder: C.TEncoderFactory
    ) {

        super(host, port, decoder, encoder, false, true);

        this._queue = [];
    }

    public async watch(keys: string[]): Promise<void> {

        await this.command("WATCH", keys);
    }

    public async unwatch(): Promise<void> {

        await this.command("UNWATCH", []);
    }

    public async multi(): Promise<void> {

        if (!this._multi && this._queue.length) {

            throw new E.E_PIPELINING();
        }

        await this.command("multi", []);

        this._multi = true;
    }

    public async discard(): Promise<void> {

        await this.command("discard", []);

        this._queue = [];

        this._multi = false;
    }

    private _queueCommand(cmd: string, args: any[]): any {

        if (this._multi) {

            return this.command(cmd, args);
        }
    }

    public async exec(): Promise<any> {

        if (!this._queue.length) {

            return [];
        }

        const queue = this._queue;

        this._queue = [];

        const ret: any[] = new Array(queue.length);

        if (this._multi) {

            const [data] = await this.command("EXEC", []) as Array<[number, any]>;

            this._multi = false;

            for (let i = 0; i < queue.length; i++) {

                const qi = queue[i];

                if (qi.process === undefined) {

                    ret[i] = data[i][1];
                }
                else if (qi.process === null) {

                    ret[i] = null;
                }
                else {

                    ret[i] = qi.process(data[i][1], qi.args);
                }
            }
        }
        else {

            const data: any[] = await this._bulkCommands(queue);

            for (let i = 0; i < queue.length; i++) {

                const qi = queue[i];

                if (qi.process === undefined) {

                    ret[i] = data[i];
                }
                else if (qi.process === null) {

                    ret[i] = null;
                }
                else {

                    ret[i] = qi.process(data[i], qi.args);
                }
            }
        }

        return ret;
    }

    // <!-- command list starts

    public async append(...args: Parameters<C.ICommandAPIs["append"]>): Promise<void> {

        const req = CMD.COMMANDS.append.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.append.process, cmd: req.cmd });
    }

    public async ping(...args: Parameters<C.ICommandAPIs["ping"]>): Promise<void> {

        const req = CMD.COMMANDS.ping.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.ping.process, cmd: req.cmd });
    }

    public async incr(...args: Parameters<C.ICommandAPIs["incr"]>): Promise<void> {

        const req = CMD.COMMANDS.incr.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.incr.process, cmd: req.cmd });
    }

    public async incrByFloat(...args: Parameters<C.ICommandAPIs["incrByFloat"]>): Promise<void> {

        const req = CMD.COMMANDS.incrByFloat.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.incrByFloat.process, cmd: req.cmd });
    }

    public async decr(...args: Parameters<C.ICommandAPIs["decr"]>): Promise<void> {

        const req = CMD.COMMANDS.decr.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.decr.process, cmd: req.cmd });
    }

    public async decrByFloat(...args: Parameters<C.ICommandAPIs["decrByFloat"]>): Promise<void> {

        const req = CMD.COMMANDS.decrByFloat.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.decrByFloat.process, cmd: req.cmd });
    }

    public async del(...args: Parameters<C.ICommandAPIs["del"]>): Promise<void> {

        const req = CMD.COMMANDS.del.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.del.process, cmd: req.cmd });
    }

    public async unlink(...args: Parameters<C.ICommandAPIs["unlink"]>): Promise<void> {

        const req = CMD.COMMANDS.unlink.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.unlink.process, cmd: req.cmd });
    }

    public async get(...args: Parameters<C.ICommandAPIs["get"]>): Promise<void> {

        const req = CMD.COMMANDS.get.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.get.process, cmd: req.cmd });
    }

    public async get$(...args: Parameters<C.ICommandAPIs["get$"]>): Promise<void> {

        const req = CMD.COMMANDS.get$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.get$.process, cmd: req.cmd });
    }

    public async getSet(...args: Parameters<C.ICommandAPIs["getSet"]>): Promise<void> {

        const req = CMD.COMMANDS.getSet.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.getSet.process, cmd: req.cmd });
    }

    public async getSet$(...args: Parameters<C.ICommandAPIs["getSet$"]>): Promise<void> {

        const req = CMD.COMMANDS.getSet$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.getSet$.process, cmd: req.cmd });
    }

    public async set(...args: Parameters<C.ICommandAPIs["set"]>): Promise<void> {

        const req = CMD.COMMANDS.set.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.set.process, cmd: req.cmd });
    }

    public async setNX(...args: Parameters<C.ICommandAPIs["setNX"]>): Promise<void> {

        const req = CMD.COMMANDS.setNX.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.setNX.process, cmd: req.cmd });
    }

    public async setEX(...args: Parameters<C.ICommandAPIs["setEX"]>): Promise<void> {

        const req = CMD.COMMANDS.setEX.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.setEX.process, cmd: req.cmd });
    }

    public async pSetNX(...args: Parameters<C.ICommandAPIs["pSetNX"]>): Promise<void> {

        const req = CMD.COMMANDS.pSetNX.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pSetNX.process, cmd: req.cmd });
    }

    public async pSetEx(...args: Parameters<C.ICommandAPIs["pSetEx"]>): Promise<void> {

        const req = CMD.COMMANDS.pSetEx.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pSetEx.process, cmd: req.cmd });
    }

    public async replace(...args: Parameters<C.ICommandAPIs["replace"]>): Promise<void> {

        const req = CMD.COMMANDS.replace.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.replace.process, cmd: req.cmd });
    }

    public async pReplace(...args: Parameters<C.ICommandAPIs["pReplace"]>): Promise<void> {

        const req = CMD.COMMANDS.pReplace.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pReplace.process, cmd: req.cmd });
    }

    public async ttl(...args: Parameters<C.ICommandAPIs["ttl"]>): Promise<void> {

        const req = CMD.COMMANDS.ttl.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.ttl.process, cmd: req.cmd });
    }

    public async pTTL(...args: Parameters<C.ICommandAPIs["pTTL"]>): Promise<void> {

        const req = CMD.COMMANDS.pTTL.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pTTL.process, cmd: req.cmd });
    }

    public async expire(...args: Parameters<C.ICommandAPIs["expire"]>): Promise<void> {

        const req = CMD.COMMANDS.expire.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.expire.process, cmd: req.cmd });
    }

    public async pExpire(...args: Parameters<C.ICommandAPIs["pExpire"]>): Promise<void> {

        const req = CMD.COMMANDS.pExpire.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pExpire.process, cmd: req.cmd });
    }

    public async expireAt(...args: Parameters<C.ICommandAPIs["expireAt"]>): Promise<void> {

        const req = CMD.COMMANDS.expireAt.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.expireAt.process, cmd: req.cmd });
    }

    public async pExpireAt(...args: Parameters<C.ICommandAPIs["pExpireAt"]>): Promise<void> {

        const req = CMD.COMMANDS.pExpireAt.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pExpireAt.process, cmd: req.cmd });
    }

    public async persist(...args: Parameters<C.ICommandAPIs["persist"]>): Promise<void> {

        const req = CMD.COMMANDS.persist.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.persist.process, cmd: req.cmd });
    }

    public async exists(...args: Parameters<C.ICommandAPIs["exists"]>): Promise<void> {

        const req = CMD.COMMANDS.exists.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.exists.process, cmd: req.cmd });
    }

    public async type(...args: Parameters<C.ICommandAPIs["type"]>): Promise<void> {

        const req = CMD.COMMANDS.type.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.type.process, cmd: req.cmd });
    }

    public async move(...args: Parameters<C.ICommandAPIs["move"]>): Promise<void> {

        const req = CMD.COMMANDS.move.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.move.process, cmd: req.cmd });
    }

    public async randomKey(...args: Parameters<C.ICommandAPIs["randomKey"]>): Promise<void> {

        const req = CMD.COMMANDS.randomKey.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.randomKey.process, cmd: req.cmd });
    }

    public async rename(...args: Parameters<C.ICommandAPIs["rename"]>): Promise<void> {

        const req = CMD.COMMANDS.rename.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rename.process, cmd: req.cmd });
    }

    public async renameNX(...args: Parameters<C.ICommandAPIs["renameNX"]>): Promise<void> {

        const req = CMD.COMMANDS.renameNX.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.renameNX.process, cmd: req.cmd });
    }

    public async select(...args: Parameters<C.ICommandAPIs["select"]>): Promise<void> {

        const req = CMD.COMMANDS.select.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.select.process, cmd: req.cmd });
    }

    public async hDel(...args: Parameters<C.ICommandAPIs["hDel"]>): Promise<void> {

        const req = CMD.COMMANDS.hDel.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hDel.process, cmd: req.cmd });
    }

    public async hGet(...args: Parameters<C.ICommandAPIs["hGet"]>): Promise<void> {

        const req = CMD.COMMANDS.hGet.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hGet.process, cmd: req.cmd });
    }

    public async hGet$(...args: Parameters<C.ICommandAPIs["hGet$"]>): Promise<void> {

        const req = CMD.COMMANDS.hGet$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hGet$.process, cmd: req.cmd });
    }

    public async hSet(...args: Parameters<C.ICommandAPIs["hSet"]>): Promise<void> {

        const req = CMD.COMMANDS.hSet.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hSet.process, cmd: req.cmd });
    }

    public async hSetNX(...args: Parameters<C.ICommandAPIs["hSetNX"]>): Promise<void> {

        const req = CMD.COMMANDS.hSetNX.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hSetNX.process, cmd: req.cmd });
    }

    public async hExists(...args: Parameters<C.ICommandAPIs["hExists"]>): Promise<void> {

        const req = CMD.COMMANDS.hExists.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hExists.process, cmd: req.cmd });
    }

    public async keys(...args: Parameters<C.ICommandAPIs["keys"]>): Promise<void> {

        const req = CMD.COMMANDS.keys.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.keys.process, cmd: req.cmd });
    }

    public async dump(...args: Parameters<C.ICommandAPIs["dump"]>): Promise<void> {

        const req = CMD.COMMANDS.dump.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.dump.process, cmd: req.cmd });
    }

    public async restore(...args: Parameters<C.ICommandAPIs["restore"]>): Promise<void> {

        const req = CMD.COMMANDS.restore.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.restore.process, cmd: req.cmd });
    }

    public async strLen(...args: Parameters<C.ICommandAPIs["strLen"]>): Promise<void> {

        const req = CMD.COMMANDS.strLen.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.strLen.process, cmd: req.cmd });
    }

    public async touch(...args: Parameters<C.ICommandAPIs["touch"]>): Promise<void> {

        const req = CMD.COMMANDS.touch.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.touch.process, cmd: req.cmd });
    }

    public async mGet(...args: Parameters<C.ICommandAPIs["mGet"]>): Promise<void> {

        const req = CMD.COMMANDS.mGet.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.mGet.process, cmd: req.cmd });
    }

    public async mGet$(...args: Parameters<C.ICommandAPIs["mGet$"]>): Promise<void> {

        const req = CMD.COMMANDS.mGet$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.mGet$.process, cmd: req.cmd });
    }

    public async mSet(...args: Parameters<C.ICommandAPIs["mSet"]>): Promise<void> {

        const req = CMD.COMMANDS.mSet.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.mSet.process, cmd: req.cmd });
    }

    public async mSetNX(...args: Parameters<C.ICommandAPIs["mSetNX"]>): Promise<void> {

        const req = CMD.COMMANDS.mSetNX.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.mSetNX.process, cmd: req.cmd });
    }

    public async hIncr(...args: Parameters<C.ICommandAPIs["hIncr"]>): Promise<void> {

        const req = CMD.COMMANDS.hIncr.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hIncr.process, cmd: req.cmd });
    }

    public async hIncrByFloat(...args: Parameters<C.ICommandAPIs["hIncrByFloat"]>): Promise<void> {

        const req = CMD.COMMANDS.hIncrByFloat.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hIncrByFloat.process, cmd: req.cmd });
    }

    public async hDecr(...args: Parameters<C.ICommandAPIs["hDecr"]>): Promise<void> {

        const req = CMD.COMMANDS.hDecr.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hDecr.process, cmd: req.cmd });
    }

    public async hDecrByFloat(...args: Parameters<C.ICommandAPIs["hDecrByFloat"]>): Promise<void> {

        const req = CMD.COMMANDS.hDecrByFloat.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hDecrByFloat.process, cmd: req.cmd });
    }

    public async hKeys(...args: Parameters<C.ICommandAPIs["hKeys"]>): Promise<void> {

        const req = CMD.COMMANDS.hKeys.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hKeys.process, cmd: req.cmd });
    }

    public async hVals(...args: Parameters<C.ICommandAPIs["hVals"]>): Promise<void> {

        const req = CMD.COMMANDS.hVals.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hVals.process, cmd: req.cmd });
    }

    public async hVals$(...args: Parameters<C.ICommandAPIs["hVals$"]>): Promise<void> {

        const req = CMD.COMMANDS.hVals$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hVals$.process, cmd: req.cmd });
    }

    public async hLen(...args: Parameters<C.ICommandAPIs["hLen"]>): Promise<void> {

        const req = CMD.COMMANDS.hLen.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hLen.process, cmd: req.cmd });
    }

    public async hMGet(...args: Parameters<C.ICommandAPIs["hMGet"]>): Promise<void> {

        const req = CMD.COMMANDS.hMGet.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hMGet.process, cmd: req.cmd });
    }

    public async hGetAll(...args: Parameters<C.ICommandAPIs["hGetAll"]>): Promise<void> {

        const req = CMD.COMMANDS.hGetAll.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hGetAll.process, cmd: req.cmd });
    }

    public async hGetAll$(...args: Parameters<C.ICommandAPIs["hGetAll$"]>): Promise<void> {

        const req = CMD.COMMANDS.hGetAll$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hGetAll$.process, cmd: req.cmd });
    }

    public async hMGet$(...args: Parameters<C.ICommandAPIs["hMGet$"]>): Promise<void> {

        const req = CMD.COMMANDS.hMGet$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hMGet$.process, cmd: req.cmd });
    }

    public async hMSet(...args: Parameters<C.ICommandAPIs["hMSet"]>): Promise<void> {

        const req = CMD.COMMANDS.hMSet.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hMSet.process, cmd: req.cmd });
    }

    public async hStrLen(...args: Parameters<C.ICommandAPIs["hStrLen"]>): Promise<void> {

        const req = CMD.COMMANDS.hStrLen.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hStrLen.process, cmd: req.cmd });
    }

    public async scan(...args: Parameters<C.ICommandAPIs["scan"]>): Promise<void> {

        const req = CMD.COMMANDS.scan.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.scan.process, cmd: req.cmd });
    }

    public async hScan(...args: Parameters<C.ICommandAPIs["hScan"]>): Promise<void> {

        const req = CMD.COMMANDS.hScan.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.hScan.process, cmd: req.cmd });
    }

    public async sAdd(...args: Parameters<C.ICommandAPIs["sAdd"]>): Promise<void> {

        const req = CMD.COMMANDS.sAdd.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sAdd.process, cmd: req.cmd });
    }

    public async sCard(...args: Parameters<C.ICommandAPIs["sCard"]>): Promise<void> {

        const req = CMD.COMMANDS.sCard.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sCard.process, cmd: req.cmd });
    }

    public async sDiff(...args: Parameters<C.ICommandAPIs["sDiff"]>): Promise<void> {

        const req = CMD.COMMANDS.sDiff.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sDiff.process, cmd: req.cmd });
    }

    public async sDiff$(...args: Parameters<C.ICommandAPIs["sDiff$"]>): Promise<void> {

        const req = CMD.COMMANDS.sDiff$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sDiff$.process, cmd: req.cmd });
    }

    public async sDiffStore(...args: Parameters<C.ICommandAPIs["sDiffStore"]>): Promise<void> {

        const req = CMD.COMMANDS.sDiffStore.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sDiffStore.process, cmd: req.cmd });
    }

    public async sInter(...args: Parameters<C.ICommandAPIs["sInter"]>): Promise<void> {

        const req = CMD.COMMANDS.sInter.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sInter.process, cmd: req.cmd });
    }

    public async sInter$(...args: Parameters<C.ICommandAPIs["sInter$"]>): Promise<void> {

        const req = CMD.COMMANDS.sInter$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sInter$.process, cmd: req.cmd });
    }

    public async sInterStore(...args: Parameters<C.ICommandAPIs["sInterStore"]>): Promise<void> {

        const req = CMD.COMMANDS.sInterStore.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sInterStore.process, cmd: req.cmd });
    }

    public async sUnion(...args: Parameters<C.ICommandAPIs["sUnion"]>): Promise<void> {

        const req = CMD.COMMANDS.sUnion.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sUnion.process, cmd: req.cmd });
    }

    public async sUnion$(...args: Parameters<C.ICommandAPIs["sUnion$"]>): Promise<void> {

        const req = CMD.COMMANDS.sUnion$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sUnion$.process, cmd: req.cmd });
    }

    public async sUnionStore(...args: Parameters<C.ICommandAPIs["sUnionStore"]>): Promise<void> {

        const req = CMD.COMMANDS.sUnionStore.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sUnionStore.process, cmd: req.cmd });
    }

    public async sIsMember(...args: Parameters<C.ICommandAPIs["sIsMember"]>): Promise<void> {

        const req = CMD.COMMANDS.sIsMember.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sIsMember.process, cmd: req.cmd });
    }

    public async sMembers(...args: Parameters<C.ICommandAPIs["sMembers"]>): Promise<void> {

        const req = CMD.COMMANDS.sMembers.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sMembers.process, cmd: req.cmd });
    }

    public async sMembers$(...args: Parameters<C.ICommandAPIs["sMembers$"]>): Promise<void> {

        const req = CMD.COMMANDS.sMembers$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sMembers$.process, cmd: req.cmd });
    }

    public async sMove(...args: Parameters<C.ICommandAPIs["sMove"]>): Promise<void> {

        const req = CMD.COMMANDS.sMove.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sMove.process, cmd: req.cmd });
    }

    public async sPop(...args: Parameters<C.ICommandAPIs["sPop"]>): Promise<void> {

        const req = CMD.COMMANDS.sPop.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sPop.process, cmd: req.cmd });
    }

    public async sPop$(...args: Parameters<C.ICommandAPIs["sPop$"]>): Promise<void> {

        const req = CMD.COMMANDS.sPop$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sPop$.process, cmd: req.cmd });
    }

    public async sRandMember(...args: Parameters<C.ICommandAPIs["sRandMember"]>): Promise<void> {

        const req = CMD.COMMANDS.sRandMember.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sRandMember.process, cmd: req.cmd });
    }

    public async sRandMember$(...args: Parameters<C.ICommandAPIs["sRandMember$"]>): Promise<void> {

        const req = CMD.COMMANDS.sRandMember$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sRandMember$.process, cmd: req.cmd });
    }

    public async sRem(...args: Parameters<C.ICommandAPIs["sRem"]>): Promise<void> {

        const req = CMD.COMMANDS.sRem.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sRem.process, cmd: req.cmd });
    }

    public async sScan(...args: Parameters<C.ICommandAPIs["sScan"]>): Promise<void> {

        const req = CMD.COMMANDS.sScan.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sScan.process, cmd: req.cmd });
    }

    public async sScan$(...args: Parameters<C.ICommandAPIs["sScan$"]>): Promise<void> {

        const req = CMD.COMMANDS.sScan$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.sScan$.process, cmd: req.cmd });
    }

    public async bLPop(...args: Parameters<C.ICommandAPIs["bLPop"]>): Promise<void> {

        const req = CMD.COMMANDS.bLPop.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.bLPop.process, cmd: req.cmd });
    }

    public async bLPop$(...args: Parameters<C.ICommandAPIs["bLPop$"]>): Promise<void> {

        const req = CMD.COMMANDS.bLPop$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.bLPop$.process, cmd: req.cmd });
    }

    public async bRPop(...args: Parameters<C.ICommandAPIs["bRPop"]>): Promise<void> {

        const req = CMD.COMMANDS.bRPop.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.bRPop.process, cmd: req.cmd });
    }

    public async bRPop$(...args: Parameters<C.ICommandAPIs["bRPop$"]>): Promise<void> {

        const req = CMD.COMMANDS.bRPop$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.bRPop$.process, cmd: req.cmd });
    }

    public async bRPopLPush(...args: Parameters<C.ICommandAPIs["bRPopLPush"]>): Promise<void> {

        const req = CMD.COMMANDS.bRPopLPush.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.bRPopLPush.process, cmd: req.cmd });
    }

    public async bRPopLPush$(...args: Parameters<C.ICommandAPIs["bRPopLPush$"]>): Promise<void> {

        const req = CMD.COMMANDS.bRPopLPush$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.bRPopLPush$.process, cmd: req.cmd });
    }

    public async lIndex(...args: Parameters<C.ICommandAPIs["lIndex"]>): Promise<void> {

        const req = CMD.COMMANDS.lIndex.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lIndex.process, cmd: req.cmd });
    }

    public async lIndex$(...args: Parameters<C.ICommandAPIs["lIndex$"]>): Promise<void> {

        const req = CMD.COMMANDS.lIndex$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lIndex$.process, cmd: req.cmd });
    }

    public async lInsertBefore(...args: Parameters<C.ICommandAPIs["lInsertBefore"]>): Promise<void> {

        const req = CMD.COMMANDS.lInsertBefore.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lInsertBefore.process, cmd: req.cmd });
    }

    public async lInsertAfter(...args: Parameters<C.ICommandAPIs["lInsertAfter"]>): Promise<void> {

        const req = CMD.COMMANDS.lInsertAfter.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lInsertAfter.process, cmd: req.cmd });
    }

    public async lLen(...args: Parameters<C.ICommandAPIs["lLen"]>): Promise<void> {

        const req = CMD.COMMANDS.lLen.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lLen.process, cmd: req.cmd });
    }

    public async lPop(...args: Parameters<C.ICommandAPIs["lPop"]>): Promise<void> {

        const req = CMD.COMMANDS.lPop.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lPop.process, cmd: req.cmd });
    }

    public async lPop$(...args: Parameters<C.ICommandAPIs["lPop$"]>): Promise<void> {

        const req = CMD.COMMANDS.lPop$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lPop$.process, cmd: req.cmd });
    }

    public async lPush(...args: Parameters<C.ICommandAPIs["lPush"]>): Promise<void> {

        const req = CMD.COMMANDS.lPush.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lPush.process, cmd: req.cmd });
    }

    public async lPushX(...args: Parameters<C.ICommandAPIs["lPushX"]>): Promise<void> {

        const req = CMD.COMMANDS.lPushX.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lPushX.process, cmd: req.cmd });
    }

    public async lRange(...args: Parameters<C.ICommandAPIs["lRange"]>): Promise<void> {

        const req = CMD.COMMANDS.lRange.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lRange.process, cmd: req.cmd });
    }

    public async lRange$(...args: Parameters<C.ICommandAPIs["lRange$"]>): Promise<void> {

        const req = CMD.COMMANDS.lRange$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lRange$.process, cmd: req.cmd });
    }

    public async lRem(...args: Parameters<C.ICommandAPIs["lRem"]>): Promise<void> {

        const req = CMD.COMMANDS.lRem.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lRem.process, cmd: req.cmd });
    }

    public async lSet(...args: Parameters<C.ICommandAPIs["lSet"]>): Promise<void> {

        const req = CMD.COMMANDS.lSet.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lSet.process, cmd: req.cmd });
    }

    public async lTrim(...args: Parameters<C.ICommandAPIs["lTrim"]>): Promise<void> {

        const req = CMD.COMMANDS.lTrim.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.lTrim.process, cmd: req.cmd });
    }

    public async rPop(...args: Parameters<C.ICommandAPIs["rPop"]>): Promise<void> {

        const req = CMD.COMMANDS.rPop.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rPop.process, cmd: req.cmd });
    }

    public async rPop$(...args: Parameters<C.ICommandAPIs["rPop$"]>): Promise<void> {

        const req = CMD.COMMANDS.rPop$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rPop$.process, cmd: req.cmd });
    }

    public async rPopLPush(...args: Parameters<C.ICommandAPIs["rPopLPush"]>): Promise<void> {

        const req = CMD.COMMANDS.rPopLPush.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rPopLPush.process, cmd: req.cmd });
    }

    public async rPopLPush$(...args: Parameters<C.ICommandAPIs["rPopLPush$"]>): Promise<void> {

        const req = CMD.COMMANDS.rPopLPush$.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rPopLPush$.process, cmd: req.cmd });
    }

    public async rPush(...args: Parameters<C.ICommandAPIs["rPush"]>): Promise<void> {

        const req = CMD.COMMANDS.rPush.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rPush.process, cmd: req.cmd });
    }

    public async rPushX(...args: Parameters<C.ICommandAPIs["rPushX"]>): Promise<void> {

        const req = CMD.COMMANDS.rPushX.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.rPushX.process, cmd: req.cmd });
    }

    public async pfAdd(...args: Parameters<C.ICommandAPIs["pfAdd"]>): Promise<void> {

        const req = CMD.COMMANDS.pfAdd.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pfAdd.process, cmd: req.cmd });
    }

    public async pfCount(...args: Parameters<C.ICommandAPIs["pfCount"]>): Promise<void> {

        const req = CMD.COMMANDS.pfCount.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pfCount.process, cmd: req.cmd });
    }

    public async pfMerge(...args: Parameters<C.ICommandAPIs["pfMerge"]>): Promise<void> {

        const req = CMD.COMMANDS.pfMerge.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pfMerge.process, cmd: req.cmd });
    }

    public async publish(...args: Parameters<C.ICommandAPIs["publish"]>): Promise<void> {

        const req = CMD.COMMANDS.publish.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.publish.process, cmd: req.cmd });
    }

    public async pubSubChannels(...args: Parameters<C.ICommandAPIs["pubSubChannels"]>): Promise<void> {

        const req = CMD.COMMANDS.pubSubChannels.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pubSubChannels.process, cmd: req.cmd });
    }

    public async pubSubNumSub(...args: Parameters<C.ICommandAPIs["pubSubNumSub"]>): Promise<void> {

        const req = CMD.COMMANDS.pubSubNumSub.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pubSubNumSub.process, cmd: req.cmd });
    }

    public async pubSubNumPat(...args: Parameters<C.ICommandAPIs["pubSubNumPat"]>): Promise<void> {

        const req = CMD.COMMANDS.pubSubNumPat.prepare(...args);

        await this._queueCommand(req.cmd, req.args);

        this._queue.push({ args: req.args, process: CMD.COMMANDS.pubSubNumPat.process, cmd: req.cmd });
    }

    // command list ends -->
}
