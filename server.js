var path = require('path');
var mysql = require('mysql');
var express = require('express')
var bodyParser = require('body-parser');

const app = express();

app.use(bodyParser());

//Set the public folder
app.use(express.static(__dirname + '/public'));

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

//Generate 10 random movieIDs
var movieIDs = [];
for (let i = 0; i < 10; i++) {
  var rand = (Math.floor(Math.random() * 17770) + 1);
  movieIDs[i] = rand;
}

var similarCustomers = [[]];
var similarCustomers2 = [];

//Receive ratings from user
app.post('/', function (req, res) {

  //Store POST result in ratings array
  var ratings = Object.values(req.body.rating);
  for (var loop = 0; loop < ratings.length; loop++) {
    if (ratings[loop] == 0) {
      ratings[loop] = "5";
    }
  }

  function queryCustomerID(value) {
    return new Promise((resolve) => {
      var query = connection.query('SELECT customerID FROM ratings WHERE movieID = ' + movieIDs[value] + ' AND rating = ' + ratings[value], function (err, rows) {
        //assign to film
        var rowResults = [];
        if (err) {
          console.log(query.sql);
          console.log("MySQL error: ", err);
          return;
        }
        console.log(query.sql);
        //Add customers per film to array
        for (var currentRow = 0; currentRow < rows.length; currentRow++) {
          rowResults[currentRow] = rows[currentRow].customerID;
        }
        console.log("added customers to row")
        similarCustomers[value] = rowResults;
        resolve(value);
      });
    });
  }

  async function makeArray() {
    const promises = [];

    for (let i = 0; i < 10; i++) {
      promises.push(queryCustomerID(i));
    }

    await Promise.all(promises)
      .then((results) => {
        //console.log("All done", results);
      })
      .catch((e) => {
        // Handle errors here
      });
  }

  makeArray().then(() => {
    //Run this code after making similarCustomers array
    console.log("Finished Customer Array");
    //Compare customers in array
    //Check for repeat customers in different movies
    //X and Y represent the coordinates of the customer all other customers are being compared with
    //compareX and compareY represent the difference in coordinates relative to the compared customer
    for (var y = 0; y < 9; y++) {
      for (var x = 0; x < similarCustomers[y].length; x++) {
        for (var compareY = 1; compareY < 9; compareY++) {
          //Make sure arrays do not go out of bounds
          if ((compareY + y) <= 9) {
            for (var compareX = 1; compareX <
              similarCustomers[y + compareY].length; compareX++) {
              //Make sure arrays do not go out of bounds
              if ((compareX + x) <= similarCustomers[y + compareY].length) {
                //Compare Customers and print same ones
                if (similarCustomers[y][x] ==
                  similarCustomers[y + compareY][x + compareX]) {
                  console.log("Same Customer " + similarCustomers[y][x] +
                  ": ", x, ", ", y, " == ", (x + compareX), ", ",
                  (y + compareY));
                }
              }
            }
          }
        }
      }
    }
  }).catch((err) => {
    console.error(err);
  })

  //Response
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end('thanks')
});

//get name from movieID function
function get_info(movieID, callback) {
  var query = connection.query('SELECT movieName FROM movies WHERE movieID = ?', [movieID], function (err, rows) {
    if (err) {
      console.log(query.sql);
      console.log("MySQL error: ", err);
      return;
    }
    //console.log(query.sql);
    return callback(rows[0].movieName);
  })
}

//Assign movieNames from movieIDs
var movieNames = [];
for (let i = 0; i < 10; i++) {

  get_info(movieIDs[i], function (result) {
    movieNames[i] = result;
    //Run if all values have been assigned to movieNames
    if (i == 9) {
      //Code goes here

      //Page the user views
      app.get('/', function (req, res) {
        res.render(path.join(__dirname, 'public/index.html'));
      });

      app.get('/api', function (req, res) {
        res.json(movieNames);
      });

      const port = 500;
      app.listen(port);
      console.log(`Listening at http://localhost:${port}`);
    }
  })
}