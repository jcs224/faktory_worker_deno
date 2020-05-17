class FaktoryClient {
  constructor(host, port, password = null) {
    this.faktoryHost = host
    this.faktoryPort = port
    this.faktoryPassword = password
    this.worker = null
    this.connection = null
  }

  setWorker(worker) {
    this.worker = worker
  }

  async push(job) {
    await this._writeLine('PUSH '+JSON.stringify(job))
  }

  async fetch(queues = ['default']) {
    let response = await this._writeLine('FETCH '+queues.join(' '))

    if (response.includes('jid') && !response.includes('$-1')) {
      let jobString = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1)
      try {
        let parsedJob = JSON.parse(jobString)
        return parsedJob
      } catch {
        return null
      }
    } else {
      return null
    }
  }

  async ack(jobId) {
    await this._writeLine('ACK '+JSON.stringify({ jid: jobId }))
  }

  async fail(jobId, errorType = 'Unknown', message = 'Job failed.') {
    await this._writeLine('FAIL '+JSON.stringify({
      jid: jobId,
      errType: errorType,
      message: message
    }))
  }

  async connect() {
    this.connection = await Deno.connect({
      hostname: this.faktoryHost,
      port: this.faktoryPort
    })

    let response = await this._readLine()

    if (!response.includes('+HI')) {
      throw 'HI not received.'
    }

    await this._writeLine('HELLO '+JSON.stringify({ v: 2 }))
  }

  close() {
    Deno.close(this.connection.rid)
  }

  async _readLine() {
    let buf = new Uint8Array(4096)
    await Deno.read(this.connection.rid, buf)
    let text = new TextDecoder().decode(buf)
    return text
  }

  async _writeLine(stringPayload) {
    let payload = stringPayload + '\r\n'
    let encodedPayload = new TextEncoder().encode(payload)
    await Deno.write(this.connection.rid, encodedPayload)
    let response = await this._readLine()
    return response
  }
}

export default FaktoryClient