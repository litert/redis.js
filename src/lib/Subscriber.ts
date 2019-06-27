// tslint:disable: no-unused-expression
import * as C from "./Common";
import { BaseClient } from "./BaseClient";

export class SubscriberClient
extends BaseClient
implements C.ISubscriberClient {

    private _channels: Record<string, boolean> = {};

    private _patterns: Record<string, boolean> = {};

    public constructor(
        host: string,
        port: number,
        _decoder: C.IDecoder,
        _encoder: C.IEncoder
    ) {

        super(host, port, _decoder, _encoder, true);
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

                    return callback(e);
                }

                callback();

            })();
        });
    }

    public async subscribe(channels: string[]): Promise<void> {

        let cs: string[] = [];

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

    public async unsubscribe(channels: string[]): Promise<void> {

        let cs: string[] = [];

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

    public async pSubscribe(patterns: string[]): Promise<void> {

        let ps: string[] = [];

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

    public async pUnsubscribe(patterns: string[]): Promise<void> {

        let ps: string[] = [];

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
