// Typed.js animation
var typed = new Typed(".auto-type", {
  strings: ["Welcome To The Password Strength Game"],
  typeSpeed: 150,
  backSpeed: 150,
  loop: true,
});

// Game Variables
let currentDifficulty = "easy";
let score = 0;

// Difficulty settings
const difficultySettings = {
  easy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: false,
    baseScore: 100,
  },
  medium: {
    minLength: 10,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
    baseScore: 200,
  },
  hard: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
    baseScore: 300,
  },
};

// DOM Elements
const passwordInput = document.getElementById("passwordInput");
const characterCount = document.querySelector(".character-count");
const strengthBar = document.getElementById("strengthBar");
const scoreValue = document.getElementById("scoreValue");
const scoreMessage = document.getElementById("scoreMessage");
const difficultyButtons = document.querySelectorAll(".btn-difficulty");

// Requirements elements
const reqLength = document.getElementById("req-length");
const reqUppercase = document.getElementById("req-uppercase");
const reqLowercase = document.getElementById("req-lowercase");
const reqNumber = document.getElementById("req-number");
const reqSpecial = document.getElementById("req-special");

// Difficulty button event listeners
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons
    difficultyButtons.forEach((btn) => btn.classList.remove("active"));

    // Add active class to clicked button
    button.classList.add("active");

    // Update current difficulty
    currentDifficulty = button.getAttribute("data-difficulty");

    // Update requirements display
    updateRequirementsDisplay();

    // Re-check password if there's input
    if (passwordInput.value) {
      checkPassword(passwordInput.value);
    } else {
      resetGame();
    }
  });
});

// Update requirements display based on difficulty
function updateRequirementsDisplay() {
  const settings = difficultySettings[currentDifficulty];

  // Update length requirement
  reqLength.querySelector(
    ".text"
  ).textContent = `Minimum ${settings.minLength} characters`;

  // Show/hide special character requirement
  if (settings.requireSpecial) {
    reqSpecial.style.display = "flex";
  } else {
    reqSpecial.style.display = "none";
  }
}

// Password input event listener
passwordInput.addEventListener("input", (e) => {
  const password = e.target.value;

  // Update character count
  characterCount.textContent = password.length;

  // Check password
  checkPassword(password);
});

// Check password function
function checkPassword(password) {
  const settings = difficultySettings[currentDifficulty];

  // Check requirements
  const hasMinLength = password.length >= settings.minLength;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  // Update requirement items
  updateRequirementItem(reqLength, hasMinLength);
  updateRequirementItem(reqUppercase, hasUppercase);
  updateRequirementItem(reqLowercase, hasLowercase);
  updateRequirementItem(reqNumber, hasNumber);

  if (settings.requireSpecial) {
    updateRequirementItem(reqSpecial, hasSpecial);
  }

  // Calculate strength
  let strength = 0;
  let strengthLabel = "";
  let strengthClass = "";

  if (hasMinLength) strength++;
  if (hasUppercase) strength++;
  if (hasLowercase) strength++;
  if (hasNumber) strength++;
  if (hasSpecial) strength++;

  // Determine strength level
  if (strength === 0 || password.length === 0) {
    strengthLabel = "";
    strengthClass = "";
  } else if (strength <= 2) {
    strengthLabel = "Weak";
    strengthClass = "weak";
  } else if (strength === 3) {
    strengthLabel = "Fair";
    strengthClass = "fair";
  } else if (strength === 4) {
    strengthLabel = "Good";
    strengthClass = "good";
  } else {
    strengthLabel = "Strong";
    strengthClass = "strong";
  }

  // Update strength bar
  strengthBar.className = "strength-bar " + strengthClass;
  strengthBar.querySelector(".strength-label").textContent = strengthLabel;

  // Calculate score
  calculateScore(
    password,
    strength,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial
  );
}

// Update requirement item
function updateRequirementItem(element, isMet) {
  if (isMet) {
    element.classList.add("met");
    element.classList.remove("unmet");
  } else {
    element.classList.add("unmet");
    element.classList.remove("met");
  }
}

// Calculate score
function calculateScore(
  password,
  strength,
  hasMinLength,
  hasUppercase,
  hasLowercase,
  hasNumber,
  hasSpecial
) {
  const settings = difficultySettings[currentDifficulty];

  if (password.length === 0) {
    score = 0;
    scoreValue.textContent = "0";
    scoreMessage.textContent = "Start typing to see your score!";
    return;
  }

  // Base score calculation
  let calculatedScore = 0;

  // Check if all requirements are met
  const allRequirementsMet =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    (settings.requireSpecial ? hasSpecial : true);

  if (allRequirementsMet) {
    calculatedScore = settings.baseScore;

    // Bonus points for extra length
    const extraLength = password.length - settings.minLength;
    calculatedScore += extraLength * 10;

    // Bonus for variety of characters
    const uniqueChars = new Set(password).size;
    calculatedScore += uniqueChars * 5;

    // Bonus for no repeating characters
    const hasRepeats = /(.)\1{2,}/.test(password);
    if (!hasRepeats) {
      calculatedScore += 50;
    }

    // Strength multiplier
    if (strength === 5) {
      calculatedScore *= 1.5;
    } else if (strength === 4) {
      calculatedScore *= 1.2;
    }

    calculatedScore = Math.round(calculatedScore);
    score = calculatedScore;

    // Update message
    if (score < 200) {
      scoreMessage.textContent = "Good start! Keep improving!";
    } else if (score < 400) {
      scoreMessage.textContent = "Great password! Well done!";
    } else if (score < 600) {
      scoreMessage.textContent = "Excellent! Very secure!";
    } else {
      scoreMessage.textContent = "🔥 Amazing! Master Level! 🔥";
    }
  } else {
    // Partial score for incomplete passwords
    calculatedScore = (strength / 5) * settings.baseScore * 0.3;
    calculatedScore = Math.round(calculatedScore);
    score = calculatedScore;
    scoreMessage.textContent = "Complete all requirements to get full score!";
  }

  scoreValue.textContent = score;
}

// Reset game
function resetGame() {
  score = 0;
  scoreValue.textContent = "0";
  scoreMessage.textContent = "Start typing to see your score!";
  characterCount.textContent = "0";
  strengthBar.className = "strength-bar";
  strengthBar.querySelector(".strength-label").textContent = "";

  // Reset all requirement items
  [reqLength, reqUppercase, reqLowercase, reqNumber, reqSpecial].forEach(
    (item) => {
      item.classList.remove("met");
      item.classList.add("unmet");
    }
  );
}

// Initialize game
updateRequirementsDisplay();
resetGame();
