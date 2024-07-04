import { describe, expect, it, jest } from '@jest/globals';

import * as fs from 'fs';
import { checkFileIsReadable, checkFileIsWritable } from './file';

jest.mock('fs');

describe('file utils', () => {
    const mockFakeFile = 'fake-file';
    const mockData = 'mock data';
    describe('checkFileIsReadable', () => {
        it('should return true if file is readable', () => {
            jest.spyOn(fs, 'readFileSync').mockImplementation(() => mockData);
            const result = checkFileIsReadable(mockFakeFile);

            expect(result.success).toBeTruthy();
            expect(result.data).toEqual(mockData);
        });
        it('should return false if file is not readable', () => {
            jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
                throw new Error('fake error');
            });
            const result = checkFileIsReadable(mockFakeFile);

            expect(result.success).toBeFalsy();
        });
    });
    describe('checkFileIsWritable', () => {
        it('should return true if file is Writable', () => {
            jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
            const result = checkFileIsWritable(mockFakeFile, 'test');

            expect(result).toBeTruthy();
        });
        it('should return false if file is not readable', () => {
            jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
                throw new Error('fake error');
            });
            const result = checkFileIsWritable(mockFakeFile, 'test');

            expect(result).toBeFalsy();
        });
    });
});
