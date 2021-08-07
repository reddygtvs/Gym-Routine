var weight;
var document;
var element = 0, c=0;


function returnWeight() {
    weight = document.getElementById("weight").value;
    document.getElementById("message").innerHTML = "Hi there, your 1RM weight is: " + weight + "Kg";
    headingHTML();
    resetHTML();
    initializeListHTML();
    
    reps1 = ['5 reps (65%):  ', '5 reps (75%): ', '5+ reps (85%): '];
    reps2 = ['3 reps (70%): ', '3 reps (80%): ', '3+ reps (90%): '];
    reps3 = ['5 reps (75%): ', '3 reps (85%): ', '1+ reps (95%): '];
    percentages1 = [.65, .75, .85];
    percentages2 = [.70, .80, .90]; 
    percentages3 = [.75, .85, .95];
    
    
     editAllArrays();
     outputAllArrays();
     return false;
}
function initializeListHTML() {
    list1 = document.getElementById("output1");
    list2 = document.getElementById("output2");
    list3 = document.getElementById("output3");
}
function headingHTML() {
    document.getElementById("week-heading1").innerHTML="Week 1";
    document.getElementById("week-heading2").innerHTML="Week 2";
    document.getElementById("week-heading3").innerHTML="Week 3";
}
function resetHTML() {
    document.getElementById("output1").innerHTML = "";
    document.getElementById("output2").innerHTML = "";
    document.getElementById("output3").innerHTML = "";
}
function editArray(reps, percentages) {
    let n = reps.length;
    for (var i = 0; i < n; i++) {
        reps[i] = reps[i] + (Math.floor(percentages[i] * weight / 5) * 5) + " Kg";
    }
}
function editAllArrays() {
    editArray(reps1, percentages1);
    editArray(reps2, percentages2);
    editArray(reps3, percentages3);
}
function outputEach(reps, list) {
    reps.forEach((item) => {
        let li = document.createElement("li");
        li.innerHTML = item;
        list.appendChild(li);
    })
}
function outputAllArrays() {
    outputEach(reps1, list1);
    outputEach(reps2, list2);
    outputEach(reps3, list3);
}
