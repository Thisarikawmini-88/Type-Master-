// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const quoteInput = document.getElementById('quoteInput');
const timeEl = document.getElementById('time');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const errorsEl = document.getElementById('errors');
const wordsEl = document.getElementById('words');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const results = document.getElementById('results');
const timeSelect = document.getElementById('timeSelect');
const difficultySelect = document.getElementById('difficultySelect');
const soundToggle = document.getElementById('soundToggle');
const themeToggle = document.getElementById('themeToggle');

// Paragraphs by difficulty
const paragraphs = {
  easy: [
    "The cat sat on the mat and looked at the sun.",
    "I like to play games with my friends every day.",
    "She went to the shop to buy some milk and bread."
  ],
  medium: [
    "The quick brown fox jumps over the lazy dog and enjoys the sunny weather in the beautiful garden.",
    "JavaScript is a programming language that enables interactive web pages and is an essential part of web applications.",
    "Learning to code requires patience practice and dedication but the rewards are worth every minute spent debugging."
  ],
  hard: [
    "Pneumonoultramicroscopicsilicovolcanoconiosis is a lung disease caused by inhaling very fine silicate or quartz dust.",
    "The juxtaposition of sophisticated algorithms and cryptic syntax exemplifies the complexity of modern programming paradigms.",
    "Nevertheless, the quintessential characteristic of extraordinary achievements lies in perseverance despite overwhelming challenges."
  ]
};

// Variables
let currentQuote = '';
let timeLeft = 60;
let selectedTime = 60;
let timer = null;
let isTestRunning = false;
let correctChars = 0;
let totalTyped = 0;
let errors = 0;
let startTime = null;

// Audio Context for sounds
let audioContext;
function playSound(freq, duration) {
  if (!soundToggle.checked) return;
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.value = freq;
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// Theme toggle
themeToggle.addEventListener('click', () => {
  const currentTheme = document.body.getAttribute('data-theme');
  if (currentTheme === 'light') {
    document.body.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
  } else {
    document.body.setAttribute('data-theme', 'light');
    themeToggle.textContent = '☀️';
  }
});

// Start Test
function startTest() {
  resetTest();
  isTestRunning = true;
  startBtn.disabled = true;
  timeSelect.disabled = true;
  difficultySelect.disabled = true;
  quoteInput.disabled = false;
  quoteInput.focus();
  startTime = new Date();
  selectedTime = parseInt(timeSelect.value);
  timeLeft = selectedTime;
  timeEl.textContent = timeLeft;

  // Load paragraph based on difficulty
  const difficulty = difficultySelect.value;
  const paraArray = paragraphs[difficulty];
  currentQuote = paraArray[Math.floor(Math.random() * paraArray.length)];
  renderQuote();

  // Start timer
  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft === 0) endTest();
  }, 1000);
}

// Render quote with span tags
function renderQuote() {
  quoteDisplay.innerHTML = '';
  currentQuote.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    quoteDisplay.appendChild(span);
  });
  quoteDisplay.querySelector('span').classList.add('current');
}

// Handle typing
quoteInput.addEventListener('input', (e) => {
  if (!isTestRunning) return;

  const arrayQuote = quoteDisplay.querySelectorAll('span');
  const arrayValue = quoteInput.value.split('');
  totalTyped = arrayValue.length;
  correctChars = 0;
  errors = 0;

  arrayQuote.forEach((charSpan, index) => {
    const character = arrayValue[index];
    charSpan.classList.remove('correct', 'incorrect', 'current');

    if (character == null) {
      if (index === arrayValue.length) charSpan.classList.add('current');
    } else if (character === charSpan.textContent) {
      charSpan.classList.add('correct');
      correctChars++;
      if (e.inputType === 'insertText') playSound(600, 0.05); // keypress sound
    } else {
      charSpan.classList.add('incorrect');
      errors++;
      if (e.inputType === 'insertText') playSound(200, 0.1); // error sound
    }
  });

  updateStats();

  // Auto complete if finished
  if (arrayValue.length === currentQuote.length) {
    endTest();
  }
});

// Update live stats
function updateStats() {
  const timeElapsed = (new Date() - startTime) / 1000 / 60;
  const wpm = timeElapsed > 0? Math.round((correctChars / 5) / timeElapsed) : 0;
  const accuracy = totalTyped > 0? Math.round((correctChars / totalTyped) * 100) : 100;
  const wordCount = quoteInput.value.trim().split(/\s+/).filter(w => w).length;

  wpmEl.textContent = wpm;
  accuracyEl.textContent = accuracy;
  errorsEl.textContent = errors;
  wordsEl.textContent = wordCount;
}

// End Test
function endTest() {
  clearInterval(timer);
  isTestRunning = false;
  quoteInput.disabled = true;
  startBtn.disabled = false;
  timeSelect.disabled = false;
  difficultySelect.disabled = false;

  const timeElapsed = (selectedTime - timeLeft) / 60;
  const finalWpm = timeElapsed > 0? Math.round((correctChars / 5) / timeElapsed) : 0;
  const finalAccuracy = totalTyped > 0? Math.round((correctChars / totalTyped) * 100) : 0;
  const wrongChars = totalTyped - correctChars;

  // Show results
  document.getElementById('finalWpm').textContent = finalWpm;
  document.getElementById('finalAccuracy').textContent = finalAccuracy + '%';
  document.getElementById('correctChars').textContent = correctChars;
  document.getElementById('wrongChars').textContent = wrongChars;
  document.getElementById('finalTime').textContent = selectedTime + 's';
  document.getElementById('finalDifficulty').textContent = difficultySelect.value;

  // High score
  const highScoreKey = `highScore_${selectedTime}_${difficultySelect.value}`;
  const highScore = localStorage.getItem(highScoreKey) || 0;
  if (finalWpm > highScore) {
    localStorage.setItem(highScoreKey, finalWpm);
    document.getElementById('highScore').textContent = `🎉 New High Score: ${finalWpm} WPM!`;
  } else {
    document.getElementById('highScore').textContent = `High Score: ${highScore} WPM`;
  }

  results.classList.add('active');
  playSound(800, 0.3); // complete sound
}

// Reset Test
function resetTest() {
  clearInterval(timer);
  isTestRunning = false;
  selectedTime = parseInt(timeSelect.value);
  timeLeft = selectedTime;
  correctChars = 0;
  totalTyped = 0;
  errors = 0;
  startTime = null;

  timeEl.textContent = selectedTime;
  wpmEl.textContent = '0';
  accuracyEl.textContent = '100';
  errorsEl.textContent = '0';
  wordsEl.textContent = '0';
  quoteInput.value = '';
  quoteInput.disabled = true;
  quoteDisplay.innerHTML = 'Select settings and click Start...';
  startBtn.disabled = false;
  timeSelect.disabled = false;
  difficultySelect.disabled = false;
  results.classList.remove('active');
}

// Event Listeners
startBtn.addEventListener('click', startTest);
resetBtn.addEventListener('click', resetTest);
timeSelect.addEventListener('change', () => {
  timeEl.textContent = timeSelect.value;
});
quoteInput.addEventListener('paste', e => e.preventDefault());