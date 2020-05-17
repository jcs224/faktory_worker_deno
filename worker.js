import FaktoryClient from './FaktoryClient.js'
import FaktoryWorker from './FaktoryWorker.js'

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

await worker.run(true)
client.close()