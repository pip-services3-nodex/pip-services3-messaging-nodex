const assert = require('chai').assert;

import { Descriptor } from 'pip-services3-commons-nodex';

import { MemoryMessageQueueFactory } from '../../src/build/MemoryMessageQueueFactory';

suite('MemoryMessageQueueFactory', ()=> {

    test('CreateMessageQueue', () => {
        let factory = new MemoryMessageQueueFactory();
        let descriptor = new Descriptor("pip-services", "message-queue", "memory", "test", "1.0");
    
        let canResult = factory.canCreate(descriptor);
        assert.isNotNull(canResult);
    
        let queue = factory.create(descriptor);
        assert.isNotNull(queue);
        assert.equal("test", queue.getName());
    });

});