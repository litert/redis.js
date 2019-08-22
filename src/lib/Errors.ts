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

import * as Core from "@litert/core";

export const ErrorHub = Core.createErrorHub("@litert/redis");

export const E_PROTOCOL_ERROR = ErrorHub.define(
    null,
    "E_PROTOCOL_ERROR",
    "Malformed data received from remote server.",
    {}
);

export const E_CAN_NOT_CONNECT = ErrorHub.define(
    null,
    "E_CAN_NOT_CONNECT",
    "Can not connect to remote server.",
    {}
);

export const E_COMMAND_FAILURE = ErrorHub.define(
    null,
    "E_COMMAND_FAILURE",
    "Recieved a failure response of command execution from remote server.",
    {}
);

export const E_CONN_LOST = ErrorHub.define(
    null,
    "E_CONN_LOST",
    "Lost the connection to remote server.",
    {}
);

export const E_NO_CONN = ErrorHub.define(
    null,
    "E_NO_CONN",
    "The connection is not ready yet.",
    {}
);

export const E_SUBSCRIBE_FAILURE = ErrorHub.define(
    null,
    "E_SUBSCRIBE_FAILURE",
    "Failed to subscribe subjects.",
    {}
);

export const E_PIPELINING = ErrorHub.define(
    null,
    "E_PIPELINING",
    "Some commands queued in pipeline, can not use MULTI.",
    {}
);

export const E_REQUEST_TIMEOUT = ErrorHub.define(
    null,
    "E_REQUEST_TIMEOUT",
    "There was no response for commands sent in time .",
    {}
);
