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
exports.CachedMessageQueue = void 0;
const MessageQueue_1 = require("./MessageQueue");
/**
 * Message queue that caches received messages in memory to allow peek operations
 * that may not be supported by the undelying queue.
 *
 * This queue is users as a base implementation for other queues
 */
class CachedMessageQueue extends MessageQueue_1.MessageQueue {
    /**
     * Creates a new instance of the persistence component.
     *
     * @param name  (optional) a queue name
     * @param capabilities (optional) a capabilities of this message queue
     */
    constructor(name, capabilities) {
        super(name, capabilities);
        this._messages = [];
    }
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        super.configure(config);
        this._autoSubscribe = config.getAsBooleanWithDefault("options.autosubscribe", this._autoSubscribe);
    }
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    open(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isOpen()) {
                return;
            }
            try {
                if (this._autoSubscribe) {
                    yield this.subscribe(correlationId);
                }
                this._logger.debug(correlationId, "Opened queue " + this.getName());
            }
            catch (ex) {
                yield this.close(correlationId);
            }
        });
    }
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isOpen()) {
                return;
            }
            try {
                // Unsubscribe from the broker
                yield this.unsubscribe(correlationId);
            }
            finally {
                this._messages = [];
                this._receiver = null;
            }
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
        });
    }
    /**
     * Reads the current number of messages in the queue to be delivered.
     *
     * @returns       a number of messages in the queue.
     */
    readMessageCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._messages.length;
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
            this.checkOpen(correlationId);
            // Subscribe to topic if needed
            yield this.subscribe(correlationId);
            // Peek a message from the top
            let message = null;
            if (this._messages.length > 0) {
                message = this._messages[0];
            }
            if (message != null) {
                this._logger.trace(message.correlation_id, "Peeked message %s on %s", message, this.getName());
            }
            return message;
        });
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
    peekBatch(correlationId, messageCount) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkOpen(correlationId);
            // Subscribe to topic if needed
            yield this.subscribe(correlationId);
            // Peek a batch of messages
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
            this.checkOpen(correlationId);
            // Subscribe to topic if needed
            yield this.subscribe(correlationId);
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
            return message;
        });
    }
    sendMessageToReceiver(receiver, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let correlationId = message != null ? message.correlation_id : null;
            if (message == null || receiver == null) {
                this._logger.warn(correlationId, "Message was skipped.");
                return;
            }
            try {
                yield this._receiver.receiveMessage(message, this);
            }
            catch (ex) {
                this._logger.error(correlationId, ex, "Failed to process the message");
            }
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
        if (!this.isOpen()) {
            return;
        }
        let listenFunc = () => __awaiter(this, void 0, void 0, function* () {
            // Subscribe to topic if needed
            yield this.subscribe(correlationId);
            this._logger.trace(null, "Started listening messages at %s", this.getName());
            // Resend collected messages to receiver
            while (this.isOpen() && this._messages.length > 0) {
                let message = this._messages.shift();
                if (message != null) {
                    yield this.sendMessageToReceiver(receiver, message);
                }
            }
            // Set the receiver
            if (this.isOpen()) {
                this._receiver = receiver;
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
        this._receiver = null;
    }
}
exports.CachedMessageQueue = CachedMessageQueue;
//# sourceMappingURL=CachedMessageQueue.js.map