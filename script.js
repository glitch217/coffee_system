// Questions data
const questions = [
  {
    id: 1,
    question: "What's your #1 coffee goal right now?",
    icon: "fas fa-bullseye",
    options: [
      {
        id: "agency",
        title: "Agency",
        description: "I want to feel in control of my morning",
        icon: "fas fa-chess-king"
      },
      {
        id: "grounding",
        title: "Grounding",
        description: "I need a calm anchor to start the day",
        icon: "fas fa-mountain"
      },
      {
        id: "craft",
        title: "Craft",
        description: "I enjoy perfecting the process itself",
        icon: "fas fa-tools"
      },
      {
        id: "alertness",
        title: "Alertness",
        description: "Fast, effective wake-up energy",
        icon: "fas fa-bolt"
      },
      {
        id: "steady-energy",
        title: "Steady Energy",
        description: "Sustained focus without jitters",
        icon: "fas fa-chart-line"
      },
      {
        id: "appetite-control",
        title: "Appetite Control",
        description: "Help manage hunger",
        icon: "fas fa-apple-alt"
      }
    ]
  },
  {
    id: 2,
    question: "What's your absolute max prep time?",
    icon: "fas fa-clock",
    options: [
      {
        id: "2",
        title: "2 minutes",
        description: "Bare minimum - I'm in a rush",
        icon: "fas fa-running"
      },
      {
        id: "5",
        title: "5 minutes",
        description: "Reasonable - I can take a moment",
        icon: "fas fa-walking"
      },
      {
        id: "8",
        title: "8 minutes",
        description: "I can indulge in the process",
        icon: "fas fa-couch"
      }
    ]
  },
  {
    id: 3,
    question: "Which constraint matters most?",
    icon: "fas fa-balance-scale",
    options: [
      {
        id: "time",
        title: "Time",
        description: "Speed is everything",
        icon: "fas fa-stopwatch"
      },
      {
        id: "consistency",
        title: "Consistency",
        description: "Same results every time",
        icon: "fas fa-redo"
      },
      {
        id: "cost",
        title: "Cost",
        description: "Budget-friendly above all",
        icon: "fas fa-coins"
      }
    ]
  },
  {
    id: 4,
    question: "How important is your mug/cup?",
    icon: "fas fa-mug-hot",
    options: [
      {
        id: "low",
        title: "Low",
        description: "Just a container - function over form",
        icon: "fas fa-box"
      },
      {
        id: "medium",
        title: "Medium",
        description: "Nice to have - adds to the experience",
        icon: "fas fa-wine-glass-alt"
      },
      {
        id: "high",
        title: "High",
        description: "Essential - the vessel defines the ritual",
        icon: "fas fa-gem"
      }
    ]
  },
  {
    id: 5,
    question: "When would you adjust your system?",
    icon: "fas fa-cogs",
    options: [
      {
        id: "chore",
        title: "When it feels like a chore",
        description: "Adjust when the joy fades",
        icon: "fas fa-tired"
      },
      {
        id: "scattered",
        title: "When mornings feel scattered",
        description: "Adjust when it stops working",
        icon: "fas fa-wind"
      },
      {
        id: "seasonal",
        title: "Every 3 months automatically",
        description: "Seasonal review and refresh",
        icon: "fas fa-calendar-alt"
      }
    ]
  }
];

// State management
let currentQuestion = 0;
let answers = {};
let systemCount = localStorage.getItem('systemCount') || 0;

// DOM Elements
const questionContainer = document.getElementById('questionContainer');
const progressBar = document.getElementById('progressBar');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const previewContainer = document.getElementById('previewContainer');
const previewContent = document.getElementById('previewContent');
const editBtn = document.getElementById('editBtn');
const generateBtn = document.getElementById('generateBtn');
const loading = document.getElementById('loading');
const resultContainer = document.getElementById('resultContainer');
const notionLink = document.getElementById('notionLink');
const newSystemBtn = document.getElementById('newSystemBtn');

// Initialize
displayQuestion(currentQuestion);
updateProgressBar();
updateNavigation();

// Event Listeners
prevBtn.addEventListener('click', goToPreviousQuestion);
nextBtn.addEventListener('click', goToNextQuestion);
editBtn.addEventListener('click', showQuestionnaire);
generateBtn.addEventListener('click', generateSystem);
newSystemBtn.addEventListener('click', resetSystem);

// Display current question
function displayQuestion(index) {
  const question = questions[index];
  
  let html = `
    <div class="question-card">
      <h3><i class="${question.icon}"></i> ${question.question}</h3>
      <div class="options">
  `;
  
  question.options.forEach(option => {
    const isSelected = answers[`q${index + 1}`] === option.id;
    html += `
      <div class="option ${isSelected ? 'selected' : ''}" data-value="${option.id}">
        <div class="option-icon">
          <i class="${option.icon}"></i>
        </div>
        <div class="option-content">
          <h4>${option.title}</h4>
          <p>${option.description}</p>
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
  `;
  
  questionContainer.innerHTML = html;
  
  // Add click listeners to options
  document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', function() {
      const value = this.getAttribute('data-value');
      answers[`q${index + 1}`] = value;
      
      // Update UI
      document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
      });
      this.classList.add('selected');
      
      // Enable next button if this is the last question
      if (index === questions.length - 1) {
        nextBtn.disabled = false;
      }
    });
  });
}

// Update progress bar
function updateProgressBar() {
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
  
  // Update step indicators
  document.querySelectorAll('.step').forEach((step, index) => {
    if (index <= currentQuestion) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
}

// Update navigation buttons
function updateNavigation() {
  prevBtn.disabled = currentQuestion === 0;
  
  if (currentQuestion === questions.length - 1) {
    nextBtn.innerHTML = 'Preview <i class="fas fa-eye"></i>';
    nextBtn.disabled = !answers[`q${currentQuestion + 1}`];
  } else {
    nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
    nextBtn.disabled = false;
  }
}

// Navigation functions
function goToPreviousQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    displayQuestion(currentQuestion);
    updateProgressBar();
    updateNavigation();
  }
}

function goToNextQuestion() {
  if (currentQuestion < questions.length - 1) {
    // Check if current question is answered
    if (!answers[`q${currentQuestion + 1}`]) {
      alert('Please select an option before continuing.');
      return;
    }
    
    currentQuestion++;
    displayQuestion(currentQuestion);
    updateProgressBar();
    updateNavigation();
  } else {
    // Show preview on last question
    showPreview();
  }
}

// Show preview
function showPreview() {
  // Map answers to readable values
  const mappedAnswers = {
    corePurpose: getOptionTitle(answers.q1),
    maxMinutes: answers.q2,
    constraint: getOptionTitle(answers.q3),
    vesselImportance: getOptionTitle(answers.q4),
    adjustmentTrigger: getOptionTitle(answers.q5)
  };
  
  // Generate system name
  systemCount++;
  localStorage.setItem('systemCount', systemCount);
  const systemName = `${mappedAnswers.corePurpose} System #${systemCount}`;
  
  // Update preview content
  previewContent.innerHTML = `
    <div class="preview-section">
      <h4><i class="fas fa-flag"></i> Core Purpose</h4>
      <p>${mappedAnswers.corePurpose}</p>
    </div>
    <div class="preview-section">
      <h4><i class="fas fa-clock"></i> Time Budget</h4>
      <p>${mappedAnswers.maxMinutes} minutes maximum</p>
    </div>
    <div class="preview-section">
      <h4><i class="fas fa-compress-arrows-alt"></i> Key Constraint</h4>
      <p>${mappedAnswers.constraint}</p>
    </div>
    <div class="preview-section">
      <h4><i class="fas fa-mug-hot"></i> Vessel Importance</h4>
      <p>${mappedAnswers.vesselImportance}</p>
    </div>
    <div class="preview-section">
      <h4><i class="fas fa-cogs"></i> Adjustment Trigger</h4>
      <p>${mappedAnswers.adjustmentTrigger}</p>
    </div>
  `;
  
  // Store final answers
  answers.corePurpose = answers.q1;
  answers.maxMinutes = answers.q2;
  answers.constraint = answers.q3;
  answers.vesselImportance = answers.q4;
  answers.adjustmentTrigger = answers.q5;
  answers.systemName = systemName;
  
  // Show preview, hide questionnaire
  questionContainer.style.display = 'none';
  previewContainer.style.display = 'block';
  progressBar.parentElement.style.display = 'none';
  prevBtn.style.display = 'none';
  nextBtn.style.display = 'none';
}

// Show questionnaire again
function showQuestionnaire() {
  previewContainer.style.display = 'none';
  questionContainer.style.display = 'block';
  progressBar.parentElement.style.display = 'block';
  prevBtn.style.display = 'flex';
  nextBtn.style.display = 'flex';
}

// Generate system in Notion
async function generateSystem() {
  // Show loading, hide preview
  previewContainer.style.display = 'none';
  loading.style.display = 'block';
  
  try {
    // Call Netlify function
    const response = await fetch('/.netlify/functions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        corePurpose: answers.corePurpose,
        maxMinutes: answers.maxMinutes,
        constraint: answers.constraint,
        vesselImportance: answers.vesselImportance,
        adjustmentTrigger: answers.adjustmentTrigger,
        systemName: answers.systemName
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Show success
      loading.style.display = 'none';
      notionLink.innerHTML = `
        <a href="${result.pageUrl}" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-notion"></i> Open your Coffee System in Notion
        </a>
      `;
      resultContainer.style.display = 'block';
    } else {
      throw new Error(result.error || 'Failed to create system');
    }
    
  } catch (error) {
    loading.style.display = 'none';
    previewContainer.style.display = 'block';
    alert(`Error: ${error.message}\n\nPlease try again.`);
    console.error('Generation error:', error);
  }
}

// Reset for new system
function resetSystem() {
  currentQuestion = 0;
  answers = {};
  resultContainer.style.display = 'none';
  showQuestionnaire();
  displayQuestion(currentQuestion);
  updateProgressBar();
  updateNavigation();
}

// Helper function to get option title by ID
function getOptionTitle(optionId) {
  for (const question of questions) {
    for (const option of question.options) {
      if (option.id === optionId) {
        return option.title;
      }
    }
  }
  return optionId;
}