'use client';

import { Activity } from '@/lib/supabase';
import { useState } from 'react';

interface WeeklySummaryProps {
  activities: Activity[];
}

export default function WeeklySummary({ activities }: WeeklySummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get last 7 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  };

  // Calculate hours for a specific day
  const getHoursForDay = (dayStart: Date) => {
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayActivities = activities.filter((a) => {
      const actDate = new Date(a.timestamp);
      return actDate >= dayStart && actDate < dayEnd;
    });

    const clockIn = dayActivities.find((a) => a.type === 'clockIn');
    const clockOut = dayActivities.find((a) => a.type === 'clockOut');

    if (!clockIn || !clockOut) return null;

    const inTime = new Date(clockIn.timestamp);
    const outTime = new Date(clockOut.timestamp);
    const hours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);

    return {
      hours: hours.toFixed(2),
      inTime,
      outTime,
    };
  };

  // Calculate weekly totals
  const days = getLast7Days();
  const dayData = days.map((day) => ({
    date: day,
    hours: getHoursForDay(day),
  }));

  const totalHours = dayData.reduce((sum, day) => {
    return sum + (day.hours ? parseFloat(day.hours.hours) : 0);
  }, 0);

  // Count activities
  const diaperChanges = activities.filter((a) => a.type === 'diaper').length;
  const feedings = activities.filter((a) => a.type === 'bottle').length;
  const naps = activities.filter((a) => a.type === 'sleep').length;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition active:scale-95 z-40 border-4"
        style={{ background: 'linear-gradient(to bottom right, #004C54, #003d46)', borderColor: '#A5ACAF' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(to bottom right, #003d46, #002d32)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(to bottom right, #004C54, #003d46)')}
        title="View weekly summary"
      >
        <span className="text-2xl">📊</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border-4" style={{ borderColor: '#004C54' }}>
        {/* Header */}
        <div className="text-white p-6 sticky top-0" style={{ background: 'linear-gradient(to right, #004C54, #003d46)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📊 Weekly Summary</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 font-semibold" style={{ color: '#A5ACAF' }}>
            {formatDate(days[0])} - {formatDate(days[6])}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Total Hours Card */}
          <div className="rounded-lg p-6 border-4 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)', borderColor: '#004C54' }}>
            <div className="text-center">
              <p className="text-sm font-bold mb-2 uppercase tracking-wider" style={{ color: '#004C54' }}>Total Hours This Week</p>
              <p className="text-6xl font-black" style={{ color: '#004C54' }}>{totalHours.toFixed(2)}</p>
              <p className="text-xs mt-2 font-semibold" style={{ color: '#004C54' }}>
                Care Taker hours
              </p>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div>
            <h3 className="text-lg font-bold mb-3 uppercase tracking-wider" style={{ color: '#004C54' }}>📅 Daily Breakdown</h3>
            <div className="space-y-2">
              {dayData.map((day, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg transition border-l-4 ${
                    day.hours
                      ? 'bg-blue-50'
                      : 'bg-gray-100'
                  }`}
                  style={{ borderColor: day.hours ? '#004C54' : '#999999' }}
                >
                  <div>
                    <p className="font-bold text-gray-900">{formatDate(day.date)}</p>
                    {day.hours && (
                      <p className="text-xs text-gray-600">
                        {day.hours.inTime.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} -{' '}
                        {day.hours.outTime.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {day.hours ? (
                      <p className="text-lg font-black" style={{ color: '#004C54' }}>{day.hours.hours}h</p>
                    ) : (
                      <p className="text-sm text-gray-500">No hours</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-yellow-50 rounded-lg p-4 text-center border-2 border-yellow-600 shadow">
              <p className="text-3xl mb-1">💩</p>
              <p className="text-3xl font-black text-yellow-700">{diaperChanges}</p>
              <p className="text-xs text-gray-700 mt-1 font-semibold">Diapers</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-600 shadow">
              <p className="text-3xl mb-1">🍼</p>
              <p className="text-3xl font-black text-blue-700">{feedings}</p>
              <p className="text-xs text-gray-700 mt-1 font-semibold">Feedings</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center border-2 border-purple-600 shadow">
              <p className="text-3xl mb-1">😴</p>
              <p className="text-3xl font-black text-purple-700">{naps}</p>
              <p className="text-xs text-gray-700 mt-1 font-semibold">Naps</p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2 pt-4 border-t-2 border-gray-300">
            <button
              onClick={() => {
                // Generate CSV
                let csv = 'Date,In Time,Out Time,Hours\n';
                dayData.forEach((day) => {
                  if (day.hours) {
                    csv += `${formatDate(day.date)},${day.hours.inTime.toLocaleTimeString()},${day.hours.outTime.toLocaleTimeString()},${day.hours.hours}\n`;
                  }
                });
                csv += `\nTotal,,,${totalHours.toFixed(2)}\n`;

                // Download CSV
                const element = document.createElement('a');
                element.setAttribute(
                  'href',
                  `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
                );
                element.setAttribute('download', `weekly-summary-${new Date().toISOString().split('T')[0]}.csv`);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="flex-1 py-2 px-4 text-white rounded-lg font-bold transition border-2"
              style={{ background: '#004C54', borderColor: '#003d46' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#003d46')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#004C54')}
            >
              📥 Download CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-800 transition border-2 border-gray-900"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
