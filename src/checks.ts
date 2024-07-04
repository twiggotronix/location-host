import { getLogger } from './logger';
import type { Ips } from './types';
import { checkFileIsReadable, checkFileIsWritable } from './utils/file';

const doChecks = (ips: Ips, filePath: string): boolean => {
    if (ips == null || Object.keys(ips).length === 0) {
        getLogger().error('⚠️ No networks found');
        throw new Error('No networks found');
    }
    const fileReadableCheckResult = checkFileIsReadable(filePath);
    if (!fileReadableCheckResult.success) {
        return false;
    }

    return checkFileIsWritable(filePath, fileReadableCheckResult.data ?? '');
};

export { doChecks };
