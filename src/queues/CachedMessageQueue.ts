/** @module queues */
import { ICleanable } from 'pip-services3-commons-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';

import { IMessageReceiver } from './IMessageReceiver';
import { MessageQueue } from './MessageQueue';
import { MessagingCapabilities } from './MessagingCapabilities';
import { MessageEnvelope } from './MessageEnvelope';

/**
 * Message queue that caches received messages in memory to allow peek operations
 * that may not be supported by the undelying queue.
 *  
 * This queue is users as a base implementation for other queues
 */
export abstract class CachedMessageQueue extends MessageQueue implements ICleanable {
    protected _autoSubscribe: boolean;
    protected _messages: MessageEnvelope[] = [];
    protected _receiver: IMessageReceiver;

    /**
     * Creates a new instance of the persistence component.
     * 
     * @param name  (optional) a queue name
     * @param capabilities (optional) a capabilities of this message queue
     */
    public constructor(name?: string, capabilities?: MessagingCapabilities) {
        super(name, capabilities);
    }

    /**
     * Configures component by passing configuration parameters.
     * 
     * @param config    configuration parameters to be set.
     */
    public configure(config: ConfigParams): void {
        super.configure(config);

        this._autoSubscribe = config.getAsBooleanWithDefault("options.autosubscribe", this._autoSubscribe);
    }

    /**
	 * Opens the component.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    public async open(correlationId: string): Promise<void> {
    	if (this.isOpen()) {
            return;
        }

        try {
            if (this._autoSubscribe) {
                await this.subscribe(correlationId);
            }

            this._logger.debug(correlationId, "Opened queue " + this.getName());
        } catch (ex) {
            await this.close(correlationId);
        }
    }

    /**
	 * Closes component and frees used resources.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    public async close(correlationId: string): Promise<void> {
    	if (!this.isOpen()) {
            return;
        }

        try {
            // Unsubscribe from the broker
            await this.unsubscribe(correlationId);
        } finally {
            this._messages = [];
            this._receiver = null;
        }
    }

    /**
     * Subscribes to the message broker.
     * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    protected abstract subscribe(correlationId: string): Promise<void>;

    /**
     * Unsubscribes from the message broker.
     * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    protected abstract unsubscribe(correlationId: string): Promise<void>;

    /**
	 * Clears component state.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    public async clear(correlationId: string): Promise<void> {
        this._messages = [];
    }

    /**
     * Reads the current number of messages in the queue to be delivered.
     * 
     * @returns       a number of messages in the queue.
     */
    public async readMessageCount(): Promise<number> {
        return this._messages.length;
    }

    /**
     * Peeks a single incoming message from the queue without removing it.
     * If there are no messages available in the queue it returns null.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @returns                 a peeked message or <code>null</code>.
     */
     public async peek(correlationId: string): Promise<MessageEnvelope> {
        this.checkOpen(correlationId);

        // Subscribe to topic if needed
        await this.subscribe(correlationId);

        // Peek a message from the top
        let message: MessageEnvelope = null;
        if (this._messages.length > 0) {
            message = this._messages[0];
        }

        if (message != null) {
            this._logger.trace(message.correlation_id, "Peeked message %s on %s", message, this.getName());
        }
    
        return message;
    }

    /**
     * Peeks multiple incoming messages from the queue without removing them.
     * If there are no messages available in the queue it returns an empty list.
     * 
     * Important: This method is not supported by MQTT.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param messageCount      a maximum number of messages to peek.
     * @returns                 a list with peeked messages.
     */
    public async peekBatch(correlationId: string, messageCount: number): Promise<MessageEnvelope[]> {
        this.checkOpen(correlationId);

        // Subscribe to topic if needed
        await this.subscribe(correlationId);

        // Peek a batch of messages
        let messages = this._messages.slice(0, messageCount);

        this._logger.trace(correlationId, "Peeked %d messages on %s", messages.length, this.getName());

        return messages;
    }

    /**
     * Receives an incoming message and removes it from the queue.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param waitTimeout       a timeout in milliseconds to wait for a message to come.
     * @returns                 a received message or <code>null</code>.
     */
    public async receive(correlationId: string, waitTimeout: number): Promise<MessageEnvelope> {
        this.checkOpen(correlationId);
        
        // Subscribe to topic if needed
        await this.subscribe(correlationId);

        let checkIntervalMs = 100;
        let elapsedTime = 0;

        // Get message the the queue
        let message = this._messages.shift();

        while (elapsedTime < waitTimeout && message == null) {
            // Wait for a while
            await new Promise((resolve, reject) => { setTimeout(resolve, checkIntervalMs); });
            elapsedTime += checkIntervalMs;

            // Get message the the queue
            message = this._messages.shift();
        }

        return message;
    }

    protected async sendMessageToReceiver(receiver: IMessageReceiver, message: MessageEnvelope): Promise<void> {
        let correlationId = message != null ? message.correlation_id : null;
        if (message == null || receiver == null) {
            this._logger.warn(correlationId, "Message was skipped.");
            return;
        }

        try {
            await this._receiver.receiveMessage(message, this);
        } catch (ex) {
            this._logger.error(correlationId, ex, "Failed to process the message");
        }
    }

     /**
     * Listens for incoming messages and blocks the current thread until queue is closed.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param receiver          a receiver to receive incoming messages.
     * 
     * @see [[IMessageReceiver]]
     * @see [[receive]]
     */
    public listen(correlationId: string, receiver: IMessageReceiver): void {
        if (!this.isOpen()) {
            return;
        }

        let listenFunc = async () => {
            // Subscribe to topic if needed
            await this.subscribe(correlationId);

            this._logger.trace(null, "Started listening messages at %s", this.getName());

            // Resend collected messages to receiver
            while(this.isOpen() && this._messages.length > 0) {
                let message = this._messages.shift();
                if (message != null) {
                    await this.sendMessageToReceiver(receiver, message);
                }
            }

            // Set the receiver
            if (this.isOpen()) {
                this._receiver = receiver;
            }
        };        
        listenFunc();
    }

    /**
     * Ends listening for incoming messages.
     * When this method is call [[listen]] unblocks the thread and execution continues.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
    public endListen(correlationId: string): void {
        this._receiver = null;
    }   
}