// ============================================
// COFFEE SYSTEM GENERATOR - TWO-PATH LOGIC
// Crash-proof + robust backend error display
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // STATE MANAGEMENT
    // ============================================
    let currentMode = null; // 'utility' or 'ritual'
    let currentQuestionIndex = 0;
    let userAnswers = {};
    let systemId = localStorage.getItem('systemCount') || 0;

    // ============================================
    // DOM ELEMENTS (SAFE LOOKUPS)
    // ============================================
    const modeSelector = document.getElementById('modeSelector');
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

    const exists = (el) => el !== null && el !== undefined;

    // ============================================
    // QUESTION DATA
    // ============================================

    const utilityQuestions = [
        {
            parameter: "Primary Function",
            description: "If coffee had one job to do for you, what would it be?",
            systemsConcept:
                "This defines the CORE UTILITY FUNCTION of your system. Every downstream parameter—from bean type to dosage—is determined from this point.",
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
            systemsConcept:
                "This identifies the NON-NEGOTIABLE CONSTRAINT—the primary bottleneck around which your entire system must be designed.",
            options: [
                { id: "time", title: "Time (Speed)", description: "Speed is everything." },
                { id: "consistency", title: "Consistency (Reliability)", description: "Same results every time." },
                { id: "cost", title: "Cost (Efficiency)", description: "Budget-friendly above all." }
            ]
        },
        {
            parameter: "Time Budget",
            description: "What is the maximum amount of hands-on time you are willing to invest per session?",
            systemsConcept:
                "This sets a HARD OPERATIONAL BOUNDARY, forcing trade-offs between complexity, quality, and resource expenditure.",
            options: [
                { id: "2", title: "2 minutes", description: "Bare minimum - I'm in a rush." },
                { id: "5", title: "5 minutes", description: "Reasonable - I can take a moment." },
                { id: "8", title: "8 minutes", description: "I can indulge in the process." }
            ]
        },
        {
            parameter: "Cost Parameter",
            description: "What is your acceptable cost per cup?",
            systemsConcept:
                "This quantifies the INPUT RESOURCE BUDGET, directly linking financial investment to the quality and sourcing of system inputs.",
            options: [
                { id: "under-50", title: "Under $0.50", description: "Minimal cost per serving." },
                { id: "50-100", title: "$0.50–$1.00", description: "Moderate investment." },
                { id: "100-200", title: "$1.00–$2.00", description: "Premium quality acceptable." }
            ]
        },
        {
            parameter: "Operating Environment",
            description: "Where must this coffee system reliably function?",
            systemsConcept:
                "This determines the CONTEXTUAL ENVELOPE—the external conditions (stability, space, tools) your system must be robust enough to withstand.",
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
            systemsConcept:
                "This defines your system's PURPOSE. It is the primary feedback loop you are optimizing for and the ultimate metric of success.",
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
            systemsConcept:
                "This determines your system's ADAPTATION FREQUENCY. A 'Yes' integrates external time as a key input, creating a responsive and evolving ritual.",
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
            systemsConcept:
                "This defines a KEY INTERFACE COMPONENT. Its importance dictates whether it is merely a container or a core variable shaping the entire outcome.",
            options: [
                { id: "low", title: "Low", description: "Just a container - function over form." },
                { id: "medium", title: "Medium", description: "Nice to have - adds to the experience." },
                { id: "high", title: "High", description: "Essential - the vessel defines the ritual." }
            ]
        },
        {
            parameter: "Maintenance Protocol",
            description: "How will you know your ritual needs adjusting?",
            systemsConcept:
                "This establishes your SYSTEM MONITORING RULE. It specifies the trigger—whether an internal signal or a calendar event—for iterative maintenance.",
            options: [
                { id: "chore", title: "Feels like a chore", description: "Adjust when the joy fades." },
                { id: "scattered", title: "Mornings feel scattered", description: "Adjust when it stops working." },
                { id: "seasonal-review", title: "Seasonal review", description: "Review and recalibrate every 3 months." }
            ]
        },
        {
            parameter: "Feedback Mechanism",
            description: "How will you measure your ritual's success?",
            systemsConcept:
                "This defines your MEASUREMENT AND FEEDBACK LOOP. A system without measurement cannot be improved.",
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

    const modeButtons = document.querySelectorAll('.mode-button');
    if (modeButtons.length > 0) {
        modeButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                selectMode(button.dataset.mode, button);
            });
        });
    } else {
        console.warn('No .mode-button elements found.');
    }

    if (exists(prevBtn)) prevBtn.addEventListener('click', (e) => { e.preventDefault(); goToPreviousQuestion(); });
    if (exists(nextBtn)) nextBtn.addEventListener('click', (e) => { e.preventDefault(); goToNextQuestion(); });

    if (exists(editProtocolBtn)) editProtocolBtn.addEventListener('click', (e) => { e.preventDefault(); showQuestionnaire(); });
    if (exists(generateProtocolBtn)) generateProtocolBtn.addEventListener('click', (e) => { e.preventDefault(); generateSystem(); });
    if (exists(newSystemBtn)) newSystemBtn.addEventListener('click', (e) => { e.preventDefault(); resetSystem(); });

    // ============================================
    // CORE FUNCTIONS
    // ============================================

    function selectMode(mode, clickedButton) {
        currentMode = mode;
        userAnswers = {};
        currentQuestionIndex = 0;

        document.querySelectorAll('.mode-button').forEach((btn) => btn.classList.remove('selected'));
        if (clickedButton) clickedButton.classList.add('selected');

        if (exists(questionContainer)) questionContainer.classList.remove('hidden');
        if (exists(navigation)) navigation.classList.remove('hidden');
        if (exists(modeSelector)) modeSelector.classList.add('hidden');

        displayQuestion();
    }

    function displayQuestion() {
        const questions = currentMode === 'utility' ? utilityQuestions : ritualQuestions;
        const question = questions[currentQuestionIndex];

        if (!question) {
            showProtocolPreview();
            return;
        }

        if (!exists(questionContainer)) {
            console.warn('Question container not found (#questionContainer).');
            return;
        }

        if (exists(progressIndicator)) {
            progressIndicator.textContent = `${question.parameter} • ${currentQuestionIndex + 1} of ${questions.length}`;
        }

        let html = `
            <div class="system-card">
                <div class="card-header">
                    <div class="parameter-label">Parameter ${currentQuestionIndex + 1}</div>
                    <div class="parameter-name">${question.parameter}</div>
                    <div class="parameter-description">${question.description}</div>
                </div>

                <div class="options-grid">
        `;

        question.options.forEach((option) => {
            const isSelected = userAnswers[question.parameter] === option.id;
            html += `
                <div class="option ${isSelected ? 'selected' : ''}" data-value="${option.id}">
                    <div class="option-title">${option.title}</div>
                    <div class="option-body">${option.description}</div>
                </div>
            `;
        });

        html += `
                </div>

                <div class="concept-block">
                    <div class="concept-label">Systems Concept</div>
                    <div class="concept-text">${question.systemsConcept}</div>
                </div>
            </div>
        `;

        questionContainer.innerHTML = html;

        document.querySelectorAll('.option').forEach((optionEl) => {
            optionEl.addEventListener('click', (e) => {
                e.preventDefault();
                selectOption(question.parameter, optionEl.dataset.value);
            });
        });

        updateNavigation();
    }

    function selectOption(parameter, value) {
        userAnswers[parameter] = value;

        document.querySelectorAll('.option').forEach((opt) => {
            opt.classList.remove('selected');
            if (opt.dataset.value === value) opt.classList.add('selected');
        });

        if (exists(nextBtn)) nextBtn.disabled = false;
    }

    function updateNavigation() {
        if (!exists(prevBtn) || !exists(nextBtn)) return;

        const questions = currentMode === 'utility' ? utilityQuestions : ritualQuestions;

        prevBtn.disabled = currentQuestionIndex === 0;

        const currentParam = questions[currentQuestionIndex]?.parameter;
        const hasAnswer = currentParam ? Boolean(userAnswers[currentParam]) : false;

        if (currentQuestionIndex === questions.length - 1) {
            nextBtn.textContent = 'Review Protocol →';
            nextBtn.disabled = !hasAnswer;
        } else {
            nextBtn.textContent = 'Continue →';
            nextBtn.disabled = !hasAnswer;
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
        if (!exists(protocolPreview)) {
            console.warn('Protocol preview container not found (#protocolPreview).');
            return;
        }

        if (exists(questionContainer)) questionContainer.classList.add('hidden');
        if (exists(navigation)) navigation.classList.add('hidden');

        generateProtocolContent();
        protocolPreview.classList.remove('hidden');
    }

    function generateProtocolContent() {
        const questions = currentMode === 'utility' ? utilityQuestions : ritualQuestions;

        if (exists(protocolTitle)) {
            protocolTitle.textContent = `${currentMode === 'utility' ? 'UTILITY' : 'RITUAL'} PROTOCOL`;
        }
        if (exists(protocolMeta)) {
            protocolMeta.textContent = `v1.0 • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }

        const purpose = currentMode === 'utility'
            ? userAnswers['Primary Function']
            : userAnswers['Core Purpose'];

        if (exists(protocolObjective)) {
            protocolObjective.textContent =
                currentMode === 'utility'
                    ? `Optimize for ${purpose ? purpose.replace('-', ' ') : 'primary function'} within specified constraints.`
                    : `Cultivate ${purpose ? purpose.toLowerCase() : 'intentional'} state through repeatable ritual.`;
        }

        if (exists(protocolConfig)) {
            protocolConfig.innerHTML = '';
            questions.forEach((q) => {
                const answer = userAnswers[q.parameter];
                const option = q.options.find((opt) => opt.id === answer);
                if (option) {
                    const li = document.createElement('li');
                    li.textContent = `${q.parameter}: ${option.title}`;
                    protocolConfig.appendChild(li);
                }
            });
        }

        if (exists(protocolSequence)) {
            protocolSequence.innerHTML = '';
            generateSequenceSteps().forEach((step) => {
                const li = document.createElement('li');
                li.textContent = step;
                protocolSequence.appendChild(li);
            });
        }

        if (exists(protocolFailure)) {
            protocolFailure.innerHTML = '';
            generateFailureConditions().forEach((failure) => {
                const li = document.createElement('li');
                li.textContent = failure;
                protocolFailure.appendChild(li);
            });
        }

        if (exists(protocolRepeat)) {
            protocolRepeat.textContent =
                currentMode === 'utility'
                    ? 'Execute daily before first work session. Do not modify more than one variable at a time.'
                    : 'Execute upon waking, before digital exposure. Deviation reduces reliability.';
        }
    }

    function generateSequenceSteps() {
        if (currentMode === 'utility') {
            return [
                'Prepare equipment according to time budget',
                'Measure inputs based on cost parameter',
                'Execute brew method optimized for environment',
                'Consume within optimal window for function'
            ];
        }

        return [
            'Set up space according to vessel importance',
            'Engage in sensory preparation (smell, sound, touch)',
            'Execute ritual sequence with intentional pacing',
            'Complete with designated reflection period'
        ];
    }

    function generateFailureConditions() {
        if (currentMode === 'utility') {
            return [
                'Rushing preparation beyond time budget',
                'Compromising on key constraint for convenience',
                'Operating outside designated environment'
            ];
        }

        return [
            'Skipping steps or rushing sequence',
            'Ignoring maintenance protocol triggers',
            'Allowing external interruptions'
        ];
    }

    function showQuestionnaire() {
        if (exists(protocolPreview)) protocolPreview.classList.add('hidden');
        if (exists(questionContainer)) questionContainer.classList.remove('hidden');
        if (exists(navigation)) navigation.classList.remove('hidden');
    }

    // ============================================
    // IMPORTANT CHANGE: parse backend error JSON
    // ============================================
    async function generateSystem() {
        if (!exists(protocolPreview) || !exists(loadingState)) {
            console.warn('Cannot generate system: preview/loading UI not found.');
            return;
        }

        protocolPreview.classList.add('hidden');
        loadingState.classList.remove('hidden');

        try {
            const systemName = `${currentMode === 'utility' ? 'Utility' : 'Ritual'} System ${parseInt(systemId) + 1}`;

            const res = await fetch('/.netlify/functions/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: currentMode,
                    answers: userAnswers,
                    systemName,
                    timestamp: new Date().toISOString()
                })
            });

            // Always attempt to parse JSON (even on 400/500)
            let result = null;
            const text = await res.text();
            try {
                result = JSON.parse(text);
            } catch {
                result = { success: false, error: 'Non-JSON response', raw: text };
            }

            if (!res.ok || !result?.success) {
                const msg = result?.message || result?.error || `HTTP ${res.status}`;
                const details = result?.details ? JSON.stringify(result.details, null, 2) : '';
                throw new Error(`${msg}${details ? `\n\nDetails:\n${details}` : ''}`);
            }

            // Success path
            systemId = parseInt(systemId) + 1;
            localStorage.setItem('systemCount', systemId);

            loadingState.classList.add('hidden');

            if (exists(notionUrl)) notionUrl.textContent = result.pageUrl;
            if (exists(openNotionBtn)) openNotionBtn.href = result.pageUrl;

            if (exists(successState)) successState.classList.remove('hidden');

        } catch (error) {
            if (exists(loadingState)) loadingState.classList.add('hidden');
            if (exists(protocolPreview)) protocolPreview.classList.remove('hidden');

            alert(`Error:\n${error.message}\n\nPlease try again.`);
            console.error('Generation error:', error);
        }
    }

    function resetSystem() {
        currentMode = null;
        currentQuestionIndex = 0;
        userAnswers = {};

        if (exists(successState)) successState.classList.add('hidden');
        if (exists(protocolPreview)) protocolPreview.classList.add('hidden');
        if (exists(questionContainer)) questionContainer.classList.add('hidden');
        if (exists(navigation)) navigation.classList.add('hidden');

        if (exists(modeSelector)) modeSelector.classList.remove('hidden');

        document.querySelectorAll('.mode-button').forEach((btn) => btn.classList.remove('selected'));
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    if (!localStorage.getItem('systemCount')) {
        localStorage.setItem('systemCount', '0');
    }

    console.log('Coffee System Generator initialized • Two-path logic • Crash-proof wiring active');
});
