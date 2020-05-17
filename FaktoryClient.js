class FaktoryClient {
  constructor(host, port, password = null) {
    this.faktoryHost = host
    this.faktoryPort = port
    this.faktoryPassword = password
    this.worker = null
  }

  setWorker(worker) {
    this.worker = worker
  }

  async push(job) {
    let conn = await this._connect()
    await this._writeLine(conn, 'PUSH '+JSON.stringify(job))
    await this._close(conn)
  }

  async fetch(queues = ['default']) {
    let conn = await this._connect()
    let response = await this._writeLine(conn, 'FETCH '+queues.join(' '))
    await this._close(conn)

    if (response.includes('$') && !response.includes('$-1')) {
      let jobString = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1)
      return JSON.parse(jobString)
    } else {
      return null
    }
  }

  async ack(jobId) {
    let conn = await this._connect()
    await this._writeLine(conn, 'ACK '+JSON.stringify({ jid: jobId }))
    await this._close(conn)
  }

  async _connect() {
    let conn = await Deno.connect({
      hostname: this.faktoryHost,
      port: this.faktoryPort
    })

    let response = await this._readLine(conn)

    if (!response.includes('+HI')) {
      throw 'HI not received.'
    }

    await this._writeLine(conn, 'HELLO '+JSON.stringify({ v: 2 }))

    return conn
  }

  async _readLine(conn) {
    let contents = ''
    while (contents.indexOf('\r\n') === -1) {
      let buf = new Uint8Array(1024)
      await Deno.read(conn.rid, buf)
      let text = new TextDecoder().decode(buf)
      contents = contents + text
    }
  
    // Much slower method, but less code
    // let buf = await Deno.readAll(conn)
    // let contents = new TextDecoder().decode(buf)
  
    return contents
  }

  async _writeLine(conn, stringPayload) {
    let payload = stringPayload + '\r\n'
    let encodedPayload = new TextEncoder().encode(payload)
    await Deno.write(conn.rid, encodedPayload)
    let response = await this._readLine(conn)
    return response
  }

  _close(conn) {
    Deno.close(conn.rid)
  }
}

export default FaktoryClient