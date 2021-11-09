var path = require('path');
var mysql = require('mysql');
var express = require('express')
var bodyParser = require('body-parser');

const app = express();

app.use(bodyParser());

//Set the public folder
app.use(express.static(__dirname + '/public'));

//Set html page
// app.get('/', function (req, res) {
//   res.sendFile(path.join(__dirname, 'public/index.html'));
// });

//Receive ratings from user
app.post('/', function (req, res) {
  console.log('POST /')
  console.log(req.body.rating)
  let ratings = (req.body.rating);
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end('thanks')
});

//Connect to MySQL database
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '*****',
  database: 'pws'
});

connection.connect(function (err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
  console.log('Connected to the MySQL server.');
});

//get name from movieID function
function get_info(movieID, callback) {
  var query = connection.query('SELECT movieName FROM movies WHERE movieID = ?', [movieID], function (err, rows) {
    if (err) {
      console.log(query.sql());
      console.log("MySQL error: ", err);
      return;
    }
    //console.log(query.sql);
    return callback(rows[0].movieName);
  })
}

var rateMovies = [];

//Assign 10 random movies to rateMovies
for (let i = 0; i < 10; i++) {
  rand = Math.floor(Math.random() * 17770) + 1;
  get_info(rand, function (result) {
    rateMovies[i] = result;
    //Check to see if all values have been assigned to rateMovies
    if (i == 9) {
      //Code goes here
      for (let j = 0; j < 10; j++) {
        console.log(rateMovies[j]);
      }

      //Page the user views
      app.get('/', function (req, res) {
        res.render(path.join(__dirname, 'public/index.html'));
      });

      data = [
        {
          "id": 1,
          "name": "Jhon"
        },
        {
          "id": 2,
          "name": "Mike"
        }
      ];

      app.get('/api', function (req, res) {
        res.json(rateMovies);
      });

      const port = 500;
      app.listen(port);
      console.log(`Listening at http://localhost:${port}`);
    }
  })
}

// const port = 500;
// app.listen(port);
// console.log(`Listening at http://localhost:${port}`);