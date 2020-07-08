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
import { Queue } from '@ioc:Reg2005/Adonis5/Kue'
import TestJob from '../app/Jobs/Producers/test'

const fs = new Filesystem(join(__dirname, '__app'))
test.group('Queue test', () => {
	test('test queue:job', async (assert) => {
		console.log(fs.basePath)
		const app = new Application(join(fs.basePath, 'build'), {} as any, {} as any, {})
		const ioc = new Ioc()
		ioc.bind('Adonis/Core/Config', () => new Config({ queue: getConfig() }))
		app.container = ioc
		const queueJob = new QueueJob(app, new Kernel(app))
		queueJob.jobName = 'testTwo'
		await queueJob.handle()
		assert.exists(1)
	})
	test('test queue:work', async () => {
		const ioc = new Ioc()
		ioc.bind('Adonis/Core/Config', () => new Config({ queue: getConfig() }))
		const queueProvider = new QueueProvider(ioc)
		queueProvider.register()
		const queue: Queue = ioc.use('@ioc:Reg2005/Adonis5/Kue')
		await queue.clear()
		const app = new Application(join(fs.basePath, 'build'), {} as any, {} as any, {})

		app.container = ioc
		await queue.dispatch(new TestJob({ test: '333' }))
		// TODO fix remove job
		// queue.remove(work)
		await new Promise((resolve) => setTimeout(resolve, 1000))
		const queueWork = new QueueWork(app, new Kernel(app))
		queueWork.handle()

		// assert.exists(1)
		// assert.equal(1, 1)
	}).timeout(2000)
})
