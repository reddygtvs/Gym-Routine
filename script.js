function returnWeight() {
    var weight = document.getElementById("weight").value;
    //document.write("Hello there, your weight is: " + weight + " kg");
    document.getElementById("message").innerHTML = "Hi there, your weight is: " + weight;
    return false;
}