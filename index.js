import FaktoryClient from './FaktoryClient.js'

let client = new FaktoryClient('localhost', 7419)

let conn = await client._connect()
let text = await client._readLine(conn)

console.log(text)

let response = await client._writeLine(conn, 'HELLO', {
  v: 2
})
console.log(response)

client._close(conn)