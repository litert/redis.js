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

import * as A from "./Common";
import * as E from "./Errors";
import * as C from "./Constants";

import PROTO_DELIMITER = C.PROTO_DELIMITER;
import PROTO_NULL = C.PROTO_NULL;
import PROTO_DELIMITER_VALUE = C.PROTO_DELIMITER_VALUE;

export class Encoder implements A.IEncoder {

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

    public encodeCommand(cmd: string | Buffer, values?: Array<string | Buffer | number>): Buffer {

        let ret: Buffer;

        let length: number = 3;

        if (values) {

            for (let i = 0; i < values.length; i++) {

                if (typeof values[i] === "number") {

                    values[i] = values[i].toString();
                }
            }

            length += (1 + values.length).toString().length;

            for (let el of values) {

                length += this._getStringEncodedLength(el as string);
            }
        }
        else {

            length += 1;
        }

        length += this._getStringEncodedLength(cmd);

        ret = Buffer.allocUnsafe(length);

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
                    el as string,
                    pos
                );
            }
        }

        return ret;
    }

    public encodeString(data: string | Buffer): Buffer {

        let ret = Buffer.allocUnsafe(this._getStringEncodedLength(data));

        this._writeString(ret, data, 0);

        return ret;
    }

    public encodeMessage(data: string | Buffer): Buffer {

        // @ts-ignore
        if (data.indexOf(PROTO_DELIMITER_VALUE) > -1) {

            throw new E.E_PROTOCOL_ERROR({
                "message": "CRLF is forbidden in MESSAGE."
            });
        }

        let length = Buffer.byteLength(data);

        let ret = Buffer.allocUnsafe(length + 3);

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

        if (data.indexOf(PROTO_DELIMITER_VALUE) > -1) {

            throw new E.E_PROTOCOL_ERROR({
                "message": "CRLF is forbidden in MESSAGE."
            });
        }

        let length = Buffer.byteLength(data);

        let ret = Buffer.allocUnsafe(length + 3);

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

        let ret = Buffer.allocUnsafe(3 + len);

        ret[0] = 58;

        ret.write(data, 1);

        PROTO_DELIMITER.copy(ret, len + 1);

        return ret;
    }

    public encodeList(data: A.ListItem[]): Buffer {

        let ret: Buffer[] = [
            Buffer.from(`*${data.length}`),
            PROTO_DELIMITER
        ];

        for (let item of data) {

            switch (item[0]) {
            case A.DataType.FAILURE:
                ret.push(this.encodeString(item[1]));
                break;
            case A.DataType.MESSAGE:
                ret.push(this.encodeMessage(item[1]));
                break;
            case A.DataType.STRING:
                ret.push(this.encodeString(item[1]));
                break;
            case A.DataType.INTEGER:
                ret.push(this.encodeInteger(item[1]));
                break;
            case A.DataType.LIST:
                ret.push(this.encodeList(item[1]));
                break;
            }
        }

        return Buffer.concat(ret);
    }
}

export default Encoder;
