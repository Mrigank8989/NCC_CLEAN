// ======================= AUTHORIZATION.JS =======================

const AUTH_KEY = 'ncc_quiz_auth';

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const registerLink = document.getElementById("registerLink");
  const loginLink = document.getElementById("loginLink");

  const loginContainer = document.querySelector(".login-form");
  const registerContainer = document.querySelector(".register-form");

  // ─── Toggle between login and register ─────────────────────────────
  registerLink?.addEventListener("click", (e) => {
    e.preventDefault();
    loginContainer.classList.add("hidden");
    registerContainer.classList.remove("hidden");
  });

  loginLink?.addEventListener("click", (e) => {
    e.preventDefault();
    registerContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
  });

  // ─── Login ─────────────────────────────────────────────────────────
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;

      try {
        const response = await fetch("https://nccserver.onrender.com/api/SignIn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          credentials: "include"
        });

        const data = await response.json();
        console.log("Login response:", data);

        if (response.ok && data.success) {
          alert("✅ Login successful!");

          const user = {
            user_id: data.user.user_id,
            full_name: data.user.full_name,
            username: data.user.username,
            is_admin: data.user.is_admin,
            accessToken: data.accessToken
          };

          // ✅ Store only auth info
          localStorage.setItem(AUTH_KEY, JSON.stringify(user));

          // Redirect based on role
          window.location.href = user.is_admin ? "admin.html" : "dashboard.html";
        } else {
          alert("Login failed: " + (data.message || "Invalid credentials"));
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Something went wrong during login.");
      }
    });
  }

  // ─── Registration ───────────────────────────────────────────────
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("fullName").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const adminCode = document.getElementById("adminCode").value.trim();
    const isAdmin = (adminCode === "secretwalicode"); // 🔐 optional

    if (password !== confirmPassword) {
      return alert("Passwords do not match.");
    }

    try {
      const response = await fetch("https://nccserver.onrender.com/api/SignUp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          full_name,
          password,
          is_admin: isAdmin
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Registered successfully! Please login.");
        registerContainer.classList.add("hidden");
        loginContainer.classList.remove("hidden");
      } else {
        alert("Registration failed: " + data.message);
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Something went wrong during registration.");
    }
  });

  // ─── Logout ────────────────────────────────────────────────────
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", () => {
    logoutUser();
  });
});

// ─── Utility: Auth Handling ─────────────────────────────────────────

function isLoggedIn() {
  return !!localStorage.getItem(AUTH_KEY);
}

function getCurrentUser() {
  if (!isLoggedIn()) return null;
  return JSON.parse(localStorage.getItem(AUTH_KEY));
}

function getLoggedInUser() {
  const auth = localStorage.getItem(AUTH_KEY);
  return auth ? JSON.parse(auth) : null;
}

function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  alert("You have been logged out.");
  window.location.href = 'index.html';
}

// ─── Save Quiz Result to Backend ─────────────────────────────────
async function saveQuizScore(scoreData) {
  try {
    const user = getLoggedInUser();
    if (!user) {
      alert("User not logged in!");
      return;
    }

    const payload = {
      user_id: user.user_id,
      quiz_id: scoreData.setNumber,
      score: scoreData.score,
      total_questions: scoreData.totalQuestions,
      percentage: scoreData.percentage,
      time_taken: scoreData.timeTaken || 0,
      is_completed: true
    };

    console.log("📤 Sending quiz result to backend:", payload);

    const response = await fetch("https://nccserver.onrender.com/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("✅ Quiz attempt response:", result);

    if (!response.ok) {
      alert(result.message || "Failed to record attempt.");
      return;
    }

    alert("✅ Quiz submitted successfully!");
  } catch (error) {
    console.error("❌ Error saving quiz attempt:", error);
    alert("Error saving quiz attempt. Please try again.");
  }
}
// ─── Expose Functions Globally ──────────────────────────────────
window.auth = {
  getCurrentUser,
  logoutUser,
  getLoggedInUser,
  saveQuizScore,
  isLoggedIn
};
