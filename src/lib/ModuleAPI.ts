/**
 * Copyright 2020 Angus.Fenying <fenying@litert.org>
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

import { Decoder } from "./Decoder";
import { Encoder } from "./Encoder";
import { ProtocolClient } from "./ProtocolClient";
import { CommandClient } from "./CommandClient";
import { PipelineClient } from "./PipelineClient";
import { SubscriberClient } from "./Subscriber";
import * as C from "./Common";
import * as Constants from "./Constants";

export function createDecoder(): C.IDecoder {

    return new Decoder();
}

export function createEncoder(): C.IEncoder {

    return new Encoder();
}

export function createCommandClient(opts: Partial<C.IClientOptions>): C.ICommandClient {

    return new CommandClient({
        host: opts.host || Constants.DEFUALT_HOST,
        port: opts.port || Constants.DEFUALT_PORT,
        decoderFactory:  opts.decoderFactory || createDecoder,
        encoderFactory: opts.encoderFactory || createEncoder,
        commandTimeout: opts.commandTimeout === undefined ? Constants.DEFAULT_COMMAND_TIMEOUT : opts.commandTimeout,
        connectTimeout: opts.connectTimeout === undefined ? Constants.DEFAULT_CONNECT_TIMEOUT : opts.connectTimeout
    }) as any as C.ICommandClient;
}

export function createPipelineClient(opts: Partial<C.IClientOptions>): C.IPipelineClient {

    return new PipelineClient({
        host: opts.host || Constants.DEFUALT_HOST,
        port: opts.port || Constants.DEFUALT_PORT,
        decoderFactory:  opts.decoderFactory || createDecoder,
        encoderFactory: opts.encoderFactory || createEncoder,
        commandTimeout: opts.commandTimeout === undefined ? Constants.DEFAULT_COMMAND_TIMEOUT : opts.commandTimeout,
        connectTimeout: opts.connectTimeout === undefined ? Constants.DEFAULT_CONNECT_TIMEOUT : opts.connectTimeout
    }) as any as C.IPipelineClient;
}

export function createProtocolClient(opts: C.IProtocolClientOptions): C.IProtocolClient {

    return new ProtocolClient(opts);
}

export function createSubscriberClient(opts: Partial<C.IClientOptions>): C.ISubscriberClient {

    return new SubscriberClient({
        host: opts.host || Constants.DEFUALT_HOST,
        port: opts.port || Constants.DEFUALT_PORT,
        decoderFactory:  opts.decoderFactory || createDecoder,
        encoderFactory: opts.encoderFactory || createEncoder,
        commandTimeout: opts.commandTimeout === undefined ? Constants.DEFAULT_COMMAND_TIMEOUT : opts.commandTimeout,
        connectTimeout: opts.connectTimeout === undefined ? Constants.DEFAULT_CONNECT_TIMEOUT : opts.connectTimeout
    });
}
