'use client';

import { useEffect, useState } from 'react';
import { Activity, getActivities, isDiaperAlertActive } from '@/lib/supabase';
import ActivityInput from '@/components/ActivityInput';
import ActivityList from '@/components/ActivityList';
import DiaperAlert from '@/components/DiaperAlert';
import WeeklySummary from '@/components/WeeklySummary';
import Header from '@/components/Header';

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setShowAlert(isDiaperAlertActive(activities));
  }, [activities]);

  async function loadActivities() {
    try {
      const data = await getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleActivityAdded(activity: Activity) {
    setActivities([activity, ...activities]);
  }

  async function handleActivityDeleted(id: string) {
    setActivities(activities.filter((a) => a.id !== id));
  }

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #1a1a1a, #004C54, #1a1a1a)' }}>
      {/* Eagles Background Watermark */}
      <div className="fixed inset-0 opacity-5 pointer-events-none text-center flex items-center justify-center">
        <div className="text-9xl font-black" style={{ fontSize: '500px', fontWeight: 'bold' }}>
          🦅
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Header />
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
          {/* Alert */}
          {showAlert && <DiaperAlert lastDiaperTime={activities.find((a) => a.type === 'diaper')?.timestamp} />}

          {/* Input Section - Full Width */}
          <div>
            <ActivityInput onActivityAdded={handleActivityAdded} activities={activities} />
          </div>

          {/* Activity List - Full Width at Bottom */}
          <div>
            {loading ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Loading activities...
              </div>
            ) : (
              <ActivityList
                activities={activities}
                onActivityDeleted={handleActivityDeleted}
              />
            )}
          </div>

          <WeeklySummary activities={activities} />
        </div>
      </div>
    </main>
  );
}
