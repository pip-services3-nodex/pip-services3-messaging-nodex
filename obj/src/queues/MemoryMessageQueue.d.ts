/** @module queues */
import { ConnectionParams } from 'pip-services3-components-nodex';
import { CredentialParams } from 'pip-services3-components-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { IMessageReceiver } from './IMessageReceiver';
import { MessageQueue } from './MessageQueue';
import { MessageEnvelope } from './MessageEnvelope';
/**
 * Message queue that sends and receives messages within the same process by using shared memory.
 *
 * This queue is typically used for testing to mock real queues.
 *
 * ### Configuration parameters ###
 *
 * - name:                        name of the message queue
 *
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>           (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:counters:\*:\*:1.0</code>         (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/count.icounters.html ICounters]] components to pass collected measurements
 *
 * @see [[MessageQueue]]
 * @see [[MessagingCapabilities]]
 *
 * ### Example ###
 *
 *     let queue = new MessageQueue("myqueue");
 *
 *     await queue.send("123", new MessageEnvelop(null, "mymessage", "ABC"));
 *
 *     let message = await queue.receive("123");
 *     if (message != null) {
 *        ...
 *        await queue.complete("123", message);
 *     }
 */
export declare class MemoryMessageQueue extends MessageQueue {
    private _messages;
    private _lockTokenSequence;
    private _lockedMessages;
    private _opened;
    /** Used to stop the listening process. */
    private _cancel;
    private _listenInterval;
    /**
     * Creates a new instance of the message queue.
     *
     * @param name  (optional) a queue name.
     *
     * @see [[MessagingCapabilities]]
     */
    constructor(name?: string);
    /**
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    isOpen(): boolean;
    /**
     * Opens the component with given connection and credential parameters.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param connections        connection parameters
     * @param credential        credential parameters
     */
    protected openWithParams(correlationId: string, connections: ConnectionParams[], credential: CredentialParams): Promise<void>;
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    close(correlationId: string): Promise<void>;
    /**
     * Clears component state.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    clear(correlationId: string): Promise<void>;
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config: ConfigParams): void;
    /**
     * Reads the current number of messages in the queue to be delivered.
     *
     * @returns     a number of messages in the queue.
     */
    readMessageCount(): Promise<number>;
    /**
     * Sends a message into the queue.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param envelope          a message envelop to be sent.
     */
    send(correlationId: string, envelope: MessageEnvelope): Promise<void>;
    /**
     * Peeks a single incoming message from the queue without removing it.
     * If there are no messages available in the queue it returns null.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @returns                 a peeked message or <code>null</code>.
     */
    peek(correlationId: string): Promise<MessageEnvelope>;
    /**
     * Peeks multiple incoming messages from the queue without removing them.
     * If there are no messages available in the queue it returns an empty list.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param messageCount      a maximum number of messages to peek.
     * @returns                 a list with peeked messages.
     */
    peekBatch(correlationId: string, messageCount: number): Promise<MessageEnvelope[]>;
    /**
     * Receives an incoming message and removes it from the queue.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param waitTimeout       a timeout in milliseconds to wait for a message to come.
     * @returns                 a received message or <code>null</code>.
     */
    receive(correlationId: string, waitTimeout: number): Promise<MessageEnvelope>;
    /**
     * Renews a lock on a message that makes it invisible from other receivers in the queue.
     * This method is usually used to extend the message processing time.
     *
     * @param message       a message to extend its lock.
     * @param lockTimeout   a locking timeout in milliseconds.
     */
    renewLock(message: MessageEnvelope, lockTimeout: number): Promise<void>;
    /**
     * Permanently removes a message from the queue.
     * This method is usually used to remove the message after successful processing.
     *
     * @param message   a message to remove.
     */
    complete(message: MessageEnvelope): Promise<void>;
    /**
     * Returnes message into the queue and makes it available for all subscribers to receive it again.
     * This method is usually used to return a message which could not be processed at the moment
     * to repeat the attempt. Messages that cause unrecoverable errors shall be removed permanently
     * or/and send to dead letter queue.
     *
     * @param message   a message to return.
     */
    abandon(message: MessageEnvelope): Promise<void>;
    /**
     * Permanently removes a message from the queue and sends it to dead letter queue.
     *
     * @param message   a message to be removed.
     */
    moveToDeadLetter(message: MessageEnvelope): Promise<void>;
    /**
     * Listens for incoming messages and blocks the current thread until queue is closed.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param receiver          a receiver to receive incoming messages.
     *
     * @see [[IMessageReceiver]]
     * @see [[receive]]
     */
    listen(correlationId: string, receiver: IMessageReceiver): void;
    /**
     * Ends listening for incoming messages.
     * When this method is call [[listen]] unblocks the thread and execution continues.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
    endListen(correlationId: string): void;
}
