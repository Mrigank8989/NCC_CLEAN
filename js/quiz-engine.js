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

  // ✅ Get logged user from localStorage
  const user = JSON.parse(localStorage.getItem("ncc_logged_user"));
  if (!user || !user.user_id) {
    alert("User not logged in!");
    return (window.location.href = "index.html");
  }

  // ✅ Send result to backend instead of localStorage
  fetch("https://nccserver.onrender.com/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: user.user_id,
      quiz_id: currentQuiz.setNumber,
      score,
      total_questions: currentQuiz.totalQuestions,
      percentage,
      time_taken: timeElapsed,
      is_completed: true
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("✅ Quiz attempt saved:", data);
    })
    .catch(err => {
      console.error("❌ Error saving quiz attempt:", err);
    });
}
