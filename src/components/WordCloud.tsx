import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface WordCloudProps {
  words: { word: string; count: number }[];
  colorMode?: 'positive' | 'negative' | 'mixed';
}

const positiveColors = [
  'hsl(142, 71%, 45%)',
  'hsl(142, 60%, 50%)',
  'hsl(160, 60%, 45%)',
  'hsl(152, 70%, 40%)',
];
const negativeColors = [
  'hsl(0, 84%, 60%)',
  'hsl(0, 70%, 55%)',
  'hsl(15, 80%, 55%)',
  'hsl(350, 75%, 55%)',
];
const mixedColors = [
  'hsl(221, 83%, 53%)',
  'hsl(250, 70%, 55%)',
  'hsl(190, 70%, 45%)',
  'hsl(142, 71%, 45%)',
  'hsl(0, 84%, 60%)',
  'hsl(40, 90%, 50%)',
];

export function WordCloud({ words, colorMode = 'mixed' }: WordCloudProps) {
  const colors = colorMode === 'positive' ? positiveColors : colorMode === 'negative' ? negativeColors : mixedColors;

  const maxCount = useMemo(() => Math.max(...words.map(w => w.count), 1), [words]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-4">
      {words.map((w, i) => {
        const ratio = w.count / maxCount;
        const size = 0.7 + ratio * 1.3; // 0.7rem to 2rem
        const opacity = 0.5 + ratio * 0.5;
        const color = colors[i % colors.length];

        return (
          <motion.span
            key={w.word}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity, scale: 1 }}
            transition={{ delay: i * 0.02, duration: 0.3 }}
            className="font-semibold cursor-default hover:opacity-100 transition-opacity"
            style={{
              fontSize: `${size}rem`,
              color,
              lineHeight: 1.2,
            }}
            title={`${w.word}: ${w.count} mentions`}
          >
            {w.word}
          </motion.span>
        );
      })}
    </div>
  );
}
