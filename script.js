var weight = 0;
var excercise;
var tempWeight;
var reps;
var document;
var element = 0, c=0;
var week = 1;
var check = 1;
//Check if origin main commmand works 

function returnWeight() {
    if (check == 1) {
    excercise = document.getElementById("excercise").value;
    tempWeight = document.getElementById("weight").value;
    reps = document.getElementById("reps").value;
    calculateOneRepMax(tempWeight, reps);
    }
    resetHTML();
    document.getElementById("temp").innerHTML="";
    document.getElementById("reset").innerHTML="Want to reset?"
    document.getElementById("message").innerHTML = "Hi there, your 1RM estimated weight is: " + weight + "Kg" + "<br />" + "Your routine for " + excercise + " is below:";
   
    headingHTML();
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
    document.getElementById("week-heading1").innerHTML="Week " + week;
    document.getElementById("week-heading2").innerHTML="Week " + (week + 1);
    document.getElementById("week-heading3").innerHTML="Week " + (week + 2);
}
function resetAll() {
    resetHTML();
    week = 1;
    check = 1;
}
function resetHTML() {
    //week = 1;
    document.getElementById("reset").innerHTML="";
    document.getElementById("temp").innerHTML="You're not supposed to be here! &#128517";
    document.getElementById("message").innerHTML ="";
    document.getElementById("week-heading1").innerHTML="";
    document.getElementById("week-heading2").innerHTML="";
    document.getElementById("week-heading3").innerHTML=""
    document.getElementById("output1").innerHTML = "";
    document.getElementById("output2").innerHTML = "";
    document.getElementById("output3").innerHTML = "";
}

function editArray(reps, percentages) {
    let n = reps.length;
    for (var i = 0; i < n; i++) {
        reps[i] = reps[i] + (Math.floor(percentages[i] * weight / 2.5) * 2.5) + " Kg";
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
function calculateOneRepMax(tempWeight, reps) {
    if (reps === '1') {
        weight = Math.round(tempWeight);
    } else {
        weight = Math.round(tempWeight * (1 + reps / 30));
    }
    
}
function nextWeek() {
    next = document.getElementById("next").value;
    if (next === "No") {
        if (excercise === "Deadlift" || excercise === "Squat") {
            weight -= 5;
        } else {
            weight -= 2.5;
        }
    } else {
        if (excercise === "Deadlift" || excercise === "Squat") {
            weight += 5;
        } else {
            weight += 2.5;
        }
    }
    // document.getElementById("weight").value = weight;
    // document.getElementById("reps").value = 1;
    week += 3;
    check = 0;
    returnWeight();
    return false;
}
