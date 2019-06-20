import * as $Events from "@litert/events";

export type TStringValue = string | Buffer;

export type TResponseType<
    T extends "list" | "string" | "integer" | "message",
    E
> =
    T extends "list" ? E[] :
    T extends "string" ? string | Buffer :
    T extends "integer" ? number : string;

export interface IProtocolClientEvents extends $Events.ICallbackDefinitions {

    aborted(e: unknown): void;

    ready(): void;

    close(): void;
}

export interface ICallbackA<R = any, E = any> {
    (err?: E): void;
    (err: null, result: R): void;
}

export enum EClientStatus {

    IDLE,
    READY,
    CONNECTING,
    CLOSING
}

/**
 * The client only provides the basic connection and communication over Redis
 * protocol.
 */
export interface IProtocolClient extends $Events.IObservable<IProtocolClientEvents> {

    readonly status: EClientStatus;

    connect(): Promise<void>;

    connect(callback: ICallbackA<void>): void;

    shutdown(): Promise<void>;

    shutdown(callback: ICallbackA<void>): void;

    command(cmd: string, args: TStringValue[]): Promise<any>;

    command(cmd: string, args: TStringValue[], callback: ICallbackA): void;
}

export enum DataType {

    /**
     * The type of byte-string.
     */
    STRING,

    /**
     * The type of list.
     */
    LIST,

    /**
     * The type of message.
     */
    MESSAGE,

    /**
     * The type of failure.
     */
    FAILURE,

    /**
     * The type of integer.
     */
    INTEGER,

    /**
     * The type of null.
     */
    NULL
}

export type ListItem<T = any> = [
    DataType, T
];

/**
 * This interface describes the structure of a Redis protocol encoder.
 */
export interface IEncoder {

    /**
     * Encode the NULL.
     */
    encodeNull(): Buffer;

    /**
     * Encode a command request into a binary chunk.
     *
     * @param cmd       The name of COMMAND to be encoded.
     * @param args      The arguments of the command to be encoded.
     */
    encodeCommand(cmd: string | Buffer, args?: Array<string | Buffer>): Buffer;

    /**
     * Encode a binary-string into a string chunk.
     *
     * @param data      The data to be encoded.
     */
    encodeString(data: string | Buffer): Buffer;

    /**
     * Encode a message into a message chunk.
     *
     * @param data      The message to be encoded.
     */
    encodeMessage(data: string | Buffer): Buffer;

    /**
     * Encode a message into a integer chunk.
     *
     * @param val       The integer to be encoded.
     */
    encodeInteger(val: number): Buffer;

    /**
     * Encode a list into a list chunk.
     *
     * @param data      The list to be encoded.
     */
    encodeList(data: ListItem[]): Buffer;
}

export interface IDecoderEvents extends $Events.ICallbackDefinitions {

    data(type: DataType, data: any): void;
}

export interface IDecoder extends $Events.IObservable<IDecoderEvents> {

    /**
     * Reset the decoder.
     */
    reset(): this;

    /**
     * Write data to the decoding stream.
     *
     * @param data      The new data to be decoded.
     */
    update(data: Buffer): this;
}
