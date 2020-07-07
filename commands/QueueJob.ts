import path from 'path'
import { paramCase, pascalCase } from 'change-case'
import { BaseCommand, flags, args, Kernel } from '@adonisjs/ace'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { ConfigContract } from '@ioc:Adonis/Core/Config'

/**
 * Generate producer/consumer pair for new jobs
 *
 * @version 1.0.0
 * @adonis-version 5.0+
 */
export default class QueueJob extends BaseCommand {
	private config: ConfigContract
	public static commandName = 'queue:job'
	public static description = 'Generate producer/consumer pair for new jobs'

	@args.string({ description: 'Name of job to process', required: true })
	public jobName: string

	@flags.string({ description: 'Run seeders in interactive mode', alias: 'jobId' })
	public jobId: string

	public static settings = {
		loadApp: true,
	}

	constructor(app: ApplicationContract, kernel: Kernel) {
		super(app, kernel)
		this.config = app.container.use('Adonis/Core/Config')
	}
	/**
	 * Execute command
	 */
	public async handle(): Promise<void> {
		const jobId = this.jobId ? paramCase(this.jobId) : paramCase(this.jobName)
		const jobName = pascalCase(this.jobName)
		try {
			// parse respective templates
			const producerTmpl = path.join(__dirname, '../templates/producer.txt')
			const consumerTmpl = path.join(__dirname, '../templates/consumer.txt')

			// save into selected directory
			const producerPath = this.config.get('queue.producerPath')
			const consumerPath = this.config.get('queue.consumerPath')
			this.generator
				.addFile(this.jobName, { pattern: 'pascalcase', form: 'singular' })
				.apply({
					jobName,
					jobId,
				})
				.stub(producerTmpl)
				.destinationDir(producerPath)
				.useMustache()
				.appRoot(this.application.cliCwd || this.application.appRoot)

			await this.generator.run()
			this.generator.clear()

			this.generator
				.addFile(this.jobName, { pattern: 'pascalcase', form: 'singular' })
				.apply({
					jobName,
					jobId,
				})
				.stub(consumerTmpl)
				.destinationDir(consumerPath)
				.useMustache()
				.appRoot(this.application.cliCwd || this.application.appRoot)
			await this.generator.run()
		} catch (e) {
			console.error(e)
			this.logger.error('Failed to generate job classes with error ' + e.message)
		}
	}
}
