import { generate } from 'https://deno.land/std@0.51.0/uuid/v4.ts'

class FaktoryWorker {
  constructor(client) {
    this.client = client
    this.queues = ['default']
    this.jobType = ''
    this.jobFunction = null
    this.id = generate()
    this.client.setWorker(this)
  }

  register(jobType, callable) {
    this.jobType = jobType
    this.jobFunction = callable
  }

  async run() {
    let inJob = await this.client.fetch(this.queues)

    if (inJob) {
      if (inJob.jobtype == this.jobType) {
        this.jobFunction.call(this, inJob.args)
        await this.client.ack(inJob.jid)
      }
    }
  }
}

export default FaktoryWorker