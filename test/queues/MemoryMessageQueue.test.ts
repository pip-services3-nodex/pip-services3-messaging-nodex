import { MemoryMessageQueue } from '../../src/queues/MemoryMessageQueue';
import { MessageQueueFixture } from './MessageQueueFixture';

suite('MemoryMessageQueue', () => {
    let queue: MemoryMessageQueue;
    let fixture: MessageQueueFixture;

    suiteSetup(async () => {
        queue = new MemoryMessageQueue("TestQueue");
        fixture = new MessageQueueFixture(queue);
        await queue.open(null);
    });

    suiteTeardown(async () => {
        await queue.close(null);
    });

    setup(async () => {
        await queue.clear(null);
    });

    test('Send Receive Message', async () => {
        await fixture.testSendReceiveMessage();
    });

    test('Receive Send Message', async () => {
        await fixture.testReceiveSendMessage();
    });

    test('Receive And Complete Message', async () => {
        await fixture.testReceiveCompleteMessage();
    });

    test('Receive And Abandon Message', async () => {
        await fixture.testReceiveAbandonMessage();
    });

    test('Send Peek Message', async () => {
        await fixture.testSendPeekMessage();
    });

    test('Peek No Message', async () => {
        await fixture.testPeekNoMessage();
    });

    test('Move To Dead Message', async () => {
        await fixture.testMoveToDeadMessage();
    });

    test('On Message', async () => {
        await fixture.testOnMessage();
    });

    test('Send Message As Object', async () => {
        await fixture.testSendAsObject();
    });
});
