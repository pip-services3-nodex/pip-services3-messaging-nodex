"use strict";
/** @module test */
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
exports.TestMessageReceiver = void 0;
class TestMessageReceiver {
    constructor() {
        this._messages = [];
    }
    /**
     * Gets the list of received messages.
     */
    get messages() {
        return this._messages;
    }
    /**
     * Gets the received message count.
     */
    get messageCount() {
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
    receiveMessage(envelope, queue) {
        return __awaiter(this, void 0, void 0, function* () {
            this._messages.push(envelope);
        });
    }
    /**
     * Clears all received messagers.
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
    clear(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._messages = [];
        });
    }
}
exports.TestMessageReceiver = TestMessageReceiver;
//# sourceMappingURL=TestMessageReceiver.js.map