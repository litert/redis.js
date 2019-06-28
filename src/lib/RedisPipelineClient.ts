// tslint:disable: no-unused-expression
import * as C from "./Common";
import * as CMD from "./Commands";
import { BaseClient } from "./BaseClient";

interface IQueueItem {

    process: undefined | CMD.TProcessor;

    args: any[];
}

export class RedisPipelineClient
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

        const data: Array<[number, any]> = await this.command("EXEC", []);

        for (const item of data) {

            const qi = this._queue.pop() as IQueueItem;

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

    // command list ends -->
}
