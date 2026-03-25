import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FeedbackEntry } from '@/lib/mock-data';

interface FeedbackDrilldownProps {
  sentiment: string;
  entries: FeedbackEntry[];
  onClose: () => void;
}

const sentimentConfig: Record<string, { emoji: string; colorClass: string; bgClass: string }> = {
  Positive: { emoji: '😊', colorClass: 'text-positive', bgClass: 'bg-positive/10' },
  Negative: { emoji: '😠', colorClass: 'text-negative', bgClass: 'bg-negative/10' },
  Neutral: { emoji: '😐', colorClass: 'text-muted-foreground', bgClass: 'bg-muted' },
};

export function FeedbackDrilldown({ sentiment, entries, onClose }: FeedbackDrilldownProps) {
  const config = sentimentConfig[sentiment] || sentimentConfig.Neutral;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border rounded-xl shadow-elevated max-w-2xl w-full max-h-[80vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{config.emoji}</span>
              <div>
                <h3 className={`font-bold ${config.colorClass}`}>{sentiment} Feedback</h3>
                <p className="text-xs text-muted-foreground">{entries.length} entries</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-y-auto max-h-[calc(80vh-70px)] p-4 space-y-2">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`rounded-lg p-3 ${config.bgClass} border`}
              >
                <p className="text-sm text-card-foreground">{entry.text}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded bg-muted">{entry.department}</span>
                  <span>{entry.course}</span>
                  <span>{entry.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
