//Print in console that loading this file was succesful
console.log('client.js loaded');

var rateMovies = {};

//Fetch movie titles from server
fetch('http://localhost:500/api')
    .then(response => response.json())
    .then(data => {
        rateMovies = data;
        createSubmitbtn()
    })

//Function to create rating submit button
function createSubmitbtn() {
    //Create form
    let submitForm = document.createElement("form");
    submitForm.setAttribute("method", "post")
    submitForm.setAttribute("action", "/")
    submitForm.setAttribute("enctype", "application/json")
    submitForm.id = "submitForm";
    document.body.appendChild(submitForm);

    var parent = document.getElementById("submitForm");

    //Create 10 inputs
    for (var i = 0; i < 10; i++) {

        //Create text box and label
        let label = document.createElement("label");
        label.name = rateMovies[i];
        label.id = "label" + i;
        label.for = "input" + i;
        label.innerHTML = (rateMovies[i]);
        parent.appendChild(label);

        let input = document.createElement("input");
        input.type = "number";
        input.name = "rating";
        input.value = "";
        input.step = "1";
        input.id = "input" + i;
        parent.appendChild(input);
        parent.innerHTML += "<br>";
    }

    //Create button
    let button = document.createElement("input");
    button.id = "button";
    button.type = "submit";
    button.value = "Submit";
    parent.appendChild(button);

    var ratingInput = document.getElementsByClassName("ratingInput");

    //Keep input value between 1 and 5
    for (var i = 0; i < ratingInput.length; i++) {
        ratingInput[i].addEventListener('change', function () {
            let v = parseInt(this.value);
            if (v < 1) this.value = 1;
            if (v > 5) this.value = 5;
        }, false);
    }

    //Load CSS
    //Create new link Element
    var link = document.createElement('link');

    //Set the attributes for link element
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'style.css';

    // Get HTML head element to append link element to it 
    document.getElementsByTagName('HEAD')[0].appendChild(link);
}