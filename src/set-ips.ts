import { createReadStream, writeFile } from 'fs';
import { EOL } from 'os';
import { createInterface } from 'readline';
import { flag } from './constants';
import { getLogger } from './logger';

export const setNewIp = async (newIp: string, hostFilePath: string) => {
    const fileStream = createReadStream(hostFilePath);

    const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    const ipRegex =
        /(25[0–5]|2[0-5][0-9]?|1[0-9]?[0-9]?|[0-9][0-9]?)\.(25[0–5]|2[0-5][0-9]?|1[0-9]?[0-9]?|[0-9][0-9]?)\.(25[0–5]|2[0-5][0-9]?|1[0-9]?[0-9]?|[0-9][0-9]?)\.(25[0–5]|2[0-5][0-9]?|1[0-9]?[0-9]?|[0-9][0-9]?)/;

    let fileContents = '';
    for await (const line of rl) {
        if (line.includes(flag)) {
            const ip2Replace = line.match(ipRegex);
            if (ip2Replace != null) {
                fileContents += line.replace(ip2Replace[0], newIp);
            }
        } else {
            fileContents += line;
        }
        fileContents += EOL;
    }

    writeFile(hostFilePath, fileContents, (err) => {
        if (err) {
            getLogger().error(`❌ Failed to write to ${hostFilePath}`, err);
        } else {
            getLogger().info(`✅ Ip was succefully updated in ${hostFilePath}`);
        }
    });
};
