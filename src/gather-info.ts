import select from '@inquirer/select';
import { getLogger } from './logger';
import type { GatherInfoOptions, Ips } from './types';

export const gatherInfo = async (
    ips: Ips,
    options: GatherInfoOptions,
): Promise<string> => {
    const choices = Object.keys(ips).map((intf) => ({
        value: ips[intf],
        name: `Interface ${intf} (${ips[intf]})`,
    }));
    if (options.wifi || options.ethernet) {
        const preSelectedNetwork: keyof Ips | undefined = Object.keys(ips).find(
            (network) =>
                network.toLowerCase() === (options.wifi ? 'wi-fi' : 'ethernet'),
        );
        if (preSelectedNetwork) {
            getLogger().info(
                `ℹ️ Pre-select ${preSelectedNetwork} (${ips[preSelectedNetwork]})`,
            );
            return ips[preSelectedNetwork];
        } else {
            getLogger().info(
                `⚠️ Network ${
                    options.wifi ? 'Wi-Fi' : 'Ethernet'
                } not found, please select an existing one`,
            );
        }
    } else {
        getLogger().info(`⚠️ No pre-selected value`);
    }
    if (options.headless) {
        throw new Error('Cannot select network in headless mode');
    }
    return select({
        message: 'Pick a network interface',
        choices,
    });
};
