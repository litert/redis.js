// tslint:disable: no-unused-expression
import * as C from "./Common";
import * as CMD from "./Commands";
import { BaseClient } from "./BaseClient";
import { PipelineClient } from "./PipelineClient";

export class CommandClient
extends BaseClient
implements C.ICommandClientBase {

    public constructor(
        host: string,
        port: number,
        private _createDecoder: C.TDecoderFactory,
        private _createEncoder: C.TEncoderFactory
    ) {

        super(host, port, _createDecoder, _createEncoder);
    }

    public async pipeline(): Promise<C.IPipelineClient> {

        const cli = new PipelineClient(
            this.host,
            this.port,
            this._createDecoder,
            this._createEncoder
        ) as any as C.IPipelineClient;

        await cli.connect();

        if (this._password) {

            await cli.auth(this._password);
        }

        return cli;
    }
}

(function(c: any) {

    let name: keyof typeof CMD.COMMANDS;

    for (name in CMD.COMMANDS) {

        if (name === "auth") {

            continue;
        }

        let process: string;
        const cmd = CMD.COMMANDS[name];

        if (cmd.process === undefined) {

            process = `return this._command(req.cmd, req.args);`;
        }
        else if (cmd.process === null) {

            process = `this._command(req.cmd, req.args);`;
        }
        else {

            process = `return process(await this._command(req.cmd, req.args), req.args);`;
        }

        c.prototype[name] = (new Function(
            "process",
            "prepare",
            `return async function(...args) {

                const req = prepare(...args);

                ${process}
            };`
        ))(cmd.process, cmd.prepare);
    }

})(CommandClient);
