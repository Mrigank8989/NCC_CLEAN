let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let timer = null;
let timeElapsed = 0;
let isReviewMode = false;
let hasBlurred = false;
let camInitInProgress = false;
let isConfirming = false;
let quizSubmitted = false;

document.addEventListener("DOMContentLoaded", () => {
  initWebcam();
  initializeQuiz();
  setupControls();
  setupBlurDetection();
});

function initWebcam() {
  camInitInProgress = true;
  const video = document.getElementById("webcam");
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.play();
      video.style.display = "block";
      camInitInProgress = false;
    })
    .catch(err => {
      console.warn("Webcam error:", err);
      camInitInProgress = false;
    });
}

function captureSnapshot() {
  const video = document.getElementById("webcam");
  const canvas = document.getElementById("snapshotCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL("image/png");
}

function setupBlurDetection() {
  window.addEventListener("blur", () => {
    if (!quizSubmitted && !hasBlurred && !isReviewMode && !camInitInProgress) {
      hasBlurred = true;
      alert("Tab switch detected. Submitting quiz.");
      finishQuiz();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (
      document.visibilityState === "hidden" &&
      !quizSubmitted &&
      !hasBlurred &&
      !isReviewMode &&
      !camInitInProgress &&
      !isConfirming
    ) {
      hasBlurred = true;
      alert("You minimized or switched tab. Submitting quiz.");
      finishQuiz();
    }
  });
}

function initializeQuiz() {
  hasBlurred = false;
  const selectedQuiz = JSON.parse(sessionStorage.getItem("selectedQuiz"));
  if (!selectedQuiz) return window.location.href = "dashboard.html";

  const questions = quizData.getQuizQuestions(selectedQuiz.difficulty, selectedQuiz.setNumber);
  if (!questions || questions.length === 0) {
    alert("Failed to load quiz. Try again.");
    return window.location.href = "dashboard.html";
  }

  currentQuiz = {
    difficulty: selectedQuiz.difficulty,
    setNumber: selectedQuiz.setNumber,
    questions,
    totalQuestions: questions.length
  };

  userAnswers = Array(currentQuiz.totalQuestions).fill(null);
  document.getElementById("quizTitle").textContent =
    `${capitalizeFirstLetter(currentQuiz.difficulty)} - Quiz Set ${currentQuiz.setNumber}`;

  showQuestion(0);
  startTimer();
}

function showQuestion(index) {
  if (!currentQuiz || index < 0 || index >= currentQuiz.totalQuestions) return;
  currentQuestionIndex = index;
  const question = currentQuiz.questions[index];

  document.getElementById("questionCounter").textContent = `Question ${index + 1} of ${currentQuiz.totalQuestions}`;
  document.getElementById("progressBar").style.width = `${((index + 1) / currentQuiz.totalQuestions) * 100}%`;
  document.getElementById("questionText").textContent = question.question;

  const optionsContainer = document.getElementById("optionsContainer");
  optionsContainer.innerHTML = "";

  question.options.forEach((option, i) => {
    const optionDiv = document.createElement("div");
    optionDiv.className = "option";
    if (userAnswers[index] === i) optionDiv.classList.add("selected");
    optionDiv.innerHTML = `<span class="option-text">${option}</span>`;

    if (!isReviewMode) {
      optionDiv.addEventListener("click", () => selectOption(i));
    }

    optionsContainer.appendChild(optionDiv);
  });

  if (isReviewMode) showAnswers();
  updateButtonStates();
}

function selectOption(optionIndex) {
  userAnswers[currentQuestionIndex] = optionIndex;
  const options = document.querySelectorAll(".option");
  options.forEach((opt, i) => {
    opt.classList.toggle("selected", i === optionIndex);
  });
}

function setupControls() {
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentQuestionIndex > 0) showQuestion(currentQuestionIndex - 1);
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentQuestionIndex < currentQuiz.totalQuestions - 1)
      showQuestion(currentQuestionIndex + 1);
  });

  document.getElementById("submitBtn").addEventListener("click", () => {
    if (quizSubmitted) return;
    const unanswered = getUnansweredCount();
    isConfirming = true;
    const confirmSubmit = confirm(
      unanswered > 0
        ? `You have ${unanswered} unanswered questions. Submit anyway?`
        : "Submit your quiz?"
    );
    isConfirming = false;
    if (confirmSubmit) finishQuiz();
  });

  document.getElementById("reviewBtn").addEventListener("click", reviewQuiz);
  document.getElementById("dashboardBtn").addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
}

function updateButtonStates() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");

  prevBtn.classList.toggle("disabled", currentQuestionIndex === 0);

  if (isReviewMode) {
    nextBtn.classList.remove("hidden");
    submitBtn.classList.remove("hidden");
  } else {
    nextBtn.classList.toggle("hidden", currentQuestionIndex === currentQuiz.totalQuestions - 1);
    submitBtn.classList.toggle("hidden", currentQuestionIndex !== currentQuiz.totalQuestions - 1);
  }
}


function startTimer() {
  const totalTime = 3000;
  const endTime = Date.now() + totalTime * 1000;

  timer = setInterval(() => {
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    const min = String(Math.floor(remaining / 60)).padStart(2, "0");
    const sec = String(remaining % 60).padStart(2, "0");

    document.getElementById("timer").textContent = `Time: ${min}:${sec}`;
    if (remaining <= 0) {
      clearInterval(timer);
      alert("Time's up!");
      finishQuiz();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function finishQuiz() {
  if (quizSubmitted) return;
  quizSubmitted = true;
  stopTimer();

  const snapshot = captureSnapshot();
  const score = calculateScore();
  const percentage = Math.round((score / currentQuiz.totalQuestions) * 100);

  document.getElementById("questionContainer").classList.add("hidden");
  document.getElementById("quizControls").classList.add("hidden");
  document.getElementById("resultContainer").classList.remove("hidden");

  document.getElementById("finalScore").textContent = score;
  document.getElementById("totalQuestions").textContent = currentQuiz.totalQuestions;
  document.getElementById("scorePercentage").textContent = `${percentage}%`;
  document.getElementById("correctAnswers").textContent = score;
  document.getElementById("incorrectAnswers").textContent =
    currentQuiz.totalQuestions - score - getUnansweredCount();
  document.getElementById("unansweredQuestions").textContent = getUnansweredCount();

  window.auth.saveQuizScore({
    difficulty: currentQuiz.difficulty,
    setNumber: currentQuiz.setNumber,
    score,
    totalQuestions: currentQuiz.totalQuestions,
    percentage,
    date: new Date().toISOString(),
    snapshot
  });
}

function reviewQuiz() {
  isReviewMode = true;
  currentQuestionIndex = 0;

  // Hide result container
  document.getElementById("resultContainer").classList.add("hidden");

  // Show quiz container
  document.getElementById("questionContainer").classList.remove("hidden");
  document.getElementById("quizControls").classList.remove("hidden");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");

  // ✅ Ensure buttons are visible in review
  prevBtn.classList.remove("disabled");
  nextBtn.classList.remove("hidden");
  submitBtn.classList.remove("hidden");

  // ✅ Remove old listeners by cloning
  const newPrevBtn = prevBtn.cloneNode(true);
  const newNextBtn = nextBtn.cloneNode(true);
  const newSubmitBtn = submitBtn.cloneNode(true);

  prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
  nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
  submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

  // ✅ Add review navigation
  newPrevBtn.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      showQuestion(currentQuestionIndex);
    }
  });

  newNextBtn.addEventListener("click", () => {
    if (currentQuestionIndex < currentQuiz.totalQuestions - 1) {
      currentQuestionIndex++;
      showQuestion(currentQuestionIndex);
    } else {
      // End of review
      isReviewMode = false;
      document.getElementById("questionContainer").classList.add("hidden");
      document.getElementById("quizControls").classList.add("hidden");
      document.getElementById("resultContainer").classList.remove("hidden");
    }
  });

  newSubmitBtn.addEventListener("click", () => {
    if (!quizSubmitted) {
      const confirmSubmit = confirm("Submit your quiz?");
      if (confirmSubmit) finishQuiz();
    }
  });

  showQuestion(currentQuestionIndex);
}


function showAnswers() {
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const correctIndex = currentQuestion.answer;
  const userIndex = userAnswers[currentQuestionIndex];
  const options = document.querySelectorAll(".option");

  options.forEach((opt, i) => {
    opt.classList.remove("correct", "incorrect");
    if (i === correctIndex) opt.classList.add("correct");
    if (userIndex !== null && userIndex === i && userIndex !== correctIndex) {
      opt.classList.add("incorrect");
    }
  });
}

function getUnansweredCount() {
  return userAnswers.filter(ans => ans === null).length;
}

function calculateScore() {
  return userAnswers.reduce((score, ans, i) => {
    return ans === currentQuiz.questions[i].answer ? score + 1 : score;
  }, 0);
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
