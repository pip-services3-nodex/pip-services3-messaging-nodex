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
exports.CallbackMessageReceiver = void 0;
/**
 * Wraps message callback into IMessageReceiver
 */
class CallbackMessageReceiver {
    /**
     * Creates an instance of the CallbackMessageReceiver.
     * @param callback a callback function that shall be wrapped into IMessageReceiver
     */
    constructor(callback) {
        if (callback == null) {
            throw new Error("Callback cannot be null");
        }
        this._callback = callback;
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
            this._callback(envelope, queue);
        });
    }
}
exports.CallbackMessageReceiver = CallbackMessageReceiver;
//# sourceMappingURL=CallbackMessageReceiver.js.map