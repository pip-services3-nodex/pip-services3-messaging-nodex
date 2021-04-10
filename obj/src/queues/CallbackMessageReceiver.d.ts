/** @module queues */
import { IMessageQueue } from './IMessageQueue';
import { MessageEnvelope } from './MessageEnvelope';
import { IMessageReceiver } from './IMessageReceiver';
/**
 * Wraps message callback into IMessageReceiver
 */
export declare class CallbackMessageReceiver implements IMessageReceiver {
    private _callback;
    /**
     * Creates an instance of the CallbackMessageReceiver.
     * @param callback a callback function that shall be wrapped into IMessageReceiver
     */
    constructor(callback: (envelope: MessageEnvelope, queue: IMessageQueue) => Promise<void>);
    /**
     * Receives incoming message from the queue.
     *
     * @param envelope  an incoming message
     * @param queue     a queue where the message comes from
     *
     * @see [[MessageEnvelope]]
     * @see [[IMessageQueue]]
     */
    receiveMessage(envelope: MessageEnvelope, queue: IMessageQueue): Promise<void>;
}
