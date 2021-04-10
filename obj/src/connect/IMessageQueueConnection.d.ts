/** @module connect */
/**
 * Defines an interface for message queue connections
 */
export interface IMessageQueueConnection {
    /**
     * Reads a list of registered queue names.
     * If connection doesn't support this function returnes an empty list.
     * @returns a list with registered queue names.
     */
    readQueueNames(): Promise<string[]>;
    /**
     * Creates a message queue.
     * If connection doesn't support this function it exists without error.
     * @param name the name of the queue to be created.
     */
    createQueue(name: string): Promise<void>;
    /**
     * Deletes a message queue.
     * If connection doesn't support this function it exists without error.
     * @param name the name of the queue to be deleted.
     */
    deleteQueue(name: string): Promise<void>;
}
