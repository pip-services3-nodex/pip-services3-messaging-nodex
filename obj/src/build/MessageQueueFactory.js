"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageQueueFactory = void 0;
/** @module build */
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
/**
 * Creates [[IMessageQueue]] components by their descriptors.
 * Name of created message queue is taken from its descriptor.
 *
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/build.factory.html Factory]]
 * @see [[MessageQueue]]
 */
class MessageQueueFactory extends pip_services3_components_nodex_1.Factory {
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        this._config = config;
    }
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references) {
        this._references = references;
    }
}
exports.MessageQueueFactory = MessageQueueFactory;
//# sourceMappingURL=MessageQueueFactory.js.map