// ============================================
// COFFEE SYSTEM GENERATOR - TWO-PATH LOGIC
// Design: SSENSE × GitLab, Systems literacy focus
// ============================================

// ============================================
// STATE MANAGEMENT
// ============================================
let currentMode = null; // 'utility' or 'ritual'
let currentQuestionIndex = 0;
let userAnswers = {};
let systemId = localStorage.getItem('systemCount') || 0;

// ============================================
// DOM ELEMENTS
// ============================================
const modeSelector = document.getElementById('modeSelector');
const utilityBtn = document.getElementById('utilityBtn');
const ritualBtn = document.getElementById('ritualBtn');
const questionContainer = document.getElementById('questionContainer');
const navigation = document.getElementById('navigation');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressIndicator = document.getElementById('progressIndicator');
const protocolPreview = document.getElementById('protocolPreview');
const editProtocolBtn = document.getElementById('editProtocolBtn');
const generateProtocolBtn = document.getElementById('generateProtocolBtn');
const loadingState = document.getElementById('loadingState');
const successState = document.getElementById('successState');
const newSystemBtn = document.getElementById('newSystemBtn');
const openNotionBtn = document.getElementById('openNotionBtn');
const notionUrl = document.getElementById('notionUrl');

// Protocol display elements
const protocolTitle = document.getElementById('protocolTitle');
const protocolMeta = document.getElementById('protocolMeta');
const protocolObjective = document.getElementById('protocolObjective');
const protocolConfig = document.getElementById('protocolConfig');
const protocolSequence = document.getElementById('protocolSequence');
const protocolFailure = document.getElementById('protocolFailure');
const protocolRepeat = document.getElementById('protocolRepeat');

// ============================================
// QUESTION DATA
// ============================================

const utilityQuestions = [
    {
        parameter: "Primary Function",
        description: "If coffee had one job to do for you, what would it be?",
        systemsConcept: "This defines the CORE UTILITY FUNCTION of your system. Every downstream parameter—from bean type to dosage—is determined from this point.",
        options: [
            { id: "alertness", title: "Shock Awake", description: "To shock my nervous system awake and achieve alertness as fast as possible." },
            { id: "thinking", title: "Improve Thinking", description: "To improve thinking and focus once I'm already awake." },
            { id: "steady-energy", title: "Steady Energy", description: "To provide steady energy without common side effects like jitters or anxiety." },
            { id: "appetite", title: "Appetite Control", description: "To suppress my appetite." }
        ]
    },
    {
        parameter: "Key Constraint",
        description: "If you could optimize for only one practical priority, which would it be?",
        systemsConcept: "This identifies the NON-NEGOTIABLE CONSTRAINT—the primary bottleneck around which your entire system must be designed.",
        options: [
            { id: "time", title: "Time (Speed)", description: "Speed is everything." },
            { id: "consistency", title: "Consistency (Reliability)", description: "Same results every time." },
            { id: "cost", title: "Cost (Efficiency)", description: "Budget-friendly above all." }
        ]
    },
    {
        parameter: "Time Budget",
        description: "What is the maximum amount of hands-on time you are willing to invest per session?",
        systemsConcept: "This sets a HARD OPERATIONAL BOUNDARY, forcing trade-offs between complexity, quality, and resource expenditure.",
        options: [
            { id: "2", title: "2 minutes", description: "Bare minimum - I'm in a rush." },
            { id: "5", title: "5 minutes", description: "Reasonable - I can take a moment." },
            { id: "8", title: "8 minutes", description: "I can indulge in the process." }
        ]
    },
    {
        parameter: "Cost Parameter",
        description: "What is your acceptable cost per cup?",
        systemsConcept: "This quantifies the INPUT RESOURCE BUDGET, directly linking financial investment to the quality and sourcing of system inputs.",
        options: [
            { id: "under-50", title: "Under $0.50", description: "Minimal cost per serving." },
            { id: "50-100", title: "$0.50–$1.00", description: "Moderate investment." },
            { id: "100-200", title: "$1.00–$2.00", description: "Premium quality acceptable." }
        ]
    },
    {
        parameter: "Operating Environment",
        description: "Where must this coffee system reliably function?",
        systemsConcept: "This determines the CONTEXTUAL ENVELOPE—the external conditions (stability, space, tools) your system must be robust enough to withstand.",
        options: [
            { id: "home", title: "Home", description: "Quiet, controlled space." },
            { id: "office", title: "Office", description: "Shared, busy environment." },
            { id: "travel", title: "Travel", description: "On the go, portable setup." }
        ]
    }
];

const ritualQuestions = [
    {
        parameter: "Core Purpose",
        description: "What is the primary directive of your ritual?",
        systemsConcept: "This defines your system's PURPOSE. It is the primary feedback loop you are optimizing for and the ultimate metric of success.",
        options: [
            { id: "agency", title: "Agency", description: "The feeling of being the cause, not just the effect." },
            { id: "grounding", title: "Grounding", description: "A sensory pull that centers you, from the scent of the beans to the sound of a heavy pour." },
            { id: "craft", title: "Craft / Personalization", description: "A signature touch that makes the experience distinctly yours." },
            { id: "warmth", title: "Warmth / Connection", description: "A sense of spaciousness or connection to natural elements." }
        ]
    },
    {
        parameter: "Temporal Resolution",
        description: "Would you like your ritual to reflect changes in the seasons or calendar?",
        systemsConcept: "This determines your system's ADAPTATION FREQUENCY. A 'Yes' integrates external time as a key input, creating a responsive and evolving ritual.",
        options: [
            { id: "no", title: "No", description: "Static system - no seasonal changes." },
            { id: "weekly", title: "Yes, weekly", description: "High-frequency adaptation." },
            { id: "monthly", title: "Yes, monthly", description: "Medium-frequency calibration." },
            { id: "seasonal", title: "Yes, seasonally", description: "Low-frequency, macro-adaptation." }
        ]
    },
    {
        parameter: "Enabling Constraint",
        description: "How critical is the mug or tumbler to the experience?",
        systemsConcept: "This defines a KEY INTERFACE COMPONENT. Its importance dictates whether it is merely a container or a core variable shaping the entire outcome.",
        options: [
            { id: "low", title: "Low", description: "Just a container - function over form." },
            { id: "medium", title: "Medium", description: "Nice to have - adds to the experience." },
            { id: "high", title: "High", description: "Essential - the vessel defines the ritual." }
        ]
    },
    {
        parameter: "Maintenance Protocol",
        description: "How will you know your ritual needs adjusting?",
        systemsConcept: "This establishes your SYSTEM MONITORING RULE. It specifies the trigger—whether an internal signal or a calendar event—for iterative maintenance.",
        options: [
            { id: "chore", title: "Feels like a chore", description: "Adjust when the joy fades." },
            { id: "scattered", title: "Mornings feel scattered", description: "Adjust when it stops working." },
            { id: "seasonal-review", title: "Seasonal review", description: "Review and recalibrate every 3 months." }
        ]
    },
    {
        parameter: "Feedback Mechanism",
        description: "How will you measure your ritual's success?",
        systemsConcept: "This defines your MEASUREMENT AND FEEDBACK LOOP. A system without measurement cannot be improved.",
        options: [
            { id: "daily-check", title: "Daily check-in", description: "A quick 1-5 rating in my journal." },
            { id: "weekly-review", title: "Weekly review", description: "Sundays: Did my mornings feel better this week?" },
            { id: "outcome-tracking", title: "Outcome tracking", description: "Track energy levels, mood, or productivity metrics." },
            { id: "intuitive", title: "Intuitive sense", description: "I'll just know—it's a feeling, not a metric." }
        ]
    }
];

// ============================================
// EVENT LISTENERS
// ============================================

// Mode selection
document.querySelectorAll('.mode-button').forEach(button => {
    button.addEventListener('click', () => {
        selectMode(button.dataset.mode);
    });
});

// Navigation
prevBtn.addEventListener('click', goToPreviousQuestion);
nextBtn.addEventListener('click', goToNextQuestion);

// Protocol actions
editProtocolBtn.addEventListener('click', showQuestionnaire);
generateProtocolBtn.addEventListener('click', generateSystem);
newSystemBtn.addEventListener('click', resetSystem);

// ============================================
// CORE FUNCTIONS
// ============================================

function selectMode(mode) {
    currentMode = mode;
    userAnswers = {};
    currentQuestionIndex = 0;
    
    // Update UI
    document.querySelectorAll('.mode-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // Show first question
    questionContainer.classList.remove('hidden');
    navigation.classList.remove('hidden');
    modeSelector.classList.add('hidden');
    
    displayQuestion();
}

function displayQuestion() {
    const questions = currentMode === 'utility' ? utilityQuestions : ritualQuestions;
    const question = questions[currentQuestionIndex];
    
    if (!question) {
        showProtocolPreview();
        return;
    }
    
    // Update progress
    progressIndicator.textContent = `${question.parameter} • ${currentQuestionIndex + 1} of ${questions.length}`;
    
    // Build question HTML
    let html = `
        <div class="system-card">
            <div class="card-header">
                <div>
                    <div class="parameter-label">Parameter ${currentQuestionIndex + 1}</div>
                    <div class="parameter-name">${question.parameter}</div>
                    <div class="parameter-description">${question.description}</div>
                </div>
            </div>
            
            <div class="options-grid">
    `;
    
    question.options.forEach(option => {
        const isSelected = userAnswers[question.parameter] === option.id;
        html += `
            <div class="option ${isSelected ? 'selected' : ''}" data-value="${option.id}">
                <div class="option-title">${option.title}</div>
                <div class="option-desc">${option.description}</div>
            </div>
        `;
    });
    
    html += `
            </div>
            
            <div class="systems-concept">
                <div class="concept-label">Systems Concept</div>
                <div class="concept-text">${question.systemsConcept}</div>
            </div>
        </div>
    `;
    
    questionContainer.innerHTML = html;
    
    // Add click listeners to options
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => {
            selectOption(question.parameter, option.dataset.value);
        });
    });
    
    // Update navigation buttons
    updateNavigation();
}

function selectOption(parameter, value) {
    userAnswers[parameter] = value;
    
    // Update UI
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.value === value) {
            opt.classList.add('selected');
        }
    });
    
    // Enable next button
    nextBtn.disabled = false;
}

function updateNavigation() {
    const questions = currentMode === 'utility' ? utilityQuestions : ritualQuestions;
    
    prevBtn.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.textContent = 'Review Protocol →';
        nextBtn.disabled = !userAnswers[questions[currentQuestionIndex].parameter];
    } else {
        nextBtn.textContent = 'Continue →';
        nextBtn.disabled = !userAnswers[questions[currentQuestionIndex].parameter];
    }
}

function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function goToNextQuestion() {
    const questions = currentMode === 'utility' ? utilityQuestions : ritualQuestions;
    
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        showProtocolPreview();
    }
}

function showProtocolPreview() {
    // Hide questionnaire
    questionContainer.classList.add('hidden');
    navigation.classList.add('hidden');
    
    // Generate protocol content
    generateProtocolContent();
    
    // Show protocol preview
    protocolPreview.classList.remove('hidden');
}

function generateProtocolContent() {
    const questions = currentMode === 'utility' ? utilityQuestions : ritualQuestions;
    
    // Set protocol title
    protocolTitle.textContent = `${currentMode === 'utility' ? 'UTILITY' : 'RITUAL'} PROTOCOL`;
    protocolMeta.textContent = `v1.0 • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    
    // Generate objective
    const purpose = currentMode === 'utility' 
        ? userAnswers['Primary Function'] 
        : userAnswers['Core Purpose'];
    
    protocolObjective.textContent = currentMode === 'utility'
        ? `Optimize for ${purpose ? purpose.replace('-', ' ') : 'primary function'} within specified constraints.`
        : `Cultivate ${purpose ? purpose.toLowerCase() : 'intentional'} state through repeatable ritual.`;
    
    // Generate configuration list
    protocolConfig.innerHTML = '';
    questions.forEach(q => {
        const answer = userAnswers[q.parameter];
        const option = q.options.find(opt => opt.id === answer);
        if (option) {
            const li = document.createElement('li');
            li.className = 'protocol-item';
            li.textContent = `${q.parameter}: ${option.title}`;
            protocolConfig.appendChild(li);
        }
    });
    
    // Generate sequence based on answers
    protocolSequence.innerHTML = '';
    const sequenceSteps = generateSequenceSteps();
    sequenceSteps.forEach(step => {
        const li = document.createElement('li');
        li.className = 'protocol-item';
        li.textContent = step;
        protocolSequence.appendChild(li);
    });
    
    // Generate failure conditions
    protocolFailure.innerHTML = '';
    const failures = generateFailureConditions();
    failures.forEach(failure => {
        const li = document.createElement('li');
        li.className = 'protocol-item failure-condition';
        li.textContent = failure;
        protocolFailure.appendChild(li);
    });
    
    // Generate repeat rule
    const repeatRule = currentMode === 'utility'
        ? 'Execute daily before first work session. Do not modify more than one variable at a time.'
        : 'Execute upon waking, before digital exposure. Deviation reduces reliability.';
    protocolRepeat.textContent = repeatRule;
}

function generateSequenceSteps() {
    const steps = [];
    
    if (currentMode === 'utility') {
        steps.push('Prepare equipment according to time budget');
        steps.push('Measure inputs based on cost parameter');
        steps.push('Execute brew method optimized for environment');
        steps.push('Consume within optimal window for function');
    } else {
        steps.push('Set up space according to vessel importance');
        steps.push('Engage in sensory preparation (smell, sound, touch)');
        steps.push('Execute ritual sequence with intentional pacing');
        steps.push('Complete with designated reflection period');
    }
    
    return steps;
}

function generateFailureConditions() {
    const conditions = [];
    
    if (currentMode === 'utility') {
        conditions.push('Rushing preparation beyond time budget');
        conditions.push('Compromising on key constraint for convenience');
        conditions.push('Operating outside designated environment');
    } else {
        conditions.push('Skipping steps or rushing sequence');
        conditions.push('Ignoring maintenance protocol triggers');
        conditions.push('Allowing external interruptions');
    }
    
    return conditions;
}

function showQuestionnaire() {
    protocolPreview.classList.add('hidden');
    questionContainer.classList.remove('hidden');
    navigation.classList.remove('hidden');
}

async function generateSystem() {
    // Show loading
    protocolPreview.classList.add('hidden');
    loadingState.classList.remove('hidden');
    
    try {
        // Prepare data for Notion
        const systemName = `${currentMode === 'utility' ? 'Utility' : 'Ritual'} System ${parseInt(systemId) + 1}`;
        
        const response = await fetch('/.netlify/functions/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mode: currentMode,
                answers: userAnswers,
                systemName: systemName,
                timestamp: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update system count
            systemId = parseInt(systemId) + 1;
            localStorage.setItem('systemCount', systemId);
            
            // Show success
            loadingState.classList.add('hidden');
            notionUrl.textContent = result.pageUrl;
            openNotionBtn.href = result.pageUrl;
            successState.classList.remove('hidden');
        } else {
            throw new Error(result.error || 'Failed to create system');
        }
        
    } catch (error) {
        loadingState.classList.add('hidden');
        protocolPreview.classList.remove('hidden');
        alert(`Error: ${error.message}\n\nPlease try again.`);
        console.error('Generation error:', error);
    }
}

function resetSystem() {
    currentMode = null;
    currentQuestionIndex = 0;
    userAnswers = {};
    
    // Reset UI
    successState.classList.add('hidden');
    modeSelector.classList.remove('hidden');
    document.querySelectorAll('.mode-button').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// ============================================
// INITIALIZATION
// ============================================

// Check if there's an existing system count
if (!localStorage.getItem('systemCount')) {
    localStorage.setItem('systemCount', '0');
}

// Log initialization
console.log('Coffee System Generator initialized • SSENSE × GitLab aesthetic • Two-path logic');