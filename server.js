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
  password: 'ArnonPWSDatabase99',
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

//Arrays
var similarCustomers = [[]]; //All customers who have at least 1 movie with the same rating as the user
var similarCustomers2 = []; //All customers who have at least 2 movies with the same rating as the user
var customerMovies = [[]]; //All movies that have been seen by a customer in similarCustomers2 and which customer that is
var customerMoviesCount = []; //(2D array) Every movie that has been seen by a customer and the amount of times it has been seen
var recommendedMoviesID = []; //All IDs of movies that appears the most amount of times by everyone in similarCustomers2
var recommendedMoviesName = []; //RecommendedMoviesID but with movie names

var ratingCustomerCount = 50;
var similarCustomers2Limit = 10000;

//Receive ratings from user
app.post('/', function (req, res) {

  //Store POST result in ratings array
  var ratings = Object.values(req.body.rating);

  //If no value was entered, change rating to 5
  for (var loop = 0; loop < ratings.length; loop++) {
    if (ratings[loop] == 0) {
      ratings[loop] = "5";
    }
  }

  //Function that queries which customers have the same rating as the user and stores them in an array
  function queryMovieName(value) {
    return new Promise((resolve) => {
      var query = connection.query('SELECT movieName FROM movies WHERE movieID = ' + recommendedMoviesID[value], function (err, rows) {
        if (err) {
          console.log(query.sql);
          console.log("MySQL error: ", err);
          return;
        }
        //console.log(query.sql);
        recommendedMoviesName[value] = rows[0].movieName;
        resolve(value);
      });
    });
  }

  //Function that calls queryMovieName a certain number of times
  async function makeRecommendedMoviesNameArray(loops) {
    const promises = [];

    for (let i = 0; i < loops; i++) {
      promises.push(queryMovieName(i));
    }

    await Promise.all(promises)
      .then((results) => {
        //console.log("All done", results);
      })
      .catch((e) => {
        // Handle errors here
      });
  }


  //Function that queries which customers have the same rating as the user and stores them in an array
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
        //console.log(query.sql);
        //Add customers per film to array
        for (var currentRow = 0; currentRow < rows.length; currentRow++) {
          rowResults[currentRow] = rows[currentRow].customerID;
        }
        //console.log("added customers to row")
        similarCustomers[value] = rowResults;
        resolve(value);
      });
    });
  }

  //Function that calls queryCustomerID 10 times
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

  //Function which querys all rated 5 movies from a customerID
  function queryMovieFromCustomerID(value) {
    return new Promise((resolve) => {
      var query = connection.query('SELECT movieID FROM ratings WHERE rating = 5 AND customerID = ' + similarCustomers2[value], function (err, rows) {
        //assign to film
        var rowResults = [];
        if (err) {
          console.log(query.sql);
          console.log("MySQL error: ", err);
          return;
        }
        //console.log(query.sql);
        //Add customers per film to array
        for (var currentRow = 0; currentRow < rows.length; currentRow++) {
          rowResults[currentRow] = rows[currentRow].movieID;
        }
        //console.log("added movie ratings to customerID")
        customerMovies[value] = rowResults;
        console.log("finished query " + (value+1))
        resolve(value);
      });
    });
  }

  //Function which calls queryMovieFromCustomerID for every value in similarCustomers2[]
  async function makeMovieCustomerArray() {
    const promises = [];

    for (let i = 0; i < ratingCustomerCount; i++) {
      promises.push(queryMovieFromCustomerID(i));
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
    var count = 0;
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
                if (similarCustomers[y][x] == similarCustomers[y + compareY][x + compareX]) {
                  //console.log("Same Customer " + similarCustomers[y][x] +": ", x, ", ", y, " == ", (x + compareX), ", ",(y + compareY));
                  similarCustomers2[count] = similarCustomers[y][x];
                  count++;
                  //For performance, stop creating array past certain customer amount
                  if (similarCustomers2.length >= similarCustomers2Limit) {
                    console.log("stop creating array")
                    y = 9;
                    compareY = 0;
                    x = similarCustomers[9].length;
                    compareX = similarCustomers[9].length
                  }
                }
              }
            }
          }
        }
      }
    }
  }).then(() => {
    var similarCustomersTotalLength = 0;
    for (var i = 0; i < similarCustomers.length; i++) {
      similarCustomersTotalLength += similarCustomers[i].length;
    }
    console.log("Similar Customers: ", similarCustomersTotalLength);
    console.log("Similar Customers2: ", similarCustomers2.length);
    if (similarCustomers2.length < ratingCustomerCount) {
      ratingCustomerCount = similarCustomers2.length;
    }
    //Performance Hiccup
    makeMovieCustomerArray().then(() => {

      var uniqueMovieBool = true;
      var checkedMovieIDs = [];

      console.log("Starting customerMoviesCount array");
      //Organize every seperate movie and it's count from customer data
      for (var y = 0; y < ratingCustomerCount; y++) {
        for (var x = 0; x < customerMovies[y].length; x++) {
          for (var checkedMovieIDsCount = 0; checkedMovieIDsCount < checkedMovieIDs.length || (checkedMovieIDs.length == 0 && checkedMovieIDsCount == 0); checkedMovieIDsCount++) {
            if (customerMovies[y][x] == checkedMovieIDs[checkedMovieIDsCount]) {
              //console.log(customerMovies[y][x]," = not unique movie")
              customerMoviesCount[checkedMovieIDsCount][1] += 1;
              uniqueMovieBool = false;
              checkedMovieIDsCount = checkedMovieIDs.length;
            } else if (checkedMovieIDsCount >= checkedMovieIDs.length) {
              //console.log(customerMovies[y][x]," = unique movie")
              uniqueMovieBool = true;
            }
          }
          //Continue here for detected movie
          if (uniqueMovieBool) {
            //console.log("Calling unique movie")
            customerMoviesCount[checkedMovieIDs.length] = [2];
            customerMoviesCount[checkedMovieIDs.length][0] = customerMovies[y][x];
            customerMoviesCount[checkedMovieIDs.length][1] = 1;
            checkedMovieIDs.push(customerMovies[y][x]);
          }
        }
      }

      console.log("Finished customerMoviesCount array")

      //Find which movie appears most in similar customers
      var mostOccurences = 0;
      for (var i = 0; i < customerMoviesCount.length / 2; i++) {
        if (customerMoviesCount[i][1] > mostOccurences) {
          mostOccurences = customerMoviesCount[i][1];
          console.log("New most occurence, movieID " + customerMoviesCount[i][0] + " with " + mostOccurences)
        }
      }

      //Add most appearing movies to array
      for (var i = 0; i < customerMoviesCount.length / 2; i++) {
        if (customerMoviesCount[i][1] == mostOccurences) {
          recommendedMoviesID.push(customerMoviesCount[i][0]);
        }
      }

      
      console.log("Finished recommendedMovies array");

    }).then(() => {
      makeRecommendedMoviesNameArray(recommendedMoviesID.length).then(() => {
        console.log("Finished movie names query");
        console.log("found " + recommendedMoviesID.length + " recommended movies");
        res.writeHead(200, { 'Content-Type': 'text/html' })

        var endMessage = "";
        for (var i = 0; i < recommendedMoviesName.length; i++) {
          var temp = recommendedMoviesName[i] + "<br>";
          endMessage += temp;
        }
        res.end(endMessage);
      })
    }).catch((err) => {
      console.error(err);
    });
  }).catch((err) => {
    console.error(err);
  })
  // res.writeHead(200, { 'Content-Type': 'text/html' })
  // res.end('thanks')
});