import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { useSettings } from './SettingsContext';

export interface UserProfile {
  username: string;
  email: string;
  phone: string;
  role?: 'learner' | 'seller';
  profilePic?: string;
}

interface UserContextType {
  diamonds: number;
  userProfile: UserProfile | null;
  unlockedCourses: string[];
  unlockCourse: (courseId: string, price: number) => boolean;
  hasUnlocked: (courseId: string) => boolean;
  login: (profile: UserProfile, token: string) => void;
  logout: () => void;
  updateProfilePic: (url: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [diamonds, setDiamonds] = useState(5000);
  const [unlockedCourses, setUnlockedCourses] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { language } = useSettings();

  useEffect(() => {
    const savedDiamonds = localStorage.getItem('user_diamonds');
    if (savedDiamonds) setDiamonds(parseInt(savedDiamonds, 10));

    const savedCourses = localStorage.getItem('user_unlocked_courses');
    if (savedCourses) setUnlockedCourses(JSON.parse(savedCourses));
    
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
  }, []);

  const login = (profile: UserProfile, token: string) => {
    setUserProfile(profile);
    localStorage.setItem('user_profile', JSON.stringify(profile));
    if (token) {
      localStorage.setItem('auth_token', token);
    }
  };
  
  const updateProfilePic = (url: string) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, profilePic: url };
      setUserProfile(updatedProfile);
      localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
    }
  };

  const logout = () => {
    setUserProfile(null);
    localStorage.removeItem('user_profile');
    localStorage.removeItem('auth_token');
  };

  const unlockCourse = (courseId: string, price: number) => {
    if (unlockedCourses.includes(courseId)) {
      return true;
    }
    
    if (diamonds >= price) {
      const newDiamonds = diamonds - price;
      const newUnlocked = [...unlockedCourses, courseId];
      
      setDiamonds(newDiamonds);
      setUnlockedCourses(newUnlocked);
      
      localStorage.setItem('user_diamonds', newDiamonds.toString());
      localStorage.setItem('user_unlocked_courses', JSON.stringify(newUnlocked));
      return true;
    } else {
      const msgs = {
        english: "Not enough diamonds!",
        bahasa: "Berlian tidak mencukupi!",
        mandarin: "钻石不足！"
      };
      toast.error(msgs[language] || msgs.english);
      return false;
    }
  };

  const hasUnlocked = (courseId: string) => {
    return unlockedCourses.includes(courseId);
  };

  return (
    <UserContext.Provider value={{ 
      diamonds, 
      userProfile, 
      unlockedCourses, 
      unlockCourse, 
      hasUnlocked,
      login,
      logout,
      updateProfilePic
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
