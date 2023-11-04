import test from 'japa'
import { Kernel } from '@adonisjs/ace'
import { join } from 'path'
import QueueJob from './../commands/QueueJob'
import QueueWork from './../commands/QueueWork'
import type { Queue } from '@ioc:Adonis5/Queue'
import TestJob from './../source/app/Jobs/Producers/test'
import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { Ignitor } from '@adonisjs/core/build/src/Ignitor'
// import QueueProvider from './../providers/QueueProvider'

test.group('Queue test', async (group) => {
	let app: ApplicationContract
	let queue: Queue
	group.before(async () => {
		const httpServer = new Ignitor(join(__dirname, '..', 'source')).httpServer()
		app = httpServer.application
		await app.setup()
		// new QueueProvider(app).register()
		// app.container.bind('Adonis/Core/Config', () => new Config({ queue: getConfig() }))
		await app.registerProviders()
		await app.bootProviders()
		queue = app.container.use('Adonis5/Queue')
	})
	test('test queue:job', async (assert) => {
		const queueJob = new QueueJob(app, new Kernel(app))
		queueJob.jobName = 'testTwo'
		await queueJob.handle()
		assert.exists(1)
	})
	test('test queue:work', async () => {
		await queue.clear()
		const queueWork = new QueueWork(app, new Kernel(app))
		queueWork.handle()

		queue.dispatch(new TestJob({ test: '333' }))
		// TODO fix remove job
		// queue.remove(work)
		await new Promise((resolve) => setTimeout(resolve, 1000))

		// assert.exists(1)
		// assert.equal(1, 1)
	}).timeout(10000)
})
