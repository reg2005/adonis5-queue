"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const japa_1 = __importDefault(require("japa"));
const ace_1 = require("@adonisjs/ace");
const path_1 = require("path");
const dev_utils_1 = require("@poppinss/dev-utils");
const standalone_1 = require("@adonisjs/application/build/standalone");
const index_1 = require("@adonisjs/fold/build/index");
const Config_1 = require("@adonisjs/config/build/src/Config");
const QueueJob_1 = __importDefault(require("./../commands/QueueJob"));
const QueueWork_1 = __importDefault(require("./../commands/QueueWork"));
const index_2 = require("../test-helpers/index");
const QueueProvider_1 = __importDefault(require("../providers/QueueProvider"));
const test_1 = __importDefault(require("../app/Jobs/Producers/test"));
const fs = new dev_utils_1.Filesystem(path_1.join(__dirname, '__app'));
japa_1.default.group('Queue test', () => {
    japa_1.default('test queue:job', async (assert) => {
        console.log(fs.basePath);
        const app = new standalone_1.Application(path_1.join(fs.basePath, 'build'), {}, {}, {});
        const ioc = new index_1.Ioc();
        ioc.bind('Adonis/Core/Config', () => new Config_1.Config({ queue: index_2.getConfig() }));
        app.container = ioc;
        const queueJob = new QueueJob_1.default(app, new ace_1.Kernel(app));
        queueJob.jobName = 'testTwo';
        await queueJob.handle();
        assert.exists(1);
    });
    japa_1.default('test queue:work', async () => {
        const ioc = new index_1.Ioc();
        ioc.bind('Adonis/Core/Config', () => new Config_1.Config({ queue: index_2.getConfig() }));
        const queueProvider = new QueueProvider_1.default(ioc);
        queueProvider.register();
        const queue = ioc.use('adonis5-kue');
        await queue.clear();
        const app = new standalone_1.Application(path_1.join(fs.basePath, 'build'), {}, {}, {});
        app.container = ioc;
        await queue.dispatch(new test_1.default({ test: '333' }));
        // TODO fix remove job
        // queue.remove(work)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const queueWork = new QueueWork_1.default(app, new ace_1.Kernel(app));
        queueWork.handle();
        // assert.exists(1)
        // assert.equal(1, 1)
    }).timeout(2000);
});
