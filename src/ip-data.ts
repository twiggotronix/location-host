import { type NetworkInterfaceInfo } from 'os';
import type { Ips } from './types';

export const getIpData = (
    networks: NodeJS.Dict<NetworkInterfaceInfo[]>,
): Ips => {
    return Object.keys(networks)
        .filter((intf) => !/^(vEthernet|Loopback).*/.test(intf))
        .reduce((carry, intf: string) => {
            const localIps = (networks[intf] as NetworkInterfaceInfo[])
                .filter((info) => info.family === 'IPv4' && !info.internal)
                .map((info) => info.address);

            return { ...carry, [intf]: localIps[0] };
        }, {});
};
