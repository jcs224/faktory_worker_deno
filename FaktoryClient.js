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
      let buf = new Uint8Array(100 - contents.length)
      await Deno.read(conn.rid, buf)
      let text = new TextDecoder().decode(buf)
      contents = contents + text
    }
  
    // Much slower method, but less code
    // let buf = await Deno.readAll(conn)
    // let contents = new TextDecoder().decode(buf)
  
    return contents
  }
}

export default FaktoryClient