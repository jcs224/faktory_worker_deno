async function readLine(conn) {
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

let conn = await Deno.connect({
  hostname: 'localhost',
  port: 7419
})

let finalText = await readLine(conn)

console.log(finalText)