const assert = require('chai').assert;

import { MessageEnvelope } from '../../src/queues/MessageEnvelope';

suite('MessageEnvelop', () => {

    test('From/To JSON', () => {
        let message = new MessageEnvelope("123", "Test", "This is a test message");
        let json = JSON.stringify(message);

        let message2 = MessageEnvelope.fromJSON(json);
        assert.equal(message.message_id, message2.message_id);
        assert.equal(message.correlation_id, message2.correlation_id);
        assert.equal(message.message_type, message2.message_type);
        assert.equal(message.message.toString(), message2.message.toString());
    });

});
