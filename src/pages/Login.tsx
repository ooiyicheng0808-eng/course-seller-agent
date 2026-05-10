import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useSettings } from '../contexts/SettingsContext';
import { useUser } from '../contexts/UserContext';

import { api } from '../lib/api';
import { toast } from 'sonner';

export function Login() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useSettings();
  const { login } = useUser();

  const isSignUp = location.state?.mode === 'signup';
  const [role, setRole] = useState<'learner' | 'seller'>(location.state?.role || 'learner');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        if (!username || !email || !phone || !password) {
          toast.error("Please fill in all fields.");
          return;
        }
        const data = await api.post('/auth/register', { username, email, phone, password, role });
        login(data.user, data.token);
        toast.success("Registration successful!");
        navigate('/catalogue');
      } else {
        if (!email || !password) {
          toast.error("Please enter email and password.");
          return;
        }
        const data = await api.post('/auth/login', { email, password });
        
        if (data.user.role !== role) {
          toast.error(`Invalid portal. This email is registered as a ${data.user.role}.`);
          return;
        }

        login(data.user, data.token);
        toast.success("Welcome back!");
        navigate('/catalogue');
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{isSignUp ? 'Register!' : t('welcomeBack')}</CardTitle>
          <CardDescription>
            {t('enterDetails')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'learner' | 'seller')}
                    className="flex h-10 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="learner">Learner</option>
                    <option value="seller">Course Seller</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">{t('username')}</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-2 border-border"
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-border"
                required
              />
            </div>
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-2 border-border"
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="Include letter, number, and space"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-border"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="pt-8">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : t('signIn'))}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
