/**
 * Copyright 2025 Angus.Fenying <fenying@litert.org>
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
import * as Constants from './Constants';
import { EventEmitter } from 'node:events';

import PROTO_DELIMITER = Constants.PROTO_DELIMITER;

enum EDecodeStatus {

    /**
     * Reading nothing.
     */
    IDLE,

    /**
     * Reading the length of a byte-string.
     */
    READING_STRING_LENGTH,

    /**
     * Reading the content of a byte-string.
     */
    READING_STRING,

    /**
     * Reading the content of a message.
     */
    READING_MESSAGE,

    /**
     * Reading the content of a failure.
     */
    READING_FAILURE,

    /**
     * Reading the value of an integer.
     */
    READING_INTEGER,

    /**
     * Reading the length of a list.
     */
    READING_LIST_LENGTH,

    /**
     * Reading the elements of a list.
     */
    READING_LIST
}

class DecodeContext {

    /**
     * The status of decoder context.
     */
    public status: EDecodeStatus;

    public data: {
        length: number;
    };

    public value: any;

    public type!: C.EDataType;

    public pos: number;

    public constructor(
        status: EDecodeStatus = EDecodeStatus.IDLE,
        pos: number = 0
    ) {

        this.data = {} as any;
        this.status = status;
        this.pos = pos;
    }
}

export class Decoder extends EventEmitter implements C.IDecoder {

    protected _buf!: Buffer;

    private _ctx!: DecodeContext;

    private _contextStack!: DecodeContext[];

    protected _cursor!: number;

    public constructor() {

        super();

        this.reset();
    }

    public reset(): this {

        this._ctx = new DecodeContext();

        this._contextStack = [];

        this._buf = Buffer.allocUnsafe(0);

        this._cursor = 0;

        return this;
    }

    public update(data: Buffer): this {

        this._buf = Buffer.concat([this._buf, data]);

        while (this._buf.length) {

            let end: number;

            switch (this._ctx.status) {
                case EDecodeStatus.READING_LIST:
                case EDecodeStatus.IDLE:

                    switch (this._buf[this._cursor]) {
                        case 36: // $
                            this._push(EDecodeStatus.READING_STRING_LENGTH);
                            break;
                        case 42: // *
                            this._push(EDecodeStatus.READING_LIST_LENGTH);
                            break;
                        case 43: // +
                            this._push(EDecodeStatus.READING_MESSAGE);
                            break;
                        case 45: // -
                            this._push(EDecodeStatus.READING_FAILURE);
                            break;
                        case 58: // :
                            this._push(EDecodeStatus.READING_INTEGER);
                            break;
                        default:
                            this.emit('error', new E.E_PROTOCOL_ERROR({
                                'message': 'Unrecognizable format of stream.'
                            }));
                            return this;
                    }

                    break;

                case EDecodeStatus.READING_MESSAGE:

                    this._ctx.type = C.EDataType.MESSAGE;

                    end = this._buf.indexOf(PROTO_DELIMITER, this._cursor);

                    if (end > -1) {

                        this._ctx.value = this._buf.subarray(
                            this._ctx.pos,
                            end
                        );

                        this._pop(end + 2);
                    }
                    else {

                        //                    this._cursor = this._buf.length - 2;
                        return this;
                    }

                    break;

                case EDecodeStatus.READING_FAILURE:

                    this._ctx.type = C.EDataType.FAILURE;

                    end = this._buf.indexOf(PROTO_DELIMITER, this._cursor);

                    if (end > -1) {

                        this._ctx.value = this._buf.subarray(
                            this._ctx.pos,
                            end
                        );

                        this._pop(end + 2);
                    }
                    else {

                        //                    this._cursor = this._buf.length - 2;
                        return this;
                    }

                    break;

                case EDecodeStatus.READING_INTEGER:

                    this._ctx.type = C.EDataType.INTEGER;

                    end = this._buf.indexOf(PROTO_DELIMITER, this._cursor);

                    if (end > -1) {

                        this._ctx.value = parseInt(this._buf.subarray(
                            this._ctx.pos,
                            end
                        ).toString());

                        this._pop(end + 2);
                    }
                    else {

                        //                    this._cursor = this._buf.length - 2;
                        return this;
                    }

                    break;

                case EDecodeStatus.READING_LIST_LENGTH:

                    end = this._buf.indexOf(PROTO_DELIMITER, this._cursor);

                    if (end > -1) {

                        this._ctx.data.length = parseInt(this._buf.subarray(
                            this._ctx.pos,
                            end
                        ).toString());

                        if (this._ctx.data.length === -1) {

                            this._ctx.type = C.EDataType.NULL;
                            this._ctx.value = null;
                            this._pop(end + 2);
                        }
                        else {

                            this._ctx.type = C.EDataType.LIST;
                            this._ctx.value = [];

                            if (this._ctx.data.length === 0) {

                                this._pop(end + 2);
                            }
                            else {

                                this._cut(end + 2);
                                this._ctx.pos = this._cursor;
                                this._ctx.status = EDecodeStatus.READING_LIST;
                            }
                        }
                    }
                    else {

                        //                    this._cursor = this._buf.length - 2;
                        return this;
                    }

                    break;

                case EDecodeStatus.READING_STRING_LENGTH:

                    this._ctx.type = C.EDataType.STRING;

                    end = this._buf.indexOf(PROTO_DELIMITER, this._cursor);

                    if (end > -1) {

                        this._ctx.data.length = parseInt(this._buf.subarray(
                            this._ctx.pos,
                            end
                        ).toString());

                        if (this._ctx.data.length === -1) {

                            this._ctx.type = C.EDataType.NULL;
                            this._ctx.value = null;
                            this._pop(end + 2);
                        }
                        else {

                            this._cut(end + 2);
                            this._ctx.pos = this._cursor;
                            this._ctx.status = EDecodeStatus.READING_STRING;
                        }
                    }
                    else {

                        //                    this._cursor = this._buf.length - 2;
                        return this;
                    }

                    break;

                case EDecodeStatus.READING_STRING:

                    if (this._buf.length >= this._ctx.data.length + 2) {

                        this._ctx.value = this._buf.subarray(
                            this._ctx.pos,
                            this._ctx.pos + this._ctx.data.length
                        );

                        this._pop(this._ctx.data.length + 2);
                    }
                    else {

                        //                    this._cursor = this._buf.length - 2;
                        return this;
                    }

                    break;
            }
        }

        return this;
    }

    private _push(newStatus: EDecodeStatus): void {

        this._contextStack.push(this._ctx);
        this._ctx = new DecodeContext(newStatus);
        this._cursor++;
        this._ctx.pos = this._cursor;
    }

    private _pop(end: number): void {

        const context = this._ctx;

        this._ctx = this._contextStack.pop()!;

        if (this._ctx.status === EDecodeStatus.READING_LIST) {

            this._ctx.value.push([
                context.type,
                context.value
            ]);

            if (this._ctx.data.length === this._ctx.value.length) {

                this._pop(0);
            }
        }
        else {

            this.emit('data', context.type, context.value);
        }

        if (end) {

            this._cut(end);
        }
    }

    /**
     * Trim the buffer before the specific position.
     */
    private _cut(end: number): void {

        this._buf = this._buf.subarray(end);
        this._cursor = 0;
    }
}

export default Decoder;
