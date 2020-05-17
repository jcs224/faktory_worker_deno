import FaktoryClient from './FaktoryClient.js'
import FaktoryJob from './FaktoryJob.js'

let client = new FaktoryClient('localhost', 7419)

let job = new FaktoryJob('adder', [1, 3])

await client.push(job)