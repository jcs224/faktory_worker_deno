import FaktoryClient from './FaktoryClient.js'
import FaktoryJob from './FaktoryJob.js'

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let client = new FaktoryClient('localhost', 7419, 'passthis')
await client.connect()

let job = new FaktoryJob('adder', [
  randomIntFromInterval(1, 10),
  randomIntFromInterval(1, 10)
])

await client.push(job)