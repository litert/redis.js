import * as Redis from "../lib";

let cmdCli!: Redis.ICommandClient;

export async function getCommandClinet(): Redis.ICommandClient {

    if (!cmdCli) {

        cmdCli = Redis.createCommandClient()
    }
}
