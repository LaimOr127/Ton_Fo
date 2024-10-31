import { toNano } from '@ton/core';
import { CounterSenMes } from '../wrappers/CounterSenMes';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const counterSenMes = provider.open(CounterSenMes.createFromConfig({}, await compile('CounterSenMes')));

    await counterSenMes.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(counterSenMes.address);

    // run methods on `counterSenMes`
}
