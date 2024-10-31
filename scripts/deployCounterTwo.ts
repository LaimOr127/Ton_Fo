import { toNano } from '@ton/core';
import { CounterTwo } from '../wrappers/CounterTwo';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const counterTwo = provider.open(
        CounterTwo.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('CounterTwo')
        )
    );

    await counterTwo.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(counterTwo.address);

    console.log('ID', await counterTwo.getID());
}
