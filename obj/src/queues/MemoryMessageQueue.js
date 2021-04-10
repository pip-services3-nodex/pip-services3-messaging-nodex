"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryMessageQueue = void 0;
const MessageQueue_1 = require("./MessageQueue");
const MessagingCapabilities_1 = require("./MessagingCapabilities");
const LockedMessage_1 = require("./LockedMessage");
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
class MemoryMessageQueue extends MessageQueue_1.MessageQueue {
    /**
     * Creates a new instance of the message queue.
     *
     * @param name  (optional) a queue name.
     *
     * @see [[MessagingCapabilities]]
     */
    constructor(name) {
        super(name);
        this._messages = [];
        this._lockTokenSequence = 0;
        this._lockedMessages = {};
        this._opened = false;
        /** Used to stop the listening process. */
        this._cancel = false;
        this._listenInterval = 1000;
        this._capabilities = new MessagingCapabilities_1.MessagingCapabilities(true, true, true, true, true, true, true, false, true);
    }
    /**
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    isOpen() {
        return this._opened;
    }
    /**
     * Opens the component with given connection and credential parameters.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param connections        connection parameters
     * @param credential        credential parameters
     */
    openWithParams(correlationId, connections, credential) {
        return __awaiter(this, void 0, void 0, function* () {
            this._opened = true;
        });
    }
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._opened = false;
            this._cancel = true;
            this._logger.trace(correlationId, "Closed queue %s", this);
        });
    }
    /**
     * Clears component state.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    clear(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._messages = [];
            this._lockedMessages = {};
            this._cancel = false;
        });
    }
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        super.configure(config);
        this._listenInterval = config.getAsIntegerWithDefault('listen_interval', this._listenInterval);
        this._listenInterval = config.getAsIntegerWithDefault('options.listen_interval', this._listenInterval);
    }
    /**
     * Reads the current number of messages in the queue to be delivered.
     *
     * @returns     a number of messages in the queue.
     */
    readMessageCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messages.length;
        });
    }
    /**
     * Sends a message into the queue.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param envelope          a message envelop to be sent.
     */
    send(correlationId, envelope) {
        return __awaiter(this, void 0, void 0, function* () {
            envelope.sent_time = new Date();
            // Add message to the queue
            this._messages.push(envelope);
            this._counters.incrementOne("queue." + this.getName() + ".sent_messages");
            this._logger.debug(envelope.correlation_id, "Sent message %s via %s", envelope.toString(), this.getName());
        });
    }
    /**
     * Peeks a single incoming message from the queue without removing it.
     * If there are no messages available in the queue it returns null.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @returns                 a peeked message or <code>null</code>.
     */
    peek(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            let message = null;
            // Pick a message
            if (this._messages.length > 0)
                message = this._messages[0];
            if (message != null)
                this._logger.trace(message.correlation_id, "Peeked message %s on %s", message, this.getName());
            return message;
        });
    }
    /**
     * Peeks multiple incoming messages from the queue without removing them.
     * If there are no messages available in the queue it returns an empty list.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param messageCount      a maximum number of messages to peek.
     * @returns                 a list with peeked messages.
     */
    peekBatch(correlationId, messageCount) {
        return __awaiter(this, void 0, void 0, function* () {
            let messages = this._messages.slice(0, messageCount);
            this._logger.trace(correlationId, "Peeked %d messages on %s", messages.length, this.getName());
            return messages;
        });
    }
    /**
     * Receives an incoming message and removes it from the queue.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param waitTimeout       a timeout in milliseconds to wait for a message to come.
     * @returns                 a received message or <code>null</code>.
     */
    receive(correlationId, waitTimeout) {
        return __awaiter(this, void 0, void 0, function* () {
            let checkIntervalMs = 100;
            let elapsedTime = 0;
            // Get message the the queue
            let message = this._messages.shift();
            while (elapsedTime < waitTimeout && message == null) {
                // Wait for a while
                yield new Promise((resolve, reject) => { setTimeout(resolve, checkIntervalMs); });
                elapsedTime += checkIntervalMs;
                // Get message the the queue
                message = this._messages.shift();
            }
            if (message == null) {
                return message;
            }
            // Generate and set locked token
            let lockedToken = this._lockTokenSequence++;
            message.setReference(lockedToken);
            // Add messages to locked messages list
            let lockedMessage = new LockedMessage_1.LockedMessage();
            let now = new Date();
            now.setMilliseconds(now.getMilliseconds() + waitTimeout);
            lockedMessage.expirationTime = now;
            lockedMessage.message = message;
            lockedMessage.timeout = waitTimeout;
            this._lockedMessages[lockedToken] = lockedMessage;
            // Instrument the process
            this._counters.incrementOne("queue." + this.getName() + ".received_messages");
            this._logger.debug(message.correlation_id, "Received message %s via %s", message, this.getName());
            return message;
        });
    }
    /**
     * Renews a lock on a message that makes it invisible from other receivers in the queue.
     * This method is usually used to extend the message processing time.
     *
     * @param message       a message to extend its lock.
     * @param lockTimeout   a locking timeout in milliseconds.
     */
    renewLock(message, lockTimeout) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.getReference() == null) {
                return;
            }
            // Get message from locked queue
            let lockedToken = message.getReference();
            let lockedMessage = this._lockedMessages[lockedToken];
            // If lock is found, extend the lock
            if (lockedMessage) {
                let now = new Date();
                // Todo: Shall we skip if the message already expired?
                if (lockedMessage.expirationTime > now) {
                    now.setMilliseconds(now.getMilliseconds() + lockedMessage.timeout);
                    lockedMessage.expirationTime = now;
                }
            }
            this._logger.trace(message.correlation_id, "Renewed lock for message %s at %s", message, this.getName());
        });
    }
    /**
     * Permanently removes a message from the queue.
     * This method is usually used to remove the message after successful processing.
     *
     * @param message   a message to remove.
     */
    complete(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.getReference() == null) {
                return;
            }
            let lockKey = message.getReference();
            delete this._lockedMessages[lockKey];
            message.setReference(null);
            this._logger.trace(message.correlation_id, "Completed message %s at %s", message, this.getName());
        });
    }
    /**
     * Returnes message into the queue and makes it available for all subscribers to receive it again.
     * This method is usually used to return a message which could not be processed at the moment
     * to repeat the attempt. Messages that cause unrecoverable errors shall be removed permanently
     * or/and send to dead letter queue.
     *
     * @param message   a message to return.
     */
    abandon(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.getReference() == null) {
                return;
            }
            // Get message from locked queue
            let lockedToken = message.getReference();
            let lockedMessage = this._lockedMessages[lockedToken];
            if (lockedMessage) {
                // Remove from locked messages
                delete this._lockedMessages[lockedToken];
                message.setReference(null);
                // Skip if it is already expired
                if (lockedMessage.expirationTime <= new Date()) {
                    return;
                }
            }
            // Skip if it absent
            else {
                return;
            }
            this._logger.trace(message.correlation_id, "Abandoned message %s at %s", message, this.getName());
            yield this.send(message.correlation_id, message);
        });
    }
    /**
     * Permanently removes a message from the queue and sends it to dead letter queue.
     *
     * @param message   a message to be removed.
     */
    moveToDeadLetter(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.getReference() == null) {
                return;
            }
            let lockedToken = message.getReference();
            delete this._lockedMessages[lockedToken];
            message.setReference(null);
            this._counters.incrementOne("queue." + this.getName() + ".dead_messages");
            this._logger.trace(message.correlation_id, "Moved to dead message %s at %s", message, this.getName());
        });
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
    listen(correlationId, receiver) {
        let listenFunc = () => __awaiter(this, void 0, void 0, function* () {
            let timeoutInterval = this._listenInterval;
            this._logger.trace(null, "Started listening messages at %s", this.toString());
            this._cancel = false;
            while (!this._cancel) {
                try {
                    let message = yield this.receive(correlationId, timeoutInterval);
                    if (message != null && !this._cancel) {
                        yield receiver.receiveMessage(message, this);
                    }
                }
                catch (ex) {
                    this._logger.error(correlationId, ex, "Failed to process the message");
                }
            }
        });
        listenFunc();
    }
    /**
     * Ends listening for incoming messages.
     * When this method is call [[listen]] unblocks the thread and execution continues.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
    endListen(correlationId) {
        this._cancel = true;
    }
}
exports.MemoryMessageQueue = MemoryMessageQueue;
//# sourceMappingURL=MemoryMessageQueue.js.map