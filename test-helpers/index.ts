import { QueueConfig } from '@ioc:Adonis5/Queue'
export function getConfig(): QueueConfig {
	return {
		consumerPath: './../../../tmp/app/Jobs/Consumers',
		producerPath: './../../../tmp/app/Jobs/Producers',

		connection: {
			/**
			 * The prefix is for differentiating kue job names from
			 * other redis-related tasks. Modify to your needs.
			 *
			 * @type {String}
			 */
			prefix: 'adonis5:queue',

			redis: {
				host: 'localhost',
				port: 6379,
				db: 0,
				options: {},
			},

			restore: true,

			worker: true,
		},
	}
}
