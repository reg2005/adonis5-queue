import Kue from 'kue-scheduler'
import { Job } from 'kue-unique'
import JobMaker from './JobMaker'
import JobRegister from './JobRegister'
import { QueueConfig, JobMakerInterface } from '@ioc:Reg2005/Adonis5/Kue'
// import { Queue } from '@ioc:Reg2005/Adonis5/Kue'
/**
 * Main queue driver
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */
export default class Queue implements Queue {
	private queue: Kue
	private config: QueueConfig
	private appRootPath: string
	/**
	 * Construct the queue
	 * @param  {Adonis/App} app Adonis app/Ioc instance
	 */
	constructor(config: QueueConfig, appRootPath: string) {
		this.config = config
		this.appRootPath = appRootPath
		// initialize kue queue
		this.queue = Kue.createQueue(this.config.connection)
		// boost number of event listeners a queue instance can listen to
		this.queue.setMaxListeners(0)
	}

	/**
	 * Register job event handlers
	 * @return {Promise}
	 */
	public processing() {
		const register = new JobRegister(this.config, this.appRootPath)
		return register.setQueue(this.queue).listenForAppJobs()
	}

	/**
	 * Dispatch a new job
	 * @param  {App/Jobs} job Job instances
	 * @return {Void}
	 */
	public dispatch(job: Job, when = 'now') {
		// create a job maker factory
		const maker = new JobMaker()

		// get the kue job converted from app job
		const result = maker.setAppJob(job).setQueue(this.queue).process()
		// schedule the job in the queue
		if (when === 'now') {
			// immediate job
			this.queue.now(result.kueJob)
		} else if (when.includes('every') || when.includes('*')) {
			when = when.replace('every ', '')
			// cron or repeating job
			this.queue.every(when, result.kueJob)
		} else {
			// schedule a job
			this.queue.schedule(when, result.kueJob)
		}
		return result
	}

	/**
	 * Remove a job from queue
	 * @param  {App/Job} job Job producer
	 * @return {Promise<Response>}
	 */
	public remove(job: JobMakerInterface) {
		return new Promise((resolve, reject) => {
			this.queue.removeJob(job.kueJob.id, (error, response) => {
				if (error) {
					reject(error)
				} else {
					// send the onRemove event
					if (job['onRemove']) {
						job['onRemove'](job.job.type)
					}
					resolve(response)
				}
			})
		})
	}

	/**
	 * Clear all jobs within a queue for a clean start
	 * @return {Promise<Response>}
	 */
	public clear() {
		return new Promise((resolve, reject) => {
			this.queue.clear((error, response) => {
				if (error) {
					reject(error)
				} else {
					resolve(response)
				}
			})
		})
	}
}
