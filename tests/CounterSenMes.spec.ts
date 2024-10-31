import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, Slice } from '@ton/core';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

// Универсальный тест для отправки сообщений
describe('Message Sending Contract Tests', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let contract: SandboxContract<any>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
    });

    // Компилируем контракт перед каждым тестом
    beforeEach(async () => {
        const code = await compile('MessageSendingContract');  // Имя контракта на FunC
        contract = await blockchain.openContract(contract.create({ code }));


        // Деплой контракта
        const deployResult = await contract.sendDeploy(deployer.getSender(), toNano('0.05'));
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: contract.address,
            deploy: true,
        });
    });

    // Тест простого сообщения с переводом монет
    it('should send a simple message with coin transfer', async () => {
        const recipient = await blockchain.treasury('recipient');
        const amount = toNano('0.01');

        const sendResult = await contract.sendSimpleMessage(deployer.getSender(), recipient.address, amount, 3);  // Режим 3 - NON_BOUNCEABLE

        expect(sendResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: recipient.address,
            value: amount,
        });
    });

    // Тест сообщения с телом (текстом)
    it('should send a message with body (text)', async () => {
        const recipient = await blockchain.treasury('recipient');
        const amount = toNano('0.01');
        const body = new Cell();

        const sendResult = await contract.sendMessageWithBody(deployer.getSender(), recipient.address, amount, body, 3);  // Режим 3 - BOUNCEABLE

        expect(sendResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: recipient.address,
            value: amount,
        });
    });

    // Тест сообщения с обработкой ошибки
    it('should send a message with error handling', async () => {
        const recipient = await blockchain.treasury('recipient');
        const amount = toNano('0.01');
        const body = new Cell();

        const sendResult = await contract.sendMessageWithErrorHandling(deployer.getSender(), recipient.address, amount, body, 3);

        expect(sendResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: recipient.address,
            value: amount,
        });
    });

    // Тест отправки сообщения и самоуничтожения контракта
    it('should send a message and self destruct contract', async () => {
        const recipient = await blockchain.treasury('recipient');
        const amount = toNano('0.01');
        const body = new Cell();

        const sendResult = await contract.sendMessageAndSelfDestruct(deployer.getSender(), recipient.address, amount, body);

        expect(sendResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: recipient.address,
            value: amount,
        });

        // Проверка, что контракт был уничтожен
        const contractBalance = await contract.getBalance();
        expect(contractBalance).toEqual(0n);
    });

    // Тест отправки пустого сообщения с нулевым переводом
    it('should send an empty message with zero coins', async () => {
        const recipient = await blockchain.treasury('recipient');

        const sendResult = await contract.sendEmptyMessage(deployer.getSender(), recipient.address, 3);  // Режим 3 - NON_BOUNCEABLE

        expect(sendResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: recipient.address,
            value: toNano('0'),
        });
    });

    // Тест отправки сообщения с задержкой
    it('should send a delayed message', async () => {
        const recipient = await blockchain.treasury('recipient');
        const amount = toNano('0.01');
        const body = new Cell();

        const sendResult = await contract.sendDelayedMessage(deployer.getSender(), recipient.address, amount, body, 3);

        expect(sendResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: recipient.address,
            value: amount,
        });

        // Проверка задержки (например, количество блоков)
        // Здесь вам нужно будет симулировать задержку, если поддерживается вашей блокчейн-платформой
    });

    // Тест сообщения с реферальным адресом
    it('should send a message with referral address', async () => {
        const recipient = await blockchain.treasury('recipient');
        const referral = await blockchain.treasury('referral');
        const amount = toNano('0.01');
        const body = new Cell();

        const sendResult = await contract.sendMessageWithReferral(deployer.getSender(), recipient.address, referral.address, amount, body, 3);

        expect(sendResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: recipient.address,
            value: amount,
        });
    });

    // Тест сообщения с кастомным кодом операции
    it('should send a message with custom op code', async () => {
        const recipient = await blockchain.treasury('recipient');
        const amount = toNano('0.01');
        const opCode = 0xDEADBEEF;  // Пример произвольного кода операции
        const body = new Cell();

        const sendResult = await contract.sendCustomOpMessage(deployer.getSender(), recipient.address, amount, opCode, body, 3);

        expect(sendResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: recipient.address,
            value: amount,
        });
    });

    // Тест сообщения с возвратом средств при ошибке
    it('should send a message with fallback on error', async () => {
        const recipient = await blockchain.treasury('recipient');
        const amount = toNano('0.01');
        const body = new Cell();

        const sendResult = await contract.sendMessageWithFallback(deployer.getSender(), recipient.address, amount, body);

        expect(sendResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: recipient.address,
            value: amount,
        });
    });
});
