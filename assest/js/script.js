/*
  Created:    09/3/2022 
  Programmer: Brian Zoulko
  Notes:      Devopled a javascript module to assist in controlling the quiz game challenge
              features.

  Modification
  ============
  09/3/20022 Brian Zoulko    Designed web-page and built a timed code taking quiz.
*/
var quizGameObj = {
  questions: ["What method concatenates all elements in to an array?", 
              "What method converts JavaScript values to a JSON string?", 
              "What method reloads the current document?", 
              "What variable type returns True or False?"],
  rightAnswers: ["join()", 
                 "JSON.stringify()", 
                 "reload()", 
                 "boolean()"],
  wrongAnswers: ["trim()", 
                 "splice()", 
                 "toString()", 
                 "valueOf()", 
                 "var", 
                 "let", 
                 "for", 
                 "if", 
                 "while", 
                 "do", 
                 "break", 
                 "return",
                 "const", 
                 "math", 
                 "console.log()"]
}

const cTime = 10 * quizGameObj.questions.length; // Seconds per round.
const cTopScoreLimit = 5;
var scoreSize = 2;
var timeLeft = cTime;
var question = document.getElementById("question");
var startQuizBtn = document.getElementById("quiz-button");
var quizCounter = document.getElementById("time-left");
var quizSelection = document.getElementById("quiz-selection");
var quizStatusFrom = document.getElementById("quiz-status-count-from");
var quizStatusTo = document.getElementById("quiz-status-count-to");
var topScoresCaption = document.getElementById("high-scores");
var topScoresList = document.getElementById("high-scores-list");

// Initial Colors for Questions.
var questionBackgroundColor = question.style.backgroundColor;
var questionColor = question.style.color;

// Create unordered list element
var ul = document.createElement("ul");

// Create all elements within unordered list section.
var lbl = document.createElement("label");
var li = document.createElement("li");
var sel = document.createElement("select");
var opt1 = document.createElement("option");
var opt2 = document.createElement("option");
var opt3 = document.createElement("option");
var opt4 = document.createElement("option");
var opt5 = document.createElement("option");

// Create list item section.
quizSelection.appendChild(ul);
ul.appendChild(li);
lbl.htmlFor = "answers";
lbl.textContent = "Select answer:";
sel.setAttribute("id", "quiz-answers");
li.appendChild(lbl);
li.appendChild(sel);  

// Load Quiz Selection Elements.
var highScores = getHighScores();
var rightAns = loadQuizSelection();
var liScores = [];
for (var i = 0; i < cTopScoreLimit; i++) liScores.push(document.createElement("li"));
showElement(quizSelection, false);
topScoresCaption.textContent = `Top ${cTopScoreLimit} High Scores`;
for (var i = 0; i < cTopScoreLimit; i++) topScoresList.appendChild(liScores[i]); 
updateHighScores(highScores);


/* *******************************
  Quiz timer for playing the game.
********************************** */
function startQuiz() {

  // Quiz Question counter.
  var quizCntr = 0;
  var to   = 0;
  var isWinner = true;

  // Initalize Question colors.
  question.style.backgroundColor = questionBackgroundColor;
  question.style.color = questionColor;
  
  // Start the game by disabling the button and initializing
  // the Quiz Timer. Also revert question style back to the 
  // way iot was when loading.
  quizStatusFrom.textContent = ++quizCntr;
  quizStatusTo.textContent = quizGameObj.questions.length;
  quizCounter.textContent = timeLeft;

  // Reset question sectional settings.
  rightAns = loadQuizSelection(quizCntr);
  enableElement(startQuizBtn, false);
  showElement(quizSelection, true);
  to = quizStatusTo.textContent;

  // Make sure the page starts from the top
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;  
  
  var timeInterval = setInterval(function () {

    selIdx = sel.selectedIndex;
    if (selIdx != 0) {

      // To be a winner, all answers must continue to be correct before 
      // time runs out.
      if (isWinner) isWinner = ((rightAns+1) === selIdx);

      // Determine if the right answer was given, otherwise deduct
      // 10 seconds from the time left in the game.
      if ((rightAns+1) != selIdx) timeLeft -= 10;

      // Determine if the user has run out of time.
      if (timeLeft < 0) {

        timeLeft = 0;

      } else {

        // Select next set of questions.        
        rightAns = loadQuizSelection(++quizCntr);
        quizStatusFrom.textContent = ((quizCntr <= to) ? quizCntr : to);
        sel.selectedIndex = 0; // Reset selection item to top of list.

      }
    }

    // Update Quiz Timer.
    quizCounter.textContent = timeLeft;

    // Determine when the game is over.
    if (quizCntr > to) {

      if (isWinner) {
        checkScore(timeLeft)
        winner();
      } else {
        gameOver(timeLeft);
      }

    } else {

      if (timeLeft > 0) {
        timeLeft--; // Decriment run time
      } else {        
        gameOver();
      }

    }

  }, 1000);

  
  /* ************
    Won the game.
  *************** */
  function winner(){
    showElement(quizSelection, false);
    question.style.backgroundColor = "green";
    question.style.color = "yellow";
    question.textContent = 'W I N N E R';
    enableElement(startQuizBtn, true);
    clearInterval(timeInterval);
    timeLeft = cTime;
  }
  

  /* **************************************************************
    Games Over, reset all values and prepare to start another game.
  ***************************************************************** */
  function gameOver(){
    showElement(quizSelection, false);
    question.style.backgroundColor = "maroon";
    question.style.color = "white";
    question.textContent = 'G A M E _ O V E R';
    enableElement(startQuizBtn, true);
    clearInterval(timeInterval);
    timeLeft = cTime;  
  }

}


/* *******************************************************
  Check Score to determine if it made the top of the list.
********************************************************** */
function checkScore(score) {
  // Obtain scores from local storage.
  var list = getHighScores();
  var inTheTop = true;

  // Determine if the score made it to the top.
  if (list !== null && list !== '') {
    list = sortScores(list);
    for (var x = 0; x < list.length; x++) {
      inTheTop = (score > list[x]);
      if (inTheTop) break;
    }
  }

  // Remove the last element from the list when the
  // top score limit is reached.
  if (list.length === cTopScoreLimit) list.pop;

  // Add winning score to the list.
  if (inTheTop) {
    list.push(score);
  }

  // Update local storage with new top scores.
  localStorage.setItem("scores", list.join(","));
  updateHighScores(list);
}


/* ******************************************
  Get list of High Scores from local storage.
********************************************* */
function getHighScores() {
  var scores = localStorage.getItem("scores");

  if (scores !== null && scores !== '') {
    return (scores.split(","));
  } else
    return ([""]);
}


/* ************************************************************
  Sort array list of numbers in reverse order, making sure to 
  pad each value with leading zeros to ensure proper sortation.
*************************************************************** */
function sortScores(numList) {
  for (var x = 0; x < numList.length; x++) {
    numList[x] = addLeadingZeros(numList[x], scoreSize);
  }
  return(numList.sort().reverse());
}


/* *****************************************************
  Format numbers with leading zeros to assist in reverse
  sortation of scores.
******************************************************** */
function addLeadingZeros(score, size) {
  score = score.toString();
  while (score.length < size) {
    score = "0" + score;
  }
  if (score === '00') score = '';
  return score;
}


/* **********************************************
  Update high scores in Top (x) High Scores List.
************************************************* */
function updateHighScores(scores) {
  scores = sortScores(scores);
  for (var ndx = 0; ndx < liScores.length; ndx++) {
    if (ndx > scores.length) 
      liScores[ndx].textContent = "";
    else
      liScores[ndx].textContent = scores[ndx];
  }
}


/* ****************************************************
  Load quiz selection list with answers to select from.
******************************************************* */
function loadQuizSelection(ans) {
  // Set question to be answered.
  if (!ans) return;
  
  // Obtain the index where the write answer will be placed.
  //var ans = getRandonIndex(quizGameObj.questions.length);  

  // Update question text before selecting arbitrary wrong answers.
  question.textContent = quizGameObj.questions[--ans];

  // Load Answer and WrongAnswers...  
  opt1.textContent = "";
  for (var i = 0; i < quizGameObj.questions.length; i++) {  
    switch (i) {
      case 0:
        opt2.textContent = (ans === i ? quizGameObj.rightAnswers[i] : quizGameObj.wrongAnswers[i]);
        break;
      case 1:
        opt3.textContent = (ans === i ? quizGameObj.rightAnswers[i] : quizGameObj.wrongAnswers[i]);
        break;
      case 2:
        opt4.textContent = (ans === i ? quizGameObj.rightAnswers[i] : quizGameObj.wrongAnswers[i]);
        break;
      case 3:
        opt5.textContent = (ans === i ? quizGameObj.rightAnswers[i] : quizGameObj.wrongAnswers[i]);
        break;
    }    
  }

  // Append list items to ordered list element 
  sel.appendChild(opt1);
  sel.appendChild(opt2);
  sel.appendChild(opt3);
  sel.appendChild(opt4);
  sel.appendChild(opt5);

  // Return the right answer index.
  return (ans);
}


/* ***********************
  Hide or Show an element.
************************** */
function showElement(element, bShow) {
  element.style.visibility = (bShow ? 'visible' : 'hidden');
}


/* ****************************
  Disable or Enable an element.
******************************* */
function enableElement(element, bEnable) {
  element.disabled = (bEnable ? '' : 'disabled');
}

/* **********************************************************************
  Obtain a randomly selected index based on a factor (aka: number range).
************************************************************************* */
function getRandonIndex(factor) {  
  return(Math.floor(Math.random() * factor));
}


// Add an event listener for the button click.
startQuizBtn.addEventListener("click", startQuiz);
