/*
 * @adonisjs/redis
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { IocContract } from '@adonisjs/fold'
import QueueManager from '../src/queue/QueueManager'
import { Application } from '@adonisjs/application'
/**
 * Provider to bind redis to the container
 */
export default class CommandProvider {
	constructor(protected container: IocContract) {}

	/**
	 * Register the redis binding
	 */
	public register() {
		this.container.singleton('Adonis5/Queue', () => {
			const app: Application = this.container.use('Adonis/Core/Application')
			const queueConfig = this.container.use('Adonis/Core/Config').get('queue', {})
			return new QueueManager(queueConfig, app.appRoot)
		})
	}

	/**
	 * Registering the health check checker with HealthCheck service
	 */
	public boot() {}
}
