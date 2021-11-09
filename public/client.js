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
    let submitForm = document.createElement("form");
    submitForm.setAttribute("method", "post")
    submitForm.setAttribute("action", "/")
    submitForm.id = "submitForm";
    document.body.appendChild(submitForm);

    var parent = document.getElementById("submitForm");
    for (var i = 0; i < 10; i++) {

        //Create text box and label
        submitForm.innerHTML += (rateMovies[i] + ": ");

        let input = document.createElement("input");
        input.type = "number";
        input.name = "rating";
        input.value = "";
        input.step = "0.1";
        input.classList.add("ratingInput");
        parent.appendChild(input);
        submitForm.innerHTML += "<br><br>";
    }

    //Create button
    let button = document.createElement("input");
    button.type = "submit";
    button.value = "Submit";
    parent.appendChild(button);

}

var ratingInput = document.getElementsByClassName("ratingInput");

//Keep text value between 1 and 5
for (var i = 0; i < ratingInput.length; i++) {
    ratingInput[i].addEventListener('change', function () {
        console.log("awaawaaa");
        let v = parseInt(this.value);
        if (v < 1) this.value = 1;
        if (v > 5) this.value = 5;
    }, false);
}