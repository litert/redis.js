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
import { BaseClient } from "./BaseClient";

export class SubscriberClient
extends BaseClient
implements C.ISubscriberClient {

    private _channels: Record<string, boolean> = {};

    private _patterns: Record<string, boolean> = {};

    public constructor(opts: C.IClientOptions) {

        super({
            pipelineMode: false,
            subscribeMode: true,
            ...opts
        });
    }

    protected _onConnected(callback: C.ICallbackA): void {

        super._onConnected((e: unknown): void => {

            if (e) {

                return callback(e);
            }

            (async () => {

                try {

                    Object.keys(this._channels).length && await this._send("SUBSCRIBE", Object.keys(this._channels));
                    Object.keys(this._patterns).length && await this._send("PSUBSCRIBE", Object.keys(this._patterns));
                }
                catch (e) {

                    return callback(new E.E_SUBSCRIBE_FAILURE({ metadata: { origin: e } }));
                }

                callback();

            })();
        });
    }

    public async subscribe(channels: string | string[]): Promise<void> {

        let cs: string[] = [];

        if (!Array.isArray(channels)) {

            channels = [channels];
        }

        if (!channels.length) {

            throw new E.E_INVALID_PARAM();
        }

        for (const c of channels) {

            if (this._channels[c] || cs.includes(c)) {

                continue;
            }

            cs.push(c);
        }

        if (!cs.length) {

            return Promise.resolve();
        }

        await this.command("SUBSCRIBE", cs);

        for (let c of cs) {

            this._channels[c] = true;
        }
    }

    public async unsubscribe(channels: string | string[]): Promise<void> {

        let cs: string[] = [];

        if (!Array.isArray(channels)) {

            channels = [channels];
        }

        if (!channels.length) {

            throw new E.E_INVALID_PARAM();
        }

        for (const c of channels) {

            if (!this._channels[c]) {

                continue;
            }

            cs.push(c);
        }

        if (!cs.length) {

            return Promise.resolve();
        }

        await this.command("UNSUBSCRIBE", cs);

        for (let c of cs) {

            delete this._channels[c];
        }
    }

    public async pSubscribe(patterns: string | string[]): Promise<void> {

        let ps: string[] = [];

        if (!Array.isArray(patterns)) {

            patterns = [patterns];
        }

        if (!patterns.length) {

            throw new E.E_INVALID_PARAM();
        }

        for (const p of patterns) {

            if (this._patterns[p] || ps.includes(p)) {

                continue;
            }

            ps.push(p);
        }

        if (!ps.length) {

            return Promise.resolve();
        }

        await this.command("PSUBSCRIBE", ps);

        for (let p of ps) {

            this._patterns[p] = true;
        }
    }

    public async pUnsubscribe(patterns: string | string[]): Promise<void> {

        let ps: string[] = [];

        if (!Array.isArray(patterns)) {

            patterns = [patterns];
        }

        if (!patterns.length) {

            throw new E.E_INVALID_PARAM();
        }

        for (const p of patterns) {

            if (!this._patterns[p]) {

                continue;
            }

            ps.push(p);
        }

        if (!ps.length) {

            return Promise.resolve();
        }

        await this.command("PUNSUBSCRIBE", ps);

        for (let p of ps) {

            delete this._patterns[p];
        }
    }
}
