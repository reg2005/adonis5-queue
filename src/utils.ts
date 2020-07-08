/**
 * Utility functions
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */

import fs from 'fs'

export const dirExistsSync = (path: string) => {
	return fs.existsSync(path)
}

export const listFiles = (path: string): Promise<string[]> => {
	return fs.promises.readdir(path)
}
