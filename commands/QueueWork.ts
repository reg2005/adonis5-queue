import { BaseCommand, Kernel } from '@adonisjs/ace'
import { dirExistsSync, listFiles } from '../src/utils'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { Queue } from '@ioc:Adonis5/Queue'
import { ConfigContract } from '@ioc:Adonis/Core/Config'
/**
 * Launch queue workers to start processing
 *
 * @version 2.0.0
 * @adonis-version 5.0+
 */
export default class QueueWork extends BaseCommand {
	private config: ConfigContract
	private queue: Queue
	public static commandName = 'queue:work'
	public static description = 'Start one or more workers'

	public static settings = {
		loadApp: true,
	}

	constructor(app: ApplicationContract, kernel: Kernel) {
		super(app, kernel)
		this.config = app.container.use('Adonis/Core/Config')
		this.queue = app.container.use('Adonis5/Queue')
	}
	/**
	 * Execute command
	 */
	public async handle(): Promise<void> {
		if (!(await this.hasJobs())) {
			this.logger.error('No jobs to watch for. Please use `node ace queue:job` to create jobs!')
			return
		}
		try {
			const success = await this.queue.processing()
			console.log(success.message)
		} catch (e) {
			console.error(e.message)
			process.exit(1)
		}

		this.logger.success('Worker are running...')

		// prevent the main process from exiting...
		await new Promise(() => () => {})
	}
	public async hasJobs() {
		// load from defined job path
		const consumerPath = this.config.get('queue.consumerPath')
		const producerPath = this.config.get('queue.producerPath')

		if (!dirExistsSync(consumerPath) || !dirExistsSync(producerPath)) {
			return false
		}

		let consumerFiles = await listFiles(consumerPath)
		if (consumerFiles && consumerFiles.length) {
			return true
		}

		const producerFiles = await listFiles(producerPath)
		if (producerFiles && producerFiles.length) {
			return true
		}

		return true
	}
}
