import FaktoryClient from './FaktoryClient.js'
import FaktoryJob from './FaktoryJob.js'

let client = new FaktoryClient('localhost', 7419)

let job1 = new FaktoryJob('cooljob', [1, 2])

await client.push(job1)