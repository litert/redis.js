/**
 * Copyright 2024 Angus.Fenying <fenying@litert.org>
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

export const PROTO_DELIMITER_VALUE: string = '\r\n';

export const PROTO_DELIMITER: Buffer = Buffer.from(PROTO_DELIMITER_VALUE);

export const PROTO_NULL: Buffer = Buffer.from(`$-1${PROTO_DELIMITER_VALUE}`);

export const DEFAULT_PORT = 6379;

export const DEFAULT_HOST = '127.0.0.1';

export const DEFAULT_COMMAND_TIMEOUT = 0;

export const DEFAULT_CONNECT_TIMEOUT = 30_000;

export const DEFAULT_QUEUE_SIZE = 1024 * 1024;

export const DEFAULT_ACTION_ON_QUEUE_FULL = 'error';
