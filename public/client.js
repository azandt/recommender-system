//Print in console that loading this file was succesful
console.log('client.js loaded');

//Function to create rating submit button
function createSubmitbtn() {
    let submitForm = document.createElement("form");
    submitForm.setAttribute("method", "post")
    submitForm.setAttribute("action", "/")
    submitForm.id = "submitForm";
    document.body.appendChild(submitForm);

    let formData = new FormData();
    formData.name = "John";

    var parent = document.getElementById("submitForm");
    for (var i = 0; i < 10; i++) {

        submitForm.innerHTML += ("label " + i + " ");

        let input = document.createElement("input");
        input.type = "text";
        input.name = "test";
        input.value = "";
        parent.appendChild(input);
        submitForm.innerHTML += "<br><br>";

    }

    let button = document.createElement("input");
    button.type = "submit";
    button.value = "Submit";
    parent.appendChild(button);

}

createSubmitbtn();

var submitInput = document.getElementsByClassName("submitInput");

//Keep text value between 1 and 5
for (var i = 0; i < submitInput.length; i++) {
    submitInput[i].addEventListener('change', function () {
        console.log("awaawaaa");
        let v = parseInt(this.value);
        if (v < 1) this.value = 1;
        if (v > 5) this.value = 5;
    }, false);
}