// src/context/BirthdayContext.tsx
import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

export interface Birthday {
  id: string;
  name: string;
  dateOfBirth: string;
  age: {
    years: number;
    months: number;
    days: number;
  };
  nextBirthday: {
    date: string;
    daysUntil: number;
  };
}

interface BirthdayContextType {
  birthdays: Birthday[];
  addBirthday: (birthday: Omit<Birthday, 'id'>) => Promise<void>;
  removeBirthday: (id: string) => Promise<void>;
  updateBirthdays: () => Promise<void>;
}

const BirthdayContext = createContext<BirthdayContextType | undefined>(undefined);

interface BirthdayProviderProps {
  children: ReactNode;
}

export const BirthdayProvider: React.FC<BirthdayProviderProps> = ({children}) => {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);

  useEffect(() => {
    loadBirthdays();
    // Initialize notification service
    NotificationService.initialize();
  }, []);

  const loadBirthdays = async () => {
    try {
      const savedBirthdays = await AsyncStorage.getItem('birthdays');
      if (savedBirthdays) {
        const parsedBirthdays = JSON.parse(savedBirthdays);
        // Recalculate ages and next birthdays when loading
        const updatedBirthdays = parsedBirthdays.map((birthday: Birthday) => ({
          ...birthday,
          age: calculateAge(birthday.dateOfBirth),
          nextBirthday: calculateNextBirthday(birthday.dateOfBirth),
        }));
        setBirthdays(updatedBirthdays);
        
        // Update notifications for all birthdays
        NotificationService.updateAllBirthdayNotifications(updatedBirthdays);
      }
    } catch (error) {
      console.log('Error loading birthdays:', error);
    }
  };

  const saveBirthdays = async (birthdaysToSave: Birthday[]) => {
    try {
      await AsyncStorage.setItem('birthdays', JSON.stringify(birthdaysToSave));
    } catch (error) {
      console.log('Error saving birthdays:', error);
    }
  };

  const addBirthday = async (birthday: Omit<Birthday, 'id'>) => {
    const newBirthday: Birthday = {
      ...birthday,
      id: Date.now().toString(),
    };
    const updatedBirthdays = [...birthdays, newBirthday];
    setBirthdays(updatedBirthdays);
    await saveBirthdays(updatedBirthdays);
    
    // Schedule notifications for the new birthday
    NotificationService.scheduleBirthdayNotifications(newBirthday);
  };

  const removeBirthday = async (id: string) => {
    // Cancel notifications for the birthday being removed
    NotificationService.cancelBirthdayNotifications(id);
    
    const updatedBirthdays = birthdays.filter(birthday => birthday.id !== id);
    setBirthdays(updatedBirthdays);
    await saveBirthdays(updatedBirthdays);
  };

  const updateBirthdays = async () => {
    const updatedBirthdays = birthdays.map(birthday => ({
      ...birthday,
      age: calculateAge(birthday.dateOfBirth),
      nextBirthday: calculateNextBirthday(birthday.dateOfBirth),
    }));
    setBirthdays(updatedBirthdays);
    await saveBirthdays(updatedBirthdays);
    
    // Update notifications for all birthdays
    NotificationService.updateAllBirthdayNotifications(updatedBirthdays);
  };

  return (
    <BirthdayContext.Provider value={{
      birthdays,
      addBirthday,
      removeBirthday,
      updateBirthdays,
    }}>
      {children}
    </BirthdayContext.Provider>
  );
};

export const useBirthday = (): BirthdayContextType => {
  const context = useContext(BirthdayContext);
  if (!context) {
    throw new Error('useBirthday must be used within a BirthdayProvider');
  }
  return context;
};

// Utility functions for age calculation
export const calculateAge = (dateOfBirth: string) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
};

export const calculateNextBirthday = (dateOfBirth: string) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  const diffTime = nextBirthday.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    date: nextBirthday.toDateString(),
    daysUntil: daysUntil === 0 ? 0 : daysUntil,
  };
};