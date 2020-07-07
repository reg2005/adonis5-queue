import { QueueConfig } from 'Adonis/Addons/Queue'
import { join } from 'path'
export function getConfig(): QueueConfig {
	return {
		consumerPath: join(__dirname, '..', '/app/Jobs/Consumers'),
		producerPath: join(__dirname, '..', '/app/Jobs/Producers'),

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
