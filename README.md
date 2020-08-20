# Faktory Deno Library
[Faktory](https://github.com/contribsys/faktory) job queue library for Deno.

### Supported Faktory versions
- 1.4.0

It could work on earlier versions, but untested.

## Usage

### Pushing jobs
```js
import { FaktoryClient, FaktoryJob } from 'https://raw.githubusercontent.com/jcs224/faktory_worker_deno/v0.1.3/mod.ts'

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let client = new FaktoryClient('localhost', 7419, 'optionalpassword')
await client.connect()

// Create job
let job = new FaktoryJob('adder', [
  randomIntFromInterval(1, 10),
  randomIntFromInterval(1, 10)
])
// Push job
await client.push(job)

// Push another job
let job2 = new FaktoryJob('anotherjob', [])
await client.push(job2)

client.close()
```

### Fetching and executing jobs
```js
import { FaktoryClient, FaktoryWorker } from 'https://raw.githubusercontent.com/jcs224/faktory_worker_deno/v0.1.3/mod.ts'

let client = new FaktoryClient('localhost', 7419, 'optionalpassword')
await client.connect()
let worker = new FaktoryWorker(client)

worker.register('adder', (job) => {
  console.log(job)
  console.log('args added together: '+ (job[0] + job[1]))

  // Throw an error object to mark the job as failed, putting it in the queue for a retry
  // throw {
  //   type: 'Adder error',
  //   message: 'Something went wrong.'
  // }
})

// Register multiple jobs with the same worker
worker.register('anotherjob', (job) => {
  console.log('whatever else')
})

await worker.run(true)
client.close()
```