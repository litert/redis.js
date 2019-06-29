import * as C from "./Common";
import { ProtocolClient } from "./ProtocolClient";

export abstract class BaseClient
extends ProtocolClient {

    protected _password!: string;

    public constructor(
        host: string,
        port: number,
        decoder: C.TDecoderFactory,
        encoder: C.TEncoderFactory,
        subscribeMode?: boolean,
        pipeline?: boolean
    ) {

        super(host, port, decoder, encoder, subscribeMode, pipeline);
    }

    protected _onConnected(callback: C.ICallbackA): void {

        if (!this._password) {

            return super._onConnected(callback);
        }

        this._send("AUTH", [this._password], (err: any): void => {

            if (err) {

                return callback(err);
            }

            super._onConnected(callback);
        });
    }

    public async auth(k: string): Promise<void> {

        await this.command("AUTH", [k]);

        this._password = k;
    }
}
