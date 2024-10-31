import { toNano } from '@ton/core';
import { CounterThree } from '../wrappers/CounterThree';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const counterThree = provider.open(
        CounterThree.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('CounterThree')
        )
    );

    await counterThree.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(counterThree.address);

    console.log('ID', await counterThree.getID());
}
