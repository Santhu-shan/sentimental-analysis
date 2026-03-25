import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Download, Clock, Tag, Brain, AlertTriangle, Lightbulb, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/GlassCard';
import { analyzeWithAI, type AspectAnalysis, type SimpleAnalysis } from '@/lib/ai-analysis';
import { analyzeSentiment } from '@/lib/sentiment';
import { toast } from 'sonner';

const EXAMPLES = [
  "The professor explains concepts very clearly and makes the subject interesting. The lab facilities are outdated though.",
  "The course was boring and the assignments were confusing. I didn't learn anything useful. The exams were unfair.",
  "I absolutely loved the interactive teaching style! Best course I've taken. Infrastructure needs improvement.",
  "Teaching is average, workload is too heavy, but exam pattern is fair. Need better lab equipment.",
  "The lectures are too long and the material is outdated. Very disappointing experience overall.",
];

const sentimentConfig = {
  Positive: { emoji: '😊', colorClass: 'text-positive', bgClass: 'bg-positive/10', borderClass: 'border-positive/30' },
  Negative: { emoji: '😠', colorClass: 'text-negative', bgClass: 'bg-negative/10', borderClass: 'border-negative/30' },
  Neutral: { emoji: '😐', colorClass: 'text-muted-foreground', bgClass: 'bg-muted', borderClass: 'border-border' },
};

const emotionEmojis: Record<string, string> = {
  Happy: '😊', Satisfied: '😌', Neutral: '😐', Frustrated: '😤', Angry: '😠', Disappointed: '😞',
};

const Analyze = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AspectAnalysis | null>(null);
  const [simpleResult, setSimpleResult] = useState<SimpleAnalysis | null>(null);
  const [history, setHistory] = useState<{ text: string; sentiment: string; confidence: number }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mode, setMode] = useState<'simple' | 'aspect'>('aspect');

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      if (mode === 'aspect') {
        const data = await analyzeWithAI(text, 'aspect') as AspectAnalysis;
        setResult(data);
        setSimpleResult(null);
        setHistory(prev => [{ text, sentiment: data.overall.sentiment, confidence: data.overall.confidence }, ...prev].slice(0, 20));
      } else {
        const data = await analyzeWithAI(text, 'simple') as SimpleAnalysis;
        setSimpleResult(data);
        setResult(null);
        setHistory(prev => [{ text, sentiment: data.sentiment, confidence: data.confidence }, ...prev].slice(0, 20));
      }
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed');
      // Fallback to client-side
      const fallback = analyzeSentiment(text);
      setSimpleResult({
        sentiment: fallback.label,
        confidence: fallback.confidence,
        keywords: fallback.keywords.map(k => ({ ...k, impact: k.impact as any })),
        explanation: 'Analyzed using local keyword-based model (AI unavailable)',
        emotions: [{ emotion: fallback.label === 'Positive' ? 'Happy' : fallback.label === 'Negative' ? 'Frustrated' : 'Neutral', intensity: fallback.confidence }],
      });
      setResult(null);
      setHistory(prev => [{ text, sentiment: fallback.label, confidence: fallback.confidence }, ...prev].slice(0, 20));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (!history.length) return;
    const csv = 'Feedback,Sentiment,Confidence\n' +
      history.map(h => `"${h.text.replace(/"/g, '""')}",${h.sentiment},${(h.confidence * 100).toFixed(1)}%`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sentiment_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeResult = result || simpleResult;
  const activeSentiment = result?.overall.sentiment || simpleResult?.sentiment;
  const activeConfidence = result?.overall.confidence || simpleResult?.confidence;
  const config = activeSentiment ? sentimentConfig[activeSentiment as keyof typeof sentimentConfig] : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-hero flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Sentiment Analysis</h1>
            <p className="text-sm text-muted-foreground">Powered by advanced NLP models</p>
          </div>
        </div>

        {/* Input Section */}
        <GlassCard className="p-6 mt-6">
          <div className="flex gap-2 mb-4">
            <Button
              variant={mode === 'aspect' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('aspect')}
              className={mode === 'aspect' ? 'bg-gradient-hero text-primary-foreground' : ''}
            >
              <Brain className="h-3.5 w-3.5 mr-1.5" /> Aspect-Based
            </Button>
            <Button
              variant={mode === 'simple' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('simple')}
              className={mode === 'simple' ? 'bg-gradient-hero text-primary-foreground' : ''}
            >
              <Tag className="h-3.5 w-3.5 mr-1.5" /> Simple
            </Button>
          </div>

          <Textarea
            placeholder="Enter student feedback to analyze... e.g., 'The professor is knowledgeable but the lab equipment is outdated and exams are too hard.'"
            value={text}
            onChange={e => setText(e.target.value)}
            className="min-h-[120px] text-base resize-none mb-4 bg-background"
          />

          <div className="flex flex-wrap gap-2 mb-4">
            {EXAMPLES.slice(0, 3).map((ex, i) => (
              <button
                key={i}
                onClick={() => setText(ex)}
                className="text-xs px-3 py-1.5 rounded-full border bg-muted text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                Example {i + 1}
              </button>
            ))}
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!text.trim() || isAnalyzing}
            className="bg-gradient-hero text-primary-foreground hover:opacity-90"
          >
            {isAnalyzing ? <Sparkles className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Sentiment'}
          </Button>
        </GlassCard>

        {/* Results */}
        <AnimatePresence mode="wait">
          {activeResult && config && (
            <motion.div
              key={activeSentiment}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 space-y-4"
            >
              {/* Overall Sentiment */}
              <GlassCard className={`p-6 ${config.borderClass} border`}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{config.emoji}</span>
                  <div className="flex-1">
                    <h2 className={`text-2xl font-bold ${config.colorClass}`}>{activeSentiment}</h2>
                    <p className="text-sm text-muted-foreground">{result?.overall.summary || simpleResult?.explanation}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${config.colorClass}`}>{((activeConfidence || 0) * 100).toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(activeConfidence || 0) * 100}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-hero"
                  />
                </div>
              </GlassCard>

              {/* Aspect-Based Results */}
              {result?.aspects && (
                <GlassCard className="p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" /> Aspect-Based Analysis
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {result.aspects.filter(a => a.sentiment !== 'Not Mentioned').map((aspect, i) => {
                      const ac = sentimentConfig[aspect.sentiment as keyof typeof sentimentConfig] || sentimentConfig.Neutral;
                      return (
                        <div key={i} className={`rounded-lg border p-3 ${ac.bgClass} ${ac.borderClass}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{aspect.category}</span>
                            <span className={`text-xs font-semibold ${ac.colorClass}`}>{aspect.sentiment}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{aspect.evidence}</p>
                          <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-hero" style={{ width: `${aspect.confidence * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              )}

              {/* Emotions */}
              {(result?.emotions || simpleResult?.emotions) && (
                <GlassCard className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Detected Emotions</h3>
                  <div className="flex flex-wrap gap-3">
                    {(result?.emotions || simpleResult?.emotions || []).map((em, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                        <span className="text-xl">{emotionEmojis[em.emotion] || '🤔'}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{em.emotion}</p>
                          <div className="h-1 w-16 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${em.intensity * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Keywords & Explanation */}
              <div className="grid sm:grid-cols-2 gap-4">
                {(result?.keywords || simpleResult?.keywords) && (
                  <GlassCard className="p-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" /> Key Words
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(result?.keywords || simpleResult?.keywords || []).map((kw, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            kw.impact === 'positive' ? 'bg-positive/15 text-positive' : kw.impact === 'negative' ? 'bg-negative/15 text-negative' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {kw.word}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                )}

                <GlassCard className="p-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" /> Why This Prediction?
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result?.explanation || simpleResult?.explanation}
                  </p>
                </GlassCard>
              </div>

              {/* Language & Sarcasm Detection */}
              {result && (result.detectedLanguage || result.sarcasmDetected) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {result.detectedLanguage && (
                    <GlassCard className="p-4 flex items-center gap-3">
                      <span className="text-2xl">🌐</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">Detected Language</p>
                        <p className="text-xs text-muted-foreground">{result.detectedLanguage}</p>
                      </div>
                    </GlassCard>
                  )}
                  {result.sarcasmDetected && (
                    <GlassCard className="p-4 border-yellow-500/30 bg-yellow-500/5 flex items-center gap-3">
                      <span className="text-2xl">🎭</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">Sarcasm Detected</p>
                        <p className="text-xs text-muted-foreground">{result.sarcasmExplanation || 'Ironic or sarcastic tone detected'}</p>
                      </div>
                    </GlassCard>
                  )}
                </div>
              )}

              {/* Spam Detection */}
              {result?.isSpam && (
                <GlassCard className="p-4 border-negative/30 bg-negative/5">
                  <div className="flex items-center gap-2 text-negative">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Spam Detected</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{result.spamReason}</p>
                </GlassCard>
              )}

              {/* Recommendations */}
              {result?.recommendations && result.recommendations.length > 0 && (
                <GlassCard className="p-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" /> Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Analysis History</h3>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download CSV
              </Button>
            </div>
            <div className="space-y-2">
              {history.map((h, i) => {
                const c = sentimentConfig[h.sentiment as keyof typeof sentimentConfig] || sentimentConfig.Neutral;
                return (
                  <GlassCard key={i} className="flex items-center gap-3 p-3">
                    <span className="text-xl">{c.emoji}</span>
                    <p className="flex-1 text-sm text-card-foreground truncate">{h.text}</p>
                    <span className={`font-medium text-xs ${c.colorClass}`}>{h.sentiment}</span>
                    <span className="text-xs text-muted-foreground">{(h.confidence * 100).toFixed(0)}%</span>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Analyze;
