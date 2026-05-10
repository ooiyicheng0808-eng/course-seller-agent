import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { BookOpen, Calendar, Target, RotateCw } from 'lucide-react';
import { api } from '../lib/api';

interface UserProgress {
  id: string;
  accuracy: number;
  attempts: number;
  lastUpdated: string;
  user: {
    id: string;
    username: string;
    email: string;
    profilePic: string | null;
  };
  topic: {
    id: string;
    name: string;
    difficulty: string;
    courseName: string;
  };
}

export function LearnerProgress() {
  const [progresses, setProgresses] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProgress() {
      try {
        const data = await api.get('/progress/learners');
        setProgresses(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <RotateCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Syncing Learner Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive font-medium border border-destructive/20 rounded-lg bg-destructive/5">
        Failed to fetch progress: {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold tracking-tight">Learner Progress</h2>
        <p className="text-sm text-muted-foreground">Detailed database view of individual learner trajectories</p>
      </div>

      {progresses.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground font-medium">No progress tracked in the database yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {progresses.map((p) => {
            const radius = 38;
            const circumference = 2 * Math.PI * radius;
            const accuracySafe = Math.min(100, Math.max(0, p.accuracy));
            const strokeDashoffset = circumference - (accuracySafe / 100) * circumference;

            return (
              <div key={p.id} className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6 justify-between">
                
                <div className="flex flex-col gap-5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0 border">
                      <AvatarImage src={p.user.profilePic || undefined} alt={p.user.username || 'Learner'} />
                      <AvatarFallback>{(p.user.username || 'A').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm truncate">{p.user.username}</span>
                      <span className="text-xs text-muted-foreground truncate">{p.user.email}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Course / Topic</span>
                      <div className="flex items-start gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-md shrink-0 mt-0.5">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex flex-col min-w-0">
                           <span className="text-sm font-semibold truncate" title={p.topic.courseName}>
                             {p.topic.courseName}
                           </span>
                           <span className="text-xs text-muted-foreground truncate flex items-center">
                              {p.topic.name} &bull; <span className="text-orange-500 font-medium ml-1">{p.topic.difficulty}</span>
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Attempts & Date</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-md shrink-0">
                          <Target className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex flex-col min-w-0">
                           <span className="text-sm font-semibold truncate inline-flex gap-2">
                             <span>Attempts: <span className="text-primary">{p.attempts}</span></span>
                           </span>
                           <span className="text-xs text-muted-foreground flex items-center">
                              Last updating: {new Date(p.lastUpdated).toLocaleDateString()}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative flex flex-col items-center justify-center shrink-0 border-l border-border/50 pl-4 sm:pl-6 pb-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest absolute top-0 text-center w-full">Score</span>
                  <div className="relative mt-5">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle 
                        cx="48" 
                        cy="48" 
                        r={radius} 
                        stroke="hsl(var(--muted))" 
                        strokeWidth="8" 
                        fill="transparent" 
                      />
                      <circle 
                        cx="48" 
                        cy="48" 
                        r={radius} 
                        stroke="#2563EB" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset} 
                        strokeLinecap="round" 
                        className="transition-all duration-1000 ease-in-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold">{p.accuracy}%</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
