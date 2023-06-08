/**
 * Copyright 2023 Angus.Fenying <fenying@litert.org>
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

import * as C from './Common';
import * as E from './Errors';
import { ProtocolClient } from './ProtocolClient';

export class SubscriberClient
    extends ProtocolClient
    implements C.ISubscriberClient {

    private readonly _channels: Record<string, boolean> = {};

    private readonly _patterns: Record<string, boolean> = {};

    private _closed: boolean = false;

    public constructor(opts: C.IClientOptions) {

        super({
            mode: C.EClientMode.SUBSCRIBER,
            ...opts
        });

        this.on('ready', () => {

            if (this._closed) {
                this.close();
                return;
            }

            this._closed = false;

            (async () => {

                if (Object.keys(this._channels).length) {

                    await this._command('SUBSCRIBE', Object.keys(this._channels));
                }

                if (Object.keys(this._patterns).length) {

                    await this._command('PSUBSCRIBE', Object.keys(this._patterns));
                }

            })().catch((e) => {

                this.emit('error', e);

                if (this._closed) {

                    this.close();
                }
            });
        }).on('close', () => {

            if (!this._closed) {

                this._tryReconnect();
            }
        });
    }

    private _tryReconnect(t: number = 0): void {

        this.connect((e) => {

            if (e && !this._closed) {

                setTimeout(() => {
                    this._tryReconnect(t + 1);
                }, t);
            }
        });
    }

    public async subscribe(channels: string | string[]): Promise<void> {

        const cs: string[] = [];

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

        await this.command('SUBSCRIBE', cs);

        for (const c of cs) {

            this._channels[c] = true;
        }
    }

    public async unsubscribe(channels: string | string[]): Promise<void> {

        const cs: string[] = [];

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

        await this.command('UNSUBSCRIBE', cs);

        for (const c of cs) {

            delete this._channels[c];
        }
    }

    public async pSubscribe(patterns: string | string[]): Promise<void> {

        const ps: string[] = [];

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

        await this.command('PSUBSCRIBE', ps);

        for (const p of ps) {

            this._patterns[p] = true;
        }
    }

    public async pUnsubscribe(patterns: string | string[]): Promise<void> {

        const ps: string[] = [];

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

        await this.command('PUNSUBSCRIBE', ps);

        for (const p of ps) {

            delete this._patterns[p];
        }
    }

    public close(cb?: C.ICallbackA<void>): any {

        this._closed = true;
        super.close(cb);
    }
}
