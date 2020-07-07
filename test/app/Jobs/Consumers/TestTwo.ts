/**
 * Sample job consumer class
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */

export default class TestTwo {
	public data: any
	public ctx: any

	/**
	 * Concurrency for processing this job
	 * @return {Int} Num of jobs processed at time
	 */
	public static get concurrency() {
		return 1
	}

	/**
	 * UUID for this job class
	 * Make sure consumer and producer are in sync
	 * @return {String}
	 */
	public static get type() {
		return 'test-two'
	}

	/**
	 * Inject custom payload into the job class
	 * @param  {Object} data
	 *
	 * DO NOT MODIFY!
	 */
	constructor(data) {
		this.data = data
	}

	/**
	 * Inject the kue ctx to the consumer, you can use it to
	 * pause(), shutdown() or remove() handler actions.
	 * See kue's doc for more details
	 * @param  {Object} data
	 *
	 * DO NOT MODIFY!
	 */
	public setContext(ctx) {
		this.ctx = ctx
	}

	/**
	 * Handle the sending of email data
	 * You can drop the async keyword if it is synchronous
	 */
	public async handle() {
		// Execute your task here...
		console.log('handle job', this.data, this.ctx)
	}
}
