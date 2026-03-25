import { supabase } from "@/integrations/supabase/client";

export interface AspectResult {
  category: string;
  sentiment: string;
  confidence: number;
  evidence: string;
}

export interface EmotionResult {
  emotion: string;
  intensity: number;
}

export interface KeywordResult {
  word: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface SimpleAnalysis {
  sentiment: string;
  confidence: number;
  keywords: KeywordResult[];
  explanation: string;
  emotions: EmotionResult[];
}

export interface AspectAnalysis {
  overall: { sentiment: string; confidence: number; summary: string };
  aspects: AspectResult[];
  emotions: EmotionResult[];
  keywords: KeywordResult[];
  explanation: string;
  recommendations: string[];
  isSpam: boolean;
  spamReason?: string;
  detectedLanguage?: string;
  sarcasmDetected?: boolean;
  sarcasmExplanation?: string;
}

export interface InsightItem {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
}

export interface Recommendation {
  action: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

export interface InsightsResult {
  keyInsights: InsightItem[];
  summary: string;
  topStrengths: string[];
  topWeaknesses: string[];
  recommendations: Recommendation[];
  alerts: { message: string; type: 'warning' | 'critical' }[];
}

export async function analyzeWithAI(text: string, mode: 'simple' | 'aspect' | 'insights' = 'simple') {
  const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
    body: { text, mode },
  });

  if (error) throw new Error(error.message || 'Analysis failed');
  if (data?.error) throw new Error(data.error);
  return data;
}
