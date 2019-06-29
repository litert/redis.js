import { Decoder } from "./Decoder";
import { Encoder } from "./Encoder";
import { ProtocolClient } from "./ProtocolClient";
import { CommandClient } from "./CommandClient";
import { PipelineClient } from "./PipelineClient";
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
    decoder: C.TDecoderFactory = createDecoder,
    encoder: C.TEncoderFactory = createEncoder
): C.ICommandClient {

    return new CommandClient(
        host,
        port,
        decoder,
        encoder
    ) as any as C.ICommandClient;
}

export function createPipelineClient(
    host: string,
    port: number = DEFUALT_PORT,
    decoder: C.TDecoderFactory = createDecoder,
    encoder: C.TEncoderFactory = createEncoder
): C.IPipelineClient {

    return new PipelineClient(
        host,
        port,
        decoder,
        encoder
    ) as any as C.IPipelineClient;
}

export function createProtocolClient(
    host: string,
    port: number = DEFUALT_PORT,
    decoder: C.TDecoderFactory = createDecoder,
    encoder: C.TEncoderFactory = createEncoder
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
    decoder: C.TDecoderFactory = createDecoder,
    encoder: C.TEncoderFactory = createEncoder
): C.ISubscriberClient {

    return new SubscriberClient(
        host,
        port,
        decoder,
        encoder
    );
}
