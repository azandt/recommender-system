var express = require('express')
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

app.use(bodyParser())

//Set the public folder
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
})

app.post('/', function (req, res) {
  console.log('POST /')
  console.dir(req.body)
  console.log(req.body["test"])
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end('thanks')
})

const port = 500
app.listen(port)
console.log(`Listening at http://localhost:${port}`)