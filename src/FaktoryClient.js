import { Sha256 } from 'https://deno.land/std@0.51.0/hash/sha256.ts'
import merge from 'https://deno.land/x/lodash@4.17.15-es/merge.js'

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
    let requestDefaults = {
      v: 2
    }

    this.connection = await Deno.connect({
      hostname: this.faktoryHost,
      port: this.faktoryPort
    })

    let response = await this._readLine()

    if (!response.includes('+HI')) {
      throw 'HI not received.'
    }

    // if password required
    if (response.includes('"i":') && response.includes('"s":')) {

      if (!this.faktoryPassword) {
        throw 'Password is required.'
      }

      let payloadString = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1)
      let payloadJSON = JSON.parse(payloadString)
      
      let authData = this.faktoryPassword + payloadJSON.s
      let sha = new Sha256()
      authData = sha.update(authData)
      for (let i = 1; i < payloadJSON.i; i++) {
        let iterSha = new Sha256()
        authData = iterSha.update(authData.digest())
      }
      let finalHex = authData.hex()
      merge(requestDefaults, { pwdhash: finalHex })
    }

    let passwordResponse = await this._writeLine('HELLO '+JSON.stringify(requestDefaults))

    if (passwordResponse.includes('ERR Invalid password')) {
      throw 'Password is incorrect.'
    }
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

export { FaktoryClient }