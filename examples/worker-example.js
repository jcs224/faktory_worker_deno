import { FaktoryClient, FaktoryWorker } from 'https://raw.githubusercontent.com/jcs224/faktory_worker_deno/v0.1.1/mod.js'

// let client = new FaktoryClient('localhost', 7419, 'somepassword') // Example with password
let client = new FaktoryClient('localhost', 7419, 'passthis')

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