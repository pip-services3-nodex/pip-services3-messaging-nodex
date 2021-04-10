"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultMessagingFactory = void 0;
/** @module build */
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const MemoryMessageQueue_1 = require("../queues/MemoryMessageQueue");
const MemoryMessageQueueFactory_1 = require("./MemoryMessageQueueFactory");
/**
 * Creates [[MemoryMessageQueue]] components by their descriptors.
 * Name of created message queue is taken from its descriptor.
 *
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/build.factory.html Factory]]
 * @see [[MemoryMessageQueue]]
 */
class DefaultMessagingFactory extends pip_services3_components_nodex_1.Factory {
    /**
     * Create a new instance of the factory.
     */
    constructor() {
        super();
        this.register(DefaultMessagingFactory.MemoryQueueDescriptor, (locator) => {
            let name = (typeof locator.getName === "function") ? locator.getName() : null;
            return new MemoryMessageQueue_1.MemoryMessageQueue(name);
        });
        this.registerAsType(DefaultMessagingFactory.MemoryQueueFactoryDescriptor, MemoryMessageQueueFactory_1.MemoryMessageQueueFactory);
    }
}
exports.DefaultMessagingFactory = DefaultMessagingFactory;
DefaultMessagingFactory.MemoryQueueDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services", "message-queue", "memory", "*", "1.0");
DefaultMessagingFactory.MemoryQueueFactoryDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services", "queue-factory", "memory", "*", "1.0");
//# sourceMappingURL=DefaultMessagingFactory.js.map