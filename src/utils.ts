/**
 * Utility functions
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */

import fs from 'fs'
import fse from 'fs-extra'

export const dirExistsSync = (path: string) => {
	return fs.existsSync(path)
}

export const createDir = (path: string): Promise<string> => {
	return fs.promises.mkdir(path, { recursive: true })
}

export const copyFile = (src: string, dest: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		fse.copy(src, dest, (err: any) => {
			if (err) {
				reject(err)
			} else {
				resolve()
			}
		})
	})
}

export const listFiles = (path: string): Promise<string[]> => {
	return fs.promises.readdir(path)
}

export const readFile = (src: string, options: any): Promise<any> => {
	return new Promise((resolve, reject) => {
		fs.readFile(src, options, (err, data) => {
			if (err) {
				reject(err)
			} else {
				resolve(data)
			}
		})
	})
}

export const writeFile = (dest, content, options: any = null): Promise<void> => {
	return new Promise((resolve, reject) => {
		fs.writeFile(dest, content, options, (err) => {
			if (err) {
				reject(err)
			} else {
				resolve()
			}
		})
	})
}

export const deleteFile = (src): Promise<void> => {
	return new Promise((resolve, reject) => {
		fs.unlink(src, (err) => {
			if (err) {
				reject(err)
			} else {
				resolve()
			}
		})
	})
}
