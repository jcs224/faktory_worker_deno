import FaktoryClient from './FaktoryClient.js'
import FaktoryWorker from './FaktoryWorker.js'

let client = new FaktoryClient('localhost', 7419)

// If Faktory server requires a password, simply pass it as a third argument to FaktoryClient
// let client = new FaktoryClient('localhost', 7419, 'somepassword')

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