import { generate } from 'https://deno.land/std@0.51.0/uuid/v4.ts'

class FaktoryJob {
  constructor(type, args) {
    this.jid = generate()
    this.jobtype = type
    this.args = args
  }
}

export { FaktoryJob }