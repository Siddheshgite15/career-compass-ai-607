import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  Play,
  ExternalLink,
  Clock,
  BookOpen,
  FileText,
  Youtube,
  GraduationCap,
  Code,
  Save,
} from "lucide-react";

const mockTopicData = {
  id: "linear-regression",
  name: "Linear Regression",
  module: "Machine Learning Basics",
  duration: "6 hours",
  objectives: [
    "Understand the concept of linear regression",
    "Learn to implement simple and multiple linear regression",
    "Master evaluation metrics (MSE, R-squared)",
    "Apply regularization techniques (L1, L2)",
    "Build a real-world regression model",
  ],
  resources: [
    {
      type: "youtube",
      title: "Linear Regression - Complete Tutorial",
      instructor: "StatQuest with Josh Starmer",
      duration: "45 min",
      url: "https://youtube.com",
      description: "Best visual explanation of linear regression concepts",
    },
    {
      type: "coursera",
      title: "Machine Learning Specialization - Linear Regression",
      instructor: "Andrew Ng",
      duration: "2 hours",
      url: "https://coursera.org",
      description: "Stanford's legendary ML course - free to audit",
    },
    {
      type: "article",
      title: "Linear Regression in Python - Complete Guide",
      instructor: "GeeksforGeeks",
      duration: "30 min",
      url: "https://geeksforgeeks.org",
      description: "Hands-on implementation with code examples",
    },
    {
      type: "practice",
      title: "Linear Regression - Kaggle Exercise",
      instructor: "Kaggle Learn",
      duration: "1 hour",
      url: "https://kaggle.com",
      description: "Practice with real datasets",
    },
  ],
};

const resourceIcons = {
  youtube: Youtube,
  coursera: GraduationCap,
  article: FileText,
  practice: Code,
};

const resourceColors = {
  youtube: "bg-red-500/10 text-red-600 border-red-500/20",
  coursera: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  article: "bg-green-500/10 text-green-600 border-green-500/20",
  practice: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const Topic = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [completed, setCompleted] = useState(false);

  const topic = mockTopicData;

  const handleMarkComplete = () => {
    setCompleted(true);
    // In a real app, this would save to the database
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Roadmap
        </Button>

        {/* Topic Header */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6 animate-slide-up">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{topic.module}</p>
              <h1 className="text-3xl font-bold mb-4">{topic.name}</h1>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
                  <Clock className="h-4 w-4 text-primary" />
                  {topic.duration}
                </span>
                <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
                  <BookOpen className="h-4 w-4 text-success" />
                  {topic.resources.length} resources
                </span>
              </div>
            </div>
            {completed ? (
              <div className="flex items-center gap-2 text-success bg-success/10 px-4 py-2 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Completed</span>
              </div>
            ) : (
              <Button variant="hero" onClick={handleMarkComplete}>
                <CheckCircle2 className="h-4 w-4" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">Learning Objectives</h2>
          <ul className="space-y-3">
            {topic.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </div>
                <span className="text-muted-foreground">{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">Curated Resources</h2>
          <div className="space-y-4">
            {topic.resources.map((resource, index) => {
              const Icon = resourceIcons[resource.type as keyof typeof resourceIcons];
              const colorClass = resourceColors[resource.type as keyof typeof resourceColors];

              return (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50 transition-all"
                >
                  <div className={`p-3 rounded-xl border ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {resource.title}
                      </h3>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {resource.instructor} • {resource.duration}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {resource.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <Play className="h-4 w-4" />
                    Start
                  </Button>
                </a>
              );
            })}
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Notes</h2>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
          <Textarea
            placeholder="Write your notes, key takeaways, or questions here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default Topic;
