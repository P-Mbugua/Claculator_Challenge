const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const historyList = document.getElementById('history-list');

// Initialize variables with localStorage fallback
let currentInput = localStorage.getItem('currentInput') || '';
let operator = localStorage.getItem('operator') || '';
let previousInput = localStorage.getItem('previousInput') || '';
let memory = parseFloat(localStorage.getItem('memory')) || 0;
let history = JSON.parse(localStorage.getItem('history')) || [];

// Update the UI
updateDisplay(currentInput);
updateHistory();

// Add event listeners for buttons
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.getAttribute('data-value');

        switch (value) {
            case 'C':
                clearDisplay();
                break;
            case '=':
                calculateResult();
                break;
            case '+':
            case '-':
            case '*':
            case '/':
                setOperator(value);
                break;
            default:
                appendToInput(value);
                break;
        }
    });
});

// Clear the display
function clearDisplay() {
    currentInput = '';
    operator = '';
    previousInput = '';
    updateDisplay('');
    saveState();
}

// Calculate the result
function calculateResult() {
    if (currentInput && previousInput && operator) {
        try {
            const result = safeEvaluate(`${previousInput} ${operator} ${currentInput}`);
            if (result !== undefined && result !== null) {
                saveHistory(`${previousInput} ${operator} ${currentInput} = ${result}`);
                currentInput = result.toString();
                operator = '';
                previousInput = '';
                updateDisplay(currentInput);
                saveState();
            } else {
                throw new Error('Invalid result');
            }
        } catch (error) {
            display.value = 'Error';
            clearDisplay();
        }
    }
}

// Set the operator
function setOperator(op) {
    if (currentInput) {
        operator = op;
        previousInput = currentInput;
        currentInput = '';
        saveState();
    }
}

// Append to the current input
function appendToInput(value) {
    if (value === '.' && currentInput.includes('.')) return;
    currentInput += value;
    updateDisplay(currentInput);
    saveState();
}

// Undo the last input
function undo() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay(currentInput);
    saveState();
}

// Memory functions
function memoryAdd() {
    memory += parseFloat(currentInput || '0');
    localStorage.setItem('memory', memory.toString());
}

function memorySubtract() {
    memory -= parseFloat(currentInput || '0');
    localStorage.setItem('memory', memory.toString());
}

function memoryRecall() {
    if (!isNaN(memory)) {
        currentInput = memory.toString();
        updateDisplay(currentInput);
        saveState();
    }
}

// Advanced functions
function squareRoot() {
    if (!isNaN(currentInput)) {
        currentInput = Math.sqrt(parseFloat(currentInput)).toString();
        updateDisplay(currentInput);
        saveState();
    }
}

function percentage() {
    if (!isNaN(currentInput)) {
        currentInput = (parseFloat(currentInput) / 100).toString();
        updateDisplay(currentInput);
        saveState();
    }
}

function power() {
    if (previousInput && currentInput && !isNaN(previousInput) && !isNaN(currentInput)) {
        currentInput = Math.pow(parseFloat(previousInput), parseFloat(currentInput)).toString();
        updateDisplay(currentInput);
        saveState();
    }
}

// Update the display
function updateDisplay(value) {
    display.value = value || '0';
}

// Save history
function saveHistory(entry) {
    history.push(entry);
    if (history.length > 10) history.shift(); // Limit to the last 10 entries
    updateHistory();
    localStorage.setItem('history', JSON.stringify(history));
}

// Update the history UI
function updateHistory() {
    historyList.innerHTML = '';
    history.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry;
        historyList.appendChild(li);
    });
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('currentInput', currentInput);
    localStorage.setItem('operator', operator);
    localStorage.setItem('previousInput', previousInput);
    localStorage.setItem('memory', memory.toString());
}

// Safely evaluate expressions
function safeEvaluate(expression) {
    try {
        // Use Function constructor instead of eval for safer evaluation
        return Function(`"use strict"; return (${expression})`)();
    } catch {
        return null;
    }
}
