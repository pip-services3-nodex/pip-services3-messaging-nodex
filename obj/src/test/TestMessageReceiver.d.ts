/** @module test */
import { ICleanable } from 'pip-services3-commons-nodex';
import { IMessageReceiver } from '../queues/IMessageReceiver';
import { IMessageQueue } from '../queues/IMessageQueue';
import { MessageEnvelope } from '../queues/MessageEnvelope';
export declare class TestMessageReceiver implements IMessageReceiver, ICleanable {
    private _messages;
    constructor();
    /**
     * Gets the list of received messages.
     */
    get messages(): MessageEnvelope[];
    /**
     * Gets the received message count.
     */
    get messageCount(): number;
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
    /**
     * Clears all received messagers.
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
    clear(correlationId: string): Promise<void>;
}
