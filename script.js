// Global variables
let questions = [];
let currentQuestionIndex = -1;
let commandHistory = [];
let currentDifficulty = 'all';
let filteredQuestions = [];

// Terminal output simulation data
const terminalResponses = {
  'grep': {
    success: [
      'file1.txt:line 1: This line contains the search term',
      'file1.txt:line 5: Another occurrence found here',
      'file2.txt:line 3: Search term appears in this file too'
    ],
    error: [
      'grep: No such file or directory',
      'grep: Invalid option -- x',
      'grep: No matches found'
    ]
  },
  'wc': {
    success: [
      '      15      45     234',
      '       3       8      45',
      '      27      89     567'
    ],
    error: [
      'wc: No such file or directory',
      'wc: Invalid option'
    ]
  },
  'cut': {
    success: [
      '2024-01-15',
      '2024-01-16',
      '2024-01-17',
      '2024-01-18'
    ],
    error: [
      'cut: No such file or directory',
      'cut: Invalid delimiter'
    ]
  },
  'sort': {
    success: [
      'apple',
      'banana',
      'cherry',
      'date',
      'elderberry'
    ],
    error: [
      'sort: No such file or directory',
      'sort: Invalid option'
    ]
  },
  'uniq': {
    success: [
      '      5 error',
      '      3 warning',
      '      1 info',
      '      2 debug'
    ],
    error: [
      'uniq: No such file or directory'
    ]
  },
  'head': {
    success: [
      'First line of the file',
      'Second line of the file',
      'Third line of the file'
    ],
    error: [
      'head: No such file or directory'
    ]
  },
  'tail': {
    success: [
      'Last line of the file',
      'Second to last line',
      'Third to last line'
    ],
    error: [
      'tail: No such file or directory'
    ]
  }
};

// Load questions on page load
async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    questions = await response.json();
    
    // Debug logging
    console.log('Questions loaded:', questions.length);
    console.log('Sample question:', questions[0]);
    console.log('Questions with difficulty property:', questions.filter(q => q.difficulty).length);
    console.log('Available difficulties:', [...new Set(questions.map(q => q.difficulty))]);
    
    setDifficulty('all'); // Default to all difficulties
  } catch (error) {
    console.error('Error loading questions:', error);
    addTerminalOutput('Error loading questions. Please refresh the page.', 'error');
  }
}

// Set difficulty level and filter questions
function setDifficulty(difficulty) {
  currentDifficulty = difficulty;
  
  // Update button states
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`btn-${difficulty}`).classList.add('active');
  
  // Filter questions based on difficulty
  if (difficulty === 'all') {
    filteredQuestions = questions;
  } else {
    filteredQuestions = questions.filter(q => q.difficulty === difficulty);
  }
  
  // Debug logging
  console.log('Total questions:', questions.length);
  console.log('Selected difficulty:', difficulty);
  console.log('Filtered questions:', filteredQuestions.length);
  console.log('Sample filtered questions:', filteredQuestions.slice(0, 3));
  
  // Update terminal output
  addTerminalOutput(`Difficulty set to: ${difficulty.toUpperCase()} (${filteredQuestions.length} questions available)`, 'info');
  
  // Get a new question from the filtered set
  if (filteredQuestions.length > 0) {
    getNextQuestion();
  } else {
    showQuestion(-1);
    addTerminalOutput(`No questions available for ${difficulty} difficulty.`, 'error');
  }
}

// Display question
function showQuestion(index) {
  if (index === -1 || filteredQuestions.length === 0) {
    document.getElementById('questionDisplay').textContent = 'No questions available for this difficulty level.';
    document.getElementById('hintDisplay').textContent = '';
    document.getElementById('currentDifficulty').textContent = '';
    document.getElementById('currentDifficulty').className = 'difficulty-badge';
    return;
  }
  
  const q = filteredQuestions[index];
  document.getElementById('questionDisplay').textContent = q.question;
  document.getElementById('hintDisplay').textContent = q.hint ? `💡 ${q.hint}` : '';
  document.getElementById('commandInput').value = '';
  clearFeedback();
  
  // Update difficulty badge
  const difficultyBadge = document.getElementById('currentDifficulty');
  difficultyBadge.textContent = q.difficulty || 'Unknown';
  difficultyBadge.className = `difficulty-badge ${q.difficulty || ''}`;
  
  // Add question to terminal output
  addTerminalOutput(`New question loaded (${q.difficulty || 'Unknown'}): ${q.question}`, 'info');
}

// Add output to terminal
function addTerminalOutput(message, type = 'output') {
  const terminalOutput = document.getElementById('terminalOutput');
  const outputLine = document.createElement('div');
  outputLine.className = 'output-line';
  
  const timestamp = new Date().toLocaleTimeString();
  const prompt = document.createElement('span');
  prompt.className = 'prompt';
  prompt.textContent = `[${timestamp}] `;
  
  const output = document.createElement('span');
  output.className = type;
  output.textContent = message;
  
  outputLine.appendChild(prompt);
  outputLine.appendChild(output);
  terminalOutput.appendChild(outputLine);
  
  // Auto-scroll to bottom
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Simulate terminal command execution
function simulateCommandExecution(command) {
  addTerminalOutput(`$ ${command}`, 'command');
  
  // Simulate processing delay
  setTimeout(() => {
    const commandParts = command.split(' ')[0];
    let response = '';
    
    // Generate realistic output based on command
    if (command.includes('grep')) {
      response = terminalResponses.grep.success[Math.floor(Math.random() * terminalResponses.grep.success.length)];
    } else if (command.includes('wc')) {
      response = terminalResponses.wc.success[Math.floor(Math.random() * terminalResponses.wc.success.length)];
    } else if (command.includes('cut')) {
      response = terminalResponses.cut.success.join('\n');
    } else if (command.includes('sort')) {
      response = terminalResponses.sort.success.join('\n');
    } else if (command.includes('uniq')) {
      response = terminalResponses.uniq.success.join('\n');
    } else if (command.includes('head')) {
      response = terminalResponses.head.success.join('\n');
    } else if (command.includes('tail')) {
      response = terminalResponses.tail.success.join('\n');
    } else {
      response = 'Command executed successfully';
    }
    
    addTerminalOutput(response, 'output');
  }, 500);
}

// Check command correctness
function checkCommand() {
  const input = document.getElementById('commandInput').value.trim();
  if (!input) {
    showFeedback('Please enter a command first.', 'error');
    return;
  }
  
  if (currentQuestionIndex === -1 || filteredQuestions.length === 0) {
    showFeedback('No question available. Please select a difficulty level.', 'error');
    return;
  }
  
  const correct = filteredQuestions[currentQuestionIndex].answer.trim();
  
  // Add command to history
  commandHistory.push(input);
  
  // Simulate command execution
  simulateCommandExecution(input);
  
  // Check if correct
  if (input === correct) {
    showFeedback('✅ Correct! Well done!', 'success');
    addTerminalOutput('🎉 Command executed successfully!', 'success');
  } else {
    showFeedback('❌ Incorrect. Try again.', 'error');
    addTerminalOutput('❌ Command failed. Check your syntax.', 'error');
  }
}

// Show feedback with animation
function showFeedback(message, type) {
  const feedback = document.getElementById('feedback');
  feedback.textContent = message;
  feedback.className = `feedback-section ${type}`;
  
  // Add animation
  feedback.style.animation = 'none';
  feedback.offsetHeight; // Trigger reflow
  feedback.style.animation = 'fadeIn 0.3s ease-in-out';
}

// Clear feedback
function clearFeedback() {
  const feedback = document.getElementById('feedback');
  feedback.textContent = '';
  feedback.className = 'feedback-section';
}

// Get next question
function getNextQuestion() {
  if (filteredQuestions.length === 0) {
    currentQuestionIndex = -1;
    showQuestion(-1);
    addTerminalOutput('No questions available for current difficulty level.', 'error');
    return;
  }
  
  currentQuestionIndex = Math.floor(Math.random() * filteredQuestions.length);
  showQuestion(currentQuestionIndex);
  addTerminalOutput('Loading new question...', 'info');
}

// Show answer
function showAnswer() {
  if (currentQuestionIndex === -1 || filteredQuestions.length === 0) {
    showFeedback('No question available. Please select a difficulty level.', 'error');
    return;
  }
  
  const correct = filteredQuestions[currentQuestionIndex].answer.trim();
  showFeedback(`💡 Answer: ${correct}`, 'info');
  addTerminalOutput(`💡 Showing answer: ${correct}`, 'info');
}

// Clear terminal output
function clearTerminal() {
  const terminalOutput = document.getElementById('terminalOutput');
  terminalOutput.innerHTML = `
    <div class="output-line">
      <span class="prompt">user@terminal:~$</span>
      <span class="command">Terminal cleared</span>
    </div>
  `;
  addTerminalOutput('Terminal output cleared.', 'info');
}

// Handle keyboard events
document.getElementById('commandInput').addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    checkCommand();
  }
  
  // Command history navigation
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (commandHistory.length > 0) {
      const lastCommand = commandHistory[commandHistory.length - 1];
      this.value = lastCommand;
    }
  }
});

// Add CSS animation for feedback
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// Initialize the application
loadQuestions();