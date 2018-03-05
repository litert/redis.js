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
import * as Core from "@litert/core";
import * as Abstract from "./Abstract";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import ProtocolClient from "./ProtocolClient";
import RedisClient from "./RedisClient";
import * as Network from "./Network";

export interface CreateProtocolClientOptions {

    "host": string;

    "port"?: number;

    "decoder"?: Abstract.DecoderFactory;

    "encoder"?: Abstract.EncoderFactory;
}

function applyDefaultOptions(
    input: Core.IDictionary<any>,
    defaults: Core.IDictionary<any>
): void {

    for (let key in defaults) {

        if (input[key] === undefined) {

            input[key] = defaults[key];
        }
    }
}

/**
 * Provide the default options for creating a client for basic Redis protocol.
 */
function getDefaultOptionsForCreateProtocolClient(): Core.IDictionary<any> {

    return {

        "port": 6379,

        "decoder"() {

            return new Decoder();
        },

        "encoder"() {

            return new Encoder();
        }
    };
}

/**
 * Create a client for basic Redis protocol.
 */
export async function createProtocolClient(
    opts: CreateProtocolClientOptions
): Promise<Abstract.ProtocolClient> {

    applyDefaultOptions(opts, getDefaultOptionsForCreateProtocolClient());

    return new ProtocolClient(
        await Network.createTCPConnection(
            opts.host,
            opts.port as number
        ),
        opts.host,
        opts.port as number,
        opts.decoder as Abstract.DecoderFactory,
        opts.encoder as Abstract.EncoderFactory
    );
}

/**
 * Create a client for full commands supported.
 */
export async function createRedisClient(
    opts: CreateProtocolClientOptions
): Promise<Abstract.RedisClient> {

    applyDefaultOptions(opts, getDefaultOptionsForCreateProtocolClient());

    return new RedisClient(
        await Network.createTCPConnection(
            opts.host,
            opts.port as number
        ),
        opts.host,
        opts.port as number,
        opts.decoder as Abstract.DecoderFactory,
        opts.encoder as Abstract.EncoderFactory
    );
}
