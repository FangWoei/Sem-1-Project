let currentDifficulty = "easy";
let requirements = [];
let password = "";
let currentScore = 0;

// Pre-defined creative requirements (like Neal's Password Game)
const allRequirements = [
  // Easy (1-5)
  {
    id: 1,
    description: "Your password must be at least 5 characters long",
    check: (pwd) => pwd.length >= 5,
  },
  {
    id: 2,
    description: "Your password must include a number",
    check: (pwd) => /[0-9]/.test(pwd),
  },
  {
    id: 3,
    description: "Your password must include an uppercase letter",
    check: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: 4,
    description: "Your password must include a special character (!@#$%^&*)",
    check: (pwd) => /[!@#$%^&*]/.test(pwd),
  },
  {
    id: 5,
    description: "The digits in your password must add up to 25",
    check: (pwd) => {
      const sum = pwd
        .split("")
        .filter((c) => /[0-9]/.test(c))
        .reduce((acc, c) => acc + parseInt(c), 0);
      return sum === 25;
    },
  },

  // Medium (6-10)
  {
    id: 6,
    description: "Your password must include the word 'password'",
    check: (pwd) => pwd.toLowerCase().includes("password"),
  },
  {
    id: 7,
    description: "Your password must include a month of the year",
    check: (pwd) => {
      const months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];
      return months.some((m) => pwd.toLowerCase().includes(m));
    },
  },
  {
    id: 8,
    description:
      "Your password must include a Roman numeral (I, V, X, L, C, D, M)",
    check: (pwd) => /[IVXLCDM]/.test(pwd),
  },
  {
    id: 9,
    description: "Your password must be at least 20 characters long",
    check: (pwd) => pwd.length >= 20,
  },
  {
    id: 10,
    description: "Your password must include the length of your password",
    check: (pwd) => pwd.includes(pwd.length.toString()),
  },

  // Hard (11-15)
  {
    id: 11,
    description: "Your password must include the current year (2024)",
    check: (pwd) => pwd.includes("2024"),
  },
  {
    id: 12,
    description: "Your password must include at least 3 vowels (a, e, i, o, u)",
    check: (pwd) => {
      const vowelCount = pwd
        .toLowerCase()
        .split("")
        .filter((c) => "aeiou".includes(c)).length;
      return vowelCount >= 3;
    },
  },
  {
    id: 13,
    description:
      "Your password must include a color (red, blue, green, yellow, purple, orange, pink, black, white)",
    check: (pwd) => {
      const colors = [
        "red",
        "blue",
        "green",
        "yellow",
        "purple",
        "orange",
        "pink",
        "black",
        "white",
      ];
      return colors.some((c) => pwd.toLowerCase().includes(c));
    },
  },
  {
    id: 14,
    description:
      "Your password must include a prime number (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47)",
    check: (pwd) => {
      const primes = [
        "2",
        "3",
        "5",
        "7",
        "11",
        "13",
        "17",
        "19",
        "23",
        "29",
        "31",
        "37",
        "41",
        "43",
        "47",
      ];
      return primes.some((p) => pwd.includes(p));
    },
  },
  {
    id: 15,
    description:
      "Your password must not contain the letter 'e' (the most common letter)",
    check: (pwd) => !pwd.toLowerCase().includes("e"),
  },
];

const difficultyConfig = {
  easy: { count: 5, score: 100 },
  medium: { count: 10, score: 200 },
  hard: { count: 15, score: 300 },
};

// DOM Elements
const passwordInput = document.getElementById("password-input");
const charCount = document.getElementById("char-count");
const requirementsContainer = document.getElementById("requirements-container");
const scoreElement = document.getElementById("score");
const scoreMessage = document.getElementById("score-message");
const easyBtn = document.getElementById("easy-btn");
const mediumBtn = document.getElementById("medium-btn");
const hardBtn = document.getElementById("hard-btn");
const crackTimeValue = document.getElementById("crack-time-value");
const crackTimeDescription = document.getElementById("crack-time-description");
const saveScoreForm = document.getElementById("save-score-form");
const playerNameInput = document.getElementById("player-name");
const saveScoreBtn = document.getElementById("save-score-btn");
const saveMessage = document.getElementById("save-message");
const leaderboardDiv = document.getElementById("leaderboard");
const clearLeaderboardBtn = document.getElementById("clear-leaderboard-btn");

// Difficulty button handlers
easyBtn.addEventListener("click", () => selectDifficulty("easy", easyBtn));
mediumBtn.addEventListener("click", () =>
  selectDifficulty("medium", mediumBtn),
);
hardBtn.addEventListener("click", () => selectDifficulty("hard", hardBtn));

function selectDifficulty(difficulty, button) {
  currentDifficulty = difficulty;

  // Update button styles
  [easyBtn, mediumBtn, hardBtn].forEach((btn) => {
    btn.classList.remove(
      "bg-green-500",
      "bg-orange-500",
      "bg-red-500",
      "text-white",
      "shadow-lg",
    );
    btn.classList.add("bg-gray-200", "text-gray-700");
  });

  if (difficulty === "easy") {
    button.classList.remove("bg-gray-200", "text-gray-700");
    button.classList.add("bg-green-500", "text-white", "shadow-lg");
  } else if (difficulty === "medium") {
    button.classList.remove("bg-gray-200", "text-gray-700");
    button.classList.add("bg-orange-500", "text-white", "shadow-lg");
  } else {
    button.classList.remove("bg-gray-200", "text-gray-700");
    button.classList.add("bg-red-500", "text-white", "shadow-lg");
  }

  // Hide save form when difficulty changes
  saveScoreForm.classList.add("hidden");
  
  loadRequirements();
}

// Password input handler
passwordInput.addEventListener("input", (e) => {
  password = e.target.value;
  charCount.textContent = password.length;
  checkRequirements();
  updateCrackTime();
});

// Calculate password entropy and crack time
function calculateCrackTime(password) {
  if (!password) {
    return { time: 0, readable: "Instantly", strength: "Very Weak" };
  }

  // Calculate character set size
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[!@#$%^&*]/.test(password)) charsetSize += 32;

  if (charsetSize === 0) charsetSize = 26;

  const entropy = password.length * Math.log2(charsetSize);
  const guessesPerSecond = 1e9;
  const crackTimeSeconds = Math.pow(2, entropy) / guessesPerSecond;

  return {
    time: crackTimeSeconds,
    readable: formatTime(crackTimeSeconds),
    strength: getPasswordStrength(entropy),
  };
}

// Format time in human-readable format
function formatTime(seconds) {
  if (seconds < 1) return "Instantly";
  if (seconds < 60) return `${seconds.toFixed(0)} second${seconds === 1 ? '' : 's'}`;
  
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes.toFixed(0)} minute${minutes === 1 ? '' : 's'}`;
  
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(0)} hour${hours === 1 ? '' : 's'}`;
  
  const days = hours / 24;
  if (days < 365) return `${days.toFixed(0)} day${days === 1 ? '' : 's'}`;
  
  const years = days / 365;
  if (years < 100) return `${years.toFixed(0)} year${years === 1 ? '' : 's'}`;
  
  const centuries = years / 100;
  if (centuries < 1000) return `${centuries.toFixed(0)} century${centuries === 1 ? '' : 's'}`;
  
  const millennia = centuries / 10;
  return `${millennia.toFixed(0)} millennia`;
}

// Get password strength based on entropy
function getPasswordStrength(entropy) {
  if (entropy < 28) return "Very Weak";
  if (entropy < 35) return "Weak";
  if (entropy < 60) return "Moderate";
  if (entropy < 128) return "Strong";
  return "Very Strong";
}

// Update crack time display
function updateCrackTime() {
  const crackInfo = calculateCrackTime(password);
  crackTimeValue.textContent = crackInfo.readable;
  
  crackTimeDescription.textContent = `${crackInfo.strength} password`;
  
  const crackTimeElement = crackTimeValue.parentElement;
  crackTimeElement.className = "text-4xl font-bold mb-2";
  
  switch(crackInfo.strength) {
    case "Very Weak":
      crackTimeElement.classList.add("text-red-300");
      break;
    case "Weak":
      crackTimeElement.classList.add("text-orange-300");
      break;
    case "Moderate":
      crackTimeElement.classList.add("text-yellow-300");
      break;
    case "Strong":
      crackTimeElement.classList.add("text-green-300");
      break;
    case "Very Strong":
      crackTimeElement.classList.add("text-green-400");
      break;
  }
}

// Load requirements based on difficulty
function loadRequirements() {
  const config = difficultyConfig[currentDifficulty];
  requirements = allRequirements.slice(0, config.count);
  renderRequirements();
}

// Render requirements
function renderRequirements() {
  const container = document.createElement("div");
  container.className = "space-y-3";

  requirements.forEach((req, index) => {
    const reqDiv = document.createElement("div");
    reqDiv.id = `req-${req.id}`;
    reqDiv.className = "requirement locked p-4 rounded-lg fade-in";
    reqDiv.style.animationDelay = `${index * 0.1}s`;

    reqDiv.innerHTML = `
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600">
              ${req.id}
            </div>
            <div class="flex-1">
              <p class="text-gray-800 font-medium">${req.description}</p>
              <p class="text-sm text-gray-500 mt-1 status">Locked</p>
            </div>
          </div>
        `;

    container.appendChild(reqDiv);
  });

  requirementsContainer.innerHTML =
    '<h2 class="text-xl font-semibold mb-4 text-gray-800">Requirements:</h2>';
  requirementsContainer.appendChild(container);

  checkRequirements();
  updateCrackTime();
}

// Check requirements
function checkRequirements() {
  let metCount = 0;
  let unlocked = 0;

  requirements.forEach((req, index) => {
    const reqElement = document.getElementById(`req-${req.id}`);
    if (!reqElement) return;

    const statusElement = reqElement.querySelector(".status");
    const numberCircle = reqElement.querySelector(".flex-shrink-0");

    const previousMet =
      index === 0 ||
      requirements.slice(0, index).every((r) => r.check(password));

    if (!previousMet) {
      reqElement.className = "requirement locked p-4 rounded-lg";
      statusElement.textContent = "Locked";
      numberCircle.className =
        "flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600";
      return;
    }

    unlocked++;

    try {
      const isMet = req.check(password);

      if (isMet) {
        reqElement.className = "requirement met p-4 rounded-lg";
        statusElement.textContent = "Complete ✓";
        statusElement.className =
          "text-sm text-green-600 mt-1 status font-semibold";
        numberCircle.className =
          "flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold text-white";
        metCount++;
      } else {
        reqElement.className = "requirement unmet p-4 rounded-lg";
        statusElement.textContent = "Incomplete ✗";
        statusElement.className =
          "text-sm text-red-600 mt-1 status font-semibold";
        numberCircle.className =
          "flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center font-bold text-white";
      }
    } catch (e) {
      console.error("Error checking requirement:", e);
    }
  });

  updateScore(metCount, unlocked);
}

// Update score
function updateScore(metCount, totalUnlocked) {
  const config = difficultyConfig[currentDifficulty];
  const baseScore = config.score;

  if (metCount === requirements.length && requirements.length > 0) {
    const lengthBonus = password.length * 10;
    const finalScore = baseScore + lengthBonus;
    currentScore = finalScore;
    scoreElement.textContent = finalScore;
    scoreMessage.textContent = "🎉 Perfect! You won the game!";
    scoreMessage.style.fontSize = "1.5rem";
    
    // Show save score form
    saveScoreForm.classList.remove("hidden");
  } else {
    // Hide save score form if not won
    saveScoreForm.classList.add("hidden");
    
    if (metCount > 0) {
      const partialScore = Math.round(
        (metCount / totalUnlocked) * baseScore * 0.7,
      );
      currentScore = partialScore;
      scoreElement.textContent = partialScore;
      scoreMessage.textContent = `${metCount}/${totalUnlocked} requirements complete. Keep going!`;
      scoreMessage.style.fontSize = "1.125rem";
    } else {
      currentScore = 0;
      scoreElement.textContent = "0";
      scoreMessage.textContent = "Complete all requirements to win!";
      scoreMessage.style.fontSize = "1.125rem";
    }
  }
}

// ========== LEADERBOARD FUNCTIONS ==========

// Save score to localStorage
saveScoreBtn.addEventListener("click", () => {
  const playerName = playerNameInput.value.trim();
  
  if (!playerName) {
    saveMessage.textContent = "Please enter your name!";
    saveMessage.className = "mt-2 text-sm text-red-200";
    return;
  }
  
  // Get existing scores from localStorage
  let scores = JSON.parse(localStorage.getItem("passwordGameScores")) || [];
  
  // Add new score
  const newScore = {
    name: playerName,
    score: currentScore,
    difficulty: currentDifficulty,
    date: new Date().toISOString(),
  };
  
  scores.push(newScore);
  
  // Sort by score (descending)
  scores.sort((a, b) => b.score - a.score);
  
  // Keep only top 10 scores
  scores = scores.slice(0, 10);
  
  // Save to localStorage
  localStorage.setItem("passwordGameScores", JSON.stringify(scores));
  
  // Show success message
  saveMessage.textContent = "Score saved successfully! 🎉";
  saveMessage.className = "mt-2 text-sm text-green-200";
  
  // Clear input
  playerNameInput.value = "";
  
  // Update leaderboard display
  displayLeaderboard();
  
  // Hide form after saving
  setTimeout(() => {
    saveScoreForm.classList.add("hidden");
  }, 2000);
});

// Display leaderboard
function displayLeaderboard() {
  const scores = JSON.parse(localStorage.getItem("passwordGameScores")) || [];
  
  if (scores.length === 0) {
    leaderboardDiv.innerHTML = '<p class="text-center text-gray-500">No scores yet. Be the first!</p>';
    return;
  }
  
  let html = '<div class="space-y-3">';
  
  scores.forEach((entry, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
    const difficultyColor = entry.difficulty === "easy" ? "text-green-600" : 
                            entry.difficulty === "medium" ? "text-orange-600" : "text-red-600";
    const date = new Date(entry.date).toLocaleDateString();
    
    html += `
      <div class="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
        <div class="flex items-center gap-4">
          <span class="text-2xl font-bold w-10">${medal}</span>
          <div>
            <p class="font-bold text-gray-800 text-lg">${entry.name}</p>
            <p class="text-sm text-gray-600">
              <span class="${difficultyColor} font-semibold capitalize">${entry.difficulty}</span> 
              · ${date}
            </p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-3xl font-bold text-purple-600">${entry.score}</p>
          <p class="text-xs text-gray-500">points</p>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  leaderboardDiv.innerHTML = html;
}

// Initialize
loadRequirements();
displayLeaderboard();