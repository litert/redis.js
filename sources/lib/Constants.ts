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
export const EXCEPTION_TYPE: string = "litert/redis";

export const PROTO_DELIMITER_VALUE: string = "\r\n";

export const PROTO_DELIMITER: Buffer = Buffer.from(PROTO_DELIMITER_VALUE);

export const PROTO_NULL: Buffer = Buffer.from(`$-1${PROTO_DELIMITER_VALUE}`);

export const FAILED_TO_CONNECT: number = 0x00001001;

export const NO_CONNECTION: number = 0x00001002;

export const INVALID_FORMAT: number = 0x00001003;

export const COMMAND_FAILURE: number = 0x00001004;

export const NETWORK_FAILURE: number = 0x00001005;

export const SUBSCRIBE_FAILURE: number = 0x00001006;
