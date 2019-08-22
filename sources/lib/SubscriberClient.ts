/*
   +----------------------------------------------------------------------+
   | LiteRT Redis.js Library                                              |
   +----------------------------------------------------------------------+
   | Copyright (c) 2007-2018 Fenying Studio                               |
   +----------------------------------------------------------------------+
   | This source file is subject to version 2.0 of the Apache license,    |
   | that is bundled with this package in the file LICENSE, and is        |
   | available through the world-wide-web at the following url:           |
   | https://github.com/litert/redis.js/blob/master/LICENSE               |
   +----------------------------------------------------------------------+
   | Authors: Angus Fenying <fenying@litert.org>                          |
   +----------------------------------------------------------------------+
 */
import * as Net from "net";
import * as Abstract from "./Abstract";
import ProtocolClient from "./ProtocolClient";
import Exception from "./Exception";
import * as Constants from "./Constants";

import ListItem = Abstract.ListItem;

type SubscribeResponse = [
    ListItem<Buffer>, ListItem<Buffer>, ListItem<number>
];

export class SubscriberClient
extends ProtocolClient
implements Abstract.ProtocolClient {

    protected _subjects!: string[];

    protected _patterns!: string[];

    protected _password: string;

    public constructor(
        connection: Net.Socket,
        host: string,
        port: number,
        createDecoder: Abstract.DecoderFactory,
        createEncoder: Abstract.EncoderFactory,
        password: string
    ) {
        super(connection, host, port, createDecoder, createEncoder);

        this._subjects = [];
        this._patterns = [];
        this._password = password;
    }

    protected async _onReconnected(): Promise<void> {

        if (this._password) {

            this._forcePipeline();

            try {

                await this.executeNow(
                    "AUTH", this._password
                );
            }
            catch (e) {

                this.emit("error", new Exception(
                    Constants.SUBSCRIBE_FAILURE,
                    "Failed to resubscribe subjects.",
                    e
                ));

                return super._onReconnected();
            }
        }

        try {

            await this._resubscribe();
        }
        catch (e) {

            this.emit("error", new Exception(
                Constants.SUBSCRIBE_FAILURE,
                "Failed to resubscribe subjects.",
                e
            ));

            return super._onReconnected();
        }
    }

    protected async _resubscribe(): Promise<void> {

        let tmp: Array<Promise<string[]>> = [];

        let subjects = this._subjects;
        let patterns = this._patterns;

        if (subjects.length) {

            this._subjects = [];
            tmp.push(this.subscribe(...subjects));
        }

        if (patterns.length) {

            this._patterns = [];
            tmp.push(this.pSubscribe(...patterns));
        }

        if (tmp.length) {

            try {

                let result = await Promise.all(tmp);

                if (subjects.length && result[0].length !== subjects.length) {

                    throw new Exception(
                        Constants.SUBSCRIBE_FAILURE,
                        "Failed to subscribe some of subjects."
                    );
                }

                if (patterns.length && result[1].length !== patterns.length) {

                    throw new Exception(
                        Constants.SUBSCRIBE_FAILURE,
                        "Failed to subscribe some of subject patterns."
                    );
                }
            }
            catch (e) {

                this._patterns = patterns;
                this._subjects = subjects;
                this.emit("error", e);
            }
        }

        super._onReconnected();
    }

    protected _onDecodedData(type: Abstract.DataType, data: any): void {

        let rp = this._waiters.shift();

        if (rp) {

            switch (type) {
            case Abstract.DataType.FAILURE:

                return rp.reject(new Exception(
                    Constants.COMMAND_FAILURE,
                    data.toString()
                ));

            case Abstract.DataType.MESSAGE:

                return rp.resolve(data.toString());

            case Abstract.DataType.LIST:

                switch (data[0][1].toString()) {

                case "message":

                    this.emit(
                        "message",
                        data[1][1].toString(),
                        data[2][1]
                    );
                    break;

                case "pmessage":

                    this.emit(
                        "message",
                        data[2][1].toString(),
                        data[3][1],
                        data[1][1].toString()
                    );
                    break;

                default:

                    rp.resolve(data);
                }

                break;

            default:

                return rp.resolve(data);
            }
        }
        else {
            if (type === Abstract.DataType.LIST
            ) {

                switch (data[0][1].toString()) {

                case "message":

                    this.emit(
                        "message",
                        data[1][1].toString(),
                        data[2][1]
                    );
                    break;

                case "pmessage":

                    this.emit(
                        "message",
                        data[2][1].toString(),
                        data[3][1],
                        data[1][1].toString()
                    );
                    break;

                default:
                }
            }
        }
    }

    public async pSubscribe(...patterns: string[]): Promise<string[]> {

        let newPatterns: string[] = [];

        for (let p of patterns) {

            if (this._patterns.indexOf(p) === -1) {

                let data = await this.executeNow<SubscribeResponse>(
                    "PSUBSCRIBE", p
                );

                if (data[1][1].toString() === p) {

                    newPatterns.push(p);
                    this._patterns.push(p);
                }
            }
        }

        return newPatterns;
    }

    public async subscribe(...subjects: string[]): Promise<string[]> {

        let newSubjects: string[] = [];

        for (let subj of subjects) {

            if (this._subjects.indexOf(subj) === -1) {

                let data = await this.executeNow<SubscribeResponse>(
                    "SUBSCRIBE", subj
                );

                if (data[1][1].toString() === subj) {

                    newSubjects.push(subj);
                    this._subjects.push(subj);
                }
            }
        }

        return newSubjects;
    }

    public async unsubscribe(...subjects: string[]): Promise<string[]> {

        let ret: string[] = [];

        for (let subj of subjects) {

            if (this._subjects.indexOf(subj) !== -1) {

                let data = await this.executeNow<SubscribeResponse>(
                    "UNSUBSCRIBE", subj
                );

                if (data[1][1].toString() === subj) {

                    ret.push(subj);
                    this._subjects.splice(this._subjects.indexOf(subj), 1);
                }
            }
        }

        return ret;
    }

    public async pUnsubscribe(...patterns: string[]): Promise<string[]> {

        let ret: string[] = [];

        for (let p of patterns) {

            if (this._patterns.indexOf(p) !== -1) {

                let data = await this.executeNow<SubscribeResponse>(
                    "PUNSUBSCRIBE", p
                );

                if (data[1][1].toString() === p) {

                    ret.push(p);
                    this._patterns.splice(this._patterns.indexOf(p), 1);
                }
            }
        }

        return ret;
    }

    public async close(): Promise<void> {

        return super.close();
    }
}

export default SubscriberClient;
