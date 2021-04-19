/**
 * Copyright 2021 Angus.Fenying <fenying@litert.org>
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
import { ProtocolClient } from './ProtocolClient';

export abstract class BaseClient
    extends ProtocolClient {

    protected _password!: string;

    protected _db: number = 0;

    public constructor(opts: C.IProtocolClientOptions) {

        super(opts);
    }

    protected _onConnected(callback: C.ICallbackA): void {

        if (!this._password) {

            return super._onConnected(callback);
        }

        this._send('AUTH', [this._password], (err: any): void => {

            if (err) {

                return callback(err);
            }

            this._send('SELECT', [this._db], (err2: any): void => {

                if (err2) {

                    return callback(err2);
                }

                super._onConnected(callback);
            });
        });
    }

    public async auth(k: string): Promise<void> {

        await this._command('AUTH', [k]);

        this._password = k;
    }

    public async select(db: number): Promise<void> {

        await this._command('SELECT', [db]);

        this._db = db;
    }
}
