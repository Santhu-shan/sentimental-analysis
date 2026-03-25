// Client-side sentiment analysis using keyword scoring + heuristics

const POSITIVE_WORDS = new Set([
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'loved',
  'best', 'awesome', 'outstanding', 'superb', 'brilliant', 'perfect', 'helpful',
  'clear', 'enjoyed', 'enjoy', 'interesting', 'engaging', 'inspiring', 'insightful',
  'effective', 'supportive', 'knowledgeable', 'well', 'thank', 'thanks', 'appreciate',
  'happy', 'satisfied', 'recommend', 'impressed', 'informative', 'valuable', 'useful',
  'organized', 'motivated', 'exciting', 'positive', 'easy', 'comfortable', 'friendly',
  'professional', 'dedicated', 'responsive', 'thorough', 'comprehensive', 'exceptional',
  'remarkable', 'innovative', 'creative', 'passionate', 'patient', 'encouraging',
  'like', 'liked', 'benefited', 'improved', 'learned', 'understood', 'delightful',
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'poor', 'terrible', 'awful', 'horrible', 'worst', 'boring', 'confusing',
  'difficult', 'hard', 'hate', 'hated', 'disappointing', 'disappointed', 'waste',
  'useless', 'unhelpful', 'unclear', 'disorganized', 'unprepared', 'rude',
  'slow', 'frustrating', 'frustrated', 'annoying', 'annoyed', 'complicated',
  'ineffective', 'unresponsive', 'lazy', 'unprofessional', 'incompetent',
  'mediocre', 'dull', 'tedious', 'monotonous', 'irrelevant', 'outdated',
  'inadequate', 'insufficient', 'lacking', 'weak', 'fail', 'failed', 'failure',
  'problem', 'issue', 'complaint', 'worse', 'struggling', 'struggle', 'painful',
  'stressful', 'overwhelming', 'dislike', 'disliked', 'negative', 'never',
]);

const NEGATION_WORDS = new Set(['not', 'no', "don't", "doesn't", "didn't", "won't", "can't", "isn't", "aren't", "wasn't", "weren't", 'never', 'neither', 'nor', 'hardly', 'barely']);

const INTENSIFIERS = new Set(['very', 'really', 'extremely', 'absolutely', 'incredibly', 'highly', 'totally', 'completely', 'truly', 'so', 'most']);

export type SentimentLabel = 'Positive' | 'Negative' | 'Neutral';

export interface SentimentResult {
  label: SentimentLabel;
  confidence: number;
  scores: { positive: number; negative: number; neutral: number };
  keywords: { word: string; impact: 'positive' | 'negative' }[];
  processingTime: number;
}

function preprocess(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

export function analyzeSentiment(text: string): SentimentResult {
  const start = performance.now();
  const words = preprocess(text);
  
  let positiveScore = 0;
  let negativeScore = 0;
  const keywords: SentimentResult['keywords'] = [];
  let negated = false;
  let intensified = false;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    if (NEGATION_WORDS.has(word)) {
      negated = true;
      continue;
    }
    if (INTENSIFIERS.has(word)) {
      intensified = true;
      continue;
    }

    const multiplier = intensified ? 1.5 : 1;

    if (POSITIVE_WORDS.has(word)) {
      if (negated) {
        negativeScore += multiplier;
        keywords.push({ word, impact: 'negative' });
      } else {
        positiveScore += multiplier;
        keywords.push({ word, impact: 'positive' });
      }
    } else if (NEGATIVE_WORDS.has(word)) {
      if (negated) {
        positiveScore += multiplier * 0.5;
        keywords.push({ word, impact: 'positive' });
      } else {
        negativeScore += multiplier;
        keywords.push({ word, impact: 'negative' });
      }
    }

    // Reset modifiers after use
    if (POSITIVE_WORDS.has(word) || NEGATIVE_WORDS.has(word)) {
      negated = false;
      intensified = false;
    }
  }

  const total = positiveScore + negativeScore + 0.5; // small neutral base
  const posRatio = positiveScore / total;
  const negRatio = negativeScore / total;
  const neuRatio = 0.5 / total;

  let label: SentimentLabel;
  let confidence: number;

  const diff = Math.abs(positiveScore - negativeScore);
  
  if (words.length === 0 || (positiveScore === 0 && negativeScore === 0)) {
    label = 'Neutral';
    confidence = 0.85;
  } else if (diff < 0.5 && positiveScore > 0 && negativeScore > 0) {
    label = 'Neutral';
    confidence = 0.55 + Math.min(neuRatio * 0.3, 0.3);
  } else if (positiveScore > negativeScore) {
    label = 'Positive';
    confidence = 0.6 + Math.min(posRatio * 0.35, 0.35);
  } else {
    label = 'Negative';
    confidence = 0.6 + Math.min(negRatio * 0.35, 0.35);
  }

  // Clamp
  confidence = Math.min(Math.max(confidence, 0.45), 0.98);

  const processingTime = performance.now() - start;

  return {
    label,
    confidence,
    scores: {
      positive: posRatio,
      negative: negRatio,
      neutral: neuRatio,
    },
    keywords: keywords.slice(0, 8),
    processingTime,
  };
}

// Mock model comparison data
export const modelMetrics = {
  logisticRegression: { name: 'Logistic Regression', accuracy: 0.891, precision: 0.883, recall: 0.876, f1: 0.879 },
  naiveBayes: { name: 'Naive Bayes', accuracy: 0.842, precision: 0.831, recall: 0.828, f1: 0.829 },
  svm: { name: 'SVM', accuracy: 0.873, precision: 0.869, recall: 0.861, f1: 0.865 },
};

export const confusionMatrices = {
  logisticRegression: [[85, 5, 10], [4, 88, 8], [7, 6, 87]],
  naiveBayes: [[80, 8, 12], [6, 82, 12], [9, 9, 82]],
  svm: [[83, 6, 11], [5, 86, 9], [8, 7, 85]],
};

export const sentimentDistribution = [
  { name: 'Positive', value: 420, fill: 'hsl(142, 71%, 45%)' },
  { name: 'Negative', value: 280, fill: 'hsl(0, 84%, 60%)' },
  { name: 'Neutral', value: 300, fill: 'hsl(215, 16%, 47%)' },
];
