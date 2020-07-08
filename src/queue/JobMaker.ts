import Kue from 'kue'
import { Job } from 'kue-unique'
import KueScheduler from 'kue-scheduler'
import randomString from 'randomstring'
import { JobFetchError } from '../errors'
import { ProducerJob, JobMakerInterface } from '@ioc:Adonis5/Queue'

/**
 * Parse producer job contents and generate kue job
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */
export default class JobMaker implements JobMakerInterface {
	public job: ProducerJob
	public kueJob: Job
	public queue: KueScheduler
	/**
	 * Get the final made job
	 * @return {Kue/Job}
	 */
	public getFinalJob() {
		return this.kueJob
	}

	/**
	 * Inject the app job
	 * @param {App/Job} job
	 */
	public setAppJob(job) {
		this.job = job
		return this
	}

	/**
	 * Inject the Kue queue
	 * @param {Queue} queue
	 */
	public setQueue(queue) {
		this.queue = queue
		return this
	}

	/**
	 * Run through the making procedures
	 * @return {this}
	 */
	public process() {
		return this.initialize()
			.assignPriority()
			.assignFailureAttempts()
			.assignFailureBackoff()
			.assignFailureBackoff()
			.assignDelay()
			.assignTTL()
			.assignUnique()
			.assignEventListeners()
	}

	/**
	 * Initalize the Kue Job
	 * @param  {App/Job} job
	 * @return {this}
	 */
	public initialize() {
		// generate an UUID for this job along with its type
		this.job.data['__unique_id__'] = this.job.constructor.type + randomString.generate(15)
		this.kueJob = this.queue.createJob(this.job.constructor.type, this.job.data)
		return this
	}

	/**
	 * Set priority for the job
	 * @return {this}
	 */
	public assignPriority() {
		if (this.job.priority) {
			this.kueJob.priority(this.job.priority)
		}
		return this
	}

	/**
	 * Set failure attempts for the job
	 * @return {this}
	 */
	public assignFailureAttempts() {
		if (this.job.attempts) {
			this.kueJob.attempts(this.job.attempts)
		}
		return this
	}

	/**
	 * Set failure backoff for the job
	 * @return {this}
	 */
	public assignFailureBackoff() {
		if (this.job.backoff) {
			this.kueJob.backoff(this.job.backoff)
		}
		return this
	}

	/**
	 * Set job delay
	 * @return {this}
	 */
	public assignDelay() {
		if (this.job.delay) {
			this.kueJob.delay(this.job.delay * 1000)
		}
		return this
	}

	/**
	 * Set Time to live for the job
	 * @return {this}
	 */
	public assignTTL() {
		if (this.job.ttl) {
			this.kueJob.ttl(this.job.ttl * 1000)
		}
		return this
	}

	/**
	 * Set uniqueness of this job
	 * @return {this}
	 */
	public assignUnique() {
		if (this.job.constructor.unique) {
			this.kueJob.unique(this.job.constructor.type)
		}
		return this
	}

	/**
	 * Assign event listeners for the job
	 * @return {this}
	 */
	public assignEventListeners() {
		let events = ['enqueue', 'start', 'promotion', 'progress', 'failed attempts', 'failed', 'complete']
		events.forEach((event) => {
			this.queue.on(`job ${event}`, (id, ...args) => {
				Kue.Job.get(id, (err, kueJob: Kue.Job) => {
					if (!err) {
						if (kueJob.data['__unique_id__'] === this.job.data['__unique_id__']) {
							const eventName =
								'on' +
								event
									.split(' ')
									.map((word) => {
										return word[0].toUpperCase() + word.slice(1)
									})
									.join('')

							if (event === 'enqueue') {
								this.job.onInit(kueJob)
								// save kue job to job when enqueued
								this.job.kueJob = kueJob
							}
							if (this.job[eventName]) {
								this.job[eventName](...args)
							}
						}
					} else if (this.job['onFailed']) {
						this.job.onFailed(
							new JobFetchError(`Failed to fetch job id ${id}, event ${event}`).setError(err).updateMessage()
						)
					}
				})
			})
		})
		return this
	}
}
