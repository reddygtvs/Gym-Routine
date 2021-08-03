var weight;
var document;
var reps;
var list;
var element = 0;


function returnWeight() {
    weight = document.getElementById("weight").value;
    document.getElementById("message").innerHTML = "Hi there, your 1RM weight is: " + weight;
    
    reps = ['5 reps (65%): ', '5 reps (75%): ', '5+ reps (85%): ', '3 reps (70%): ', '3 reps (80%): ', '3+ reps (90%): ', '5 reps (75%): ', '3 reps (85%): ', '1+ reps (95%): '];
    percentages = [65, 75, 85, 70, 80, 90, 75, 85, 95];
    editArray(reps, percentages);
    document.getElementById("output").innerHTML = "";
    list = document.getElementById("output");
    
    reps.forEach((item) => {
        let li = document.createElement("li");
        li.innerHTML = item;
        list.appendChild(li);
    })
    
    return false;

}
function calcPercentage(percent, weight) {
    let w = percent * weight;
    return w / 100.0;
}
function editArray(reps, percentages) {
    let n = reps.length;
    for (var i = 0; i < n; i++) {
        reps[i] = reps[i] + calcPercentage(percentages[i], weight) + " Kg";
    }
}