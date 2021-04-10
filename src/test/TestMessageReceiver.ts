/** @module test */

import { ICleanable } from 'pip-services3-commons-nodex';

import { IMessageReceiver } from '../queues/IMessageReceiver';
import { IMessageQueue } from '../queues/IMessageQueue';
import { MessageEnvelope } from '../queues/MessageEnvelope';

export class TestMessageReceiver implements IMessageReceiver, ICleanable {
    private _messages: MessageEnvelope[] = [];

    constructor() {}

    /**
     * Gets the list of received messages.
     */
    public get messages(): MessageEnvelope[] {
        return this._messages;
    }

    /**
     * Gets the received message count.
     */
    public get messageCount(): number {
        return this._messages.length;
    }

    /**
     * Receives incoming message from the queue.
     * 
     * @param envelope  an incoming message
     * @param queue     a queue where the message comes from
     * 
     * @see [[MessageEnvelope]]
     * @see [[IMessageQueue]]
     */
    public async receiveMessage(envelope: MessageEnvelope, queue: IMessageQueue): Promise<void> {
        this._messages.push(envelope);
    }

    /**
     * Clears all received messagers.
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
    public async clear(correlationId: string): Promise<void> {
        this._messages = [];
    }
}