declare module '@ioc:Adonis5/Queue' {
	import { Job } from 'kue'
	import KueScheduler from 'kue-scheduler'

	export type QueueConfig = {
		consumerPath: string
		producerPath: string

		connection: {
			/**
			 * The prefix is for differentiating kue job names from
			 * other redis-related tasks. Modify to your needs.
			 *
			 * @type {String}
			 */
			prefix: string

			redis: {
				host: string
				port: number
				db: number
				options: Object
			}

			restore: boolean

			worker: boolean
		}
	}

	export interface ProducerJob {
		['constructor']: any
		priority: string
		attempts: number
		unique: boolean
		type?: string
		delay?: number
		ttl?: number
		backoff?(job: Job): void
		onInit(job: Job): void
		/**
		 * @param  {Object} data Data passed from consumer's handle() method
		 */
		onComplete(data: Object): void
		onFailed(e: Error): void
		kueJob?: Job
		data: {
			__unique_id__: string
		}
	}
	export interface JobMakerInterface {
		job: ProducerJob
		kueJob: Job
		queue: KueScheduler
	}
	export interface ProcessingResultInteface {
		message: string
	}
	export interface Queue {
		processing(): Promise<ProcessingResultInteface>
		dispatch(job: any, when?: string): JobMakerInterface
		remove(job: JobMakerInterface): void
		clear(): Promise<void>
	}
	const Queue: Queue
	export default Queue
}
