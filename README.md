<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [adonis5-kue](#adonis5-kue)
- [Adonis5 Queue](#adonis5-queue)
  - [Features](#features)
  - [Consumer/Producer model](#consumerproducer-model)
  - [Notices](#notices)
  - [Installation](#installation)
      - [Create a job](#create-a-job)
    - [Run worker](#run-worker)
  - [Job API](#job-api)
  - [Queue API](#queue-api)
    - [Access the queue](#access-the-queue)
    - [Push job onto the queue](#push-job-onto-the-queue)
    - [Remove jobs](#remove-jobs)
    - [Run tests](#run-tests)
  - [Development](#development)
  - [Thanks](#thanks)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# adonis5-kue
> Tagline

[![travis-image]][travis-url] [![typescript-image]][typescript-url] [![npm-image]][npm-url] [![license-image]][license-url]

# Adonis5 Queue
Adonis5 queue is a worker-based queue library for [AdonisJS](https://github.com/adonisjs/adonis-framework), it is backed by [Kue](https://github.com/Automattic/kue) and [Kue-Scheduler](https://github.com/lykmapipo/kue-scheduler). 

## Features
  - Ace commands for generating jobs and start workers
  - Use your existing adonis modules in your queue processor
  - (Close-to) Full kue/kue-scheduler API supported including future/repeat job scheduling
  - Produce/Consumer model for structuring your job
  - Simple and Elegant API for scheduling and processing your jobs

## Consumer/Producer model
Instead of defining Job as a single entity, this library separates the responsibility of job into consumer and producer, here are the definitions:

**Producer:** Define the static properties of the job, in kue's context,  **supported** properties include **priority, attempts, backOff, delay, ttl and unique**. Documentations of each property can be found in Kue and Kue-scheduler's Github.

**Consumer:** Define the runtime properties of the job, in kue's context,  **supported** properties include **concurrency** and the process handler.

Example of a basic producer/consumer pair can be found by generating a sample job using the ``node ace queue:job`` command.

## Notices
This version only support **Adonis V5+**.

## Installation
Install it:
```bash
npm i --save adonis5-kue
```
Compile your code:
```bash
node ace server --watch
```
Connect all dependences:
```bash
node ace invoke adonis5-kue
```

#### Create a job
Make your first job:
```bash
node ace queue:job ExampleJob
```
or:
```bash
node ace queue:job ExampleJob --jobId='custom-job-id'
```
The option `jobId` is optional, if not provided, the kue type for the job will be a kebab-case of the argument. i.e. SendEmail -> send-email.

This command will create job producers and consumers in designated directories, which are configurable in **config/queue.js** with **consumerPath** and **producerPath**; this defaults to **app/Jobs/{Consumers | Producers}**.

The job consumers and producers will both run in Adonis framework's context, thus you can easily use any supported libraries within the job file. 


### Run worker
```sh
node ace queue:work
```

**Notice**: For multiworker usage, you can use tools such as [Supervisor](https://github.com/Supervisor/supervisor) or [PM2](https://github.com/Unitech/pm2) or sclalable docker containers with orchestrator such as [Docker Swarm](https://docs.docker.com/engine/swarm/) or [Kuberneties (k8s)](https://kubernetes.io/), and the command will be ``node ace queue:work`` in your app’s root directory.

## Job API

The producer job file supports Kue job properties which are defined as an ES6 ``get`` property in the class, see example by running `node ace queue:job`.

Refer to supported job properties above in the **Consumer/Producer Model** section.

The consumer job file supports Kue job's **concurrecy** defined as an ES6 `static get` property in the class, see example by running `node ace queue:job`.

The processing function is defined as an async function `async handle()` or `handle()` depending on whether your task is asynchronous. Within the task class, you can access constructor-injected payload with `this.data`.

The producer job class also supports job events, listed below:
```js
// with in producer class
// job has been created and scheduled
// useful for retrieving redis id for the job
onInit(Kue/Job job)
// See kue documentation for below
onEnqueue(String jobType)
onStart(String jobType)
onPromotion(String jobType)
onProgress(Float progress)
// data returned from handle() method
onComplete(Object data)
onRemove(String jobType)
// error caught in the handle() method
onFailed(Error error)
onFailedAttempts(Error error)
```
This producer job class itself is an Event Listener, thus you can export the data received from the job event to the outside world. 

A useful scenario is to remove job after it has been initialized: 

```js
// within job producer class
onInit(job) {
    this.emit('init');
}
// outside of the consumer
// for queue.remove() see Queue API below
job.on('init', async () => await Queue.remove(job));
```

## Queue API

### Access the queue
```js
const Queue = use('adonis5-kue');
```
### Push job onto the queue
```js
// optionally inject data into the job class using constructor
// and access it in the consumer handler using this.data
const ExampleJob = use('App/Jobs/Producer/ExampleJob');
Queue.dispatch(new ExampleJob({'data': 'whatever'}));
```
`Queue.dispatch()` has a second optional `String` argument default to 'now', which reflects the Kue-Scheduler API:
```js
// schedule a job immediately
Queue.dispatch(new ExampleJob, 'now');
// schedule a repeated job every 2 seconds
// basically embeding the 'every' method into the string itself
Queue.dispatch(new ExampleJob, 'every 2 seconds');
// schedule a single job in the future
Queue.dispatch(new ExampleJob, '2 seconds from now');
```
### Remove jobs

Remove a single job, the argument must be the **job instance** you created:

```js
// asynchronous removal...
Queue.remove(job).then(response => {}, error => {});
```

Clear all jobs:

```js
// also returns a promise
Queue.clear().then(response => {}, error => {});
```

Note: currently <i>clear()</i> will not trigger the <i>remove</i> event on the job.

### Run tests

Please clone [this repo](https://github.com/reg2005/adonis5-queue), install the dependencies, and run ``npm run build && npm run test`` to run the spec tests. (Make sure redis is installed and configured properly as required by Kue).

You can also contribute to the test repo by submitting issues and PRs.

## Development

Contributions are welcome! This is a community project so please send a pull request whenever you feel like to!

## Thanks
Many thanks to:
- [Harminder Virk](https://github.com/thetutlage)
- [Romain Lanz](https://github.com/RomainLanz)
- [Jackie Zhang](https://github.com/ReactiveXYZ-Dev) for older version (it used in Adonis 4) [Adonis queue pro](https://github.com/ReactiveXYZ-Dev/Adonis-Queue-Pro)

[travis-image]: https://img.shields.io/travis/reg2005/adonis5-queue/master.svg?style=for-the-badge&logo=travis
[travis-url]: https://travis-ci.org/reg2005/adonis5-queue "travis"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"

[npm-image]: https://img.shields.io/npm/v/adonis5-kue.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/adonis5-kue "npm"

[license-image]: https://img.shields.io/npm/l/adonis5-kue?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"
