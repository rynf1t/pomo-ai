// Sound dictionary
const SOUNDS = {
    beep: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
    bell: 'https://actions.google.com/sounds/v1/alarms/mechanical_clock_ring.ogg',
    digital: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
    arcade: 'https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg'
};

let timeLeft = getWorkDuration(); // Initialize with work duration
let timerId = null;
let isRunning = false;
let isPomodoro = true;
let currentSound = null;

function getWorkDuration() {
    const minutes = parseInt(document.getElementById('workDuration').value) || 25;
    return minutes * 60;
}

function getBreakDuration() {
    const minutes = parseInt(document.getElementById('breakDuration').value) || 5;
    return minutes * 60;
}

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
    
    document.getElementById('timer').textContent = timeString;
    document.title = `${timeString} - ${modeText}`;
}

function updateButtonText() {
    const button = document.getElementById('toggleButton');
    if (!isRunning) {
        if ((isPomodoro && timeLeft === getWorkDuration()) || (!isPomodoro && timeLeft === getBreakDuration())) {
            button.textContent = 'Start';
        } else {
            button.textContent = 'Resume';
        }
    } else {
        button.textContent = 'Pause';
    }
}

function toggleMode(isWork) {
    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    isPomodoro = isWork;
    timeLeft = isPomodoro ? getWorkDuration() : getBreakDuration();
    
    document.getElementById('workMode').classList.toggle('active', isPomodoro);
    document.getElementById('breakMode').classList.toggle('active', !isPomodoro);
    
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
    timeLeft = getWorkDuration();
    
    document.getElementById('workMode').classList.add('active');
    document.getElementById('breakMode').classList.remove('active');
    
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

// Add event listeners
document.getElementById('toggleButton').addEventListener('click', stopCurrentSound);
document.getElementById('workDuration').addEventListener('change', function() {
    if (!isRunning && isPomodoro) {
        timeLeft = getWorkDuration();
        updateDisplay();
    }
});
document.getElementById('breakDuration').addEventListener('change', function() {
    if (!isRunning && !isPomodoro) {
        timeLeft = getBreakDuration();
        updateDisplay();
    }
});
document.querySelector('button[onclick="resetTimer()"]').addEventListener('click', stopCurrentSound);