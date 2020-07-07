/* eslint-gnore */
import { QueueConfig, ProcessingResultInteface } from 'Adonis/Addons/Queue'
import Kue from 'kue-scheduler'
import { JobDirectoryNotFoundError, JobProcessError } from '../errors/index'
import { listFiles } from './../utils'

/**
 * Register and preload consumer processes
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */
export default class JobRegister {
	private config: QueueConfig
	private queue: Kue

	constructor(Config: QueueConfig) {
		this.config = Config
	}

	/**
	 * Inject Kue Queue into the app
	 * @param {Kue/Queue} queue
	 */
	public setQueue(queue) {
		this.queue = queue
		return this
	}

	/**
	 * Load all job classes aynchronously
	 * @return {Promise}
	 */
	public async listenForAppJobs(): Promise<ProcessingResultInteface> {
		try {
			const filePaths = await this.jobFilePaths()
			await this.requireAndProcessJobs(filePaths)
			return {
				message: 'Preprocessed jobs and started queue listener!',
			}
		} catch (error) {
			console.log(error)
			const e = new JobDirectoryNotFoundError(
				'Consumer/Producer directory not found. Please make sure to create job with node ace queue:job'
			)
			e.setError(error)
			throw e
		}
	}

	/**
	 * Get all job file paths
	 * @return {Promise<String>} File paths
	 */
	public jobFilePaths() {
		return listFiles(this.config.consumerPath)
	}

	/**
	 * Require all available jobs and process them
	 * @param  {Array} filePaths Job class files
	 * @return {Void}
	 */
	public async requireAndProcessJobs(filePaths) {
		filePaths.forEach((path: string) => {
			// path = path.replace('.ts', '.js')
			const fullPath = `${this.config.consumerPath}/${path}`

			if (path.includes('index')) {
				return
			}
			const Job = require(fullPath).default
			const concurrency = Job.concurrency || 1

			this.queue.process(Job.type, concurrency, (job, ctx, done) => {
				// recreate the job and apply the handle function
				const appJob = new Job(job.data)
				appJob.setContext(ctx)
				try {
					const res = appJob.handle.apply(appJob)
					if (res instanceof Promise) {
						res.then(
							(success) => done(null, success),
							(error) => {
								const e = new JobProcessError(`Failed to process job ${Job.name}!`)
								done(e.setError(error).updateMessage())
							}
						)
					} else {
						// just a regular call
						done(null, res)
					}
				} catch (error) {
					const e = new JobProcessError(`Failed to process job ${Job.name}!`)
					done(e.setError(error).updateMessage())
				}
			})
		})
	}
}
