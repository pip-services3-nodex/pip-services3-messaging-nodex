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
exports.MessageQueueFixture = void 0;
const assert = require('chai').assert;
const MessageEnvelope_1 = require("../../src/queues/MessageEnvelope");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const TestMessageReceiver_1 = require("../../src/test/TestMessageReceiver");
class MessageQueueFixture {
    constructor(queue) {
        this._queue = queue;
    }
    testSendReceiveMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            let envelope1 = new MessageEnvelope_1.MessageEnvelope("123", "Test", "Test message");
            yield this._queue.send(null, envelope1);
            let envelope2 = yield this._queue.receive(null, 10000);
            assert.isNotNull(envelope2);
            assert.equal(envelope1.message_type, envelope2.message_type);
            assert.equal(envelope1.message, envelope2.message);
            assert.equal(envelope1.correlation_id, envelope2.correlation_id);
        });
    }
    testReceiveSendMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            let envelope1 = new MessageEnvelope_1.MessageEnvelope("123", "Test", "Test message");
            setTimeout(() => {
                this._queue.send(null, envelope1);
            }, 500);
            let envelope2 = yield this._queue.receive(null, 10000);
            assert.isNotNull(envelope2);
            assert.equal(envelope1.message_type, envelope2.message_type);
            assert.equal(envelope1.message, envelope2.message);
            assert.equal(envelope1.correlation_id, envelope2.correlation_id);
        });
    }
    testReceiveCompleteMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            let envelope1 = new MessageEnvelope_1.MessageEnvelope("123", "Test", "Test message");
            yield this._queue.send(null, envelope1);
            let count = yield this._queue.readMessageCount();
            assert.isTrue(count > 0);
            let envelope2 = yield this._queue.receive(null, 10000);
            assert.isNotNull(envelope2);
            assert.equal(envelope1.message_type, envelope2.message_type);
            assert.equal(envelope1.message, envelope2.message);
            assert.equal(envelope1.correlation_id, envelope2.correlation_id);
            yield this._queue.complete(envelope2);
            assert.isNull(envelope2.getReference());
        });
    }
    testReceiveAbandonMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            let envelope1 = new MessageEnvelope_1.MessageEnvelope("123", "Test", "Test message");
            yield this._queue.send(null, envelope1);
            let envelope2 = yield this._queue.receive(null, 10000);
            assert.isNotNull(envelope2);
            assert.equal(envelope1.message_type, envelope2.message_type);
            assert.equal(envelope1.message, envelope2.message);
            assert.equal(envelope1.correlation_id, envelope2.correlation_id);
            yield this._queue.abandon(envelope2);
            envelope2 = yield this._queue.receive(null, 10000);
            assert.isNotNull(envelope2);
            assert.equal(envelope1.message_type, envelope2.message_type);
            assert.equal(envelope1.message, envelope2.message);
            assert.equal(envelope1.correlation_id, envelope2.correlation_id);
        });
    }
    testSendPeekMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            let envelope1 = new MessageEnvelope_1.MessageEnvelope("123", "Test", "Test message");
            yield this._queue.send(null, envelope1);
            let envelope2 = yield this._queue.peek(null);
            assert.isNotNull(envelope2);
            assert.equal(envelope1.message_type, envelope2.message_type);
            assert.equal(envelope1.message, envelope2.message);
            assert.equal(envelope1.correlation_id, envelope2.correlation_id);
        });
    }
    testPeekNoMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            let envelope = yield this._queue.peek(null);
            assert.isNull(envelope);
        });
    }
    testMoveToDeadMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            let envelope1 = new MessageEnvelope_1.MessageEnvelope("123", "Test", "Test message");
            yield this._queue.send(null, envelope1);
            let envelope2 = yield this._queue.receive(null, 10000);
            assert.isNotNull(envelope2);
            assert.equal(envelope1.message_type, envelope2.message_type);
            assert.equal(envelope1.message, envelope2.message);
            assert.equal(envelope1.correlation_id, envelope2.correlation_id);
            yield this._queue.moveToDeadLetter(envelope2);
        });
    }
    testOnMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            let messageReceiver = new TestMessageReceiver_1.TestMessageReceiver();
            this._queue.beginListen(null, messageReceiver);
            yield new Promise((resolve, reject) => setTimeout(resolve, 1000));
            let envelope1 = new MessageEnvelope_1.MessageEnvelope("123", "Test", "Test message");
            yield this._queue.send(null, envelope1);
            yield new Promise((resolve, reject) => setTimeout(resolve, 1000));
            let envelope2 = messageReceiver.messages[0];
            assert.isNotNull(envelope2);
            assert.equal(envelope1.message_type, envelope2.message_type);
            assert.equal(envelope1.message, envelope2.message);
            assert.equal(envelope1.correlation_id, envelope2.correlation_id);
            this._queue.endListen(null);
        });
    }
    testSendAsObject() {
        return __awaiter(this, void 0, void 0, function* () {
            let messageReceiver = new TestMessageReceiver_1.TestMessageReceiver();
            let testObj = {
                id: pip_services3_commons_nodex_1.IdGenerator.nextLong(),
                name: pip_services3_commons_nodex_1.RandomString.nextString(20, 50)
            };
            this._queue.beginListen(null, messageReceiver);
            yield new Promise((resolve, reject) => setTimeout(resolve, 1000));
            //  send array of strings 
            yield this._queue.sendAsObject('123', 'messagetype', ['string1', 'string2']);
            yield new Promise((resolve, reject) => setTimeout(resolve, 1000));
            assert.equal(1, messageReceiver.messageCount);
            let envelope = messageReceiver.messages[0];
            assert.isNotNull(envelope);
            assert.equal('messagetype', envelope.message_type);
            assert.equal('123', envelope.correlation_id);
            let message = envelope.getMessageAs();
            assert.isArray(message);
            assert.includeMembers(message, ['string1', 'string2']);
            // send string
            yield messageReceiver.clear(null);
            yield this._queue.sendAsObject('123', 'messagetype', 'string2');
            yield new Promise((resolve, reject) => setTimeout(resolve, 1000));
            assert.equal(1, messageReceiver.messageCount);
            envelope = messageReceiver.messages[0];
            assert.isNotNull(envelope);
            assert.equal('messagetype', envelope.message_type);
            assert.equal('123', envelope.correlation_id);
            let message2 = envelope.getMessageAsString();
            assert.equal('string2', message2);
            // // send object
            // await messageReceiver.clear(null);
            // await this._queue.sendAsObject('123', 'messagetype', testObj);
            // await new Promise<void>((resolve, reject) => setTimeout(resolve, 1000));
            // assert.equal(1, messageReceiver.messageCount);
            // envelope = messageReceiver.messages[0];
            // assert.isNotNull(envelope);
            // assert.equal('messagetype', envelope.message_type);
            // assert.equal('123', envelope.correlation_id);
            // let message3 = envelope.getMessageAs<any>();
            // assert.isNotNull(message);
            // assert.equal(testObj.id, message3.id);
            // assert.equal(testObj.name, message3.name);
            this._queue.endListen(null);
        });
    }
}
exports.MessageQueueFixture = MessageQueueFixture;
//# sourceMappingURL=MessageQueueFixture.js.map