import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let toolDef: any = null;
    let toolChoice: any = undefined;

    if (mode === "aspect") {
      systemPrompt = `You are a multilingual student feedback analyst. You can analyze feedback written in ANY language including English, Tamil (தமிழ்), Hindi (हिन्दी), Telugu, Kannada, Malayalam, and mixed-language (code-switching) text. 

IMPORTANT INSTRUCTIONS:
- Detect the language of the input automatically.
- Understand context, sarcasm, irony, and mixed emotions — do NOT rely on keyword matching alone.
- For example, "The professor is so helpful, I barely learned anything" is sarcastic and NEGATIVE.
- Analyze sentiment at the sentence level, considering the full context.
- Always respond in English regardless of input language.
- Include the detected language in your analysis.`;
      toolDef = {
        type: "function",
        function: {
          name: "analyze_aspects",
          description: "Analyze feedback by educational aspects",
          parameters: {
            type: "object",
            properties: {
              overall: {
                type: "object",
                properties: {
                  sentiment: { type: "string", enum: ["Positive", "Negative", "Neutral"] },
                  confidence: { type: "number" },
                  summary: { type: "string" }
                },
                required: ["sentiment", "confidence", "summary"]
              },
              aspects: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string", enum: ["Teaching Quality", "Course Content", "Infrastructure", "Exams", "Workload", "Support"] },
                    sentiment: { type: "string", enum: ["Positive", "Negative", "Neutral", "Not Mentioned"] },
                    confidence: { type: "number" },
                    evidence: { type: "string" }
                  },
                  required: ["category", "sentiment", "confidence", "evidence"]
                }
              },
              emotions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    emotion: { type: "string", enum: ["Happy", "Satisfied", "Neutral", "Frustrated", "Angry", "Disappointed"] },
                    intensity: { type: "number" }
                  },
                  required: ["emotion", "intensity"]
                }
              },
              keywords: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    word: { type: "string" },
                    impact: { type: "string", enum: ["positive", "negative", "neutral"] }
                  },
                  required: ["word", "impact"]
                }
              },
              explanation: { type: "string" },
              recommendations: {
                type: "array",
                items: { type: "string" }
              },
              isSpam: { type: "boolean" },
              spamReason: { type: "string" },
              detectedLanguage: { type: "string", description: "The detected language of the input text, e.g. English, Tamil, Hindi" },
              sarcasmDetected: { type: "boolean", description: "Whether sarcasm or irony was detected in the feedback" },
              sarcasmExplanation: { type: "string", description: "If sarcasm was detected, explain how it affected the analysis" }
            },
            required: ["overall", "aspects", "emotions", "keywords", "explanation", "recommendations", "isSpam", "detectedLanguage", "sarcasmDetected"]
          }
        }
      };
      toolChoice = { type: "function", function: { name: "analyze_aspects" } };
    } else if (mode === "insights") {
      systemPrompt = `You are an educational data analyst. Given multiple student feedback entries, generate actionable insights, trends, and recommendations. Be specific and data-driven.`;
      toolDef = {
        type: "function",
        function: {
          name: "generate_insights",
          description: "Generate insights from feedback data",
          parameters: {
            type: "object",
            properties: {
              keyInsights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    severity: { type: "string", enum: ["info", "warning", "critical"] },
                    category: { type: "string" }
                  },
                  required: ["title", "description", "severity", "category"]
                }
              },
              summary: { type: "string" },
              topStrengths: { type: "array", items: { type: "string" } },
              topWeaknesses: { type: "array", items: { type: "string" } },
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    action: { type: "string" },
                    priority: { type: "string", enum: ["high", "medium", "low"] },
                    impact: { type: "string" }
                  },
                  required: ["action", "priority", "impact"]
                }
              },
              alerts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    type: { type: "string", enum: ["warning", "critical"] }
                  },
                  required: ["message", "type"]
                }
              }
            },
            required: ["keyInsights", "summary", "topStrengths", "topWeaknesses", "recommendations", "alerts"]
          }
        }
      };
      toolChoice = { type: "function", function: { name: "generate_insights" } };
    } else {
      // Simple sentiment
      systemPrompt = `You are a multilingual sentiment analysis expert for student feedback. You understand English, Tamil, Hindi, Telugu, Kannada, Malayalam, and code-mixed text. Detect sarcasm and irony. Always respond in English. Classify the sentiment and provide confidence, keywords, and an explanation.`;
      toolDef = {
        type: "function",
        function: {
          name: "classify_sentiment",
          description: "Classify student feedback sentiment",
          parameters: {
            type: "object",
            properties: {
              sentiment: { type: "string", enum: ["Positive", "Negative", "Neutral"] },
              confidence: { type: "number" },
              keywords: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    word: { type: "string" },
                    impact: { type: "string", enum: ["positive", "negative"] }
                  },
                  required: ["word", "impact"]
                }
              },
              explanation: { type: "string" },
              emotions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    emotion: { type: "string" },
                    intensity: { type: "number" }
                  },
                  required: ["emotion", "intensity"]
                }
              }
            },
            required: ["sentiment", "confidence", "keywords", "explanation", "emotions"]
          }
        }
      };
      toolChoice = { type: "function", function: { name: "classify_sentiment" } };
    }

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      tools: [toolDef],
      tool_choice: toolChoice,
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No analysis result" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysisResult = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-sentiment error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
