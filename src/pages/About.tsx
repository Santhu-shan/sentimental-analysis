import { motion } from 'framer-motion';
import { Database, Cpu, BarChart3, Globe, Brain, Code2, PieChart, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const team = [
  { name: 'Member 1', role: 'Data Collection & Preprocessing', icon: Database, desc: 'Gathered and cleaned student feedback datasets, handled missing data, and prepared text for NLP pipeline.' },
  { name: 'Member 2', role: 'Feature Extraction & Model Training', icon: Cpu, desc: 'Implemented TF-IDF vectorization, trained Logistic Regression, Naive Bayes, and SVM classifiers.' },
  { name: 'Member 3', role: 'Evaluation & Visualization', icon: BarChart3, desc: 'Built model evaluation pipeline, generated confusion matrices, and created interactive data visualizations.' },
  { name: 'Member 4', role: 'Web App Development', icon: Globe, desc: 'Designed and developed the full-stack web application with responsive UI and real-time prediction.' },
];

const technologies = [
  { name: 'React + TypeScript', icon: Code2 },
  { name: 'Machine Learning', icon: Brain },
  { name: 'NLP & TF-IDF', icon: Layers },
  { name: 'Data Visualization', icon: PieChart },
];

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2 text-foreground">About This Project</h1>
        <p className="text-muted-foreground mb-10 leading-relaxed max-w-2xl">
          This AI-powered system uses Natural Language Processing and Machine Learning to analyze student feedback and classify sentiment. 
          It compares multiple ML models—Logistic Regression, Naive Bayes, and SVM—to identify the best-performing classifier, providing real-time predictions with explainable AI features.
        </p>

        {/* How It Works */}
        <h2 className="text-xl font-bold mb-4 text-foreground">How It Works</h2>
        <div className="rounded-xl border bg-card p-6 shadow-card mb-10">
          <ol className="space-y-3 text-sm text-card-foreground">
            {[
              'User enters student feedback text',
              'Text is preprocessed: lowercased, punctuation removed, stopwords filtered, tokenized',
              'Features extracted using TF-IDF vectorization',
              'Trained ML model predicts sentiment (Positive / Negative / Neutral)',
              'Results displayed with confidence score and influential keywords',
            ].map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Technologies */}
        <h2 className="text-xl font-bold mb-4 text-foreground">Technologies Used</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {technologies.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="shadow-card text-center p-4">
                <CardContent className="p-0">
                  <t.icon className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-sm font-medium text-card-foreground">{t.name}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Team */}
        <h2 className="text-xl font-bold mb-4 text-foreground">Team Contributions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="shadow-card h-full">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <member.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-card-foreground">{member.name}</h3>
                      <p className="text-xs text-primary font-medium">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default About;
