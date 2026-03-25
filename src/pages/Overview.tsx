import { motion } from 'framer-motion';
import { Brain, TrendingUp, MessageSquare, AlertTriangle, ArrowRight, Sparkles, BarChart3, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { sentimentDistribution } from '@/lib/sentiment';

const trendData = [
  { month: 'Jan', positive: 65, negative: 20, neutral: 15 },
  { month: 'Feb', positive: 68, negative: 18, neutral: 14 },
  { month: 'Mar', positive: 62, negative: 25, neutral: 13 },
  { month: 'Apr', positive: 70, negative: 15, neutral: 15 },
  { month: 'May', positive: 75, negative: 12, neutral: 13 },
  { month: 'Jun', positive: 72, negative: 14, neutral: 14 },
];

const stats = [
  { label: 'Total Feedback', value: '1,000', icon: MessageSquare, change: '+12%', color: 'text-primary' },
  { label: 'Positive Rate', value: '72%', icon: TrendingUp, change: '+5%', color: 'text-positive' },
  { label: 'AI Analyses', value: '856', icon: Brain, change: '+24%', color: 'text-primary' },
  { label: 'Active Alerts', value: '3', icon: AlertTriangle, change: '-2', color: 'text-negative' },
];

const quickActions = [
  { title: 'AI Analysis', desc: 'Analyze feedback with aspect-based sentiment', icon: Sparkles, to: '/analyze', gradient: 'from-primary to-primary/70' },
  { title: 'Dashboard', desc: 'View model performance and metrics', icon: BarChart3, to: '/dashboard', gradient: 'from-positive to-positive/70' },
  { title: 'Insights', desc: 'AI-generated insights and recommendations', icon: FileText, to: '/insights', gradient: 'from-accent-foreground/80 to-accent-foreground/50' },
];

const Overview = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-1">Welcome to SentiMind</h1>
        <p className="text-muted-foreground">Your AI-powered student feedback intelligence platform</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <GlassCard
            key={stat.label}
            hover
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className={`text-xs mt-2 font-medium ${stat.change.startsWith('+') ? 'text-positive' : 'text-negative'}`}>
              {stat.change} from last month
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-5 gap-6">
        <GlassCard className="lg:col-span-3 p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="font-semibold text-foreground mb-4">Sentiment Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              <Area type="monotone" dataKey="positive" stroke="hsl(142, 71%, 45%)" fill="url(#posGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="negative" stroke="hsl(0, 84%, 60%)" fill="url(#negGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="lg:col-span-2 p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="font-semibold text-foreground mb-4">Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sentimentDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {sentimentDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            {sentimentDistribution.map(s => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.fill }} />
                {s.name}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <Link key={action.title} to={action.to}>
              <GlassCard
                hover
                className="p-5 cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3`}>
                  <action.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">{action.title}</h4>
                <p className="text-xs text-muted-foreground mb-3">{action.desc}</p>
                <span className="text-xs text-primary font-medium group-hover:underline flex items-center gap-1">
                  Open <ArrowRight className="h-3 w-3" />
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
