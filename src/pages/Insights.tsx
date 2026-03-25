import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, TrendingUp, TrendingDown, Lightbulb, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/GlassCard';
import { analyzeWithAI, type InsightsResult } from '@/lib/ai-analysis';
import { toast } from 'sonner';

const SAMPLE_BATCH = `The professor is excellent and explains concepts clearly.
Lab equipment is outdated and needs replacement urgently.
Course content is good but the workload is overwhelming.
Teaching quality has improved a lot this semester.
Infrastructure is terrible, classrooms are too crowded.
Exams are fair and well-structured.
The curriculum needs to be updated with modern topics.
Support staff is very helpful and responsive.
I hate the long lectures, they are so boring.
Overall a great experience, learned a lot.`;

const severityConfig = {
  info: { icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10' },
  critical: { icon: AlertTriangle, color: 'text-negative', bg: 'bg-negative/10' },
};

const priorityColors = {
  high: 'bg-negative/15 text-negative',
  medium: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  low: 'bg-primary/15 text-primary',
};

const Insights = () => {
  const [feedbackBatch, setFeedbackBatch] = useState('');
  const [insights, setInsights] = useState<InsightsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!feedbackBatch.trim()) return;
    setLoading(true);
    try {
      const data = await analyzeWithAI(feedbackBatch, 'insights') as InsightsResult;
      setInsights(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-gradient-hero flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Insights Engine</h1>
            <p className="text-sm text-muted-foreground">Generate actionable insights from batch feedback</p>
          </div>
        </div>

        <GlassCard className="p-6 mb-6">
          <p className="text-sm text-muted-foreground mb-3">
            Paste multiple feedback entries (one per line) to generate AI-driven insights, alerts, and recommendations.
          </p>
          <Textarea
            placeholder="Paste multiple feedback entries here, one per line..."
            value={feedbackBatch}
            onChange={e => setFeedbackBatch(e.target.value)}
            className="min-h-[160px] text-sm resize-none mb-4 bg-background font-mono"
          />
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={!feedbackBatch.trim() || loading} className="bg-gradient-hero text-primary-foreground hover:opacity-90">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Generate Insights
            </Button>
            <Button variant="outline" onClick={() => setFeedbackBatch(SAMPLE_BATCH)}>
              Load Sample
            </Button>
          </div>
        </GlassCard>

        {insights && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Alerts */}
            {insights.alerts.length > 0 && (
              <div className="space-y-2">
                {insights.alerts.map((alert, i) => (
                  <GlassCard key={i} className={`p-4 border ${alert.type === 'critical' ? 'border-negative/30 bg-negative/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${alert.type === 'critical' ? 'text-negative' : 'text-yellow-600 dark:text-yellow-400'}`} />
                      <span className="text-sm font-medium text-foreground">{alert.message}</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {/* Summary */}
            <GlassCard className="p-6">
              <h3 className="font-semibold text-foreground mb-3">Executive Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{insights.summary}</p>
            </GlassCard>

            {/* Strengths & Weaknesses */}
            <div className="grid sm:grid-cols-2 gap-4">
              <GlassCard className="p-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-positive" /> Top Strengths
                </h3>
                <ul className="space-y-2">
                  {insights.topStrengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="h-5 w-5 rounded-full bg-positive/10 text-positive text-xs flex items-center justify-center flex-shrink-0">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </GlassCard>
              <GlassCard className="p-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-negative" /> Top Weaknesses
                </h3>
                <ul className="space-y-2">
                  {insights.topWeaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="h-5 w-5 rounded-full bg-negative/10 text-negative text-xs flex items-center justify-center flex-shrink-0">!</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>

            {/* Key Insights */}
            <GlassCard className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Key Insights</h3>
              <div className="space-y-3">
                {insights.keyInsights.map((insight, i) => {
                  const sc = severityConfig[insight.severity];
                  return (
                    <div key={i} className={`rounded-lg p-3 ${sc.bg} flex items-start gap-3`}>
                      <sc.icon className={`h-4 w-4 mt-0.5 ${sc.color}`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{insight.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground mt-1 inline-block">{insight.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Recommendations */}
            <GlassCard className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" /> Recommendations
              </h3>
              <div className="space-y-3">
                {insights.recommendations.map((rec, i) => (
                  <div key={i} className="rounded-lg border p-4 bg-background">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${priorityColors[rec.priority]}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{rec.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">Impact: {rec.impact}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Insights;
