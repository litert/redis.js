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

import * as $Exceptions from '@litert/exception';

export const errorRegistry = $Exceptions.createExceptionRegistry({
    'module': 'redis.litert.org',
    'types': {
        'redis': {
            'index': $Exceptions.createIncreaseCodeIndex(1)
        }
    }
});

export const E_PROTOCOL_ERROR = errorRegistry.register({
    name: 'protocol_error',
    message: 'Malformed data received from remote server.',
    metadata: {},
    type: 'redis'
});

export const E_COMMAND_FAILURE = errorRegistry.register({
    name: 'command_failure',
    message: 'Recieved a failure response of command execution from remote server.',
    metadata: {},
    type: 'redis'
});

export const E_CONN_LOST = errorRegistry.register({
    name: 'conn_lost',
    message: 'Lost the connection to remote server.',
    metadata: {},
    type: 'redis'
});

export const E_CONNECT_FAILED = errorRegistry.register({
    name: 'connect_failed',
    message: 'Failed to connect to Redis server.',
    metadata: {},
    type: 'redis'
});

export const E_COMMAND_QUEUE_FULL = errorRegistry.register({
    name: 'command_queue_full',
    message: 'The queue of commands is full.',
    metadata: {},
    type: 'redis'
});

export const E_PIPELINING = errorRegistry.register({
    name: 'pipelining',
    message: 'Some commands queued in pipeline, can not use MULTI.',
    metadata: {},
    type: 'redis'
});

export const E_COMMAND_TIMEOUT = errorRegistry.register({
    name: 'command_timeout',
    message: 'There was no response for commands in time .',
    metadata: {},
    type: 'redis'
});

export const E_CONNECT_TIMEOUT = errorRegistry.register({
    name: 'connect_timeout',
    message: 'Timeout while connecting to server.',
    metadata: {},
    type: 'redis'
});

export const E_INVALID_PARAM = errorRegistry.register({
    name: 'invalid_param',
    message: 'The parameters passed to the command is unacceptable.',
    metadata: {},
    type: 'redis'
});

export const E_NOT_MULTI_MODE = errorRegistry.register({
    name: 'not_multi_mode',
    message: 'The client is not under multi mode, please call multi method first.',
    metadata: {},
    type: 'redis'
});
