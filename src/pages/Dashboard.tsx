import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
} from 'recharts';
import { modelMetrics, confusionMatrices, sentimentDistribution } from '@/lib/sentiment';
import {
  getSentimentTimeline, getWordFrequencies, getDepartmentComparison, getFeedbackBySentiment,
} from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/GlassCard';
import { WordCloud } from '@/components/WordCloud';
import { DepartmentHeatmap } from '@/components/DepartmentHeatmap';
import { FeedbackDrilldown } from '@/components/FeedbackDrilldown';

const models = Object.values(modelMetrics);
const accuracyData = models.map(m => ({ name: m.name, accuracy: +(m.accuracy * 100).toFixed(1) }));
const MODEL_COLORS = ['hsl(221, 83%, 53%)', 'hsl(250, 70%, 55%)', 'hsl(190, 70%, 45%)'];
const LABELS = ['Positive', 'Negative', 'Neutral'];
const SENTIMENT_COLORS: Record<string, string> = {
  Positive: 'hsl(142, 71%, 45%)',
  Negative: 'hsl(0, 84%, 60%)',
  Neutral: 'hsl(215, 16%, 47%)',
};

const tooltipStyle = {
  borderRadius: '8px',
  border: '1px solid hsl(var(--border))',
  background: 'hsl(var(--card))',
  fontSize: '12px',
};

const ConfusionMatrix = ({ matrix, title }: { matrix: number[][]; title: string }) => (
  <div>
    <h4 className="text-sm font-medium text-muted-foreground mb-3">{title}</h4>
    <div className="grid grid-cols-4 gap-1 text-xs max-w-[260px]">
      <div />
      {LABELS.map(l => <div key={l} className="text-center font-medium text-muted-foreground py-1">{l.slice(0, 3)}</div>)}
      {matrix.map((row, i) => (
        <div key={i} className="contents">
          <div className="font-medium text-muted-foreground flex items-center">{LABELS[i].slice(0, 3)}</div>
          {row.map((val, j) => {
            const intensity = val / 100;
            return (
              <div
                key={`${i}-${j}`}
                className="aspect-square flex items-center justify-center rounded font-mono font-medium"
                style={{
                  backgroundColor: i === j
                    ? `hsl(221, 83%, ${85 - intensity * 45}%)`
                    : `hsl(0, 84%, ${95 - intensity * 35}%)`,
                  color: intensity > 0.5 ? 'white' : 'hsl(222, 47%, 11%)',
                }}
              >
                {val}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const [drilldown, setDrilldown] = useState<{ sentiment: string } | null>(null);
  const [wordCloudFilter, setWordCloudFilter] = useState<'mixed' | 'positive' | 'negative'>('mixed');

  const timeline = useMemo(() => getSentimentTimeline(), []);
  const deptComparison = useMemo(() => getDepartmentComparison(), []);
  const wordFreqs = useMemo(
    () => getWordFrequencies(wordCloudFilter === 'positive' ? 'Positive' : wordCloudFilter === 'negative' ? 'Negative' : undefined),
    [wordCloudFilter]
  );
  const drilldownEntries = useMemo(
    () => drilldown ? getFeedbackBySentiment(drilldown.sentiment) : [],
    [drilldown]
  );

  const handlePieClick = (_: any, index: number) => {
    setDrilldown({ sentiment: sentimentDistribution[index].name });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1 text-foreground">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">Interactive visualizations, drill-down charts, and department analytics.</p>
      </motion.div>

      {/* Row 1: Sentiment Timeline + Drill-down Pie */}
      <div className="grid lg:grid-cols-5 gap-6">
        <GlassCard className="lg:col-span-3 p-5">
          <h3 className="font-semibold text-foreground text-sm mb-4">📈 Sentiment Timeline</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="tl-pos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SENTIMENT_COLORS.Positive} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={SENTIMENT_COLORS.Positive} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tl-neg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SENTIMENT_COLORS.Negative} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={SENTIMENT_COLORS.Negative} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tl-neu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SENTIMENT_COLORS.Neutral} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={SENTIMENT_COLORS.Neutral} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="positive" stroke={SENTIMENT_COLORS.Positive} fill="url(#tl-pos)" strokeWidth={2} name="Positive" />
              <Area type="monotone" dataKey="negative" stroke={SENTIMENT_COLORS.Negative} fill="url(#tl-neg)" strokeWidth={2} name="Negative" />
              <Area type="monotone" dataKey="neutral" stroke={SENTIMENT_COLORS.Neutral} fill="url(#tl-neu)" strokeWidth={1.5} name="Neutral" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="lg:col-span-2 p-5">
          <h3 className="font-semibold text-foreground text-sm mb-1">🥧 Sentiment Distribution</h3>
          <p className="text-[10px] text-muted-foreground mb-3">Click a slice to drill down into feedback</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sentimentDistribution}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                onClick={handlePieClick}
                cursor="pointer"
              >
                {sentimentDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            {sentimentDistribution.map(s => (
              <button
                key={s.name}
                onClick={() => setDrilldown({ sentiment: s.name })}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.fill }} />
                {s.name} ({s.value})
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Row 2: Word Cloud + Department Comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm">☁️ Word Cloud</h3>
            <div className="flex gap-1">
              {(['mixed', 'positive', 'negative'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setWordCloudFilter(f)}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                    wordCloudFilter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <WordCloud words={wordFreqs} colorMode={wordCloudFilter} />
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-foreground text-sm mb-4">📊 Department Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptComparison} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} className="fill-muted-foreground" angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="positive" stackId="a" fill={SENTIMENT_COLORS.Positive} radius={[0, 0, 0, 0]} name="Positive" />
              <Bar dataKey="neutral" stackId="a" fill={SENTIMENT_COLORS.Neutral} name="Neutral" />
              <Bar dataKey="negative" stackId="a" fill={SENTIMENT_COLORS.Negative} radius={[4, 4, 0, 0]} name="Negative" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Row 3: Department Heatmap */}
      <GlassCard className="p-5">
        <h3 className="font-semibold text-foreground text-sm mb-4">🔥 Department × Aspect Heatmap</h3>
        <p className="text-xs text-muted-foreground mb-4">Sentiment scores by department and aspect category. Green = positive, Red = negative.</p>
        <DepartmentHeatmap />
      </GlassCard>

      {/* Row 4: Model Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="font-semibold text-foreground text-sm mb-4">🤖 Model Accuracy Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={accuracyData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
              <YAxis domain={[75, 95]} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, 'Accuracy']} />
              <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                {accuracyData.map((_, i) => <Cell key={i} fill={MODEL_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-foreground text-sm mb-4">📋 Performance Metrics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground">Model</th>
                  <th className="text-center py-2.5 px-3 font-semibold text-muted-foreground">Acc</th>
                  <th className="text-center py-2.5 px-3 font-semibold text-muted-foreground">Prec</th>
                  <th className="text-center py-2.5 px-3 font-semibold text-muted-foreground">Rec</th>
                  <th className="text-center py-2.5 px-3 font-semibold text-muted-foreground">F1</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m, i) => (
                  <tr key={m.name} className="border-b last:border-0">
                    <td className="py-2.5 px-3 font-medium text-foreground flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MODEL_COLORS[i] }} />
                      {m.name}
                      {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">Best</span>}
                    </td>
                    <td className="text-center py-2.5 px-3 text-foreground">{(m.accuracy * 100).toFixed(1)}%</td>
                    <td className="text-center py-2.5 px-3 text-foreground">{(m.precision * 100).toFixed(1)}%</td>
                    <td className="text-center py-2.5 px-3 text-foreground">{(m.recall * 100).toFixed(1)}%</td>
                    <td className="text-center py-2.5 px-3 text-foreground">{(m.f1 * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Row 5: Confusion Matrices */}
      <GlassCard className="p-5">
        <h3 className="font-semibold text-foreground text-sm mb-4">🔲 Confusion Matrices</h3>
        <Tabs defaultValue="lr">
          <TabsList className="mb-4">
            <TabsTrigger value="lr">Logistic Regression</TabsTrigger>
            <TabsTrigger value="nb">Naive Bayes</TabsTrigger>
            <TabsTrigger value="svm">SVM</TabsTrigger>
          </TabsList>
          <TabsContent value="lr"><ConfusionMatrix matrix={confusionMatrices.logisticRegression} title="Logistic Regression" /></TabsContent>
          <TabsContent value="nb"><ConfusionMatrix matrix={confusionMatrices.naiveBayes} title="Naive Bayes" /></TabsContent>
          <TabsContent value="svm"><ConfusionMatrix matrix={confusionMatrices.svm} title="SVM" /></TabsContent>
        </Tabs>
      </GlassCard>

      {/* Drilldown Modal */}
      {drilldown && (
        <FeedbackDrilldown
          sentiment={drilldown.sentiment}
          entries={drilldownEntries}
          onClose={() => setDrilldown(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
