import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard = ({ children, className, hover = false, ...props }: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        'rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-card',
        hover && 'hover:shadow-elevated hover:border-primary/20 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
