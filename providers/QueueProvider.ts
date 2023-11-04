import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import QueueManager from '../src/queue/QueueManager'
/**
 * Provider to bind redis to the container
 */
export default class QueueProvider {
	constructor(protected app: ApplicationContract) {}

	/**
	 * Register the redis binding
	 */
	public register() {
		this.app.container.singleton('Adonis5/Queue', () => {
			const queueConfig = this.app.container.use('Adonis/Core/Config').get('queue', {})
			return new QueueManager(queueConfig, this.app.appRoot)
		})
	}

	/**
	 * Registering the health check checker with HealthCheck service
	 */
	public boot() {}
}
