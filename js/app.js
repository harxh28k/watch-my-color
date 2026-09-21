// js/app.js
import { QUESTIONS } from '../data/question.js';
import { calculateScores, deriveSpectrumResult } from './calculator.js';
import { getMoviesForColor } from '../services/omdb.js';

// --- Color Archetype & Meaning Definitions ---
const COLOR_PROFILES = {
    yellow: {
        archetype: "The Nostalgic Romantic",
        quote: "You gravitate toward warmth, memory, and whimsical optimism—drawn to narratives that find tender beauty in eccentric worlds."
    },
    orange: {
        archetype: "The Kinetic Adventurer",
        quote: "You crave high-stakes momentum, raw terrain, and visceral intensity where survival and instinct take center stage."
    },
    red: {
        archetype: "The Passionate Obsessive",
        quote: "You are pulled toward emotional vertigo, intense desire, and seductive danger that burns right at the edge of control."
    },
    purple: {
        archetype: "The Neon Dreamer",
        quote: "You dwell in midnight atmospheres, surreal reveries, and hypnotic mysteries that prioritize sensory mood over conventional logic."
    },
    blue: {
        archetype: "The Analytical Observer",
        quote: "You seek clinical precision, intellectual architecture, and quiet isolation where every decision is weighed with calculated calm."
    },
    green: {
        archetype: "The Organic Enigma",
        quote: "You appreciate eerie mutations, primal tension, and reality-bending shifts that disturb the boundaries of the natural world."
    },
    grey: {
        archetype: "The Stoic Contemplator",
        quote: "You value grounded realism, quiet sorrow, and unvarnished truth, finding comfort in patient, rain-soaked existential stories."
    },
    blackWhite: {
        archetype: "The Purist Contrast",
        quote: "You are drawn to raw light, profound moral contrast, and timeless stillness stripped of decorative distraction."
    }
};

// --- Color Display Names ---
const COLOR_NAMES = {
    yellow: 'Yellow',
    orange: 'Orange',
    red: 'Red',
    purple: 'Purple',
    blue: 'Slate Blue',
    green: 'Green',
    grey: 'Grey',
    blackWhite: 'Black & White'
};

// --- State Management ---
const state = {
    currentQuestionIndex: 0,
    userAnswers: []
};

// --- DOM Elements ---
const landingView = document.getElementById('landing-view');
const quizView = document.getElementById('quiz-view');
const resultView = document.getElementById('result-view');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const questionProgress = document.getElementById('question-progress');
const progressBarFill = document.getElementById('progress-bar-fill');
const statementText = document.getElementById('statement-text');
const likertButtons = document.querySelectorAll('.likert-btn');

const resultColorTitle = document.getElementById('result-color-title');
const resultSwatch = document.getElementById('result-swatch');
const resultArchetype = document.getElementById('result-archetype');
const resultDescription = document.getElementById('result-description');
const intensityValue = document.getElementById('intensity-value');
const neighborValue = document.getElementById('neighbor-value');
const oppositeValue = document.getElementById('opposite-value');
const movieGrid = document.getElementById('movie-grid');

// --- View Transition Helpers ---
function showView(viewToShow) {
    [landingView, quizView, resultView].forEach(view => {
        if (view) view.classList.add('hidden');
    });
    if (viewToShow) viewToShow.classList.remove('hidden');
}

// --- Quiz Navigation & Rendering ---
function renderCurrentQuestion() {
    const currentQ = QUESTIONS[state.currentQuestionIndex];
    if (!currentQ) return;

    const totalQuestions = QUESTIONS.length;
    const progressPercent = ((state.currentQuestionIndex + 1) / totalQuestions) * 100;

    if (questionProgress) {
        questionProgress.textContent = `STATEMENT ${state.currentQuestionIndex + 1} OF ${totalQuestions}`;
    }
    if (progressBarFill) {
        progressBarFill.style.width = `${progressPercent}%`;
    }
    if (statementText) {
        statementText.textContent = `"${currentQ.statement}"`;
    }
}

function handleAnswerSelection(value) {
    const currentQ = QUESTIONS[state.currentQuestionIndex];

    state.userAnswers.push({
        questionId: currentQ.id,
        value: value
    });

    if (state.currentQuestionIndex < QUESTIONS.length - 1) {
        state.currentQuestionIndex++;
        renderCurrentQuestion();
    } else {
        finishDiagnosis();
    }
}

// --- Results & Movie Presentation ---
async function finishDiagnosis() {
    showView(resultView);

    // 1. Calculate scores and derived spectrum
    const scores = calculateScores(state.userAnswers);
    const spectrumResult = deriveSpectrumResult(scores);

    const primaryKey = spectrumResult.primary.color;
    const primaryName = COLOR_NAMES[primaryKey] || primaryKey;
    const neighborName = COLOR_NAMES[spectrumResult.neighbor.color] || spectrumResult.neighbor.color;
    const oppositeName = COLOR_NAMES[spectrumResult.polarOpposite.color] || spectrumResult.polarOpposite.color;

    // 2. Populate title, swatch, and spectrum metrics
    if (resultColorTitle) {
        resultColorTitle.textContent = `${spectrumResult.primary.intensityTier} ${primaryName}`;
    }

    if (resultSwatch) {
        resultSwatch.className = 'result-swatch';
        resultSwatch.classList.add(primaryKey === 'blackWhite' ? 'black-white' : primaryKey);
    }

    if (intensityValue) {
        intensityValue.textContent = `${spectrumResult.primary.saturation}% Saturation`;
    }
    if (neighborValue) {
        neighborValue.textContent = neighborName;
    }
    if (oppositeValue) {
        oppositeValue.textContent = oppositeName;
    }

    // 3. Populate Archetype & Meaning Quote
    const profile = COLOR_PROFILES[primaryKey];
    if (profile) {
        if (resultArchetype) resultArchetype.textContent = profile.archetype;
        if (resultDescription) resultDescription.textContent = profile.quote;
    }

    // 4. Fetch and render 5 movie posters
    if (movieGrid) {
        movieGrid.innerHTML = '<p class="loading-text" style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.85rem;">Curating your cinematic spectrum...</p>';

        try {
            const movies = await getMoviesForColor(primaryKey);

            if (movies && movies.length > 0) {
                movieGrid.innerHTML = movies.map(movie => `
          <div class="movie-card">
            <img src="${movie.poster}" alt="${movie.title}" loading="lazy" />
            <div class="movie-card-info">
              <p class="movie-card-title">${movie.title}</p>
              <p class="movie-card-year">${movie.year} • ★ ${movie.rating}</p>
            </div>
          </div>
        `).join('');
            } else {
                movieGrid.innerHTML = '<p style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.85rem;">Unable to load recommendations at this moment.</p>';
            }
        } catch (error) {
            console.error('Error rendering movies:', error);
            movieGrid.innerHTML = '<p style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.85rem;">Unable to load recommendations at this moment.</p>';
        }
    }
}

// --- Quiz Reset / Start ---
function startQuiz() {
    state.currentQuestionIndex = 0;
    state.userAnswers = [];
    showView(quizView);
    renderCurrentQuestion();
}

// --- Event Listeners ---
if (startBtn) {
    startBtn.addEventListener('click', startQuiz);
}

if (restartBtn) {
    restartBtn.addEventListener('click', startQuiz);
}

likertButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const value = parseInt(btn.getAttribute('data-value'), 10);
        handleAnswerSelection(value);
    });
});