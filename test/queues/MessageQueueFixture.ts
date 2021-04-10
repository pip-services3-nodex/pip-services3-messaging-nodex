const assert = require('chai').assert;

import { IMessageQueue } from '../../src/queues/IMessageQueue';
import { MessageEnvelope } from '../../src/queues/MessageEnvelope';
import { RandomString, IdGenerator } from 'pip-services3-commons-nodex';
import { TestMessageReceiver } from '../../src/test/TestMessageReceiver';

export class MessageQueueFixture {
    private _queue: IMessageQueue;

    public constructor(queue: IMessageQueue) {
        this._queue = queue;
    }

    public async testSendReceiveMessage(): Promise<void> {
        let envelope1: MessageEnvelope = new MessageEnvelope("123", "Test", "Test message");
        await this._queue.send(null, envelope1);

        let envelope2 = await this._queue.receive(null, 10000);
        assert.isNotNull(envelope2);
        assert.equal(envelope1.message_type, envelope2.message_type);
        assert.equal(envelope1.message, envelope2.message);
        assert.equal(envelope1.correlation_id, envelope2.correlation_id);
    }

    public async testReceiveSendMessage() {
        let envelope1: MessageEnvelope = new MessageEnvelope("123", "Test", "Test message");

        setTimeout(() => {
            this._queue.send(null, envelope1);
        }, 500);

        let envelope2 = await this._queue.receive(null, 10000);
        assert.isNotNull(envelope2);
        assert.equal(envelope1.message_type, envelope2.message_type);
        assert.equal(envelope1.message, envelope2.message);
        assert.equal(envelope1.correlation_id, envelope2.correlation_id);
    }

    public async testReceiveCompleteMessage() {
        let envelope1: MessageEnvelope = new MessageEnvelope("123", "Test", "Test message");

        await this._queue.send(null, envelope1);

        let count = await this._queue.readMessageCount();
        assert.isTrue(count > 0);

        let envelope2 = await this._queue.receive(null, 10000);
        assert.isNotNull(envelope2);
        assert.equal(envelope1.message_type, envelope2.message_type);
        assert.equal(envelope1.message, envelope2.message);
        assert.equal(envelope1.correlation_id, envelope2.correlation_id);

        await this._queue.complete(envelope2);
        assert.isNull(envelope2.getReference());
    }

    public async testReceiveAbandonMessage() {
        let envelope1: MessageEnvelope = new MessageEnvelope("123", "Test", "Test message");
        await this._queue.send(null, envelope1);

        let envelope2 = await this._queue.receive(null, 10000);
        assert.isNotNull(envelope2);
        assert.equal(envelope1.message_type, envelope2.message_type);
        assert.equal(envelope1.message, envelope2.message);
        assert.equal(envelope1.correlation_id, envelope2.correlation_id);

        await this._queue.abandon(envelope2);

        envelope2 = await this._queue.receive(null, 10000);
        assert.isNotNull(envelope2);
        assert.equal(envelope1.message_type, envelope2.message_type);
        assert.equal(envelope1.message, envelope2.message);
        assert.equal(envelope1.correlation_id, envelope2.correlation_id);
    }

    public async testSendPeekMessage() {
        let envelope1: MessageEnvelope = new MessageEnvelope("123", "Test", "Test message");
        await this._queue.send(null, envelope1);

        let envelope2 = await this._queue.peek(null);
        assert.isNotNull(envelope2);
        assert.equal(envelope1.message_type, envelope2.message_type);
        assert.equal(envelope1.message, envelope2.message);
        assert.equal(envelope1.correlation_id, envelope2.correlation_id);
    }

    public async testPeekNoMessage() {
        let envelope = await this._queue.peek(null);
        assert.isNull(envelope);
    }

    public async testMoveToDeadMessage() {
        let envelope1: MessageEnvelope = new MessageEnvelope("123", "Test", "Test message");
        await this._queue.send(null, envelope1);

        let envelope2 = await this._queue.receive(null, 10000);
        assert.isNotNull(envelope2);
        assert.equal(envelope1.message_type, envelope2.message_type);
        assert.equal(envelope1.message, envelope2.message);
        assert.equal(envelope1.correlation_id, envelope2.correlation_id);

        await this._queue.moveToDeadLetter(envelope2);
    }

    public async testOnMessage() {
        let messageReceiver = new TestMessageReceiver();
        this._queue.beginListen(null, messageReceiver);

        await new Promise<void>((resolve, reject) => setTimeout(resolve, 1000));

        let envelope1: MessageEnvelope = new MessageEnvelope("123", "Test", "Test message");
        await this._queue.send(null, envelope1);

        await new Promise<void>((resolve, reject) => setTimeout(resolve, 1000));

        let envelope2 = messageReceiver.messages[0];
        assert.isNotNull(envelope2);
        assert.equal(envelope1.message_type, envelope2.message_type);
        assert.equal(envelope1.message, envelope2.message);
        assert.equal(envelope1.correlation_id, envelope2.correlation_id);

        this._queue.endListen(null);
    }

    public async testSendAsObject() {
        let messageReceiver = new TestMessageReceiver();
        let testObj = {
            id: IdGenerator.nextLong(),
            name: RandomString.nextString(20, 50)
        };

        this._queue.beginListen(null, messageReceiver);

        await new Promise<void>((resolve, reject) => setTimeout(resolve, 1000));

        //  send array of strings 
        await this._queue.sendAsObject('123', 'messagetype', ['string1', 'string2']);

        await new Promise<void>((resolve, reject) => setTimeout(resolve, 1000));

        assert.equal(1, messageReceiver.messageCount);
        let envelope = messageReceiver.messages[0];
        assert.isNotNull(envelope);
        assert.equal('messagetype', envelope.message_type);
        assert.equal('123', envelope.correlation_id);

        let message = envelope.getMessageAs<string[]>();
        assert.isArray(message);
        assert.includeMembers(message, ['string1', 'string2']);

        // send string
        await messageReceiver.clear(null);
        await this._queue.sendAsObject('123', 'messagetype', 'string2');

        await new Promise<void>((resolve, reject) => setTimeout(resolve, 1000));

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
    }

}
