console.log(window.auth); // make sure auth is available globally

// Admin Module for NCC Quiz Portal
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is admin
  if (!window.auth || !auth.isAdmin()) {
    alert("Access denied. Admins only.");
    window.location.href = 'dashboard.html';
    return;
  }

  // Initialize admin panel
  initAdminPanel();
});

// Snapshot Modal
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('view-snapshot-btn')) {
    const imgSrc = e.target.dataset.img;
    document.getElementById('snapshotImage').src = imgSrc;
    document.getElementById('snapshotModal').classList.remove('hidden');
  }
});

document.getElementById('closeSnapshotModal').addEventListener('click', () => {
  document.getElementById('snapshotModal').classList.add('hidden');
  document.getElementById('snapshotImage').src = '';
});

// Initialize admin panel
function initAdminPanel() {
  setupTabs();
  loadUserScores();
  loadUserManagement();
  loadQuizStatistics();
}

// Tab navigation
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(button.dataset.tab).classList.add('active');
    });
  });
}

// Load Scores
function loadUserScores() {
  const scoresTableBody = document.getElementById('scoresTableBody');
  const userFilter = document.getElementById('userFilter');

  const allScores = auth.getAllScores();
  scoresTableBody.innerHTML = '';
  populateUserFilter(userFilter, allScores);
  populateScoresTable(scoresTableBody, allScores);

  document.getElementById('applyFilterBtn').addEventListener('click', () => {
    applyScoresFilter();
  });
}

function populateUserFilter(userFilter, scores) {
  const usernames = [...new Set(scores.map(score => score.username))];
  userFilter.innerHTML = '<option value="all">All Users</option>';

  usernames.forEach(username => {
    if (username === 'admin') return;
    const option = document.createElement('option');
    option.value = username;
    option.textContent = username;
    userFilter.appendChild(option);
  });
}

function populateScoresTable(tableBody, scores) {
  tableBody.innerHTML = '';

  if (scores.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="7" class="text-center">No scores found</td>`;
    tableBody.appendChild(row);
    return;
  }

  scores.forEach(score => {
    const scoreDate = new Date(score.date);
    const formattedDate = scoreDate.toLocaleDateString() + ' ' + scoreDate.toLocaleTimeString();

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${score.username}</td>
      <td>Set ${score.setNumber}</td>
      <td>${capitalizeFirstLetter(score.difficulty)}</td>
      <td>${score.score}/${score.totalQuestions}</td>
      <td>${score.percentage}%</td>
      <td>${formattedDate}</td>
      <td>${score.snapshot 
        ? `<button class="btn btn-secondary view-snapshot-btn" data-img="${score.snapshot}">View Snapshot</button>`
        : 'No Image'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view-btn" data-username="${score.username}" data-set="${score.setNumber}" data-difficulty="${score.difficulty}">View</button>
          <button class="action-btn delete-btn" data-username="${score.username}" data-date="${score.date}">Delete</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });

  addScoreActionListeners();
}

function addScoreActionListeners() {
  document.querySelectorAll('.view-btn').forEach(button => {
    button.addEventListener('click', () => {
      const { username, set, difficulty } = button.dataset;
      alert(`View score details for ${username} - ${capitalizeFirstLetter(difficulty)} Set ${set}`);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => {
      const { username, date } = button.dataset;
      if (confirm(`Are you sure you want to delete this score record for ${username}?`)) {
        deleteScore(username, date);
      }
    });
  });
}

function deleteScore(username, date) {
  const users = JSON.parse(localStorage.getItem('ncc_quiz_users'));
  if (!users || !users[username]) return alert('User not found');

  const scores = users[username].quizzesTaken;
  const index = scores.findIndex(s => s.date === date);
  if (index === -1) return alert('Score record not found');

  scores.splice(index, 1);
  localStorage.setItem('ncc_quiz_users', JSON.stringify(users));
  loadUserScores();
  loadQuizStatistics();
  alert('Score record deleted successfully');
}

function applyScoresFilter() {
  const userFilter = document.getElementById('userFilter').value;
  const difficultyFilter = document.getElementById('difficultyFilter').value;
  let filteredScores = auth.getAllScores();

  if (userFilter !== 'all') {
    filteredScores = filteredScores.filter(score => score.username === userFilter);
  }
  if (difficultyFilter !== 'all') {
    filteredScores = filteredScores.filter(score => score.difficulty === difficultyFilter);
  }

  populateScoresTable(document.getElementById('scoresTableBody'), filteredScores);
}

// Load User Management
function loadUserManagement() {
  const userTableBody = document.getElementById('userTableBody');
  const users = JSON.parse(localStorage.getItem('ncc_quiz_users'));
  if (!users) return;

  userTableBody.innerHTML = '';

  Object.keys(users).forEach(username => {
    if (username === 'admin') return;
    const user = users[username];
    const total = user.quizzesTaken.length;
    const avg = total ? Math.round(user.quizzesTaken.reduce((a, b) => a + b.percentage, 0) / total) : 0;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.fullName}</td>
      <td>${total}</td>
      <td>${avg}%</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view-btn" data-username="${user.username}">View</button>
          <button class="action-btn delete-btn" data-username="${user.username}">Delete</button>
        </div>
      </td>
    `;
    userTableBody.appendChild(row);
  });

  addUserActionListeners();
}

function addUserActionListeners() {
  document.querySelectorAll('#userManagement .view-btn').forEach(button => {
    button.addEventListener('click', () => {
      const username = button.dataset.username;
      document.querySelector('.tab-btn[data-tab="userScores"]').click();
      document.getElementById('userFilter').value = username;
      applyScoresFilter();
    });
  });

  document.querySelectorAll('#userManagement .delete-btn').forEach(button => {
    button.addEventListener('click', () => {
      const username = button.dataset.username;
      if (confirm(`Are you sure you want to delete user ${username}? This will delete all their quiz records.`)) {
        deleteUser(username);
      }
    });
  });
}

function deleteUser(username) {
  const users = JSON.parse(localStorage.getItem('ncc_quiz_users'));
  if (!users || !users[username]) return alert('User not found');

  delete users[username];
  localStorage.setItem('ncc_quiz_users', JSON.stringify(users));
  loadUserManagement();
  loadUserScores();
  loadQuizStatistics();
  alert('User deleted successfully');
}

// Statistics
function loadQuizStatistics() {
  const allScores = auth.getAllScores();
  const users = JSON.parse(localStorage.getItem('ncc_quiz_users'));
  if (!users) return;

  const totalAttempts = allScores.length;
  const avgScore = totalAttempts ? Math.round(allScores.reduce((a, b) => a + b.percentage, 0) / totalAttempts) : 0;
  const highestScore = totalAttempts ? Math.max(...allScores.map(s => s.percentage)) : 0;
  const registeredUsers = Object.keys(users).filter(u => u !== 'admin').length;

  document.getElementById('totalAttempts').textContent = totalAttempts;
  document.getElementById('averageScore').textContent = `${avgScore}%`;
  document.getElementById('highestScore').textContent = `${highestScore}%`;
  document.getElementById('registeredUsers').textContent = registeredUsers;

  const getAvg = (difficulty) => {
    const filtered = allScores.filter(s => s.difficulty === difficulty);
    if (!filtered.length) return 0;
    return Math.round(filtered.reduce((sum, s) => sum + s.percentage, 0) / filtered.length);
  };

  const easy = getAvg('easy');
  const intermediate = getAvg('intermediate');
  const hard = getAvg('hard');

  document.getElementById('easyBar').style.width = `${easy}%`;
  document.getElementById('easyAvg').textContent = `${easy}%`;

  document.getElementById('intermediateBar').style.width = `${intermediate}%`;
  document.getElementById('intermediateAvg').textContent = `${intermediate}%`;

  document.getElementById('hardBar').style.width = `${hard}%`;
  document.getElementById('hardAvg').textContent = `${hard}%`;
}

// Helper
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
