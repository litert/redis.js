import { Decoder } from "./Decoder";
import { Encoder } from "./Encoder";
import { ProtocolClient } from "./ProtocolClient";
import * as C from "./Common";
import { DEFUALT_PORT } from "./Constants";

export function createDecoder(): C.IDecoder {

    return new Decoder();
}

export function createEncoder(): C.IEncoder {

    return new Encoder();
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


