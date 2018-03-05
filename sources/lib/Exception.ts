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
import * as Constants from "./Constants";

export class Exception extends Core.Exception {

    public constructor(error: number, message: string, origin?: any) {

        super(error, message, origin);

        this._type = Constants.EXCEPTION_TYPE;

        if (!origin) {

            this._origin = new Error("Tracing");
        }
    }
}

export default Exception;
