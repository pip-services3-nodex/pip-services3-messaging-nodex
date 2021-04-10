/** @module queues */
import { IReferenceable } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { CompositeLogger } from 'pip-services3-components-nodex';
import { CompositeCounters } from 'pip-services3-components-nodex';
import { ConnectionResolver } from 'pip-services3-components-nodex';
import { CredentialResolver } from 'pip-services3-components-nodex';
import { ConnectionParams } from 'pip-services3-components-nodex';
import { CredentialParams } from 'pip-services3-components-nodex';
import { IMessageQueue } from './IMessageQueue';
import { IMessageReceiver } from './IMessageReceiver';
import { MessagingCapabilities } from './MessagingCapabilities';
import { MessageEnvelope } from './MessageEnvelope';
/**
 * Abstract message queue that is used as a basis for specific message queue implementations.
 *
 * ### Configuration parameters ###
 *
 * - name:                        name of the message queue
 * - connection(s):
 *   - discovery_key:             key to retrieve parameters from discovery service
 *   - protocol:                  connection protocol like http, https, tcp, udp
 *   - host:                      host name or IP address
 *   - port:                      port number
 *   - uri:                       resource URI or connection string with all parameters in it
 * - credential(s):
 *   - store_key:                 key to retrieve parameters from credential store
 *   - username:                  user name
 *   - password:                  user password
 *   - access_id:                 application access id
 *   - access_key:                application secret key
 *
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>           (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:counters:\*:\*:1.0</code>         (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/count.icounters.html ICounters]] components to pass collected measurements
 * - <code>\*:discovery:\*:\*:1.0</code>        (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]] components to discover connection(s)
 * - <code>\*:credential-store:\*:\*:1.0</code> (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/auth.icredentialstore.html ICredentialStore]] componetns to lookup credential(s)
 */
export declare abstract class MessageQueue implements IMessageQueue, IReferenceable, IConfigurable {
    protected _logger: CompositeLogger;
    protected _counters: CompositeCounters;
    protected _connectionResolver: ConnectionResolver;
    protected _credentialResolver: CredentialResolver;
    protected _name: string;
    protected _capabilities: MessagingCapabilities;
    /**
     * Creates a new instance of the message queue.
     *
     * @param name  (optional) a queue name
     * @param capabilities (optional) a capabilities of this message queue
     */
    constructor(name?: string, capabilities?: MessagingCapabilities);
    /**
     * Gets the queue name
     *
     * @returns the queue name.
     */
    getName(): string;
    /**
     * Gets the queue capabilities
     *
     * @returns the queue's capabilities object.
     */
    getCapabilities(): MessagingCapabilities;
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config: ConfigParams): void;
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references: IReferences): void;
    /**
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    abstract isOpen(): boolean;
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    open(correlationId: string): Promise<void>;
    /**
     * Opens the component with given connection and credential parameters.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param connection        connection parameters
     * @param credential        credential parameters
     */
    protected openWithParams(correlationId: string, connections: ConnectionParams[], credential: CredentialParams): Promise<void>;
    /**
     * Checks if the queue has been opened and throws an exception is it's not.
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
    protected checkOpen(correlationId: string): void;
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    abstract close(correlationId: string): Promise<void>;
    /**
     * Clears component state.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    abstract clear(correlationId: string): Promise<void>;
    /**
     * Reads the current number of messages in the queue to be delivered.
     *
     * @returns      a number of messages in the queue.
     */
    abstract readMessageCount(): Promise<number>;
    /**
     * Sends a message into the queue.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param envelope          a message envelop to be sent.
     */
    abstract send(correlationId: string, envelope: MessageEnvelope): Promise<void>;
    /**
     * Sends an object into the queue.
     * Before sending the object is converted into JSON string and wrapped in a [[MessageEnvelope]].
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param messageType       a message type
     * @param value             an object value to be sent
     *
     * @see [[send]]
     */
    sendAsObject(correlationId: string, messageType: string, message: any): Promise<void>;
    /**
     * Peeks a single incoming message from the queue without removing it.
     * If there are no messages available in the queue it returns null.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @returns                 a peeked message or <code>null</code>.
     */
    abstract peek(correlationId: string): Promise<MessageEnvelope>;
    /**
     * Peeks multiple incoming messages from the queue without removing them.
     * If there are no messages available in the queue it returns an empty list.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param messageCount      a maximum number of messages to peek.
     * @returns                 a list of peeked messages
     */
    abstract peekBatch(correlationId: string, messageCount: number): Promise<MessageEnvelope[]>;
    /**
     * Receives an incoming message and removes it from the queue.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param waitTimeout       a timeout in milliseconds to wait for a message to come.
     * @returns                 a received message or <code>null</code>.
     */
    abstract receive(correlationId: string, waitTimeout: number): Promise<MessageEnvelope>;
    /**
     * Renews a lock on a message that makes it invisible from other receivers in the queue.
     * This method is usually used to extend the message processing time.
     *
     * @param message       a message to extend its lock.
     * @param lockTimeout   a locking timeout in milliseconds.
     */
    abstract renewLock(message: MessageEnvelope, lockTimeout: number): Promise<void>;
    /**
     * Permanently removes a message from the queue.
     * This method is usually used to remove the message after successful processing.
     *
     * @param message   a message to remove.
     */
    abstract complete(message: MessageEnvelope): Promise<void>;
    /**
     * Returnes message into the queue and makes it available for all subscribers to receive it again.
     * This method is usually used to return a message which could not be processed at the moment
     * to repeat the attempt. Messages that cause unrecoverable errors shall be removed permanently
     * or/and send to dead letter queue.
     *
     * @param message   a message to return.
     */
    abstract abandon(message: MessageEnvelope): Promise<void>;
    /**
     * Permanently removes a message from the queue and sends it to dead letter queue.
     *
     * @param message   a message to be removed.
     */
    abstract moveToDeadLetter(message: MessageEnvelope): Promise<void>;
    /**
     * Listens for incoming messages and blocks the current thread until queue is closed.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param receiver          a receiver to receive incoming messages.
     *
     * @see [[IMessageReceiver]]
     * @see [[receive]]
     */
    abstract listen(correlationId: string, receiver: IMessageReceiver): void;
    /**
     * Ends listening for incoming messages.
     * When this method is call [[listen]] unblocks the thread and execution continues.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
    abstract endListen(correlationId: string): void;
    /**
     * Listens for incoming messages without blocking the current thread.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param receiver          a receiver to receive incoming messages.
     *
     * @see [[listen]]
     * @see [[IMessageReceiver]]
     */
    beginListen(correlationId: string, receiver: IMessageReceiver): void;
    /**
     * Gets a string representation of the object.
     *
     * @returns a string representation of the object.
     */
    toString(): string;
}
