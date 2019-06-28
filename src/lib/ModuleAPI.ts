import { Decoder } from "./Decoder";
import { Encoder } from "./Encoder";
import { ProtocolClient } from "./ProtocolClient";
import { CommandClient } from "./CommandClient";
import { SubscriberClient } from "./Subscriber";
import * as C from "./Common";
import { DEFUALT_PORT } from "./Constants";

export function createDecoder(): C.IDecoder {

    return new Decoder();
}

export function createEncoder(): C.IEncoder {

    return new Encoder();
}

export function createCommandClient(
    host: string,
    port: number = DEFUALT_PORT,
    decoder: C.IDecoder = createDecoder(),
    encoder: C.IEncoder = createEncoder()
): C.ICommandClient {

    return new CommandClient(
        host,
        port,
        decoder,
        encoder
    );
}

export function createProtocolClient(
    host: string,
    port: number = DEFUALT_PORT,
    decoder: C.IDecoder = createDecoder(),
    encoder: C.IEncoder = createEncoder()
): C.IProtocolClient {

    return new ProtocolClient(
        host,
        port,
        decoder,
        encoder
    );
}

export function createSubscriberClient(
    host: string,
    port: number = DEFUALT_PORT,
    decoder: C.IDecoder = createDecoder(),
    encoder: C.IEncoder = createEncoder()
): C.ISubscriberClient {

    return new SubscriberClient(
        host,
        port,
        decoder,
        encoder
    );
}
