'use client';

import { useState, useEffect } from 'react';

interface DiaperAlertProps {
  lastDiaperTime?: string;
}

export default function DiaperAlert({ lastDiaperTime }: DiaperAlertProps) {
  const [timeSince, setTimeSince] = useState('');

  useEffect(() => {
    const updateTimeSince = () => {
      if (!lastDiaperTime) {
        setTimeSince('Never');
        return;
      }

      const now = new Date();
      const lastTime = new Date(lastDiaperTime);
      const diff = now.getTime() - lastTime.getTime();
      const minutes = Math.floor(diff / 60000);

      if (minutes < 1) {
        setTimeSince('just now');
      } else if (minutes < 60) {
        setTimeSince(`${minutes}m ago`);
      } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        setTimeSince(`${hours}h ${mins}m ago`);
      }
    };

    updateTimeSince();
    const interval = setInterval(updateTimeSince, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [lastDiaperTime]);

  return (
    <div className="mb-6 p-4 bg-red-100 border-4 border-red-600 rounded-lg shadow-lg">
      <div className="flex items-start gap-3">
        <span className="text-3xl animate-bounce">⚠️</span>
        <div className="flex-1">
          <h3 className="font-bold text-red-900 text-lg">🚨 DIAPER CHECK ALERT!</h3>
          <p className="text-red-800 mt-1 font-medium">
            No diaper logged in 30+ minutes. Last check: <span className="font-bold text-red-700">{timeSince}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
