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
import * as Core from "@litert/core";
import Exception from "./Exception";
import * as Constants from "./Constants";

export function createTCPConnection(
    host: string,
    port: number
): Promise<Net.Socket> {

    let ret = new Core.RawPromise<Net.Socket, Core.Exception>();

    let connection = Net.createConnection(
        port,
        host,
        function(this: Net.Socket): void {

            this.removeAllListeners("error");

            ret.resolve(connection);
        }
    );

    connection.once("error", (err: NodeJS.ErrnoException): void => {

        connection.destroy();

        ret.reject(new Exception(
            Constants.FAILED_TO_CONNECT,
            "Unabled to connect to Redis server.",
            err
        ));
    });

    return ret.promise;
}
