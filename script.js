var weight;
var excercise;
var tempWeight;
var reps;
var document;
var element = 0,
  c = 0;
//Check if origin main commmand works

function returnWeight() {
  console.log("is it working???");
  excercise = document.getElementById("excercise").value;
  tempWeight = document.getElementById("weight").value;
  reps = document.getElementById("reps").value;
  calculateOneRepMax(tempWeight, reps);
  reset();
  document.getElementById("temp").innerHTML = "";
  console.log("working? p2");
  document.getElementById("reset").innerHTML = "Want to reset?";
  document.getElementById("message").innerHTML =
    "Hi there, your 1RM estimated weight is: " +
    weight +
    "Kg" +
    "<br />" +
    "Your routine for " +
    excercise +
    " is below:";

  headingHTML();
  initializeListHTML();

  reps1 = ["5 reps (65%):  ", "5 reps (75%): ", "5+ reps (85%): "];
  reps2 = ["3 reps (70%): ", "3 reps (80%): ", "3+ reps (90%): "];
  reps3 = ["5 reps (75%): ", "3 reps (85%): ", "1+ reps (95%): "];
  percentages1 = [0.65, 0.75, 0.85];
  percentages2 = [0.7, 0.8, 0.9];
  percentages3 = [0.75, 0.85, 0.95];
  console.log("working? p3");

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
  document.getElementById("week-heading1").innerHTML = "Week 1";
  document.getElementById("week-heading2").innerHTML = "Week 2";
  document.getElementById("week-heading3").innerHTML = "Week 3";
}
function reset() {
  document.getElementById("reset").innerHTML = "";
  document.getElementById("temp").innerHTML = "";
  document.getElementById("message").innerHTML = "";
  document.getElementById("week-heading1").innerHTML = "";
  document.getElementById("week-heading2").innerHTML = "";
  document.getElementById("week-heading3").innerHTML = "";
  document.getElementById("output1").innerHTML = "";
  document.getElementById("output2").innerHTML = "";
  document.getElementById("output3").innerHTML = "";
}
function resetHTML() {
  document.getElementById("reset").innerHTML = "";
  document.getElementById("temp").innerHTML =
    "You're not supposed to be here! &#128517";
  document.getElementById("message").innerHTML = "";
  document.getElementById("week-heading1").innerHTML = "";
  document.getElementById("week-heading2").innerHTML = "";
  document.getElementById("week-heading3").innerHTML = "";
  document.getElementById("output1").innerHTML = "";
  document.getElementById("output2").innerHTML = "";
  document.getElementById("output3").innerHTML = "";
}

function editArray(reps, percentages) {
  let n = reps.length;
  for (var i = 0; i < n; i++) {
    reps[i] =
      reps[i] + Math.floor((percentages[i] * weight) / 2.5) * 2.5 + " Kg";
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
  });
}
function outputAllArrays() {
  outputEach(reps1, list1);
  outputEach(reps2, list2);
  outputEach(reps3, list3);
}
function calculateOneRepMax(tempWeight, reps) {
  if (reps == 1) {
    weight = tempWeight;
  } else {
    weight = Math.round(tempWeight * (1 + reps / 30));
  }
}

function scrollToSection(sectionId) {
  var section = document.getElementById(sectionId);
  section.scrollIntoView({ behavior: "smooth" });
}
