'use client';

import { useEffect, useState } from 'react';

export default function Header() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-white shadow-2xl border-b-4" style={{ background: 'linear-gradient(to right, #004C54, #1a1a1a, #004C54)', borderColor: '#A5ACAF' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl md:text-6xl font-black flex items-center gap-3 drop-shadow-lg">
              🦅 James Activity Tracker
            </h1>
            <p className="text-2xl md:text-3xl mt-2 font-black tracking-wider" style={{ color: '#A5ACAF' }}>
              🎉 GO BIRDS! 🎉
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl md:text-6xl font-black font-mono rounded-lg p-4 border-4 shadow-lg" style={{ background: 'rgba(0, 76, 84, 0.8)', borderColor: '#A5ACAF' }}>
              {time || '⏳'}
            </div>
            <p className="text-sm md:text-base mt-3 font-semibold" style={{ color: '#A5ACAF' }}>{date}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
