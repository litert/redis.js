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

export function nullableBuffer2String(data: Buffer | null): string | null {

    return data ? data.toString() : null;
}

export function buffer2String(data: Buffer): string {

    return data.toString();
}

export function pairList2BufferDict(data: Array<[number, Buffer]>): Record<string, Buffer> {

    let ret: Record<string, Buffer> = {};

    if (!data) {

        return ret;
    }

    for (let i = 0; i < data.length; i += 2) {

        ret[data[i][1].toString()] = data[i + 1][1];
    }

    return ret;
}

export function pairList2NullableBufferDict(data: Array<[number, Buffer]>): Record<string, Buffer | null> {

    let ret: Record<string, Buffer | null> = {};

    if (!data) {

        return ret;
    }

    for (let i = 0; i < data.length; i += 2) {

        ret[data[i][1].toString()] = data[i + 1][1];
    }

    return ret;
}

export function pairList2StringDict(data: Array<[number, Buffer]>): Record<string, string> {

    let ret: Record<string, string> = {};

    if (!data) {

        return ret;
    }

    for (let i = 0; i < data.length; i += 2) {

        ret[data[i][1].toString()] = data[i + 1][1].toString();
    }

    return ret;
}

export function pairList2NullableStringDict(data: Array<[number, Buffer]>): Record<string, string | null> {

    let ret: Record<string, string | null> = {};

    if (!data) {

        return ret;
    }

    for (let i = 0; i < data.length; i += 2) {

        ret[data[i][1].toString()] = data[i + 1][1] ? data[i + 1][1].toString() : null;
    }

    return ret;
}

export function list2NullableBufferDict(keys: string[], data: Array<[number, Buffer]>): Record<string, Buffer | null> {

    let ret: Record<string, Buffer | null> = {};

    for (let i = 0; i < data.length; i++) {

        ret[keys[i]] = data[i][1];
    }

    return ret;
}

export function list2NullableStringDict(keys: string[], data: Array<[number, Buffer]>): Record<string, string | null> {

    let ret: Record<string, string | null> = {};

    for (let i = 0; i < data.length; i++) {

        ret[keys[i]] = data[i][1] ? data[i][1].toString() : null;
    }

    return ret;
}

export function list2StringList(data: Array<[number, Buffer]>): string[] {

    return data ? data.map((x) => x[1].toString()) : [];
}

export function list2BufferList(data: Array<[number, Buffer]>): Buffer[] {

    return data ? data.map((x) => x[1]) : [];
}
