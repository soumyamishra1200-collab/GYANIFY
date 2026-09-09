/* ==============================================================
   GYANIFY
   Adaptive Learning Platform
   Browser-only prototype

   No backend.
   No external API.
   State is persisted in localStorage.
================================================================ */


/* ==============================================================
   1. STORAGE
================================================================ */

const STORAGE_KEY = "gyanify-demo-state-v1";


/* ==============================================================
   2. DEFAULT STATE
================================================================ */

const defaultState = {

    onboardingComplete: false,

    user: {
        name: "Alex",
        subject: "python",
        dailyMinutes: 30
    },

    currentView: "dashboard",

    theme: "light",

    progress: {
        overall: 38,
        streak: 7,
        xp: 1240,
        confidence: 72,
        quizAccuracy: 84,
        learningMinutes: 222
    },

    roadmap: {
        currentModule: 3,
        controlFlowProgress: 64,
        checkpointShown: true
    },

    lesson: {
        completedQuickCheck: false,
        confidence: null,
        bookmarked: false,
        completed: false
    },

    coding: {
        hintsUsed: 0,
        code:
`def is_even(number):
    # Write your solution here
    pass`,
        completed: false
    },

    projects: {
        workspaceOpen: false,
        expenseTrackerProgress: 68
    },


    learnerIntelligence: {
        selectedConceptId: "functions",
        concepts: [
            {conceptId:"variables",conceptName:"Variables",mastery:92,confidence:"High",evidenceCount:8,evidenceSources:["Diagnostic Quiz","Practice"],status:"Mastered",lastUpdated:"Today",recentPerformance:"8 successful interactions",application:90,consistency:88},
            {conceptId:"data-types",conceptName:"Data Types",mastery:85,confidence:"High",evidenceCount:7,evidenceSources:["Diagnostic Quiz","Practice"],status:"Strong",lastUpdated:"Today",recentPerformance:"Consistently accurate",application:82,consistency:84},
            {conceptId:"conditional-statements",conceptName:"Conditional Statements",mastery:61,confidence:"Medium",evidenceCount:6,evidenceSources:["Adaptive Quiz","Lesson Check"],status:"Developing",lastUpdated:"Today",recentPerformance:"Improving after practice",application:60,consistency:68},
            {conceptId:"boolean-logic",conceptName:"Boolean Logic",mastery:42,confidence:"Low",evidenceCount:4,evidenceSources:["Diagnostic Quiz","Adaptive Practice"],status:"Needs Attention",lastUpdated:"Yesterday",recentPerformance:"4 weak assessment signals",application:40,consistency:52},
            {conceptId:"functions",conceptName:"Functions",mastery:48,confidence:"Low",evidenceCount:5,evidenceSources:["Coding Lab","Assessment Attempts"],status:"Blocked by Prerequisite",lastUpdated:"Today",recentPerformance:"Function performance is unstable",application:46,consistency:58},
            {conceptId:"variable-scope",conceptName:"Variable Scope",mastery:42,confidence:"Low",evidenceCount:4,evidenceSources:["Assessment Attempts","Coding Practice"],status:"Needs Attention",lastUpdated:"Yesterday",recentPerformance:"Weak prerequisite signals",application:41,consistency:50},
            {conceptId:"parameters",conceptName:"Parameters",mastery:56,confidence:"Medium",evidenceCount:5,evidenceSources:["Lesson Check"],status:"Developing",lastUpdated:"This week",recentPerformance:"Needs more application",application:54,consistency:62},
            {conceptId:"loops",conceptName:"Loops",mastery:68,confidence:"Medium",evidenceCount:6,evidenceSources:["Practice"],status:"Developing",lastUpdated:"This week",recentPerformance:"Steady progress",application:66,consistency:70}
        ],
        relationships: {"variables":["data-types","conditional-statements"],"data-types":["conditional-statements"],"boolean-logic":["conditional-statements"],"conditional-statements":["functions"],"variable-scope":["functions"],"parameters":["functions"],"functions":["loops"]},
        updates:[{when:"Today",text:"Conditional Statements updated",change:"61% → 67%",detail:"New assessment evidence received."},{when:"Yesterday",text:"Boolean Logic marked: Needs Attention",change:"42%",detail:"Repeated weak signals detected."}]
    },

    chat: {
        messages: [
            {
                type: "ai",
                text:
                    "Hi! I can help you reason through your Python problem. What part of if/else statements feels confusing right now?"
            },
            {
                type: "user",
                text:
                    "I don't understand when Python chooses the else block."
            },
            {
                type: "ai",
                text:
                    "Good question. Let's reason it out. If Python checks the condition inside if and finds that it is false, what do you think should happen next?"
            }
        ]
    }

};


/* ==============================================================
   3. APPLICATION STATE
================================================================ */

let state = loadState();

let onboardingStep = 1;

const onboardingData = {
    subject: null,
    time: null
};


/* ==============================================================
   4. DOM HELPERS
================================================================ */

const $ = (selector, root = document) => {
    return root.querySelector(selector);
};

const $$ = (selector, root = document) => {
    return [...root.querySelectorAll(selector)];
};


/* ==============================================================
   5. STORAGE HELPERS
================================================================ */

function loadState() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return structuredClone(defaultState);
        }

        const parsed = JSON.parse(saved);

        return deepMerge(
            structuredClone(defaultState),
            parsed
        );

    } catch (error) {

        console.warn(
            "Could not load Gyanify state.",
            error
        );

        return structuredClone(defaultState);
    }

}


function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    } catch (error) {

        console.warn(
            "Could not save Gyanify state.",
            error
        );

    }

}


function deepMerge(target, source) {

    Object.keys(source || {}).forEach(key => {

        if (
            source[key] &&
            typeof source[key] === "object" &&
            !Array.isArray(source[key]) &&
            target[key] &&
            typeof target[key] === "object"
        ) {

            deepMerge(
                target[key],
                source[key]
            );

        } else {

            target[key] = source[key];

        }

    });

    return target;
}


/* ==============================================================
   6. INITIALIZATION
================================================================ */

document.addEventListener("DOMContentLoaded", () => {

    applyTheme();

    bindGlobalEvents();

    if (state.onboardingComplete) {

        showMainApplication();

    } else {

        showOnboarding();

    }

    renderAll();

});


/* ==============================================================
   7. GLOBAL EVENT DELEGATION
================================================================ */

function legacy_bindGlobalEvents() {

    document.addEventListener(
        "click",
        handleDocumentClick
    );

    document.addEventListener(
        "change",
        handleDocumentChange
    );

    const chatForm = $("#chatForm");

    if (chatForm) {

        chatForm.addEventListener(
            "submit",
            handleChatSubmit
        );

    }

}


/* ==============================================================
   8. CLICK ROUTER
================================================================ */

function handleDocumentClick(event) {

    const target = event.target.closest(
        "[data-action], [data-view], [data-answer], [data-confidence], [data-choice], [data-prompt]"
    );

    if (!target) {
        return;
    }


    /* VIEW NAVIGATION */

    if (target.dataset.view) {

        navigateTo(
            target.dataset.view
        );

        return;
    }


    /* ACTIONS */

    const action = target.dataset.action;

    if (action) {

        handleAction(
            action,
            target
        );

        return;
    }


    /* ONBOARDING CHOICE */

    if (target.dataset.choice) {

        handleChoice(
            target
        );

        return;
    }


    /* QUICK ANSWER */

    if (target.dataset.answer) {

        handleQuickAnswer(
            target
        );

        return;
    }


    /* CONFIDENCE */

    if (target.dataset.confidence) {

        handleConfidence(
            target
        );

        return;
    }


    /* AI PROMPT */

    if (target.dataset.prompt) {

        const input = $("#chatInput");

        if (input) {

            input.value =
                target.dataset.prompt;

            input.focus();

        }

    }

}


/* ==============================================================
   9. CHANGE ROUTER
================================================================ */

function handleDocumentChange(event) {

    const element = event.target;

    if (
        element.id === "studentName"
    ) {

        state.user.name =
            element.value.trim() ||
            "Learner";

    }

}


/* ==============================================================
   10. ACTION ROUTER
================================================================ */

function handleAction(action, element) {

    switch (action) {

        case "next-onboarding":
            nextOnboarding();
            break;


        case "finish-onboarding":
            finishOnboarding();
            break;


        case "toggle-theme":
            toggleTheme();
            break;


        case "restart-demo":
            restartDemo();
            break;


        case "toggle-sidebar":
            toggleSidebar();
            break;


        case "show-notifications":
            showNotifications();
            break;


        case "open-profile":
            openProfile();
            break;


        case "bookmark":
            toggleBookmark(element);
            break;


        case "next-lesson":
            completeLesson();
            break;


        case "ask-ai":
            navigateTo("ai");
            break;

        case "open-concept": openConcept(element.dataset.concept); break;
        case "open-graph-node":
            state.learnerIntelligence.selectedConceptId = element.dataset.concept;
            renderKnowledgeGraph();
            break;
        case "view-knowledge-map": navigateTo("knowledge"); break;
        case "check-dependencies": checkDependencies(); break;
        case "start-repair": startRepair(element.dataset.concept); break;
        case "start-hero-repair": startRepair(calculateNextBestAction().concept.conceptId); break;
        case "guided-intelligence-demo": runGuidedIntelligenceDemo(); break;
        case "view-reasoning": openDecisionTrace(); break;
        case "repair-answer": submitRepairAnswer(element.dataset.answer); break;
        case "begin-repair": showRepairQuestion(element.dataset.concept); break;
        case "reset-intelligence-demo": resetIntelligenceDemo(); break;


        case "start-checkpoint":
            startCheckpoint();
            break;


        case "get-hint":
            showNextHint();
            break;


        case "run-code":
            runCodingTests();
            break;


        case "reset-code":
            resetCode();
            break;


        case "new-project":
            newProject();
            break;


        case "open-project":
            openProject();
            break;


        case "close-project":
            closeProject();
            break;


        case "start-project":
            startProject();
            break;


        case "download-passport":
            downloadPassport();
            break;


        case "copy-code":
            copyLessonCode();
            break;


        case "close-modal":
            closeModal();
            break;

    }

}


/* ==============================================================
   11. ONBOARDING
================================================================ */

function showOnboarding() {

    $("#onboardingScreen").classList.add(
        "active"
    );

    $("#mainApp").classList.remove(
        "active"
    );

    updateOnboardingUI();
}


function updateOnboardingUI() {

    $$(".onboarding-step").forEach(
        step => step.classList.remove("active")
    );

    const current =
        $(`#onboardingStep${onboardingStep}`);

    if (current) {
        current.classList.add("active");
    }


    $$(".step").forEach(
        step => {

            const number =
                Number(step.dataset.step);

            step.classList.toggle(
                "active",
                number <= onboardingStep
            );

        }
    );

}


function nextOnboarding() {

    if (onboardingStep === 1) {

        const input =
            $("#studentName");

        const name =
            input.value.trim();

        if (!name) {

            showToast(
                "Please enter your name first.",
                "error"
            );

            input.focus();

            return;
        }

        state.user.name = name;

        onboardingStep = 2;

    } else if (onboardingStep === 2) {

        if (!onboardingData.subject) {

            showToast(
                "Choose a learning subject.",
                "error"
            );

            return;
        }

        state.user.subject =
            onboardingData.subject;

        onboardingStep = 3;

    }

    updateOnboardingUI();

    saveState();
}


function finishOnboarding() {

    if (!onboardingData.time) {

        showToast(
            "Choose your daily learning time.",
            "error"
        );

        return;
    }

    state.user.dailyMinutes =
        Number(onboardingData.time);

    state.onboardingComplete = true;

    saveState();

    showMainApplication();

    showToast(
        "Your personalized roadmap is ready!",
        "success"
    );

}


/* ==============================================================
   12. CHOICES
================================================================ */

function handleChoice(button) {

    const group =
        button.dataset.group;

    const value =
        button.dataset.choice;

    $$(
        `.choice-card[data-group="${group}"]`
    ).forEach(
        card => card.classList.remove("selected")
    );

    button.classList.add("selected");

    if (group === "subject") {

        onboardingData.subject = value;

    }

    if (group === "time") {

        onboardingData.time = value;

    }

}


/* ==============================================================
   13. MAIN APPLICATION
================================================================ */

function showMainApplication() {

    $("#onboardingScreen").classList.remove(
        "active"
    );

    $("#mainApp").classList.add(
        "active"
    );

    navigateTo(
        state.currentView || "dashboard"
    );

    updateUserIdentity();

}


function updateUserIdentity() {

    const name =
        state.user.name ||
        "Learner";

    const avatar =
        name.charAt(0).toUpperCase();

    const dashboardName =
        $("#dashboardName");

    const headerName =
        $("#userNameHeader");

    const avatarElement =
        $("#userAvatar");

    const passportName =
        $("#passportName");

    if (dashboardName) {
        dashboardName.textContent =
            name;
    }

    if (headerName) {
        headerName.textContent =
            name;
    }

    if (avatarElement) {
        avatarElement.textContent =
            avatar;
    }

    if (passportName) {
        passportName.textContent =
            name;
    }

}


/* ==============================================================
   14. NAVIGATION
================================================================ */

function navigateTo(viewName) {

    const view =
        $(`#view-${viewName}`);

    if (!view) {
        return;
    }

    state.currentView =
        viewName;

    $$(".view").forEach(
        section => {

            section.classList.toggle(
                "active",
                section.id === `view-${viewName}`
            );

        }
    );


    /* Desktop navigation */

    $$(".nav-item[data-view]").forEach(
        item => {

            item.classList.toggle(
                "active",
                item.dataset.view === viewName
            );

        }
    );


    /* Mobile navigation */

    $$(".mobile-nav-item[data-view]").forEach(
        item => {

            item.classList.toggle(
                "active",
                item.dataset.view === viewName
            );

        }
    );


    const breadcrumb =
        $("#breadcrumb");

    if (breadcrumb) {

        breadcrumb.textContent =
            getViewLabel(viewName);

    }


    closeSidebar();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    saveState();

}


function getViewLabel(view) {

    const labels = {

        dashboard: "Dashboard",
        roadmap: "Roadmap",
        learn: "Learning Room",
        coding: "Coding Lab",
        projects: "Projects",
        progress: "Progress",
        passport: "Skill Passport",
        mentor: "Mentor Intelligence",
        ai: "Gyanify AI",
        twin: "Learner Digital Twin",
        knowledge: "Knowledge Map",
        action: "Next Best Action"

    };

    return labels[view] || "Dashboard";
}


/* ==============================================================
   15. THEME
================================================================ */

function applyTheme() {

    document.body.classList.toggle(
        "dark",
        state.theme === "dark"
    );

    const icon =
        $("#themeIcon");

    if (icon) {

        icon.textContent =
            state.theme === "dark"
                ? "☀"
                : "☾";

    }

}


function toggleTheme() {

    state.theme =
        state.theme === "dark"
            ? "light"
            : "dark";

    applyTheme();

    saveState();

    showToast(
        state.theme === "dark"
            ? "Dark mode enabled."
            : "Light mode enabled.",
        "success"
    );

}


/* ==============================================================
   16. SIDEBAR
================================================================ */

function toggleSidebar() {

    const sidebar =
        $("#sidebar");

    if (sidebar) {

        sidebar.classList.toggle(
            "open"
        );

    }

}


function closeSidebar() {

    const sidebar =
        $("#sidebar");

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }

}


/* ==============================================================
   17. LESSON QUICK CHECK
================================================================ */

function handleQuickAnswer(button) {

    const answer =
        button.dataset.answer;

    const feedback =
        $("#quickCheckFeedback");

    $$(".answer-button").forEach(
        item => {

            item.classList.remove(
                "selected"
            );

        }
    );

    button.classList.add(
        "selected"
    );


    if (answer === "B") {

        feedback.className =
            "feedback success";

        feedback.textContent =
            "Correct! Since 72 is below 80, the else branch runs.";

        if (!state.lesson.completedQuickCheck) {

            state.lesson.completedQuickCheck =
                true;

            state.progress.xp += 20;

            state.progress.overall =
                Math.min(
                    100,
                    state.progress.overall + 1
                );

            saveState();

            updateStats();

            showToast(
                "+20 XP — Nice reasoning!",
                "success"
            );

        }

    } else {

        feedback.className =
            "feedback error";

        feedback.textContent =
            "Not quite. Check the condition: is 72 greater than or equal to 80?";

    }

}


/* ==============================================================
   18. CONFIDENCE
================================================================ */

function handleConfidence(button) {

    const value =
        Number(button.dataset.confidence);

    state.lesson.confidence =
        value;

    $$(".confidence-buttons button").forEach(
        item => {

            item.classList.toggle(
                "selected",
                Number(item.dataset.confidence) === value
            );

        }
    );


    const mappedConfidence = {

        1: 45,
        2: 60,
        3: 78,
        4: 90

    };

    const newConfidence =
        mappedConfidence[value];

    state.progress.confidence =
        Math.round(
            (
                state.progress.confidence +
                newConfidence
            ) / 2
        );

    saveState();

    updateStats();

    showToast(
        "Confidence recorded. Your roadmap will adapt to this signal.",
        "success"
    );

}


/* ==============================================================
   19. LESSON COMPLETION
================================================================ */

function completeLesson() {

    if (!state.lesson.completed) {

        state.lesson.completed =
            true;

        state.progress.xp += 40;

        state.progress.overall =
            Math.min(
                100,
                state.progress.overall + 2
            );

        state.roadmap.controlFlowProgress =
            Math.min(
                100,
                state.roadmap.controlFlowProgress + 5
            );

        saveState();

        updateStats();

        showToast(
            "Lesson completed — +40 XP!",
            "success"
        );

    }

    navigateTo("coding");

}


/* ==============================================================
   20. BOOKMARK
================================================================ */

function toggleBookmark() {

    state.lesson.bookmarked =
        !state.lesson.bookmarked;

    saveState();

    showToast(
        state.lesson.bookmarked
            ? "Lesson bookmarked."
            : "Bookmark removed.",
        "success"
    );

}


/* ==============================================================
   21. ADAPTIVE CHECKPOINT
================================================================ */

function startCheckpoint() {

    openModal({

        title: "Adaptive Checkpoint",

        content: `
            <span class="eyebrow">
                7-MINUTE REPAIR ACTIVITY
            </span>

            <h2>
                Let's fix the misconception
            </h2>

            <p>
                Gyanify noticed that you sometimes treat
                <code>and</code> and <code>or</code> as if they
                behave the same way.
            </p>

            <div class="concept-card">
                <div class="concept-icon">💡</div>
                <div>
                    <h3>Think about the number of conditions</h3>
                    <p>
                        With <code>and</code>, every condition must
                        be true. With <code>or</code>, at least one
                        condition must be true.
                    </p>
                </div>
            </div>

            <div class="try-it-card">
                <h3>
                    Which statement is true?
                </h3>

                <button
                    class="btn btn-secondary btn-block"
                    data-action="checkpoint-answer-1"
                >
                    5 > 3 and 5 < 10
                </button>

                <br>

                <button
                    class="btn btn-secondary btn-block"
                    data-action="checkpoint-answer-2"
                >
                    5 > 10 and 5 < 3
                </button>
            </div>
        `

    });

}


/* ==============================================================
   22. HINT SYSTEM
================================================================ */

const codingHints = [

    "Think about what property an even number has when you divide it by 2.",

    "The modulo operator (%) gives you the remainder after division.",

    "If number % 2 equals 0, the number is even. Your function should return a boolean."

];


function showNextHint() {

    const index =
        state.coding.hintsUsed;

    if (index >= codingHints.length) {

        showToast(
            "You've used all three hints. Try the problem yourself!",
            "error"
        );

        return;
    }

    const hintContainer =
        $("#hintContainer");

    if (!hintContainer) {
        return;
    }

    const hint =
        document.createElement("div");

    hint.className =
        "hint";

    hint.textContent =
        `Hint ${index + 1}: ${codingHints[index]}`;

    hintContainer.appendChild(
        hint
    );

    state.coding.hintsUsed++;

    $("#hintCount").textContent =
        `${state.coding.hintsUsed} / 3 used`;

    if (
        state.coding.hintsUsed >= 3
    ) {

        $("#hintButton").textContent =
            "All hints used";

    }

    saveState();

}


/* ==============================================================
   23. CODING LAB
================================================================ */

function legacy_runCodingTests() {

    const editor =
        $("#codeEditor");

    const output =
        $("#codeOutput");

    if (!editor || !output) {
        return;
    }

    const code =
        editor.value;

    /*
       IMPORTANT:
       This prototype intentionally does NOT execute arbitrary
       JavaScript or Python code supplied by the learner.

       Instead it performs a lightweight static check of the
       expected solution pattern.
    */

    const hasFunction =
        /def\s+is_even\s*\(/.test(code);

    const hasModulo =
        /%\s*2/.test(code);

    const hasReturn =
        /\breturn\b/.test(code);

    const hasZeroCheck =
        /%\s*2\s*={1,2}\s*0/.test(code);

    const passed =
        hasFunction &&
        hasModulo &&
        hasReturn &&
        hasZeroCheck;


    if (passed) {

        output.innerHTML = `

            <div class="test-result pass">
                ✓ Test 1 — is_even(4) → True
            </div>

            <div class="test-result pass">
                ✓ Test 2 — is_even(7) → False
            </div>

            <div class="test-result pass">
                ✓ Test 3 — is_even(0) → True
            </div>

            <div class="test-result pass">
                ✓ All tests passed!
            </div>

        `;

        if (!state.coding.completed) {

            state.coding.completed =
                true;

            state.progress.xp += 50;

            state.progress.overall =
                Math.min(
                    100,
                    state.progress.overall + 2
                );

            saveState();

            updateStats();

            showToast(
                "Coding challenge passed — +50 XP!",
                "success"
            );

        }

    } else {

        output.innerHTML = `

            <div class="test-result fail">
                ✕ Some tests failed.
            </div>

            <div class="test-result">
                → Make sure the function uses the modulo
                operator and returns True/False.
            </div>

            <div class="test-result">
                → You can use the progressive hints on the left.
            </div>

        `;

    }

}


function resetCode() {

    const editor =
        $("#codeEditor");

    if (!editor) {
        return;
    }

    editor.value =
`def is_even(number):
    # Write your solution here
    pass`;

    const output =
        $("#codeOutput");

    if (output) {

        output.innerHTML = `
            <div class="output-placeholder">
                Run your code to see test results.
            </div>
        `;

    }

    showToast(
        "Code reset.",
        "success"
    );

}


/* ==============================================================
   24. PROJECTS
================================================================ */

function openProject() {

    state.projects.workspaceOpen =
        true;

    const workspace =
        $("#projectWorkspace");

    if (workspace) {

        workspace.classList.remove(
            "hidden"
        );

        workspace.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    saveState();

}


function closeProject() {

    state.projects.workspaceOpen =
        false;

    const workspace =
        $("#projectWorkspace");

    if (workspace) {

        workspace.classList.add(
            "hidden"
        );

    }

    saveState();

}


function startProject() {

    showToast(
        "Project added to your roadmap.",
        "success"
    );

    state.projects.workspaceOpen =
        true;

    saveState();

    openProject();

}


function newProject() {

    openModal({

        title: "Create a project",

        content: `

            <span class="eyebrow">
                PROJECT BUILDER
            </span>

            <h2>
                Start from an idea
            </h2>

            <p>
                Describe what you want to build and Gyanify
                will help you turn it into milestones.
            </p>

            <div class="form-group">
                <label for="newProjectName">
                    Project name
                </label>

                <input
                    id="newProjectName"
                    type="text"
                    placeholder="e.g. Study Planner"
                >
            </div>

            <button
                class="btn btn-primary btn-block"
                data-action="create-project"
            >
                Create project
            </button>

        `

    });

}


/* ==============================================================
   25. PASSPORT
================================================================ */

function downloadPassport() {

    const name =
        state.user.name || "Learner";

    const content = [

        "GYANIFY SKILL PASSPORT",
        "======================",
        "",
        `Learner: ${name}`,
        "Track: Python Foundations",
        "",
        "SKILLS",
        "------",
        "Python Fundamentals: 84%",
        "Problem Solving: 76%",
        "Project Application: 68%",
        "",
        "EVIDENCE",
        "--------",
        "24 lessons completed",
        "87 coding tests passed",
        "2 projects submitted",
        "",
        `Overall progress: ${state.progress.overall}%`,
        `Confidence: ${state.progress.confidence}%`,
        `Quiz accuracy: ${state.progress.quizAccuracy}%`,
        "",
        "Issued by Gyanify"

    ].join("\n");


    const blob =
        new Blob(
            [content],
            {
                type: "text/plain"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href =
        url;

    link.download =
        "gyanify-skill-passport.txt";

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );

    showToast(
        "Skill passport exported.",
        "success"
    );

}


/* ==============================================================
   26. AI CHAT
================================================================ */

function handleChatSubmit(event) {

    event.preventDefault();

    const input =
        $("#chatInput");

    if (!input) {
        return;
    }

    const message =
        input.value.trim();

    if (!message) {
        return;
    }

    addChatMessage(
        "user",
        message
    );

    input.value = "";

    setTimeout(
        () => {

            const response =
                generateTutorResponse(
                    message
                );

            addChatMessage(
                "ai",
                response
            );

        },
        450
    );

}


function addChatMessage(
    type,
    text
) {

    state.chat.messages.push({
        type,
        text
    });

    renderChatMessages();

    saveState();

}


function renderChatMessages() {

    const container =
        $("#chatMessages");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    state.chat.messages.forEach(
        message => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                `message ${message.type}`;


            if (message.type === "ai") {

                const avatar =
                    document.createElement("div");

                avatar.className =
                    "message-avatar";

                avatar.textContent =
                    "✦";

                wrapper.appendChild(
                    avatar
                );

            }


            const bubble =
                document.createElement("div");

            bubble.className =
                "message-bubble";


            const paragraphs =
                message.text
                    .split("\n\n")
                    .filter(Boolean);


            paragraphs.forEach(
                paragraph => {

                    const p =
                        document.createElement("p");

                    p.textContent =
                        paragraph;

                    bubble.appendChild(
                        p
                    );

                }
            );


            wrapper.appendChild(
                bubble
            );

            container.appendChild(
                wrapper
            );

        }
    );

    container.scrollTop =
        container.scrollHeight;

}


function generateSocraticFallback(message) {

    const text =
        message.toLowerCase();


    if (
        text.includes("else") ||
        text.includes("if")
    ) {

        return [
            "Let's reason through it rather than jumping straight to the answer.",
            "",
            "Python evaluates the condition after `if` first.",
            "If that condition is false, what other branch is available in the example?"
        ].join("\n\n");

    }


    if (
        text.includes("modulo") ||
        text.includes("%") ||
        text.includes("even")
    ) {

        return [
            "Think about division by 2.",
            "",
            "When a number is even, what remainder do you get after dividing it by 2?",
            "",
            "Try predicting the result for 4 % 2 and 7 % 2."
        ].join("\n\n");

    }


    if (
        text.includes("function")
    ) {

        return [
            "A function is a reusable block of logic.",
            "",
            "Before writing the code, identify three things:",
            "1. What input does the function receive?",
            "2. What should it calculate?",
            "3. What should it return?"
        ].join("\n\n");

    }


    if (
        text.includes("debug") ||
        text.includes("error")
    ) {

        return [
            "Let's debug it systematically.",
            "",
            "First identify the exact line where the behavior becomes different from what you expected.",
            "Then ask: what values do the variables have at that point?",
            "",
            "If you paste the smallest piece of code that reproduces the problem, we can reason through it together."
        ].join("\n\n");

    }


    return [
        "Good question.",
        "",
        "Instead of giving you the answer immediately, let's break the problem into smaller parts.",
        "",
        "What do you already know about the concept, and which exact step feels uncertain?"
    ].join("\n\n");

}


/* ==============================================================
   27. NOTIFICATIONS
================================================================ */

function showNotifications() {

    openModal({

        title: "Notifications",

        content: `

            <div class="mentor-action">
                <strong>
                    ✦ Adaptive recommendation
                </strong>

                <span>
                    Spend 8 extra minutes on conditional logic.
                </span>
            </div>

            <div class="mentor-action">
                <strong>
                    🔥 Streak milestone
                </strong>

                <span>
                    You've maintained a 7-day learning streak.
                </span>
            </div>

            <div class="mentor-action">
                <strong>
                    🏆 New achievement
                </strong>

                <span>
                    You unlocked Concept Builder.
                </span>
            </div>

        `

    });

}


/* ==============================================================
   28. PROFILE
================================================================ */

function openProfile() {

    openModal({

        title: "Your profile",

        content: `

            <div class="passport-header">

                <div class="passport-avatar">
                    ${escapeHtml(
                        state.user.name
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <div>
                    <span class="eyebrow">
                        LEARNER
                    </span>

                    <h2>
                        ${escapeHtml(
                            state.user.name
                        )}
                    </h2>

                    <p>
                        Python Foundations
                    </p>
                </div>

            </div>

            <div class="mentor-action">
                <strong>
                    Daily learning target
                </strong>

                <span>
                    ${state.user.dailyMinutes}
                    minutes per day
                </span>
            </div>

            <div class="mentor-action">
                <strong>
                    Current streak
                </strong>

                <span>
                    ${state.progress.streak}
                    days
                </span>
            </div>

        `

    });

}


/* ==============================================================
   29. MODALS
================================================================ */

function openModal({
    title,
    content
}) {

    const overlay =
        $("#modalOverlay");

    const modalContent =
        $("#modalContent");

    if (!overlay || !modalContent) {
        return;
    }

    modalContent.innerHTML = `

        <h2>
            ${escapeHtml(title)}
        </h2>

        ${content}

    `;

    overlay.classList.add(
        "active"
    );

    overlay.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeModal() {

    const overlay =
        $("#modalOverlay");

    if (!overlay) {
        return;
    }

    overlay.classList.remove(
        "active"
    );

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );

}


$("#modalOverlay")?.addEventListener(
    "click",
    event => {

        if (
            event.target.id ===
            "modalOverlay"
        ) {

            closeModal();

        }

    }
);


/* ==============================================================
   30. TOASTS
================================================================ */

function showToast(
    message,
    type = "success"
) {

    const container =
        $("#toastContainer");

    if (!container) {
        return;
    }

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.textContent =
        message;

    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(5px)";

            setTimeout(
                () => toast.remove(),
                200
            );

        },
        2800
    );

}


/* ==============================================================
   31. COPY CODE
================================================================ */

function copyLessonCode() {

    const code =
`age = 18

if age >= 18:
    print("You can vote")
else:
    print("You cannot vote")`;

    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        navigator.clipboard
            .writeText(code)
            .then(
                () => {

                    showToast(
                        "Code copied to clipboard.",
                        "success"
                    );

                }
            )
            .catch(
                () => {

                    showToast(
                        "Could not copy automatically.",
                        "error"
                    );

                }
            );

    }

}


/* ==============================================================
   32. RESTART DEMO
================================================================ */

function legacy_restartDemo() {

    const confirmed =
        window.confirm(
            "Restart the Gyanify demo? Your local demo progress will be reset."
        );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(
        STORAGE_KEY
    );

    state =
        structuredClone(
            defaultState
        );

    onboardingStep = 1;

    onboardingData.subject =
        null;

    onboardingData.time =
        null;

    showOnboarding();

    updateOnboardingUI();

    showToast(
        "Demo restarted.",
        "success"
    );

}


/* ==============================================================
   33. RENDER ALL
================================================================ */

function legacy_renderAll_1() {

    updateUserIdentity();

    updateStats();

    restoreCodingState();

    restoreProjectState();

    restoreChatState();

    renderLearnerIntelligence();

}


/* ==============================================================
   34. UPDATE STATS
================================================================ */

function updateStats() {

    const elements = {

        streakStat:
            `${state.progress.streak} days`,

        progressStat:
            `${state.progress.overall}%`,

        xpStat:
            state.progress.xp.toLocaleString(),

        confidenceStat:
            `${state.progress.confidence}%`

    };


    Object.entries(elements).forEach(
        ([id, value]) => {

            const element =
                $(`#${id}`);

            if (element) {

                element.textContent =
                    value;

            }

        }
    );


    const roadmapProgress =
        $("#roadmapProgressBar");

    if (roadmapProgress) {

        roadmapProgress.style.width =
            `${state.progress.overall}%`;

    }

}


/* ==============================================================
   35. RESTORE CODING
================================================================ */

function restoreCodingState() {

    const editor =
        $("#codeEditor");

    if (editor) {

        editor.value =
            state.coding.code;

    }

    const count =
        $("#hintCount");

    if (count) {

        count.textContent =
            `${state.coding.hintsUsed} / 3 used`;

    }


    const hintButton =
        $("#hintButton");

    if (
        hintButton &&
        state.coding.hintsUsed >= 3
    ) {

        hintButton.textContent =
            "All hints used";

    }

}


/* ==============================================================
   36. SAVE CODE WHILE TYPING
================================================================ */

document.addEventListener(
    "input",
    event => {

        if (
            event.target.id ===
            "codeEditor"
        ) {

            state.coding.code =
                event.target.value;

            saveState();

        }

    }
);


/* ==============================================================
   37. RESTORE PROJECT
================================================================ */

function restoreProjectState() {

    const workspace =
        $("#projectWorkspace");

    if (!workspace) {
        return;
    }

    workspace.classList.toggle(
        "hidden",
        !state.projects.workspaceOpen
    );

}


/* ==============================================================
   38. RESTORE CHAT
================================================================ */

function restoreChatState() {

    renderChatMessages();

}


/* ==============================================================
   39. HTML ESCAPING
================================================================ */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ==============================================================
   40. KEYBOARD SHORTCUTS
================================================================ */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModal();

            closeSidebar();

        }

    }
);


/* ==============================================================
   41. CLICK OUTSIDE SIDEBAR ON MOBILE
================================================================ */

document.addEventListener(
    "click",
    event => {

        if (
            window.innerWidth > 760
        ) {
            return;
        }

        const sidebar =
            $("#sidebar");

        const menu =
            $(".mobile-menu-btn");

        if (
            sidebar &&
            sidebar.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !menu?.contains(event.target)
        ) {

            closeSidebar();

        }

    }
);


/* ==============================================================
   42. CHECKPOINT ANSWER HANDLERS
================================================================ */

document.addEventListener(
    "click",
    event => {

        const action =
            event.target.closest(
                "[data-action]"
            )?.dataset.action;

        if (
            action ===
            "checkpoint-answer-1"
        ) {

            closeModal();

            state.progress.confidence =
                Math.min(
                    100,
                    state.progress.confidence + 4
                );

            state.progress.xp += 25;

            state.roadmap.checkpointShown =
                false;

            saveState();

            updateStats();

            showToast(
                "Correct! Misconception repaired — +25 XP.",
                "success"
            );

        }

        if (
            action ===
            "checkpoint-answer-2"
        ) {

            showToast(
                "Think again: both conditions need to be true when using 'and'.",
                "error"
            );

        }

    }
);


/* ==============================================================
   43. CREATE PROJECT
================================================================ */

document.addEventListener(
    "click",
    event => {

        const action =
            event.target.closest(
                "[data-action]"
            )?.dataset.action;

        if (
            action !==
            "create-project"
        ) {
            return;
        }

        const input =
            $("#newProjectName");

        const name =
            input?.value.trim();

        if (!name) {

            showToast(
                "Give your project a name.",
                "error"
            );

            return;
        }

        closeModal();

        showToast(
            `"${name}" added to your project workspace.`,
            "success"
        );

    }
);


/* ==============================================================
   44. EXTERNAL WINDOW SAFETY
================================================================ */

window.addEventListener(
    "beforeunload",
    () => {

        saveState();

    }
);


/* ==============================================================
   END OF APPLICATION
================================================================ */

/* ==============================================================\n   BATCH 1 — CONNECTED LEARNER INTELLIGENCE\n================================================================ */
function getConcept(id){return state.learnerIntelligence.concepts.find(c=>c.conceptId===id);}
function getStatusClass(status){return status.toLowerCase().replace(/[^a-z]+/g,'-');}
function getPrerequisites(id){return Object.entries(state.learnerIntelligence.relationships).filter(([k,v])=>v.includes(id)).map(([k])=>k);}
function getDependents(id){return state.learnerIntelligence.relationships[id]||[];}
function legacy_calculateNextBestAction_1(){
 const concepts=state.learnerIntelligence.concepts; const functions=getConcept('functions'); const scope=getConcept('variable-scope');
 // Rule 1: repair weaker prerequisite before a blocked concept.
 if(functions && scope && functions.mastery<50 && scope.mastery<50){return {concept:scope,action:'Repair Foundation',title:'Repair Variable Scope',minutes:7,why:'Current learning evidence indicates Variable Scope is a weak prerequisite likely affecting Functions.',outcome:'Improve readiness for Functions.',focus:'Functions'};}
 // After prerequisite repair, keep the journey focused on the previously unstable dependent concept.
 if(functions && scope && scope.mastery>=75 && functions.mastery<50){return {concept:functions,action:'Adaptive Practice',title:'Practice Functions',minutes:10,why:'The prerequisite foundation has improved; Functions now needs targeted application evidence.',outcome:'Strengthen Functions through guided practice.',focus:'Functions'};}
 const target=[...concepts].filter(c=>c.mastery<50).sort((a,b)=>a.mastery-b.mastery)[0];
 if(target)return {concept:target,action:'Targeted Concept Repair',title:`Repair ${target.conceptName}`,minutes:7,why:`${target.conceptName} has the weakest current learning state.`,outcome:'Stabilize the foundation before progressing.',focus:target.conceptName};
 const developing=[...concepts].filter(c=>c.mastery>=50&&c.mastery<=70).sort((a,b)=>a.mastery-b.mastery)[0];
 if(developing)return {concept:developing,action:'Adaptive Practice',title:`Practice ${developing.conceptName}`,minutes:10,why:`${developing.conceptName} is developing and needs more evidence.`,outcome:'Strengthen mastery through application.',focus:developing.conceptName};
 const next=[...concepts].filter(c=>c.mastery>75)[0]||concepts[0]; return {concept:next,action:'Continue to Next Concept',title:`Continue to ${next.conceptName}`,minutes:12,why:'Mastery and confidence are sufficient to progress.',outcome:'Build on a stable foundation.',focus:next.conceptName};
}
function legacy_openDecisionTrace_1(){const a=calculateNextBestAction(); showModal('Why GYANIFY Recommended This',`<div class="decision-modal"><span class="eyebrow">EXPLAINABLE DECISION TRACE</span><div class="trace-step"><span>1</span><div><b>LEARNING EVIDENCE</b><p>${a.concept.evidenceCount} signals · ${a.concept.recentPerformance}</p></div></div><div class="trace-step"><span>2</span><div><b>CONCEPT ANALYSIS</b><p>${a.focus}: ${getConcept(a.focus.toLowerCase().replace(' ','-'))?.mastery||48}% mastery.</p></div></div><div class="trace-step"><span>3</span><div><b>DEPENDENCY ANALYSIS</b><p>Checking prerequisite concepts and connected knowledge relationships.</p></div></div><div class="trace-step"><span>4</span><div><b>WEAK FOUNDATION</b><p>${a.concept.conceptName}: ${a.concept.mastery}% mastery · ${a.concept.confidence} confidence.</p></div></div><div class="trace-step"><span>5</span><div><b>INSIGHT</b><p>Evidence suggests a potential prerequisite instability rather than a definitive diagnosis.</p></div></div><div class="trace-step decision"><span>6</span><div><b>DECISION</b><p>${a.title}</p><small><strong>WHY THIS MATTERS</strong><br>${a.outcome}</small></div></div><div class="modal-actions"><button class="btn btn-secondary" data-action="view-knowledge-map">View Knowledge Map</button><button class="btn btn-primary" data-action="start-repair" data-concept="${a.concept.conceptId}">Start Repair</button></div></div>`);}
function renderLearnerIntelligence(){renderTwin();renderKnowledgeGraph();renderNextBestAction();renderDashboardNextBestAction();}
function renderDashboardNextBestAction(){const root=$('#dashboardNextBestAction');if(!root)return;const a=calculateNextBestAction();root.innerHTML=`<span class="eyebrow">NEXT BEST ACTION</span><h3>${a.title}</h3><p>${a.why}</p><div class="dashboard-action-meta"><span><strong>${a.minutes} min</strong> focused action</span><span><strong>Expected:</strong> ${a.outcome}</span></div><div class="modal-actions"><button class="btn btn-primary" data-action="start-repair" data-concept="${a.concept.conceptId}">Start Repair</button><button class="btn btn-secondary" data-action="view-reasoning">Why This Action?</button></div>`;}
function legacy_renderTwin_1(){const root=$('#twinSummary'); if(!root)return; const cs=state.learnerIntelligence.concepts; const avg=Math.round(cs.reduce((s,c)=>s+c.mastery,0)/cs.length); const mastered=cs.filter(c=>c.mastery>=80).length; const gaps=cs.filter(c=>c.mastery<50).length; root.innerHTML=`<div class="metric-card"><span>Overall Learning State</span><strong>${avg}%</strong></div><div class="metric-card"><span>Learner Model Confidence</span><strong>87%</strong></div><div class="metric-card"><span>Concepts Mastered</span><strong>${mastered} / ${cs.length}</strong></div><div class="metric-card"><span>Knowledge Gaps</span><strong>${gaps}</strong></div>`;
 const list=$('#conceptList'); if(list)list.innerHTML=cs.map(c=>`<article class="concept-row"><div><strong>${c.conceptName}</strong><small>${c.recentPerformance}</small></div><div class="mastery-mini"><strong>${c.mastery}%</strong><div><i style="width:${c.mastery}%"></i></div></div><span class="status-pill ${getStatusClass(c.status)}">${c.confidence} · ${c.status}</span><span class="evidence-count">${c.evidenceCount} signals</span><button class="btn btn-secondary btn-small" data-action="open-concept" data-concept="${c.conceptId}">View Details</button></article>`).join('');
 const dims=$('#twinDimensions'); if(dims){const d=[['Knowledge Mastery',avg],['Confidence',Math.round(cs.reduce((s,c)=>s+({High:90,Medium:65,Low:40}[c.confidence]),0)/cs.length)],['Application',Math.round(cs.reduce((s,c)=>s+c.application,0)/cs.length)],['Consistency',Math.round(cs.reduce((s,c)=>s+c.consistency,0)/cs.length)]];dims.innerHTML=d.map(([n,v])=>`<div class="dimension-card"><span>${n}</span><strong>${v}%</strong><div class="dimension-bar"><i style="width:${v}%"></i></div></div>`).join('');}
 const up=$('#twinUpdates');if(up)up.innerHTML=state.learnerIntelligence.updates.map(u=>`<div class="update-item"><span>${u.when}</span><div><strong>${u.text}</strong><b>${u.change}</b><small>${u.detail}</small></div></div>`).join('');}
function openConcept(id){state.learnerIntelligence.selectedConceptId=id;const c=getConcept(id); if(!c)return; showModal(c.conceptName,`<div class="concept-modal"><span class="eyebrow">CURRENT LEARNING STATE</span><h2>${c.mastery}% mastery</h2><p><strong>${c.confidence} confidence</strong> · ${c.status}</p><hr><p><strong>Evidence sources</strong><br>${c.evidenceSources.join(' · ')}</p><p><strong>Recent performance</strong><br>${c.recentPerformance}</p><p><strong>Related concepts</strong><br>${[...getPrerequisites(id),...getDependents(id)].map(x=>getConcept(x)?.conceptName).filter(Boolean).join(' · ')||'No mapped relationships'}</p><div class="modal-actions"><button class="btn btn-secondary" data-action="view-knowledge-map">View Knowledge Map</button><button class="btn btn-primary" data-action="start-repair" data-concept="${id}">Start Repair</button></div></div>`);}
function legacy_renderKnowledgeGraph_1(){const root=$('#knowledgeGraph');if(!root)return;const cs=state.learnerIntelligence.concepts;root.innerHTML=cs.map(c=>`<button class="graph-node ${getStatusClass(c.status)} ${state.learnerIntelligence.selectedConceptId===c.conceptId?'selected':''}" data-action="open-graph-node" data-concept="${c.conceptId}" aria-label="${c.conceptName}, ${c.mastery}% mastery"><strong>${c.conceptName}</strong><span>${c.mastery}%</span></button>`).join('');renderGraphDetails(state.learnerIntelligence.selectedConceptId);}
function renderGraphDetails(id){const root=$('#graphDetails');const c=getConcept(id);if(!root||!c)return;const prereqs=getPrerequisites(id).map(x=>getConcept(x)).filter(Boolean);const deps=getDependents(id).map(x=>getConcept(x)).filter(Boolean);root.innerHTML=`<span class="eyebrow">CONCEPT INSIGHT</span><h2>${c.conceptName}</h2><div class="detail-metrics"><div><span>Mastery</span><strong>${c.mastery}%</strong></div><div><span>Confidence</span><strong>${c.confidence}</strong></div></div><p class="status-copy">${c.status}</p><h4>Prerequisites</h4><p>${prereqs.map(x=>`${x.conceptName} ${x.mastery>=75?'✓':'· '+x.mastery+'%'}`).join('<br>')||'Foundation concept'}</p><h4>Dependent Concepts</h4><p>${deps.map(x=>x.conceptName).join('<br>')||'No mapped dependents'}</p><h4>Learning Evidence</h4><p>${c.recentPerformance}</p><div class="modal-actions"><button class="btn btn-secondary" data-action="check-dependencies">Check Dependencies</button><button class="btn btn-primary" data-action="start-repair" data-concept="${id}">Start Repair</button></div>`;}
function legacy_checkDependencies_1(){const f=getConcept('functions'),scope=getConcept('variable-scope'),cond=getConcept('conditional-statements');const root=$('#dependencyResult');if(!root)return;root.innerHTML=`<div class="dependency-card"><span class="eyebrow">ROOT GAP ANALYSIS</span><h2>Functions <small>${f.mastery}%</small></h2><div class="dependency-flow"><div>Checking prerequisites</div><div>${cond.conceptName} · ${cond.mastery}%</div><div>${scope.conceptName} · ${scope.mastery}%</div><strong>Potential Root Gap Identified: ${scope.conceptName}</strong></div><p>Evidence suggests prerequisite instability. Improving Variable Scope may strengthen understanding of Functions.</p><button class="btn btn-primary" data-action="start-repair" data-concept="variable-scope">Repair Variable Scope</button></div>`;}
function renderNextBestAction(){const a=calculateNextBestAction();const root=$('#nextBestAction');if(root)root.innerHTML=`<div class="action-kicker">ONE PRIMARY RECOMMENDATION</div><span class="eyebrow">NEXT BEST ACTION</span><h2>${a.title}</h2><p class="action-type">${a.action}</p><div class="action-facts"><div><span>Estimated Time</span><strong>${a.minutes} minutes</strong></div><div><span>Why this matters</span><strong>${a.why}</strong></div><div><span>Expected Outcome</span><strong>${a.outcome}</strong></div></div><div class="modal-actions"><button class="btn btn-primary" data-action="start-repair" data-concept="${a.concept.conceptId}">Start Repair</button><button class="btn btn-secondary" data-action="view-reasoning">Why This Action?</button></div>`;renderDecisionTrace(a);}
function renderDecisionTrace(a){const root=$('#decisionTrace');if(!root)return;const c=a.concept;const focus=getConcept('functions');root.innerHTML=`<div class="trace-step"><span>1</span><div><b>EVIDENCE</b><p>${c.recentPerformance}</p></div></div><div class="trace-step"><span>2</span><div><b>INTERPRETATION</b><p>${c.conceptName} is currently at ${c.mastery}% mastery with ${c.confidence.toLowerCase()} confidence.</p></div></div><div class="trace-step"><span>3</span><div><b>KNOWLEDGE MAP</b><p>${c.conceptName==='variable-scope'?`Variable Scope is a weak prerequisite for Functions (${focus.mastery}%).`:'Dependency and mastery rules were checked before recommending progress.'}</p></div></div><div class="trace-step decision"><span>4</span><div><b>DECISION</b><p>${a.title}</p><small><strong>Why this matters:</strong> Improving ${c.conceptName} may strengthen the next connected concept without claiming certainty.</small></div></div>`;}
function legacy_startRepair_1(id){const c=getConcept(id);if(!c)return;const before=c.mastery;c.mastery=Math.max(c.mastery,78);c.confidence='Medium';c.status='Developing';c.evidenceCount+=1;c.lastUpdated='Just now';c.recentPerformance='Successful targeted practice and retest';state.learnerIntelligence.updates.unshift({when:'Just now',text:`${c.conceptName} updated`,change:`${before}% → ${c.mastery}%`,detail:'Successful practice/retest evidence received.'});saveState();renderAll();showToast('✓ Learner Digital Twin Updated');}



/* ==============================================================
   FINAL SIH 2026 INTELLIGENCE ENGINE — CONNECTED MVP OVERRIDES
================================================================ */
function dependencyImpact(c){return getDependents(c.conceptId).length*18 + getPrerequisites(c.conceptId).length*8;}
function confidenceValue(v){return ({High:90,Medium:65,Low:35}[v]||50);}
function riskScore(c){const mastery=100-c.mastery, confidence=100-confidenceValue(c.confidence), evidence=Math.max(0,60-c.evidenceCount*8), recent=/weak|unstable|difficulty/i.test(c.recentPerformance)?18:5;return Math.min(100,Math.round(mastery*.42+confidence*.22+evidence*.12+dependencyImpact(c)*.16+recent));}
function priorityFor(c){return riskScore(c)+dependencyImpact(c)*.35;}
function modelConfidence(){const cs=state.learnerIntelligence.concepts;return Math.round(Math.min(94,cs.reduce((n,c)=>n+Math.min(100,c.evidenceCount*12+confidenceValue(c.confidence)*.25),0)/cs.length));}
function actionFor(c){if(c.mastery<50)return 'Targeted Repair';if(c.mastery<=70)return 'Adaptive Practice';if(c.mastery<=85)return 'Challenge Application';return 'Continue to Next Concept';}
function calculateNextBestAction(){const cs=state.learnerIntelligence.concepts;let candidates=[];cs.forEach(c=>{if(c.mastery>=75&&c.confidence==='High')return;const prereqs=getPrerequisites(c.conceptId).map(getConcept).filter(Boolean);const weaker=prereqs.filter(p=>p.mastery<c.mastery||riskScore(p)>riskScore(c)).sort((a,b)=>priorityFor(b)-priorityFor(a))[0];if(weaker)candidates.push({concept:weaker,focus:c,score:priorityFor(weaker)+18,dependency:true});candidates.push({concept:c,focus:c,score:priorityFor(c),dependency:false});});candidates.sort((a,b)=>b.score-a.score);const pick=candidates[0]||{concept:cs[0],focus:cs[0],score:0};const c=pick.concept, type=actionFor(c);return {concept:c,focus:pick.focus,action:type,title:type==='Targeted Repair'?`Repair ${c.conceptName}`:type==='Adaptive Practice'?`Practice ${c.conceptName}`:type==='Challenge Application'?`Challenge ${c.conceptName}`:`Continue to ${c.conceptName}`,minutes:type==='Targeted Repair'?7:type==='Adaptive Practice'?10:12,why:pick.dependency?`${c.conceptName} is the highest-impact unstable prerequisite for ${pick.focus.conceptName}.`:`${c.conceptName} has the highest current learning priority based on evidence, confidence and dependency impact.`,outcome:pick.dependency?`Reduce risk before progressing with ${pick.focus.conceptName}.`:`Generate stronger ${c.conceptName} learning evidence.`,confidence:Math.min(92,Math.max(58,Math.round(55+c.evidenceCount*4+getDependents(c.conceptId).length*6)))};}
function checkDependencies(){const id=state.learnerIntelligence.selectedConceptId||calculateNextBestAction().concept.conceptId,c=getConcept(id),prereqs=getPrerequisites(id).map(getConcept).filter(Boolean),weak=[...prereqs].sort((a,b)=>riskScore(b)-riskScore(a))[0],root=$('#dependencyResult');if(!root||!c)return;root.innerHTML=`<div class="dependency-card"><span class="eyebrow">DYNAMIC DEPENDENCY ANALYSIS</span><h2>${c.conceptName} <small>${c.mastery}%</small></h2><div class="dependency-flow"><div>Current concept: <strong>${c.conceptName}</strong></div>${prereqs.map(p=>`<div>${p.conceptName} · ${p.mastery}% · risk ${riskScore(p)}</div>`).join('')||'<div>No mapped prerequisites</div>'}</div><strong>${weak?`Potential Root Gap: ${weak.conceptName}`:'Foundation stable'}</strong><p>${weak?`Current evidence suggests ${weak.conceptName} may be affecting ${c.conceptName}. This is an evidence-based hypothesis, not a certain diagnosis.`:`No weaker mapped prerequisite currently requires intervention.`}</p>${weak?`<button class="btn btn-primary" data-action="start-repair" data-concept="${weak.conceptId}">Repair ${weak.conceptName}</button>`:''}</div>`;}
function legacy_renderKnowledgeGraph_2(){const root=$('#knowledgeGraph');if(!root)return;const cs=state.learnerIntelligence.concepts,id=state.learnerIntelligence.selectedConceptId;const selected=[...getPrerequisites(id),...getDependents(id),id];root.innerHTML=`<svg class="graph-links" viewBox="0 0 1000 600" preserveAspectRatio="none">${Object.entries(state.learnerIntelligence.relationships).flatMap(([a,bs])=>bs.map(b=>`<path d="M 100 100 C 350 100,650 500,900 500" class="${selected.includes(a)&&selected.includes(b)?'active':''}"/>`)).join('')}</svg>`+cs.map((c,i)=>`<button class="graph-node ${getStatusClass(c.status)} ${id===c.conceptId?'selected':''} ${selected.includes(c.conceptId)?'connected':''}" style="--i:${i}" data-action="open-graph-node" data-concept="${c.conceptId}"><strong>${c.conceptName}</strong><span>${c.mastery}% · ${c.status}</span></button>`).join('');renderGraphDetails(id);}
function legacy_renderTwin_active_1(){const root=$('#twinSummary'),cs=state.learnerIntelligence.concepts;if(root){const avg=Math.round(cs.reduce((s,c)=>s+c.mastery,0)/cs.length),mastered=cs.filter(c=>c.mastery>=80).length,gaps=cs.filter(c=>riskScore(c)>=65).length;root.innerHTML=`<div class="metric-card"><span>Overall Learning State</span><strong>${avg}%</strong></div><div class="metric-card"><span>Learner Model Confidence</span><strong>${modelConfidence()}%</strong></div><div class="metric-card"><span>Concepts Mastered</span><strong>${mastered} / ${cs.length}</strong></div><div class="metric-card"><span>Knowledge Risks</span><strong>${gaps}</strong></div>`;}const list=$('#conceptList');if(list)list.innerHTML=cs.map(c=>`<article class="concept-row"><div><strong>${c.conceptName}</strong><small>${c.recentPerformance}</small></div><div class="mastery-mini"><strong>${c.mastery}%</strong><div><i style="width:${c.mastery}%"></i></div></div><span class="status-pill ${getStatusClass(c.status)}">${c.confidence} · Risk ${riskScore(c)}</span><span class="evidence-count">${c.evidenceCount} signals</span><button class="btn btn-secondary btn-small" data-action="open-concept" data-concept="${c.conceptId}">View Details</button></article>`).join('');}
function legacy_startRepair_2(id){const c=getConcept(id);if(!c)return;showModal(`Repair ${c.conceptName}`,`<div class="repair-flow"><span class="eyebrow">TARGETED FOUNDATION REPAIR</span><h2>${c.conceptName}</h2><p>Why you're here: evidence suggests this concept has meaningful learning risk or dependency impact.</p><p><strong>Estimated time: 7 minutes</strong></p><button class="btn btn-primary" data-action="begin-repair" data-concept="${id}">Begin Repair</button></div>`);state.repairConceptId=id;}
function legacy_showRepairQuestion_1(id){const c=getConcept(id);showModal(`${c.conceptName} · Concept Check`,`<div class="repair-flow"><span class="eyebrow">MICRO EXPLANATION</span><p>${c.conceptName==='variable-scope'?'A variable can only be accessed inside the part of the program where it exists.':'Use the concept rules to reason about the code before choosing.'}</p><pre>def greet():\n    message = "Hello"\n\nprint(message)</pre><h3>Why can this code cause an error?</h3><button class="option-btn" data-action="repair-answer" data-answer="A">A. Python cannot print strings</button><button class="option-btn" data-action="repair-answer" data-answer="B">B. message only exists inside greet()</button><button class="option-btn" data-action="repair-answer" data-answer="C">C. Functions cannot contain variables</button></div>`);}
function legacy_submitRepairAnswer_1(answer){if(answer!=='B'){showToast('Not quite — review where the variable is created and try again.','error');return;}const id=state.repairConceptId||'variable-scope',c=getConcept(id),before=c.mastery;c.mastery=Math.max(78,c.mastery+30);c.confidence='Medium';c.status='Developing';c.evidenceCount++;c.evidenceSources=[...new Set([...c.evidenceSources,'Concept Check'])];c.recentPerformance='Concept check passed; targeted evidence received';c.lastUpdated='Just now';state.learnerIntelligence.updates.unshift({when:'Just now',text:`${c.conceptName} updated`,change:`${before}% → ${c.mastery}%`,detail:'Concept check passed; dependency risk recalculated.'});saveState();closeModal();showToast('✓ New learning evidence received');setTimeout(()=>{renderAll();const a=calculateNextBestAction();showModal('Learner Intelligence Updated',`<div class="repair-result"><span class="eyebrow">WHAT CHANGED?</span><h2>${c.conceptName}</h2><p><strong>${before}% → ${c.mastery}%</strong></p><p>Dependency risk recalculated. New Next Best Action: <strong>${a.title}</strong></p></div>`);},350);}
function legacy_resetIntelligenceDemo(){state.learnerIntelligence=structuredClone(defaultState.learnerIntelligence);saveState();renderAll();showToast('Demo intelligence state reset');}
function legacy_openDecisionTrace_2(){const a=calculateNextBestAction(),c=a.concept,pre=getPrerequisites(a.focus.conceptId).map(getConcept).filter(Boolean);showModal('Why GYANIFY Recommended This',`<div class="decision-modal"><span class="eyebrow">EXPLAINABLE DECISION TRACE</span><div class="trace-step"><span>01</span><div><b>LEARNING EVIDENCE</b><p>${c.evidenceCount} signals · ${c.evidenceSources.join(', ')}</p></div></div><div class="trace-step"><span>02</span><div><b>CONCEPT PERFORMANCE</b><p>${c.conceptName}: ${c.mastery}% mastery · ${c.confidence} confidence.</p></div></div><div class="trace-step"><span>03</span><div><b>DEPENDENCY ANALYSIS</b><p>${pre.map(x=>`${x.conceptName} ${x.mastery}%`).join(' · ')||'No prerequisite dependency'}</p></div></div><div class="trace-step"><span>04</span><div><b>IMPACT & RISK</b><p>Risk ${riskScore(c)}/100 · ${getDependents(c.conceptId).length} dependent concepts.</p></div></div><div class="trace-step decision"><span>05</span><div><b>DECISION</b><p>${a.title}</p><small>Decision confidence ${a.confidence}% · ${a.why}</small></div></div><div class="modal-actions"><button class="btn btn-secondary" data-action="view-knowledge-map">View Knowledge Map</button><button class="btn btn-primary" data-action="start-repair" data-concept="${c.conceptId}">${a.action}</button></div></div>`);}



/* ================= FINAL SIH WINNING EXPERIENCE OVERRIDE ================= */
const REPAIR_TEMPLATES={
 'variables':{ex:'A variable stores a value that your program can reuse.',code:'score = 10\nprint(score)',q:'What does the variable score store?',opts:['A. A value','B. Only text','C. A function'],ans:'A'},
 'data-types':{ex:'Data types describe what kind of value Python is handling.',code:'age = 18\nname = "Alex"',q:'What is the data type of 18?',opts:['A. str','B. int','C. bool'],ans:'B'},
 'boolean-logic':{ex:'Boolean expressions evaluate to either True or False.',code:'age = 18\nprint(age >= 18)',q:'What will this expression produce?',opts:['A. True','B. False','C. A string'],ans:'A'},
 'conditional-statements':{ex:'Conditionals choose a path based on a condition.',code:'if score >= 50:\n    print("Pass")',q:'When does this code print Pass?',opts:['A. score is at least 50','B. score is text','C. Always'],ans:'A'},
 'variable-scope':{ex:'A variable is only available inside the scope where it was created.',code:'def greet():\n    message = "Hello"\n\nprint(message)',q:'Why can this code cause an error?',opts:['A. Python cannot print strings','B. message only exists inside greet()','C. Functions cannot contain variables'],ans:'B'},
 'parameters':{ex:'Parameters let functions receive information from outside.',code:'def greet(name):\n    print(name)',q:'What is name in greet(name)?',opts:['A. A parameter','B. A loop','C. A data type'],ans:'A'},
 'functions':{ex:'Functions package reusable logic into named blocks.',code:'def add(a, b):\n    return a + b',q:'Why use a function here?',opts:['A. To reuse logic','B. To remove variables','C. To avoid return values'],ans:'A'},
 'loops':{ex:'Loops repeat a block while iterating over a sequence or condition.',code:'for i in range(3):\n    print(i)',q:'How many values are printed?',opts:['A. 2','B. 3','C. 4'],ans:'B'}
};
const GRAPH_POS={'variables':[110,120],'data-types':[330,80],'boolean-logic':[300,250],'conditional-statements':[540,250],'variable-scope':[180,430],'parameters':[480,430],'functions':[700,390],'loops':[880,220]};
function graphPoint(id){const p=GRAPH_POS[id]||[500,300];return {x:p[0],y:p[1]};}
function riskLabel(r){return r>=70?'High impact':r>=50?'Moderate':'Low';}
function evidenceStrength(c){let s=c.evidenceCount>=5?'Strong':c.evidenceCount>=3?'Moderate':'Emerging';if((c.evidenceSources||[]).some(x=>/coding|application/i.test(x)))s='Strong';return s;}
function renderKnowledgeGraph(){
 const root=$('#knowledgeGraph');if(!root)return;
 const cs=state.learnerIntelligence.concepts,id=state.learnerIntelligence.selectedConceptId||cs[0].conceptId;
 const connected=new Set([id,...getPrerequisites(id),...getDependents(id)]);
 const links=Object.entries(state.learnerIntelligence.relationships).flatMap(([a,bs])=>(bs||[]).map(b=>{
   const A=graphPoint(a),B=graphPoint(b),active=connected.has(a)&&connected.has(b);
   return `<path d="M ${A.x} ${A.y} L ${B.x} ${B.y}" class="graph-path ${active?'active':''}" marker-end="url(#arrow)"/>`;
 })).join('');
 root.innerHTML=`<svg class="graph-links real" viewBox="0 0 1000 600"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z"/></marker></defs>${links}</svg>`+
 cs.map(c=>{const [x,y]=GRAPH_POS[c.conceptId]||[500,300];return `<button class="graph-node spatial ${id===c.conceptId?'selected':''} ${connected.has(c.conceptId)?'connected':'dimmed'}" style="left:${x/10}%;top:${y/6}%" data-action="open-graph-node" data-concept="${c.conceptId}"><strong>${c.conceptName}</strong><span>${c.mastery}% · ${riskLabel(riskScore(c))}</span></button>`}).join('');
 renderGraphDetails(id);
}
function renderRiskRadar(){
 const host=document.getElementById('riskRadar');if(!host)return;
 const risks=[...state.learnerIntelligence.concepts].map(c=>({c,r:riskScore(c)})).sort((a,b)=>b.r-a.r).slice(0,4);
 host.innerHTML=risks.map(({c,r})=>`<div class="risk-item ${riskLabel(r).toLowerCase().replace(' ','-')}"><div><strong>${c.conceptName}</strong><span>${riskLabel(r)} · affects ${getDependents(c.conceptId).length} concepts</span></div><b>${r}</b></div>`).join('');
}
function ensureWinningPanels(){
 const dash=document.querySelector('#view-dashboard .page-heading');if(dash&&!document.getElementById('winningIntelligence')){
   const panel=document.createElement('section');panel.id='winningIntelligence';panel.className='winning-intelligence';
   panel.innerHTML=`<div class="intelligence-hero"><span class="eyebrow">GYANIFY INTELLIGENCE · LIVE LEARNER MODEL</span><h2 id="heroActionTitle">Finding your next best action…</h2><p id="heroActionWhy"></p><div class="hero-actions"><button class="btn btn-primary" data-action="start-hero-repair">Start recommended action</button><button class="btn btn-secondary" data-action="view-reasoning">See why GYANIFY chose this</button></div></div><div class="risk-radar"><span class="eyebrow">CURRENT LEARNING RISKS</span><div id="riskRadar"></div></div>`;
   dash.parentNode.insertBefore(panel,dash.nextSibling);
 }
 const twin=document.querySelector('#view-twin');if(twin&&!document.getElementById('twinSnapshot')){
   const x=document.createElement('section');x.id='twinSnapshot';x.className='twin-snapshot';twin.prepend(x);
 }
 const knowledge=document.querySelector('#view-knowledge');if(knowledge&&!document.getElementById('graphLegend')){
   const x=document.createElement('div');x.id='graphLegend';x.className='graph-legend';x.textContent='Select any concept to inspect prerequisites, dependents, evidence and impact.';
   knowledge.prepend(x);
 }
}
function renderWinningPanels(){
 ensureWinningPanels();const a=calculateNextBestAction(),c=a.concept;
 const title=$('#heroActionTitle'),why=$('#heroActionWhy');if(title)title.textContent=a.title;if(why)why.textContent=`${a.why} · ${a.minutes} min · decision confidence ${a.confidence}%`;
 renderRiskRadar();
 const twin=$('#twinSnapshot');if(twin){const cs=state.learnerIntelligence.concepts,avg=Math.round(cs.reduce((s,c)=>s+c.mastery,0)/cs.length),block=[...cs].sort((a,b)=>riskScore(b)-riskScore(a))[0];twin.innerHTML=`<span class="eyebrow">LEARNER DIGITAL TWIN · CURRENT SNAPSHOT</span><div class="snapshot-grid"><div><span>Learning state</span><b>${avg}%</b></div><div><span>Current blocker</span><b>${block.conceptName}</b></div><div><span>Knowledge stability</span><b>${100-riskScore(block)}%</b></div><div><span>Model confidence</span><b>${modelConfidence()}%</b></div></div><p><strong>Learning pattern:</strong> Foundation-aware learner · <strong>Evidence strength:</strong> ${evidenceStrength(block)} · <strong>Application readiness:</strong> ${Math.max(0,avg-8)}%</p>`;}
}
function startRepair(id){const c=getConcept(id);if(!c)return;state.repairConceptId=id;const t=REPAIR_TEMPLATES[id]||REPAIR_TEMPLATES['variable-scope'];showModal(`Repair ${c.conceptName}`,`<div class="repair-flow"><span class="eyebrow">ADAPTIVE TARGETED REPAIR</span><h2>${c.conceptName}</h2><p>${t.ex}</p><pre>${escapeHtml(t.code)}</pre><p><strong>Why now:</strong> Risk ${riskScore(c)}/100 · ${evidenceStrength(c)} evidence · ${getDependents(id).length} downstream concepts.</p><button class="btn btn-primary" data-action="begin-repair" data-concept="${id}">Take concept check</button></div>`);}
function showRepairQuestion(id){const c=getConcept(id),t=REPAIR_TEMPLATES[id]||REPAIR_TEMPLATES['variable-scope'];state.repairConceptId=id;showModal(`${c.conceptName} · Concept Check`,`<div class="repair-flow"><span class="eyebrow">MICRO EXPLANATION</span><p>${t.ex}</p><pre>${escapeHtml(t.code)}</pre><h3>${t.q}</h3>${t.opts.map((o,i)=>`<button class="option-btn" data-action="repair-answer" data-answer="${String.fromCharCode(65+i)}">${o}</button>`).join('')}</div>`);}
function legacy_submitRepairAnswer_active_1(answer){const id=state.repairConceptId||'variable-scope',c=getConcept(id),t=REPAIR_TEMPLATES[id]||REPAIR_TEMPLATES['variable-scope'];if(answer!==t.ans){c.recentPerformance='Concept check retry required; evidence remains inconclusive';saveState();showToast('Not quite — GYANIFY keeps the learner model unchanged until stronger evidence is generated.','error');return;}const before=c.mastery;c.mastery=Math.min(92,Math.max(before+18,72));c.confidence=c.mastery>=80?'High':'Medium';c.status=c.mastery>=80?'Stable':'Developing';c.evidenceCount++;c.evidenceSources=[...new Set([...(c.evidenceSources||[]),'Concept-specific concept check'])];c.recentPerformance='Targeted concept check passed; stronger learning evidence received';c.lastUpdated='Just now';state.learnerIntelligence.updates.unshift({when:'Just now',text:`${c.conceptName} evidence strengthened`,change:`${before}% → ${c.mastery}%`,detail:`${evidenceStrength(c)} evidence; dependency risk recalculated.`});saveState();closeModal();renderAll();const a=calculateNextBestAction();showModal('Learner Intelligence Updated',`<div class="repair-result"><span class="eyebrow">THE ADAPTIVE LOOP</span><h2>New learning evidence received</h2><p><strong>${c.conceptName}: ${before}% → ${c.mastery}%</strong></p><p>Digital Twin updated → Knowledge risk recalculated → Next Best Action changed.</p><div class="new-action"><span>NEW NEXT BEST ACTION</span><b>${a.title}</b></div></div>`);}
function openDecisionTrace(){const a=calculateNextBestAction(),c=a.concept;const parts=[['Evidence coverage',Math.min(100,c.evidenceCount*18)],['Signal consistency',Math.max(35,100-riskScore(c))],['Dependency strength',Math.min(100,45+getDependents(c.conceptId).length*15)],['Performance recency',/passed|successful/i.test(c.recentPerformance)?85:62]];showModal('Why GYANIFY Recommended This',`<div class="decision-modal"><span class="eyebrow">EXPLAINABLE DECISION TRACE</span><div class="trace-step"><span>01</span><div><b>LEARNING EVIDENCE</b><p>${c.evidenceCount} signals · ${evidenceStrength(c)} strength</p></div></div><div class="trace-step"><span>02</span><div><b>KNOWLEDGE RELATIONSHIPS</b><p>Prerequisites: ${getPrerequisites(c.conceptId).map(x=>getConcept(x)?.conceptName).filter(Boolean).join(' · ')||'None'} · Downstream: ${getDependents(c.conceptId).length}</p></div></div><div class="trace-step"><span>03</span><div><b>RISK & IMPACT</b><p>Risk ${riskScore(c)}/100 · ${a.why}</p></div></div><div class="confidence-breakdown">${parts.map(([n,v])=>`<div><span>${n}</span><i><b style="width:${v}%"></b></i><strong>${v}%</strong></div>`).join('')}</div><div class="trace-step decision"><span>04</span><div><b>DECISION</b><p>${a.title}</p><small>Overall decision confidence ${a.confidence}% — derived from current evidence quality, signal consistency, dependency impact and recency.</small></div></div></div>`);}
const _baseGenerateTutorResponse=generateSocraticFallback;
function generateTutorResponse(message){
 const q=(message||'').toLowerCase(),a=calculateNextBestAction(),c=a.concept;
 if(/why.*next|why.*action/.test(q))return `GYANIFY chose ${a.title} because ${a.why} Current evidence: ${c.evidenceCount} signals, ${c.mastery}% mastery, risk ${riskScore(c)}/100.`;
 if(/block|risk/.test(q))return `Your highest current learning risk is ${c.conceptName}. It has ${c.mastery}% mastery, ${evidenceStrength(c)} evidence, and can influence ${getDependents(c.conceptId).length} connected concepts.`;
 if(/changed|today/.test(q))return state.learnerIntelligence.updates.slice(0,2).map(x=>`${x.text}: ${x.change}`).join(' · ')||'No new learner-model changes yet.';
 if(/ready.*project/.test(q))return `Your current application readiness is approximately ${Math.max(0,Math.round(state.learnerIntelligence.concepts.reduce((s,x)=>s+x.mastery,0)/state.learnerIntelligence.concepts.length)-8)}%. Strengthen ${c.conceptName} before adding more complex project logic.`;
 return _baseGenerateTutorResponse(message);
}
function renderImpactAndDemo(){
 const ai=document.querySelector('#view-ai');if(ai&&!document.getElementById('sihImpactLayer')){const s=document.createElement('section');s.id='sihImpactLayer';s.className='impact-layer';s.innerHTML=`<span class="eyebrow">WHY GYANIFY IS DIFFERENT</span><h2>From completion tracking to learning intelligence</h2><div class="impact-grid"><div><b>Traditional</b><p>Watch → Complete → Progress %</p></div><div><b>GYANIFY</b><p>Evidence → Digital Twin → Knowledge Graph → Risk → Next Best Action → Explain Why</p></div><div><b>Impact</b><p>Students: personalized recovery · Teachers: early risk visibility · Institutions: learning intelligence at scale</p></div></div><div class="architecture-flow">Activities → Evidence Engine → Learner Digital Twin → Knowledge Graph → Risk Engine → Next Best Action → Explainable Decision</div><div class="demo-story"><b>SIH Intelligence Story</b><p>Struggle → investigate evidence → detect connected foundation → prioritize risk → repair → new evidence → learner model updates → recommendation adapts.</p></div></section>`;ai.prepend(s);}
}


function enhanceProjectReadiness(){
 const host=document.querySelector('#view-projects');if(!host||document.getElementById('projectIntelligence'))return;
 const cs=state.learnerIntelligence.concepts;const weak=[...cs].sort((a,b)=>riskScore(b)-riskScore(a))[0];
 const box=document.createElement('section');box.id='projectIntelligence';box.className='impact-layer project-intelligence';
 box.innerHTML=`<span class="eyebrow">PROJECT READINESS INTELLIGENCE</span><h2>Why you're ready — and what unlocks next</h2><div class="impact-grid"><div><b>Ready</b><p>${cs.filter(c=>c.mastery>=70).map(c=>c.conceptName).slice(0,3).join(' · ')||'Foundation in progress'}</p></div><div><b>Foundation risk</b><p>${weak.conceptName} · ${weak.mastery}% · Risk ${riskScore(weak)}</p></div><div><b>What unlocks next</b><p>Stronger reusable logic, application evidence and project architecture.</p></div></div><p>GYANIFY recommends strengthening <strong>${weak.conceptName}</strong> before increasing project complexity.</p></section>`;
 host.prepend(box);
}


/* ==============================================================
   FINAL SIH TECHNICAL CONSOLIDATION — SINGLE ACTIVE INTELLIGENCE LAYER
   Mastery, Evidence Strength and Knowledge Stability are intentionally separate.
================================================================ */
const EVIDENCE_WEIGHTS = Object.freeze({
  diagnostic: 1,
  conceptCheck: 2,
  adaptivePractice: 3,
  codingApplication: 4,
  repeatedSuccess: 5
});

function inferEvidenceType(source) {
  const value = String(source || '').toLowerCase();
  if (/coding|application/.test(value)) return 'codingApplication';
  if (/adaptive/.test(value)) return 'adaptivePractice';
  if (/practice/.test(value)) return 'adaptivePractice';
  if (/lesson|check|assessment/.test(value)) return 'conceptCheck';
  return 'diagnostic';
}

/* Migrate legacy evidenceCount/evidenceSources once into the ledger so the ledger
   becomes the single source of truth without losing baseline evidence. */
function migrateLegacyEvidenceLedger(c) {
  if (!c) return;
  const legacyCount = Number.isFinite(Number(c.evidenceCount)) ? Math.max(0, Number(c.evidenceCount)) : 0;
  if (!Array.isArray(c.evidenceLedger)) c.evidenceLedger = [];
  if (c.evidenceLedger.length === 0 && legacyCount > 0) {
    const sources = Array.isArray(c.evidenceSources) && c.evidenceSources.length ? c.evidenceSources : ['Baseline assessment'];
    for (let i = 0; i < legacyCount; i++) {
      const source = sources[i % sources.length];
      const type = inferEvidenceType(source);
      c.evidenceLedger.push({
        id: `baseline:${c.conceptId}:${i + 1}`,
        type,
        weight: EVIDENCE_WEIGHTS[type] || 1,
        detail: `Baseline evidence · ${source} · #${i + 1}`,
        when: 'Baseline'
      });
    }
  }
}

function normalizeConceptIntelligence(c) {
  if (!c) return c;
  migrateLegacyEvidenceLedger(c);
  c.evidenceCount = c.evidenceLedger.length;
  const weighted = c.evidenceLedger.reduce((sum,e)=>sum + (e.weight || EVIDENCE_WEIGHTS[e.type] || 1),0);
  const weightedScore = Math.min(100, Math.round((weighted / 15) * 100));
  c.evidenceStrengthLevel = weightedScore>=75?'Very Strong':weightedScore>=50?'Strong':weightedScore>=25?'Moderate':'Weak';
  c.knowledgeStability = c.evidenceCount>=5 && c.evidenceStrengthLevel==='Very Strong'?'High':
                         c.evidenceCount>=3?'Moderate':'Low';
  return c;
}

function weightedEvidenceScore(c) {
  normalizeConceptIntelligence(c);
  const total = c.evidenceLedger.reduce((sum,e)=>sum + (e.weight || EVIDENCE_WEIGHTS[e.type] || 1),0);
  return Math.min(100, Math.round((total / 15) * 100));
}

function recordEvidence(conceptId, type, detail) {
  const c=getConcept(conceptId); if(!c) return null;
  normalizeConceptIntelligence(c);
  const weight=EVIDENCE_WEIGHTS[type] || 1;
  c.evidenceLedger.push({
    id: `${type}:${detail||type}:${Date.now()}`,
    type, weight, detail:detail||type, when:'Just now'
  });
  normalizeConceptIntelligence(c);
  c.lastUpdated='Just now';
  return c;
}

function getEvidenceSummary(c) {
  normalizeConceptIntelligence(c);
  return {
    strength:c.evidenceStrengthLevel,
    stability:c.knowledgeStability,
    weightedScore:weightedEvidenceScore(c),
    count:c.evidenceCount
  };
}

/* Single active repair submission: one correct answer strengthens evidence,
   it does not claim complete mastery. */
function submitRepairAnswer(answer){
  const id=state.repairConceptId||'variable-scope';
  const c=getConcept(id), t=REPAIR_TEMPLATES[id]||REPAIR_TEMPLATES['variable-scope'];
  if(!c) return;
  normalizeConceptIntelligence(c);

  if(answer!==t.ans){
    c.recentPerformance='Concept check retry required; evidence remains inconclusive';
    saveState();
    showToast('Not quite — mastery is unchanged. GYANIFY needs stronger evidence before updating the learner model.','error');
    return;
  }

  const before=c.mastery;
  const previousCount=c.evidenceCount;
  const evidenceDetail=`repair:${id}:concept-check-v1`;
  const result=addUniqueEvidence(id,'conceptCheck',evidenceDetail);

  // Evidence integrity: the same successful repair can only update the learner model once.
  if(!result.added){
    c.recentPerformance='Concept check already recorded; no duplicate evidence or mastery increase applied';
    c.lastUpdated='Just now';
    saveState(); closeModal(); renderAll();
    const a=calculateNextBestAction();
    showModal('Evidence Already Recorded',`<div class="repair-result">
      <span class="eyebrow">EVIDENCE INTEGRITY PROTECTED</span>
      <h2>No duplicate mastery increase</h2>
      <p><strong>${c.conceptName} remains at ${before}% mastery.</strong></p>
      <p>This concept check was already recorded as evidence. GYANIFY keeps the learner model unchanged until the learner generates a new, distinct evidence signal.</p>
      <div class="impact-grid">
        <div><b>Evidence</b><p>${c.evidenceStrengthLevel}</p></div>
        <div><b>Stability</b><p>${c.knowledgeStability}</p></div>
        <div><b>Next proof</b><p>Application practice</p></div>
      </div>
      <div class="new-action"><span>NEXT BEST ACTION</span><b>${a.title}</b></div>
    </div>`);
    showToast('Evidence already recorded — mastery was not increased.','info');
    return;
  }

  // Conservative evidence-driven progression: only genuinely new evidence strengthens the estimate.
  const gain = previousCount < 2 ? 10 : previousCount < 4 ? 7 : 4;
  c.mastery=Math.min(88,before+gain);
  c.confidence=c.mastery>=75 && c.knowledgeStability!=='Low'?'High':'Medium';
  c.status=c.mastery>=80 && c.knowledgeStability==='High'?'Stable':'Developing';
  c.evidenceSources=[...new Set([...(c.evidenceSources||[]),'Concept-specific concept check'])];
  c.recentPerformance='Targeted concept check passed; new evidence strengthened, application evidence still recommended';

  state.learnerIntelligence.updates.unshift({
    when:'Just now',
    text:`${c.conceptName} evidence strengthened`,
    change:`${before}% → ${c.mastery}%`,
    detail:`${c.evidenceStrengthLevel} evidence · ${c.knowledgeStability} stability · application evidence pending.`
  });

  saveState(); closeModal(); renderAll();
  const a=calculateNextBestAction();
  showModal('Learner Intelligence Updated',`<div class="repair-result">
    <span class="eyebrow">EVIDENCE-DRIVEN ADAPTATION</span>
    <h2>New evidence strengthened — mastery is still being validated</h2>
    <p><strong>${c.conceptName}: ${before}% → ${c.mastery}%</strong></p>
    <div class="impact-grid">
      <div><b>Evidence</b><p>${c.evidenceStrengthLevel}</p></div>
      <div><b>Stability</b><p>${c.knowledgeStability}</p></div>
      <div><b>Next proof</b><p>Application practice</p></div>
    </div>
    <p>Digital Twin updated → Risk recalculated → Recommendation adapted.</p>
    <div class="new-action"><span>NEXT BEST ACTION</span><b>${a.title}</b></div>
  </div>`);
}

/* Consolidated Twin renderer with explicit uncertainty dimensions. */
function renderTwin(){
  const cs=state.learnerIntelligence.concepts;
  cs.forEach(normalizeConceptIntelligence);
  const root=$('#twinSummary');
  if(root){
    const avg=Math.round(cs.reduce((s,c)=>s+c.mastery,0)/cs.length);
    const mastered=cs.filter(c=>c.mastery>=80 && c.knowledgeStability==='High').length;
    const gaps=cs.filter(c=>riskScore(c)>=65).length;
    root.innerHTML=`<div class="metric-card"><span>Overall Learning State</span><strong>${avg}%</strong></div>
      <div class="metric-card"><span>Learner Model Confidence</span><strong>${modelConfidence()}%</strong></div>
      <div class="metric-card"><span>Stable Mastery</span><strong>${mastered} / ${cs.length}</strong></div>
      <div class="metric-card"><span>Knowledge Risks</span><strong>${gaps}</strong></div>`;
  }
  const list=$('#conceptList');
  if(list) list.innerHTML=cs.map(c=>{
    const ev=getEvidenceSummary(c);
    return `<article class="concept-row">
      <div><strong>${c.conceptName}</strong><small>${c.recentPerformance}</small>
      <small class="intel-dimensions">Mastery ${c.mastery}% · Evidence ${ev.strength} · Stability ${ev.stability}</small></div>
      <div class="mastery-mini"><strong>${c.mastery}%</strong><div><i style="width:${c.mastery}%"></i></div></div>
      <span class="status-pill ${getStatusClass(c.status)}">${c.confidence} · Risk ${riskScore(c)}</span>
      <span class="evidence-count">${ev.count} signals · ${ev.weightedScore}% weighted</span>
      <button class="btn btn-secondary btn-small" data-action="open-concept" data-concept="${c.conceptId}">View Details</button>
    </article>`;
  }).join('');
}

/* One consolidated application-level render pipeline. */
function legacy_renderAll_2() {
  updateUserIdentity();
  updateStats();
  restoreCodingState();
  restoreProjectState();
  restoreChatState();
  renderLearnerIntelligence();
  renderTwin();
  renderKnowledgeGraph();
  renderWinningPanels();
  renderImpactAndDemo();
  enhanceProjectReadiness();
}

/* Final state normalization before rendering and persistence. */
state.learnerIntelligence.concepts.forEach(normalizeConceptIntelligence);


/* ==============================================================
   FINAL WINNING POLISH BATCH — 10 PRIORITY UPDATES
   1 Coding application evidence
   2 Reliable full demo reset
   3 Evidence journey
   4 Guided intelligence flow
   5 Consolidated active logic
   6 Runtime protection
   7 Event listener audit
   8 CSS/design consistency support
   9 Responsive-safe rendering
   10 Performance cleanup
================================================================ */

/* ---------- 7. Event listener audit: bind exactly once ---------- */
let gyanifyEventsBound = false;
function bindGlobalEvents() {
  if (gyanifyEventsBound) return;
  gyanifyEventsBound = true;
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("change", handleDocumentChange);
  document.addEventListener("input", event => {
    if (event.target && event.target.id === "codeEditor") {
      state.coding.code = event.target.value;
      saveState();
    }
  });
}

/* ---------- 6. Runtime protection ---------- */
const GYANIFY_RUNTIME = { errors: [], lastSafeRender: 0 };
window.addEventListener("error", event => {
  GYANIFY_RUNTIME.errors.push({ message: event.message || "Unknown runtime error", when: Date.now() });
  if (GYANIFY_RUNTIME.errors.length > 10) GYANIFY_RUNTIME.errors.shift();
  console.error("GYANIFY recovered a runtime error:", event.error || event.message);
});
window.addEventListener("unhandledrejection", event => {
  GYANIFY_RUNTIME.errors.push({ message: "Unhandled async error", when: Date.now() });
  console.error("GYANIFY recovered an async error:", event.reason);
});
function safeRender(name, fn) {
  try { return fn(); }
  catch (error) {
    console.error(`GYANIFY safe render failed: ${name}`, error);
    GYANIFY_RUNTIME.errors.push({ message: `${name} failed`, when: Date.now() });
    return null;
  }
}

/* ---------- Evidence model helpers ---------- */
function evidenceStage(c) {
  const e = getEvidenceSummary(c);
  if (c.knowledgeStability === "High" && e.strength === "Very Strong") return "Stable Mastery";
  if ((c.evidenceLedger || []).some(x => x.type === "codingApplication")) return "Coding Application";
  if ((c.evidenceLedger || []).some(x => x.type === "adaptivePractice")) return "Adaptive Practice";
  if ((c.evidenceLedger || []).some(x => x.type === "conceptCheck")) return "Concept Repair";
  return "Diagnostic";
}
function addUniqueEvidence(conceptId, type, detail) {
  const c = getConcept(conceptId);
  if (!c) return { concept: null, added: false };
  normalizeConceptIntelligence(c);
  const exists = c.evidenceLedger.some(e => e.type === type && e.detail === detail);
  if (exists) return { concept: c, added: false };
  recordEvidence(conceptId, type, detail);
  return { concept: c, added: true };
}
function updateConceptFromApplication(conceptId, detail) {
  const c = getConcept(conceptId);
  if (!c) return { concept: null, added: false, before: null, after: null };
  normalizeConceptIntelligence(c);
  const before = c.mastery;
  const previousCount = c.evidenceCount;
  const result = addUniqueEvidence(conceptId, "codingApplication", detail);
  if (!result.added) return { concept: c, added: false, before, after: before };

  const gain = previousCount < 5 ? 8 : 5;
  c.mastery = Math.min(92, before + gain);
  c.confidence = c.mastery >= 78 && c.knowledgeStability !== "Low" ? "High" : "Medium";
  c.status = c.mastery >= 82 && c.knowledgeStability === "High" ? "Stable" : "Developing";
  c.recentPerformance = "Coding application completed; high-value application evidence received";
  c.evidenceSources = [...new Set([...(c.evidenceSources || []), "Coding Application"])];
  state.learnerIntelligence.updates.unshift({
    when: "Just now",
    text: `${c.conceptName} application evidence added`,
    change: `${before}% → ${c.mastery}%`,
    detail: `${c.evidenceStrengthLevel} evidence · ${c.knowledgeStability} stability · high-value coding signal.`
  });
  return { concept: c, added: true, before, after: c.mastery };
}

/* ---------- 1. Coding Lab → Application Evidence ---------- */
function runCodingTests() {
  const editor = $("#codeEditor"), output = $("#codeOutput");
  if (!editor || !output) return;
  const code = editor.value || "";

  // Browser-only prototype: this is intentionally a guided structural validation,
  // not a Python execution sandbox. Do not claim code execution to the user.
  const hasFunction = /def\s+is_even\s*\(\s*number\s*\)\s*:/.test(code);
  const hasModulo = /number\s*%\s*2/.test(code);
  const hasBooleanReturn = /return\s+(?:number\s*%\s*2\s*==\s*0|not\s+number\s*%\s*2)/.test(code);
  const passed = hasFunction && hasModulo && hasBooleanReturn;

  if (!passed) {
    output.innerHTML = `<div class="test-result fail">✕ Guided validation needs a clearer solution.</div>
      <div class="test-result">→ Define <code>is_even(number)</code>.</div>
      <div class="test-result">→ Use <code>number % 2</code> and return a boolean result.</div>
      <div class="test-result">→ No mastery changes until new application evidence is validated.</div>`;
    return;
  }

  const firstCompletion = !state.coding.completed;
  const fnResult = updateConceptFromApplication("functions", "is_even coding challenge passed");
  const logicResult = updateConceptFromApplication("boolean-logic", "Modulo condition applied successfully");
  const newEvidenceAdded = fnResult.added || logicResult.added;

  state.coding.completed = true;
  if (firstCompletion) {
    state.progress.xp += 50;
    state.progress.overall = Math.min(100, state.progress.overall + 2);
  }
  saveState();
  renderAll();

  const fn = fnResult.concept, logic = logicResult.concept;
  const evidenceMessage = newEvidenceAdded
    ? 'New application evidence added → Digital Twin updated → Risk recalculated → Next Best Action refreshed.'
    : 'This exact application evidence was already recorded, so mastery and evidence were intentionally left unchanged.';

  output.innerHTML = `<div class="test-result pass">✓ Guided validation passed.</div>
    <div class="test-result">✓ Function structure detected</div>
    <div class="test-result">✓ Modulo logic detected</div>
    <div class="test-result">✓ Boolean return pattern detected</div>
    <section class="application-evidence-card">
      <span class="eyebrow">${newEvidenceAdded ? 'APPLICATION EVIDENCE DETECTED' : 'EVIDENCE ALREADY RECORDED'}</span>
      <h3>${newEvidenceAdded ? 'High-value proof added to your learner model' : 'No duplicate mastery inflation'}</h3>
      <div class="evidence-update-grid">
        <div><span>Functions</span><b>${fn ? fn.evidenceStrengthLevel : 'Updated'}</b></div>
        <div><span>Boolean Logic</span><b>${logic ? logic.evidenceStrengthLevel : 'Updated'}</b></div>
        <div><span>Validation</span><b>Guided · Structural</b></div>
      </div>
      <p>${evidenceMessage}</p>
      <small>GYANIFY's browser prototype validates solution structure; secure runtime execution is not claimed in this demo.</small>
      <button class="btn btn-secondary btn-small" data-view="twin">View Learner Update</button>
    </section>`;

  showToast(newEvidenceAdded
    ? 'Guided validation passed — new application evidence added to your Digital Twin.'
    : 'Guided validation passed — evidence already exists, so mastery remains unchanged.', 'success');
}

/* ---------- 2. SIH judge-ready demo reset ---------- */
function restartDemo() {
  const confirmed = window.confirm("Reset the GYANIFY SIH demo to its baseline dashboard state?");
  if (!confirmed) return;
  state = structuredClone(defaultState);
  state.onboardingComplete = true;
  state.currentView = "dashboard";
  onboardingStep = 1;
  onboardingData.subject = state.user.subject;
  onboardingData.time = String(state.user.dailyMinutes);
  GYANIFY_RUNTIME.errors = [];
  localStorage.removeItem(STORAGE_KEY);
  saveState();
  document.querySelectorAll(".modal-overlay.active").forEach(el => el.classList.remove("active"));
  const output = $("#codeOutput");
  if (output) output.innerHTML = `<div class="output-placeholder">Validate your solution to generate new application evidence.</div>`;
  const editor = $("#codeEditor");
  if (editor) editor.value = state.coding.code;
  showMainApplication();
  navigateTo("dashboard");
  renderAll();
  showToast("✓ Demo reset successfully — baseline dashboard is ready for the next judge.", "success");
}

function resetIntelligenceDemo() {
  const baseline = structuredClone(defaultState);
  state.learnerIntelligence = baseline.learnerIntelligence;
  state.coding = baseline.coding;
  state.projects = baseline.projects;
  state.progress = baseline.progress;
  state.chat = baseline.chat;
  saveState();
  renderAll();
  showToast("✓ Intelligence state reset to baseline.", "success");
}

/* ---------- 3. Evidence Journey ---------- */
function renderEvidenceJourney() {
  const host = document.getElementById("evidenceJourney");
  if (!host) return;
  const c = calculateNextBestAction().concept;
  const ledger = (c.evidenceLedger || []).map(e => e.type);
  const stages = [
    ["Diagnostic", "Initial signal", "diagnostic", 1],
    ["Concept Repair", "Targeted concept check", "conceptCheck", 2],
    ["Adaptive Practice", "Repeated adaptive proof", "adaptivePractice", 3],
    ["Coding Application", "High-value application proof", "codingApplication", 4],
    ["Stable Mastery", "Repeated success + strong stability", "repeatedSuccess", 5]
  ];
  host.innerHTML = `<section class="evidence-journey-card">
    <div class="journey-heading"><div><span class="eyebrow">EVIDENCE JOURNEY</span><h2>${c.conceptName}: how GYANIFY builds mastery</h2></div>
    <span class="journey-current">Current stage · ${evidenceStage(c)}</span></div>
    <div class="evidence-timeline">${stages.map(([name,desc,type,weight],i) => {
      const complete = type === "diagnostic" || ledger.includes(type) || (type === "repeatedSuccess" && c.knowledgeStability === "High");
      const active = evidenceStage(c) === name;
      return `<article class="journey-step ${complete ? "complete" : ""} ${active ? "active" : ""}">
        <span class="journey-index">${i + 1}</span><div><b>${name}</b><small>${desc}</small><em>Evidence weight ${weight}</em></div>
      </article>`;
    }).join("")}</div>
    <div class="journey-metrics"><div><span>Mastery</span><b>${c.mastery}%</b></div><div><span>Evidence</span><b>${getEvidenceSummary(c).strength}</b></div><div><span>Stability</span><b>${c.knowledgeStability}</b></div><div><span>Next proof</span><b>${c.knowledgeStability === "High" ? "Maintain" : "Application"}</b></div></div>
  </section>`;
}

/* ---------- 4. Guided Animated Intelligence Flow ---------- */
let intelligenceFlowTimer = null;
function renderIntelligenceFlow(activeIndex = -1) {
  const host = document.getElementById("intelligenceFlow");
  if (!host) return;
  const steps = ["Learner Activity","Evidence Engine","Digital Twin","Knowledge Graph","Risk Engine","Next Best Action","Explainable Decision"];
  host.innerHTML = `<section class="intelligence-flow-card">
    <div class="flow-heading"><div><span class="eyebrow">HOW GYANIFY THINKS</span><h2>From learner activity to an explainable decision</h2></div>
    <button class="btn btn-primary btn-small" data-action="guided-intelligence-demo">▶ Run guided demo</button></div>
    <div class="intelligence-flow-track">${steps.map((step,i) => `<div class="flow-stage ${i === activeIndex ? "active" : ""} ${i < activeIndex ? "complete" : ""}"><span>${i+1}</span><b>${step}</b></div>`).join("")}</div>
    <p id="intelligenceFlowCaption">GYANIFY connects evidence, learner state, knowledge relationships and risk before recommending the next action.</p>
  </section>`;
}
function runGuidedIntelligenceDemo() {
  if (intelligenceFlowTimer) clearInterval(intelligenceFlowTimer);
  let index = 0;
  const captions = [
    "A learner action generates a new signal.",
    "The Evidence Engine records the strength and type of proof.",
    "The Learner Digital Twin updates its evolving model.",
    "The Knowledge Graph checks connected concepts and dependencies.",
    "The Risk Engine recalculates learning impact.",
    "GYANIFY selects the highest-value next action.",
    "The decision is exposed so the learner can understand why."
  ];
  renderIntelligenceFlow(index);
  const caption = () => { const el = document.getElementById("intelligenceFlowCaption"); if (el) el.textContent = captions[Math.min(index, captions.length - 1)]; };
  caption();
  intelligenceFlowTimer = setInterval(() => {
    index += 1;
    if (index >= captions.length) {
      clearInterval(intelligenceFlowTimer);
      intelligenceFlowTimer = null;
      return;
    }
    renderIntelligenceFlow(index);
    caption();
  }, 900);
}

/* ---------- Product panels are created once and rendered safely ---------- */
function ensureFinalWinningPanels() {
  const twin = document.getElementById("view-twin");
  if (twin && !document.getElementById("evidenceJourney")) {
    const host = document.createElement("div");
    host.id = "evidenceJourney";
    twin.insertBefore(host, twin.querySelector(".intelligence-section") || null);
  }
  const dash = document.getElementById("view-dashboard");
  if (dash && !document.getElementById("intelligenceFlow")) {
    const host = document.createElement("div");
    host.id = "intelligenceFlow";
    const intelligence = document.getElementById("winningIntelligence");
    if (intelligence && intelligence.parentNode) intelligence.parentNode.insertBefore(host, intelligence.nextSibling);
    else dash.prepend(host);
  }
}

/* ---------- 5, 9, 10. Consolidated, responsive-safe render pipeline ---------- */
function renderAll() {
  ensureFinalWinningPanels();
  safeRender("user identity", updateUserIdentity);
  safeRender("stats", updateStats);
  safeRender("coding state", restoreCodingState);
  safeRender("project state", restoreProjectState);
  safeRender("chat state", restoreChatState);
  safeRender("learner intelligence", renderLearnerIntelligence);
  safeRender("digital twin", renderTwin);
  safeRender("knowledge graph", renderKnowledgeGraph);
  safeRender("winning panels", renderWinningPanels);
  safeRender("impact layer", renderImpactAndDemo);
  safeRender("project readiness", enhanceProjectReadiness);
  safeRender("evidence journey", renderEvidenceJourney);
  safeRender("intelligence flow", () => renderIntelligenceFlow(-1));
  GYANIFY_RUNTIME.lastSafeRender = Date.now();
}

/* ---------- Performance cleanup: save/render batching ---------- */
let responsiveRenderQueued = false;
function queueResponsiveRender() {
  if (responsiveRenderQueued) return;
  responsiveRenderQueued = true;
  requestAnimationFrame(() => {
    responsiveRenderQueued = false;
    safeRender("responsive graph", renderKnowledgeGraph);
  });
}
window.addEventListener("resize", queueResponsiveRender, { passive: true });

/* ---------- Initial normalization ---------- */
state.learnerIntelligence.concepts.forEach(normalizeConceptIntelligence);
