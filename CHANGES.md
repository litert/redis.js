# Changes Logs

## v3.0.5

- fix(command): fixed optional step for `INCR-like` commands.

## v3.0.4

- fix(protocol): ensure writing network and queue in sync, avoiding disorder of execution queue.

## v3.0.3

- fix(command): Return keys in `HMGET` command correctly.
- fix(protocol): decode `*-1` correctly
- feat(command): added lmove and blmove commands

## v3.0.2

- fix(command): Incorrect preprocessing of arguments for `SREM` command.
- feat(command): Added basic supports for `ZADD`, `ZREM`, `ZRANGE` commands.
- fix(docs): Fixed the links to the command documents.
- build(test): Initialized test flows.

## v3.0.1

- fix(docs): fixed comments.

## v3.0.0

- build(deps): dropped `@litert/exception` and `@litert/observable`.

## v2.0.2

- fix(command): fixed command `lpop` and `rpop`.

## v2.0.1

- fix(connection): refactored connection management

    - Not use internal reconnection anymore. Instead, if a connection dead, redis.js will try
    reconnect only when a command requested. *Except for subscriber clients.*
    - Disabled command timeout **by default**.

- fix(protocol): fixed empty list like `*-1<CR><LF>`.
- fix(command): fixed command `LPOP`/`RPOP` with 2nd argument `count`.
- fix(command): fixed command `MOVE`.
- feat(command): added command `COPY` supports.
- feat(command): added command `SWAPDB` supports.
- feat(command): added command `TIME` supports with methods `time`, `secTime`, `msTime`, `usTime`.
- feat(command): added ACL user supports to command `AUTH`.

## v1.2.4

- feat(command): added command `HRANDFILED` supports.
- feat(command): added `count` param of command `R/LPOP`.
- feat(command): added command `GETEX` supports.
- feat(command): added command `GETDEL` supports.

## v1.2.3

- fix(connection): select previous database if reconnected.

## v1.2.2

- config(deps): replaced exception mechanism with `@litert/exception`.

## v1.2.1

- fix(command): fixed the return value of EXISTS command.

## v1.2.0

- Added following command methods:

    - `mExists`
    - `eval`
    - `evalSHA`
    - `scriptLoad`
    - `scriptFlush`
    - `scriptKill`
    - `scriptExists`
    - `scriptDebug`

## v1.1.0

- Fixed the watch mode with a new `WatchClient` class.
- Replaced TSLint with ESLint.

## v1.0.3

- Fixed: The pipeline doesn't switch database following the parent client.

## v1.0.2

- Migrate deps from `@litert/events` to `@litert/observable`.

## v1.0.1

- Refactored the code to improve the performance and maintainability.

## v0.1.8

- Removed KEEP-ALIVE.

## v0.1.7

- Added keep-alive for clients.

## v0.1.6

- Auto switch to the selected database.

## v0.1.5

- Updated the dependency @litert/core to v0.6.0.

## v0.1.4

- Updated the dependency @litert/core to v0.5.0.

## v0.1.3

- Remove subscriber authentication when no password is required.

## v0.1.2

- Fixed the decoder error when reading half length of buffer.

## v0.1.1

- Achieved the listen mode for subscriber.
