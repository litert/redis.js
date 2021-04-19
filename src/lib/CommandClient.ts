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

/* eslint-disable @typescript-eslint/unbound-method */
import * as C from './Common';
import * as CMD from './Commands';
import { BaseClient } from './BaseClient';
import { PipelineClient } from './PipelineClient';
import { MultiClient } from './WatchClient';

export class CommandClient
    extends BaseClient
    implements C.ICommandClientBase {

    private _createDecoder: C.TDecoderFactory;

    private _createEncoder: C.TEncoderFactory;

    public constructor(opts: C.IClientOptions) {

        super({
            subscribeMode: false,
            pipelineMode: false,
            ...opts
        });

        this._createDecoder = opts.decoderFactory;
        this._createEncoder = opts.encoderFactory;
    }

    public async pipeline(): Promise<C.IPipelineClient> {

        const cli = new PipelineClient({
            host: this.host,
            port: this.port,
            decoderFactory: this._createDecoder,
            encoderFactory: this._createEncoder,
            commandTimeout: this._commandTimeout,
            connectTimeout: this._connectTimeout
        }) as any as C.IPipelineClient;

        await cli.connect();

        if (this._password) {

            await cli.auth(this._password);
        }

        if (this._db) {

            await cli.select(this._db);
        }

        return cli;
    }

    public async multi(): Promise<C.IMultiClient> {

        const cli = new MultiClient({
            host: this.host,
            port: this.port,
            decoderFactory: this._createDecoder,
            encoderFactory: this._createEncoder,
            commandTimeout: this._commandTimeout,
            connectTimeout: this._connectTimeout
        }) as any as C.IMultiClient;

        await cli.connect();

        if (this._password) {

            await cli.auth(this._password);
        }

        if (this._db) {

            await cli.select(this._db);
        }

        return cli;
    }
}

(function(c: any) {

    let name: keyof typeof CMD.COMMANDS;

    for (name in CMD.COMMANDS) {

        if (name === 'auth' || name === 'select') {

            continue;
        }

        let process: string;
        const cmd = CMD.COMMANDS[name];

        if (cmd.process === undefined) {

            process = 'return this._command(req.cmd, req.args);';
        }
        else if (cmd.process === null) {

            process = 'this._command(req.cmd, req.args);';
        }
        else {

            process = 'return process(await this._command(req.cmd, req.args), req.args);';
        }

        c.prototype[name] = (new Function(
            'process',
            'prepare',
            `return async function(...args) {

                const req = prepare(...args);

                ${process}
            };`
        ))(cmd.process, cmd.prepare);
    }

})(CommandClient);
