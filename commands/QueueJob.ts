import path from 'path'
import mustache from 'mustache'
import { paramCase, pascalCase } from 'change-case'
import { BaseCommand, flags, args, Kernel } from '@adonisjs/ace'
import { readFile, writeFile, dirExistsSync, createDir, deleteFile } from '../src/utils'
import { Config } from '@adonisjs/config/build/standalone'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

/**
 * Generate producer/consumer pair for new jobs
 *
 * @version 1.0.0
 * @adonis-version 5.0+
 */
export default class QueueJob extends BaseCommand {
	public static commandName = 'queue:job'
	public static description = 'Generate producer/consumer pair for new jobs'

	@args.string({ description: 'Name of job to process', required: true })
	public jobName: string

	@flags.string({ description: 'Run seeders in interactive mode', alias: 'jobId' })
	public jobId: string

	@flags.string({ description: 'Remove this job', alias: 'remove' })
	public remove: string

	public static settings = {
		loadApp: true,
	}

	constructor(app: ApplicationContract, kernel: Kernel, private config: Config) {
		super(app, kernel)
	}
	/**
	 * Execute command
	 */
	public async handle(): Promise<void> {
		const jobId = this.jobId ? paramCase(this.jobId) : paramCase(this.jobName)
		const jobName = pascalCase(this.jobName)
		try {
			// parse respective templates
			const producerTmpl = await readFile(path.join(__dirname, '../templates/producer.txt'), 'utf8')
			const producerTask = mustache.render(producerTmpl, {
				jobName,
				jobId,
			})
			const consumerTmpl = await readFile(path.join(__dirname, '../templates/consumer.txt'), 'utf8')
			const consumerTask = mustache.render(consumerTmpl, {
				jobName,
				jobId,
			})

			// save into selected directory
			const consumerPath = this.config.get('queue.consumerPath')
			const producerPath = this.config.get('queue.producerPath')
			console.log(consumerPath)
			if (!dirExistsSync(consumerPath)) {
				await createDir(consumerPath)
			}

			if (!dirExistsSync(producerPath)) {
				await createDir(producerPath)
			}

			if (this.remove) {
				await deleteFile(`${consumerPath}/${this.jobName}.js`)
				await deleteFile(`${producerPath}/${this.jobName}.js`)

				this.logger.success('Job has been removed')
			} else {
				await writeFile(`${consumerPath}/${this.jobName}.ts`, consumerTask)
				await writeFile(`${producerPath}/${this.jobName}.ts`, producerTask)

				this.logger.success('Job has been created')
			}
		} catch (e) {
			console.error(e)
			this.logger.error('Failed to generate job classes with error ' + e.message)
		}
	}
}
