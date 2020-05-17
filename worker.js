import FaktoryClient from './FaktoryClient.js'
import FaktoryWorker from './FaktoryWorker.js'

let client = new FaktoryClient('localhost', 7419)
let worker = new FaktoryWorker(client)

worker.register('adder', (job) => {
  console.log(job)
  console.log('adding '+ (job[0] + job[1]))
})

await worker.run()