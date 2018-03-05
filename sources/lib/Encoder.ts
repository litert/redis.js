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
import * as Abstracts from "./Abstract";
import Exception from "./Exception";
import * as Constants from "./Constants";

import PROTO_DELIMITER = Constants.PROTO_DELIMITER;
import PROTO_NULL = Constants.PROTO_NULL;
import PROTO_DELIMITER_VALUE = Constants.PROTO_DELIMITER_VALUE;

export class Encoder implements Abstracts.Encoder {

    protected _getStringEncodedLength(val: string | Buffer): number {

        let l = Buffer.byteLength(val);

        return 5 + l + l.toString().length;
    }

    protected _writeString(
        target: Buffer,
        val: string | Buffer,
        pos: number
    ): number {

        pos += target.write(
            `$${Buffer.byteLength(val)}`,
            pos
        );

        pos += PROTO_DELIMITER.copy(target, pos);

        if (typeof val === "string") {

            pos += target.write(val, pos);
        }
        else {

            pos += val.copy(target, pos);
        }

        pos += PROTO_DELIMITER.copy(target, pos);

        return pos;
    }

    public encodeNull(): Buffer {

        return PROTO_NULL.slice();
    }

    public encodeCommand(
        cmd: string | Buffer,
        values?: Array<string | Buffer>
    ): Buffer {

        let ret: Buffer;

        let length: number = 3;

        if (values) {

            length += (1 + values.length).toString().length;

            for (let el of values) {

                length += this._getStringEncodedLength(el);
            }
        }
        else {

            length += 1;
        }

        length += this._getStringEncodedLength(cmd);

        ret = Buffer.alloc(length);

        let pos: number = 0;

        pos += ret.write(
            `*${values ? values.length + 1 : 1}`,
            pos
        );

        pos += PROTO_DELIMITER.copy(ret, pos);

        pos = this._writeString(
            ret,
            cmd,
            pos
        );

        if (values) {

            for (let el of values) {

                pos = this._writeString(
                    ret,
                    el,
                    pos
                );
            }
        }

        return ret;
    }

    public encodeString(data: string | Buffer): Buffer {

        let ret = Buffer.alloc(this._getStringEncodedLength(data));

        this._writeString(ret, data, 0);

        return ret;
    }

    public encodeMessage(data: string | Buffer): Buffer {

        // @ts-ignore
        if (data.indexOf(PROTO_DELIMITER_VALUE) > -1) {

            throw new Exception(
                Constants.INVALID_FORMAT,
                "CRLF is forbidden in MESSAGE."
            );
        }

        let length = Buffer.byteLength(data);

        let ret = Buffer.alloc(length + 3);

        ret[0] = 43;

        if (typeof data === "string") {

            ret.write(data, 1);
        }
        else {

            data.copy(ret, 1);
        }

        PROTO_DELIMITER.copy(ret, length + 1);

        return ret;
    }

    public encodeFailure(data: string | Buffer): Buffer {

        // @ts-ignore
        if (data.indexOf(PROTO_DELIMITER_VALUE) > -1) {

            throw new Exception(
                Constants.INVALID_FORMAT,
                "CRLF is forbidden in FAILURE."
            );
        }

        let length = Buffer.byteLength(data);

        let ret = Buffer.alloc(length + 3);

        ret[0] = 45;

        if (typeof data === "string") {

            ret.write(data, 1);
        }
        else {

            data.copy(ret, 1);
        }

        PROTO_DELIMITER.copy(ret, length + 1);

        return ret;
    }

    public encodeInteger(val: number): Buffer {

        let data = val.toString();

        let len = Buffer.byteLength(data);

        let ret = Buffer.alloc(3 + len);

        ret[0] = 58;

        ret.write(data, 1);

        PROTO_DELIMITER.copy(ret, len + 1);

        return ret;
    }

    public encodeList(data: Abstracts.ListItem[]): Buffer {

        let ret: Buffer[] = [
            Buffer.from(`*${data.length}`),
            PROTO_DELIMITER
        ];

        for (let item of data) {

            switch (item[0]) {
            case Abstracts.DataType.FAILURE:
                ret.push(this.encodeString(item[1]));
                break;
            case Abstracts.DataType.MESSAGE:
                ret.push(this.encodeMessage(item[1]));
                break;
            case Abstracts.DataType.STRING:
                ret.push(this.encodeString(item[1]));
                break;
            case Abstracts.DataType.INTEGER:
                ret.push(this.encodeInteger(item[1]));
                break;
            case Abstracts.DataType.LIST:
                ret.push(this.encodeList(item[1]));
                break;
            }
        }

        return Buffer.concat(ret);
    }
}

export default Encoder;
