# Changes Logs

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
