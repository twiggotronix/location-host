import { readFileSync, writeFileSync } from 'fs';
import { getLogger } from '../logger';

const checkFileIsWritable = (file: string, data: string): boolean => {
    try {
        writeFileSync(file, data);
        getLogger().info(`✅ Can write ${file}`);
        return true;
    } catch (err) {
        getLogger().error(`⚠️ Can't write ${file}`);
        return false;
    }
};

const checkFileIsReadable = (
    file: string,
): { success: boolean; data?: string } => {
    try {
        const data = readFileSync(file, { encoding: 'utf8' });
        getLogger().info(`✅ Can read ${file}`);
        return { success: true, data };
    } catch (err) {
        getLogger().error(`⚠️ Can't read ${file}`);
        return { success: false };
    }
};

export { checkFileIsReadable, checkFileIsWritable };
