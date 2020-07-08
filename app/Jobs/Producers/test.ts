import { EventEmitter } from 'events'
import { ProducerJob } from '@ioc:Reg2005/Adonis5/Kue'
/**
 * Sample job producer class
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */

export default class Test extends EventEmitter implements ProducerJob {
	public data: any
	public ctx: any
	/**
	 * UUID for this job class
	 * Make sure consumer and producer are in sync
	 * @return {String}
	 */
	public static get type() {
		return 'test'
	}

	/**
	 * Inject custom payload into the job class
	 * @param  {Object} data
	 *
	 * DO NOT MODIFY!
	 */
	constructor(data) {
		super()
		this.data = data
	}

	/**
	 * Priority for this job
	 * @return {String|Int}
	 */
	public get priority() {
		return 'normal'
	}

	/**
	 * Number of attempts after each failure
	 * @return {Int}
	 */
	public get attempts() {
		return 3
	}

	/**
	 * Whether this job will be unique
	 * @return {Boolean}
	 */
	public get unique() {
		return false
	}

	/**
	 * Event handlers
	 */
	/**
	 * Job created and sent to queue
	 * @param  {Kue/Job} job Kue job, see https://github.com/Automattic/kue/blob/master/lib/queue/job.js
	 * @return {Void}
	 */
	public onInit(job) {
		console.log('Inited Job ID ' + job.id)

		this.emit('init', job.id) // emit the id of the kue job
	}

	/**
	 * Completed with optional data
	 * @param  {Object} data Data passed from consumer's handle() method
	 * @return {Void}
	 */
	public onComplete(data) {
		console.log('Completed!')

		this.emit('complete', data) // emit the completion data
	}

	/**
	 * Failed event
	 * @param  {String} e Error message
	 * @return {Void}
	 */
	public onFailed(e) {
		console.log(e)

		this.emit('failed', e, this.data, this.ctx) // emit the error
	}
}
