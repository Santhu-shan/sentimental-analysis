// Rich mock dataset for interactive dashboard visualizations

export interface FeedbackEntry {
  id: number;
  text: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  department: string;
  course: string;
  date: string;
  aspects: { category: string; sentiment: string }[];
  emotions: string[];
}

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics'];
const courses = ['Data Structures', 'Machine Learning', 'Digital Electronics', 'Thermodynamics', 'Structural Analysis', 'Linear Algebra', 'Operating Systems', 'Control Systems'];

const positiveFeedback = [
  "The professor explains concepts very clearly and makes the subject interesting.",
  "Excellent teaching methodology. I really enjoyed the interactive sessions.",
  "The lab sessions were well-organized and the faculty was very supportive.",
  "Great course content with practical real-world applications.",
  "The assignments helped me understand the concepts deeply.",
  "Very knowledgeable professor who is always willing to help students.",
  "The teaching quality is outstanding and the material is up to date.",
  "I loved the hands-on projects. They really enhanced my learning.",
  "Best course I've taken this semester. Highly recommend it.",
  "The exam pattern was fair and well-aligned with what was taught.",
];

const negativeFeedback = [
  "The lab equipment is outdated and doesn't work properly.",
  "The course content is too theoretical with no practical applications.",
  "Too much workload. Assignments are overwhelming and stressful.",
  "The infrastructure needs serious improvement. Classrooms are overcrowded.",
  "Exams are unfair and don't reflect what was taught in class.",
  "The professor rushes through topics without explaining properly.",
  "Poor internet connectivity in the campus affects online learning.",
  "The syllabus is outdated and not industry relevant.",
  "No proper guidance for projects. Students are left on their own.",
  "The grading system is too strict and demotivating.",
];

const neutralFeedback = [
  "The course was okay. Nothing exceptional but not bad either.",
  "Teaching is average. Could be more engaging.",
  "The infrastructure is adequate but could use some upgrades.",
  "Mixed feelings about the course. Some topics were good, others not.",
  "The workload is manageable but assignments could be more interesting.",
];

const aspectCategories = ['Teaching Quality', 'Course Content', 'Infrastructure', 'Exams', 'Workload', 'Support'];

function randomDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - Math.floor(Math.random() * months));
  d.setDate(1 + Math.floor(Math.random() * 28));
  return d.toISOString().slice(0, 10);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFeedback(): FeedbackEntry[] {
  const entries: FeedbackEntry[] = [];
  let id = 1;

  for (let i = 0; i < 150; i++) {
    const sentiment: FeedbackEntry['sentiment'] = Math.random() < 0.45 ? 'Positive' : Math.random() < 0.65 ? 'Negative' : 'Neutral';
    const text = sentiment === 'Positive' ? pickRandom(positiveFeedback)
      : sentiment === 'Negative' ? pickRandom(negativeFeedback)
      : pickRandom(neutralFeedback);

    const numAspects = 1 + Math.floor(Math.random() * 3);
    const aspects = Array.from({ length: numAspects }, () => ({
      category: pickRandom(aspectCategories),
      sentiment: pickRandom(['Positive', 'Negative', 'Neutral']),
    }));

    entries.push({
      id: id++,
      text,
      sentiment,
      department: pickRandom(departments),
      course: pickRandom(courses),
      date: randomDate(12),
      aspects,
      emotions: [pickRandom(['Happy', 'Satisfied', 'Frustrated', 'Angry', 'Disappointed', 'Neutral'])],
    });
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

export const feedbackData = generateFeedback();

// Aggregation helpers
export function getSentimentTimeline() {
  const months: Record<string, { positive: number; negative: number; neutral: number }> = {};
  feedbackData.forEach(f => {
    const m = f.date.slice(0, 7); // YYYY-MM
    if (!months[m]) months[m] = { positive: 0, negative: 0, neutral: 0 };
    months[m][f.sentiment.toLowerCase() as 'positive' | 'negative' | 'neutral']++;
  });
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      ...data,
    }));
}

export function getDepartmentHeatmap() {
  const depts: Record<string, Record<string, number>> = {};
  departments.forEach(d => {
    depts[d] = {};
    aspectCategories.forEach(a => { depts[d][a] = 0; });
  });
  feedbackData.forEach(f => {
    f.aspects.forEach(a => {
      if (depts[f.department] && a.category in depts[f.department]) {
        const score = a.sentiment === 'Positive' ? 1 : a.sentiment === 'Negative' ? -1 : 0;
        depts[f.department][a.category] += score;
      }
    });
  });
  return { departments, aspectCategories, data: depts };
}

export function getWordFrequencies(sentiment?: 'Positive' | 'Negative') {
  const words: Record<string, number> = {};
  const filtered = sentiment ? feedbackData.filter(f => f.sentiment === sentiment) : feedbackData;
  const stopwords = new Set(['the', 'is', 'and', 'a', 'to', 'in', 'of', 'for', 'with', 'was', 'are', 'that', 'this', 'i', 'it', 'not', 'but', 'be', 'on', 'have', 'has', 'had', 'do', 'does', 'did', 'an', 'or', 'no', 'so', 'too', 'very', 'can', 'my', 'me', 'we', 'they', 'some', 'what', 'who', 'which', 'their', 'them', 'been', 'would', 'could', 'should']);
  filtered.forEach(f => {
    f.text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).forEach(w => {
      if (w.length > 2 && !stopwords.has(w)) {
        words[w] = (words[w] || 0) + 1;
      }
    });
  });
  return Object.entries(words)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 40)
    .map(([word, count]) => ({ word, count }));
}

export function getDepartmentComparison() {
  const result: { department: string; positive: number; negative: number; neutral: number; total: number }[] = [];
  departments.forEach(dept => {
    const filtered = feedbackData.filter(f => f.department === dept);
    result.push({
      department: dept,
      positive: filtered.filter(f => f.sentiment === 'Positive').length,
      negative: filtered.filter(f => f.sentiment === 'Negative').length,
      neutral: filtered.filter(f => f.sentiment === 'Neutral').length,
      total: filtered.length,
    });
  });
  return result;
}

export function getFeedbackBySentiment(sentiment: string) {
  return feedbackData.filter(f => f.sentiment === sentiment);
}
