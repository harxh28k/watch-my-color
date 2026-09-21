// js/calculator.js
import { QUESTIONS } from '../data/question.js';

const COLOR_KEYS = [
    'yellow',
    'orange',
    'red',
    'purple',
    'blue',
    'green',
    'grey',
    'blackWhite'
];

/**
 * Calculates responsive scores using quadratic Likert amplification.
 */
export function calculateScores(userAnswers) {
    const scoreTotals = COLOR_KEYS.reduce((acc, color) => {
        acc[color] = 0;
        return acc;
    }, {});

    userAnswers.forEach(answer => {
        const question = QUESTIONS.find(q => q.id === answer.questionId);
        if (!question) return;

        // Amplify user choice (-2 -> -3, -1 -> -1.5, 0 -> 0, 1 -> 1.5, 2 -> 3)
        const amplifiedValue = answer.value * 1.5;

        Object.entries(question.weights).forEach(([color, weight]) => {
            scoreTotals[color] += amplifiedValue * weight;
        });
    });

    return scoreTotals;
}

/**
 * Derives precise primary, secondary, and polar opposite.
 */
export function deriveSpectrumResult(scoreTotals) {
    // Sort descending by score with slight jitter for absolute ties
    const sortedColors = Object.entries(scoreTotals)
        .sort(() => Math.random() - 0.5)
        .sort((a, b) => b[1] - a[1]);

    const [primaryKey, primaryScore] = sortedColors[0];
    const [neighborKey, neighborScore] = sortedColors[1];
    const [oppositeKey, oppositeScore] = sortedColors[sortedColors.length - 1];

    // Dynamic saturation based on how strongly the top color separated from the rest
    const scoreGap = primaryScore - neighborScore;
    const saturationPercentage = Math.min(100, Math.max(25, Math.round(50 + scoreGap * 5)));

    let intensityTier = "Muted / Low";
    if (saturationPercentage >= 75) {
        intensityTier = "Harsh / Deep";
    } else if (saturationPercentage >= 45) {
        intensityTier = "Balanced";
    }

    return {
        primary: {
            color: primaryKey,
            score: primaryScore,
            saturation: saturationPercentage,
            intensityTier: intensityTier
        },
        neighbor: {
            color: neighborKey,
            score: neighborScore
        },
        polarOpposite: {
            color: oppositeKey,
            score: oppositeScore
        },
        rawScores: scoreTotals
    };
}