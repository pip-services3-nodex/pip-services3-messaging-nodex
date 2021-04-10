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
const MemoryMessageQueue_1 = require("../../src/queues/MemoryMessageQueue");
const MessageQueueFixture_1 = require("./MessageQueueFixture");
suite('MemoryMessageQueue', () => {
    let queue;
    let fixture;
    suiteSetup(() => __awaiter(void 0, void 0, void 0, function* () {
        queue = new MemoryMessageQueue_1.MemoryMessageQueue("TestQueue");
        fixture = new MessageQueueFixture_1.MessageQueueFixture(queue);
        yield queue.open(null);
    }));
    suiteTeardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield queue.close(null);
    }));
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        yield queue.clear(null);
    }));
    test('Send Receive Message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testSendReceiveMessage();
    }));
    test('Receive Send Message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testReceiveSendMessage();
    }));
    test('Receive And Complete Message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testReceiveCompleteMessage();
    }));
    test('Receive And Abandon Message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testReceiveAbandonMessage();
    }));
    test('Send Peek Message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testSendPeekMessage();
    }));
    test('Peek No Message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testPeekNoMessage();
    }));
    test('Move To Dead Message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testMoveToDeadMessage();
    }));
    test('On Message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testOnMessage();
    }));
    test('Send Message As Object', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testSendAsObject();
    }));
});
//# sourceMappingURL=MemoryMessageQueue.test.js.map