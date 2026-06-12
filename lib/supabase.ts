import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Demo mode for local development without Supabase
const isDemoMode = !supabaseUrl || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Only create Supabase client if we have valid credentials
export const supabase = !isDemoMode ? createClient(supabaseUrl, supabaseAnonKey) : null;

export interface Activity {
  id: string;
  timestamp: string;
  type: 'diaper' | 'feeding' | 'sleep' | 'food' | 'other' | 'clockIn' | 'clockOut' | 'injury';
  diaperType?: 'wet' | 'dry' | 'poop';
  amount?: number;
  unit?: 'oz' | 'ml';
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Demo data storage (localStorage for now)
const DEMO_STORAGE_KEY = 'nanny_activities';

export async function getActivities(): Promise<Activity[]> {
  if (isDemoMode) {
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  if (!supabase) return [];

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addActivity(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> {
  const newActivity: Activity = {
    ...activity,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isDemoMode) {
    try {
      const activities = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || '[]');
      activities.unshift(newActivity);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(activities));
      return newActivity;
    } catch {
      return newActivity;
    }
  }

  if (!supabase) return newActivity;

  const { data, error } = await supabase
    .from('activities')
    .insert([newActivity])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteActivity(id: string): Promise<void> {
  if (isDemoMode) {
    try {
      let activities = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || '[]');
      activities = activities.filter((a: Activity) => a.id !== id);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(activities));
    } catch {
      // ignore
    }
    return;
  }

  if (!supabase) return;

  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function getLastDiaperTime(activities: Activity[]): Date | null {
  const lastDiaper = activities.find(
    (a) => a.type === 'diaper' && (a.diaperType === 'wet' || a.diaperType === 'poop')
  );
  return lastDiaper ? new Date(lastDiaper.timestamp) : null;
}

export function isDiaperAlertActive(activities: Activity[]): boolean {
  const lastDiaperTime = getLastDiaperTime(activities);
  if (!lastDiaperTime) return true;

  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
  return lastDiaperTime < thirtyMinutesAgo;
}

export function getTodayClockInTime(activities: Activity[]): Date | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const clockIn = activities.find((a) => {
    const activityDate = new Date(a.timestamp);
    activityDate.setHours(0, 0, 0, 0);
    return a.type === 'clockIn' && activityDate.getTime() === today.getTime();
  });
  
  return clockIn ? new Date(clockIn.timestamp) : null;
}

export function getTodayClockOutTime(activities: Activity[]): Date | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const clockOut = activities.find((a) => {
    const activityDate = new Date(a.timestamp);
    activityDate.setHours(0, 0, 0, 0);
    return a.type === 'clockOut' && activityDate.getTime() === today.getTime();
  });
  
  return clockOut ? new Date(clockOut.timestamp) : null;
}

export function isClockedIn(activities: Activity[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayActivities = activities.filter((a) => {
    const activityDate = new Date(a.timestamp);
    activityDate.setHours(0, 0, 0, 0);
    return activityDate.getTime() === today.getTime() && (a.type === 'clockIn' || a.type === 'clockOut');
  });
  
  if (todayActivities.length === 0) return false;
  
  const lastClockEvent = todayActivities[0];
  return lastClockEvent.type === 'clockIn';
}
