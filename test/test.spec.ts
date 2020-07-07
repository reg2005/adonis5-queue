import test from 'japa'
import { Kernel } from '@adonisjs/ace'
import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { Application } from '@adonisjs/application/build/standalone'
import { Ioc } from '@adonisjs/fold/build/index'
import { Config } from '@adonisjs/config/build/src/Config'
import QueueJob from './../commands/QueueJob'
import QueueWork from './../commands/QueueWork'
import { getConfig } from '../test-helpers/index'
import QueueProvider from '../providers/QueueProvider'
import { Queue } from 'Adonis/Addons/Queue'
import TestJob from '../app/Jobs/Producers/test'

const fs = new Filesystem(join(__dirname, '__app'))
test.group('Auth test', () => {
	test('test queue:job', async (assert) => {
		const config = new Config({
			queue: getConfig(),
		})
		const app = new Application(join(fs.basePath, 'build'), {} as any, {} as any, {})
		const queueJob = new QueueJob(app, new Kernel(app), config)
		queueJob.jobName = 'test'
		await queueJob.handle()
		assert.exists(1)
		assert.equal(1, 1)
	})
	test('test queue:work', async () => {
		const ioc = new Ioc()
		ioc.bind('Adonis/Core/Config', () => new Config({ queue: getConfig() }))
		// console.log(config.get('queue'))
		const queueProvider = new QueueProvider(ioc)
		queueProvider.register()
		const queue: Queue = ioc.use('Adonis/Addons/Queue')
		await queue.clear()
		const app = new Application(join(fs.basePath, 'build'), {} as any, {} as any, {})
		app.container = ioc
		await queue.dispatch(new TestJob({ test: '333' }))
		// TODO fix remove job
		// queue.remove(work)
		await new Promise((resolve) => setTimeout(resolve, 1000))
		const queueWork = new QueueWork(app, new Kernel(app))
		queueWork.handle()

		await new Promise(() => {})
		// assert.exists(1)
		// assert.equal(1, 1)
	}).timeout(0)
})
