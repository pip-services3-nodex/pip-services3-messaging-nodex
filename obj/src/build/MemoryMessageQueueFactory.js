"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryMessageQueueFactory = void 0;
/** @module build */
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const MemoryMessageQueue_1 = require("../queues/MemoryMessageQueue");
const MessageQueueFactory_1 = require("./MessageQueueFactory");
/**
 * Creates [[MemoryMessageQueue]] components by their descriptors.
 * Name of created message queue is taken from its descriptor.
 *
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/build.factory.html Factory]]
 * @see [[MemoryMessageQueue]]
 */
class MemoryMessageQueueFactory extends MessageQueueFactory_1.MessageQueueFactory {
    /**
     * Create a new instance of the factory.
     */
    constructor() {
        super();
        this.register(MemoryMessageQueueFactory.MemoryQueueDescriptor, (locator) => {
            let name = (typeof locator.getName === "function") ? locator.getName() : null;
            return this.createQueue(name);
        });
    }
    /**
     * Creates a message queue component and assigns its name.
     * @param name a name of the created message queue.
     */
    createQueue(name) {
        let queue = new MemoryMessageQueue_1.MemoryMessageQueue(name);
        if (this._config != null) {
            queue.configure(this._config);
        }
        if (this._references != null) {
            queue.setReferences(this._references);
        }
        return queue;
    }
}
exports.MemoryMessageQueueFactory = MemoryMessageQueueFactory;
MemoryMessageQueueFactory.MemoryQueueDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services", "message-queue", "memory", "*", "1.0");
//# sourceMappingURL=MemoryMessageQueueFactory.js.map