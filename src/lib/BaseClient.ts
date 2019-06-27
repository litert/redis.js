import * as C from "./Common";
import { ProtocolClient } from "./ProtocolClient";

export abstract class BaseClient
extends ProtocolClient {

    private _password!: string;

    public constructor(
        host: string,
        port: number,
        decoder: C.IDecoder,
        encoder: C.IEncoder,
        subscribeMode?: boolean
    ) {

        super(host, port, decoder, encoder, subscribeMode);
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
