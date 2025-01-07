// Sound dictionary
const SOUNDS = {
    beep: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
    bell: 'https://actions.google.com/sounds/v1/alarms/mechanical_clock_ring.ogg',
    digital: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
    arcade: 'https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg'
};

let timeLeft = 25 * 60; // 25 minutes in seconds
let timerId = null;
let isRunning = false;
let isPomodoro = true; // Track if we're in Pomodoro or Break mode
let currentSound = null;

const POMODORO_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

// Add audio element
const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

function stopCurrentSound() {
    if (currentSound) {
        currentSound.pause();
        currentSound.currentTime = 0;
    }
}

function playSound(soundUrl, duration = 5000) {
    stopCurrentSound();
    currentSound = new Audio(soundUrl);
    currentSound.volume = 0.5;
    currentSound.play().catch(e => console.log('Audio play failed:', e));
    
    // Stop after duration
    setTimeout(() => {
        stopCurrentSound();
    }, duration);
}

function playNotification() {
    const soundSelect = document.getElementById('soundSelect');
    playSound(SOUNDS[soundSelect.value], 5000); // Notification plays for 5 seconds
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const modeText = isPomodoro ? 'WORK' : 'BREAK';
    
    // Update timer display
    document.getElementById('timer').textContent = timeString;
    
    // Update browser tab title
    document.title = `${timeString} - ${modeText}`;
}

function updateButtonText() {
    const button = document.getElementById('toggleButton');
    if (!isRunning) {
        if ((isPomodoro && timeLeft === POMODORO_TIME) || (!isPomodoro && timeLeft === BREAK_TIME)) {
            button.textContent = 'Start';
        } else {
            button.textContent = 'Resume';
        }
    } else {
        button.textContent = 'Pause';
    }
}

function toggleMode(isWork) {
    // Reset everything when switching modes
    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    isPomodoro = isWork;
    timeLeft = isPomodoro ? POMODORO_TIME : BREAK_TIME;
    
    // Update active states
    document.getElementById('workMode').classList.toggle('active', isPomodoro);
    document.getElementById('breakMode').classList.toggle('active', !isPomodoro);
    
    // Force button text to Start
    document.getElementById('toggleButton').textContent = 'Start';
    
    updateDisplay();
}

function toggleTimer() {
    if (!isRunning) {
        // Start or Resume
        isRunning = true;
        timerId = setInterval(() => {
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(timerId);
                timerId = null;
                isRunning = false;
                playNotification();
                toggleMode(!isPomodoro);
                updateDisplay();
                updateButtonText();
            } else {
                updateDisplay();
                updateButtonText();
            }
        }, 1000);
    } else {
        // Pause
        clearInterval(timerId);
        timerId = null;
        isRunning = false;
    }
    updateButtonText();
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    isPomodoro = true;
    timeLeft = POMODORO_TIME;
    
    // Update active states for mode buttons
    document.getElementById('workMode').classList.add('active');
    document.getElementById('breakMode').classList.remove('active');
    
    // Force button text to Start
    document.getElementById('toggleButton').textContent = 'Start';
    
    updateDisplay();
}

function testSound() {
    const soundSelect = document.getElementById('soundSelect');
    playSound(SOUNDS[soundSelect.value], 2000); // Test sound plays for 2 seconds
}

// Initialize
updateDisplay();
updateButtonText();

// Add event listeners to stop sound when interacting with other controls
document.getElementById('toggleButton').addEventListener('click', stopCurrentSound);
document.getElementById('mode').addEventListener('click', stopCurrentSound);
document.querySelector('button[onclick="resetTimer()"]').addEventListener('click', stopCurrentSound);