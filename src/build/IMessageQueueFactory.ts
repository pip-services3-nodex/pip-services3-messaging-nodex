/** @module build */
import { IMessageQueue } from '../queues/IMessageQueue';

/**
 * Creates message queue componens.
 * 
 * @see [[IMessageQueue]]
 */
export interface IMessageQueueFactory {
    /**
     * Creates a message queue component and assigns its name.
     * @param name a name of the created message queue.
     */
    createQueue(name: string): IMessageQueue;
}