/**
 * Copyright 2019 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
implements C.IPipelineClientBase {

    private _queue: IQueueItem[];

    private _multi: boolean = false;

    public constructor(opts: C.IClientOptions) {

        super({
            pipelineMode: true,
            subscribeMode: false,
            ...opts
        });

        this._queue = [];
    }

    public async watch(keys: string[]): Promise<void> {

        await this._command("WATCH", keys);
    }

    public async unwatch(): Promise<void> {

        await this._command("UNWATCH", []);
    }

    public async multi(): Promise<void> {

        if (!this._multi && this._queue.length) {

            throw new E.E_PIPELINING();
        }

        await this._command("multi", []);

        this._multi = true;
    }

    public async discard(): Promise<void> {

        await this._command("discard", []);

        this._queue = [];

        this._multi = false;
    }

    public async exec(): Promise<any> {

        if (!this._queue.length) {

            return [];
        }

        const queue = this._queue;

        this._queue = [];

        const ret: any[] = new Array(queue.length);

        if (this._multi) {

            const [data] = await this._command("EXEC", []) as Array<[number, any]>;

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

    public command(cmd: string, args: any[], cb?: C.ICallbackA): any {

        if (this._multi) {

            const ret = this._command(cmd, args, cb);

            this._queue.push({ args, process: undefined, cmd });

            return ret;
        }

        this._queue.push({ args, process: undefined, cmd });
    }

    // command list ends -->
}

(function(c: any) {

    let name: keyof typeof CMD.COMMANDS;

    for (name in CMD.COMMANDS) {

        if (name === "auth") {

            continue;
        }

        c.prototype[name] = (new Function(
            "process",
            "prepare",
            `return async function(...args) {

                const req = prepare(...args);

                if (this._multi) {

                    await this._command(req.cmd, req.args);
                }

                this._queue.push({ args: req.args, process: process, cmd: req.cmd });
            };`
        ))(CMD.COMMANDS[name].process, CMD.COMMANDS[name].prepare);
    }

})(PipelineClient);
