var express = require('express')
var fs = require('fs')
var app = express()
var bodyParser = require('body-parser');


app.use(bodyParser())

app.get('/', function (request, response) {
  response.sendfile("./index.html");
})

app.post('/', function (request, response) {
  console.log('POST /')
  console.dir(request.body)
  console.log(request.body["test"])
  response.writeHead(200, { 'Content-Type': 'text/html' })
  response.end('thanks')
})

const port = 500
app.listen(port)
console.log(`Listening at http://localhost:${port}`)