/**
 * Copyright 2023 Angus.Fenying <fenying@litert.org>
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

/**
 * The error class for RedisClient.
 */
export abstract class RedisError extends Error {

    public constructor(
        /**
         * The name of the error.
         */
        name: string,
        /**
         * The message of the error.
         */
        message: string,
        /**
         * The metadata of the error.
         */
        public readonly origin: unknown = null
    ) {

        super(message);
        this.name = name;
    }
}

export const E_PROTOCOL_ERROR = class extends RedisError {

    public constructor(
        origin: unknown = null
    ) {
        super(
            'protocol_error',
            'Malformed data received from remote server.',
            origin,
        );
    }
};

export const E_COMMAND_FAILURE = class extends RedisError {

    public constructor(
        message: string,
        origin: unknown = null
    ) {
        super(
            'command_failure',
            message,
            origin,
        );
    }
};

export const E_CONN_LOST = class extends RedisError {

    public constructor(
        origin: unknown = null
    ) {
        super(
            'conn_lost',
            'Lost the connection to remote server.',
            origin,
        );
    }
};

export const E_CONNECT_FAILED = class extends RedisError {

    public constructor(
        origin: unknown = null
    ) {
        super(
            'connect_failed',
            'Failed to connect to Redis server.',
            origin,
        );
    }
};

export const E_COMMAND_QUEUE_FULL = class extends RedisError {

    public constructor(
        origin: unknown = null
    ) {
        super(
            'command_queue_full',
            'The queue of commands is full.',
            origin,
        );
    }
};

export const E_COMMAND_TIMEOUT = class extends RedisError {

    public constructor(
        origin: unknown = null
    ) {
        super(
            'command_timeout',
            'There was no response for commands in time .',
            origin,
        );
    }
};

export const E_CONNECT_TIMEOUT = class extends RedisError {

    public constructor(
        origin: unknown = null
    ) {
        super(
            'connect_timeout',
            'Timeout while connecting to server.',
            origin,
        );
    }
};

export const E_INVALID_PARAM = class extends RedisError {

    public constructor(
        origin: unknown = null
    ) {
        super(
            'invalid_param',
            'The parameters passed to the command is unacceptable.',
            origin,
        );
    }
};

export const E_NOT_MULTI_MODE = class extends RedisError {

    public constructor(
        origin: unknown = null
    ) {
        super(
            'not_multi_mode',
            'The client is not under multi mode, please call multi method first.',
            origin,
        );
    }
};
