import { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Target, Zap, ChevronRight, CheckCircle2, AlertTriangle, BookOpen, Activity, Play, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router';
import { useUser } from '../contexts/UserContext';
import { products } from '../data/products';
import { api } from '../lib/api';

const getQuizQuestions = (courseName: string) => [
  {
    question: `What is the primary foundation of ${courseName}?`,
    options: [
      "Understanding its fundamental concepts",
      "Memorizing all potential applications",
      "Using complex tools instead of basics",
      "Ignoring the context of the problem"
    ],
    correctAnswer: 0,
    topic: "Fundamentals",
    difficulty: "Medium"
  },
  {
    question: `When applying ${courseName} principles, what must be prioritized?`,
    options: [
      "Quick execution over careful planning",
      "Consistency and strategic analysis",
      "Isolated tasks without overall vision",
      "Relying solely on external intuition"
    ],
    correctAnswer: 1,
    topic: "Strategic Application",
    difficulty: "Medium"
  },
  {
    question: `Which methodology best evaluates success in ${courseName}?`,
    options: [
      "Anecdotal reports from unverified sources",
      "Looking at the highest single performance",
      "Measuring metrics against established benchmarks",
      "Guessing based on short-term results"
    ],
    correctAnswer: 2,
    topic: "Performance Metrics",
    difficulty: "Hard"
  }
];

export function AiLearning() {
  const navigate = useNavigate();
  const { userProfile, unlockedCourses } = useUser();
  const latestCourseId = unlockedCourses[unlockedCourses.length - 1];
  const latestCourse = products.find(p => p.id === latestCourseId);
  const courseName = latestCourse ? latestCourse.name : "your registered";
  
  const quizQuestions = getQuizQuestions(courseName);
  // 0 = Intro, 1 = Quiz, 2 = Loading Analysis, 3 = Results & Study Plan
  const [phase, setPhase] = useState(0);

  // Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  // Loading State
  const [loadingText, setLoadingText] = useState("Tracking Accuracy...");

  // Calculate Progress
  const progressPercent = ((currentQuestionIdx) / quizQuestions.length) * 100;

  const currentQuestion = quizQuestions[currentQuestionIdx];

  const handleStartQuiz = () => {
    setPhase(1);
  };

  const handleNextQuestion = () => {
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    if (currentQuestionIdx < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIdx(prev => prev + 1);
        setSelectedOption(null);
      }, 400); 
    } else {
      setPhase(2); // Go to Analysis Mode
    }
  };

  useEffect(() => {
    if (phase === 2) {
      const timers = [
        setTimeout(() => setLoadingText("Identifying Weak Areas..."), 1500),
        setTimeout(() => setLoadingText("Synthesizing Personalized Study Plan..."), 3000),
        setTimeout(async () => {
          if (userProfile && courseName) {
            const accuracy = Math.round((score / quizQuestions.length) * 100);
            try {
              await api.post('/progress', {
                email: userProfile.email,
                username: userProfile.username,
                profilePic: userProfile.profilePic,
                courseName: courseName,
                accuracy: accuracy
              });
            } catch (err) {
              console.error('Failed to post progress', err);
            }
          }
          setPhase(3);
        }, 4500)
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [phase]);

  // Phase Renderer
  const renderPhase0 = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/20">
        <Brain className="h-12 w-12 text-primary" />
      </div>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">AI Self-Learning System</h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          You've completed the <strong>{courseName}</strong> course. Now, let our AI engine track your accuracy, identify weak spots, and generate a customized path forward.
        </p>
      </div>
      <Button size="lg" onClick={handleStartQuiz} className="h-14 px-8 text-lg font-semibold rounded-full group">
        Start AI Evaluation
        <Play className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );

  const renderPhase1 = () => (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-8 fade-in opacity-100 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pb-1">AI Adaptive Quiz</h2>
          <div className="flex items-center gap-3">
             <Badge variant={streak > 1 ? "default" : "secondary"} className="flex items-center gap-1 transition-all">
                <Zap className="h-3 w-3" />
                Streak: {streak}
             </Badge>
             <Badge variant="outline" className={`transition-colors duration-500 ${streak > 1 ? 'border-orange-500 text-orange-500 bg-orange-500/10' : ''}`}>
               Difficulty: <span className="font-bold ml-1">{streak > 1 ? 'Hard' : currentQuestion.difficulty}</span>
             </Badge>
             {streak > 1 && (
               <span className="text-xs text-orange-500 font-medium animate-pulse">
                  AI Difficulty Raised
               </span>
             )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{currentQuestionIdx + 1} <span className="text-muted-foreground text-sm">/ {quizQuestions.length}</span></p>
        </div>
      </div>
      <Progress value={progressPercent} className="h-2 w-full" />
      
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-4">
          <Badge variant="outline" className="w-fit mb-2 text-primary border-primary/30 bg-primary/5">
             <Target className="h-3 w-3 w-3 mr-1" />
             {currentQuestion.topic}
          </Badge>
          <CardTitle className="text-xl md:text-2xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedOption === idx 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' 
                  : 'border-border hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <div className="flex items-center">
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${selectedOption === idx ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                   {selectedOption === idx && <div className="h-2 w-2 rounded-full bg-current" />}
                </div>
                <span className={`font-medium ${selectedOption === idx ? 'text-primary' : 'text-foreground'}`}>{option}</span>
              </div>
            </button>
          ))}
        </CardContent>
        <CardFooter className="pt-4 border-t bg-muted/20">
          <Button 
            className="w-full h-12 text-md" 
            disabled={selectedOption === null}
            onClick={handleNextQuestion}
          >
            {currentQuestionIdx === quizQuestions.length - 1 ? 'Analyze Results' : 'Submit & Continue'}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const renderPhase2 = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-6 animate-in fade-in duration-500">
       <div className="relative">
         <Loader2 className="h-16 w-16 text-primary animate-spin" />
         <Brain className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70" />
       </div>
       <div className="space-y-2 text-center h-16">
          <p className="text-xl font-bold animate-pulse">{loadingText}</p>
          <p className="text-sm text-muted-foreground">Our AI is crunching your performance footprint.</p>
       </div>
       <Progress value={undefined} className="w-64 h-1 mt-4" /> {/* Indeterminate */}
    </div>
  );

  const renderPhase3 = () => {
    const accuracy = Math.round((score / quizQuestions.length) * 100);
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-12 fade-in duration-700 pb-12">
        {/* Header summary */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <Card className="flex-1 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
             <CardContent className="p-6 flex items-center gap-6">
                <div className="relative flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/30" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * accuracy) / 100} className="text-primary transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-extrabold">{accuracy}%</span>
                  </div>
                </div>
                <div>
                   <h3 className="text-2xl font-bold mb-1">Your Accuracy</h3>
                   <p className="text-muted-foreground text-sm">Based on algorithmic assessment</p>
                </div>
             </CardContent>
          </Card>
          
          <Card className="flex-1 border-destructive/20 bg-destructive/5">
             <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center gap-2 mb-2">
                   <AlertTriangle className="h-5 w-5 text-destructive" />
                   <h3 className="font-bold text-destructive">Identified Weakness</h3>
                </div>
                 <p className="text-lg font-semibold mb-1">Key Application Concepts</p>
                 <p className="text-sm text-muted-foreground">You struggled with identifying the best strategic approach in {courseName}.</p>
             </CardContent>
          </Card>
        </div>

        {/* Personalized Study Plan */}
        <div>
           <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                 <Activity className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Personalized Study Plan</h2>
           </div>
           
           <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
              {/* Step 1 */}
              <div className="relative animate-in slide-in-from-right-4 fade-in duration-500 delay-100 fill-mode-both">
                <div className="absolute -left-10 h-6 w-6 rounded-full bg-primary flex items-center justify-center ring-4 ring-background">
                   <span className="text-[10px] font-bold text-primary-foreground">1</span>
                </div>
                <Card>
                   <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                     <div className="h-12 w-12 rounded-full bg-primary/10 shrink-0 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-xl font-bold mb-1">Review {courseName} Core Principles</h4>
                        <p className="text-sm text-muted-foreground">Read up on why foundational strategies play a critical role in long-term success of {courseName}.</p>
                     </div>
                     <Button variant="outline" className="shrink-0 w-full sm:w-auto">Start Module</Button>
                   </CardContent>
                </Card>
              </div>

              {/* Step 2 */}
              <div className="relative animate-in slide-in-from-right-4 fade-in duration-500 delay-200 fill-mode-both">
                <div className="absolute -left-10 h-6 w-6 rounded-full bg-muted border-2 border-border flex items-center justify-center ring-4 ring-background">
                   <span className="text-[10px] font-bold text-muted-foreground">2</span>
                </div>
                <Card className="opacity-80">
                   <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                     <div className="h-12 w-12 rounded-full bg-muted shrink-0 flex items-center justify-center">
                        <Target className="h-6 w-6 text-muted-foreground" />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-xl font-bold mb-1">Interactive Sandbox: Scenario Analysis</h4>
                        <p className="text-sm text-muted-foreground">Practice updating complex scenario analyses without overlooking baseline metrics.</p>
                     </div>
                     <Button variant="secondary" className="shrink-0 w-full sm:w-auto" disabled>Locked</Button>
                   </CardContent>
                </Card>
              </div>

           </div>
        </div>

        <div className="flex justify-center pt-8">
           <Button variant="ghost" onClick={() => navigate('/catalogue')} className="hover:bg-muted font-medium">
             Return to Dashboard
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <header className="h-16 border-b flex items-center px-4 bg-card shrink-0 gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <span className="font-bold tracking-tight text-lg">AI Assistance</span>
      </header>

      <main className="flex-1 px-4 flex items-center justify-center">
        {phase === 0 && renderPhase0()}
        {phase === 1 && renderPhase1()}
        {phase === 2 && renderPhase2()}
        {phase === 3 && renderPhase3()}
      </main>
    </div>
  );
}
