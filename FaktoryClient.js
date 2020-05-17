class FaktoryClient {
  constructor(host, port, password = null) {
    this.faktoryHost = host
    this.faktoryPort = port
    this.faktoryPassword = password
  }

  async _connect() {
    return await Deno.connect({
      hostname: this.faktoryHost,
      port: this.faktoryPort
    })
  }

  async _readLine(conn) {
    let contents = ''
    while (contents.indexOf('\r\n') === -1) {
      let buf = new Uint8Array(100)
      await Deno.read(conn.rid, buf)
      let text = new TextDecoder().decode(buf)
      contents = contents + text
    }
  
    // Much slower method, but less code
    // let buf = await Deno.readAll(conn)
    // let contents = new TextDecoder().decode(buf)
  
    return contents
  }

  async _writeLine(conn, command, json) {
    let payload = command + ' ' + JSON.stringify(json) + '\r\n'
    let encodedPayload = new TextEncoder().encode(payload)
    await Deno.write(conn.rid, encodedPayload)
    let response = await this._readLine(conn)
    return response
  }
}

export default FaktoryClient