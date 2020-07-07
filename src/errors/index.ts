/**
 * Miscellaneous custom errors
 */

class BaseError extends Error {
	public error: any
	constructor(message) {
		super(message)
	}

	public setError(error) {
		this.error = error
		return this
	}

	public getError() {
		return this.error
	}

	public updateMessage() {
		let message = this.message
		if (this.error) message += ` (src err: ${this.error.message})`
		this.message = message
		return this
	}
}

export class JobDirectoryNotFoundError extends BaseError {}
export class JobProcessError extends BaseError {}
export class JobFetchError extends BaseError {}
