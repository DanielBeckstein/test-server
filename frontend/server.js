import http from "node:http"
import fs from "node:fs"

let server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" })
  res.end(fs.readFileSync("index.html", "utf-8"))
})

server.listen(3000, () => {
  console.log("Frontend running on port 3000")
})
