'use client';

import { useState } from 'react';
import { Activity, addActivity, isClockedIn, getTodayClockInTime } from '@/lib/supabase';

interface ActivityInputProps {
  onActivityAdded: (activity: Activity) => void;
  activities: Activity[];
}

function getEasternTime() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date()).replace('24:', '00:');
}

export default function ActivityInput({ onActivityAdded, activities }: ActivityInputProps) {
  const [activityType, setActivityType] = useState<'diaper' | 'bottle' | 'sleep' | 'food' | 'other' | 'medicine' | 'milestone'>('diaper');
  const [diaperType, setDiaperType] = useState<'wet' | 'dry' | 'poop'>('wet');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState(getEasternTime);
  const [loading, setLoading] = useState(false);
  const [clockLoading, setClockLoading] = useState(false);

  const clockedIn = isClockedIn(activities);
  const clockInTime = getTodayClockInTime(activities);

  const handleQuickClockInOut = async (action: 'in' | 'out') => {
    setClockLoading(true);
    try {
      const newActivity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> = {
        timestamp: new Date().toISOString(),
        type: action === 'in' ? 'clockIn' : 'clockOut',
      };

      const activity = await addActivity(newActivity);
      onActivityAdded(activity);
    } catch (error) {
      console.error('Failed to clock in/out:', error);
      alert('Failed to clock in/out');
    } finally {
      setClockLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const [hours, minutes] = time.split(':');
      const etDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); // YYYY-MM-DD
      const etOffsetMatch = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', timeZoneName: 'shortOffset' }).match(/GMT([+-])(\d{1,2})/);
      const etOffset = etOffsetMatch ? `${etOffsetMatch[1]}${etOffsetMatch[2].padStart(2, '0')}` : '-05';
      const timestamp = new Date(`${etDate}T${hours.padStart(2, '0')}:${minutes}:00${etOffset}:00`);

      const newActivity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> = {
        timestamp: timestamp.toISOString(),
        type: activityType,
        ...(activityType === 'diaper' && { diaperType }),
        ...(activityType === 'bottle' && amount && { amount: parseFloat(amount), unit: 'oz' }),
        ...(description && { description }),
      };

      const activity = await addActivity(newActivity);
      onActivityAdded(activity);

      // Reset form
      setAmount('');
      setDescription('');
      setTime(getEasternTime());
      setActivityType('diaper' as const);
      setDiaperType('wet');
    } catch (error) {
      console.error('Failed to add activity:', error);
      alert('Failed to add activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Clock In/Out Section */}
      <div className="rounded-lg shadow-lg p-6 border-4" style={{ background: 'linear-gradient(to bottom right, #004C54, #003d46)', borderColor: '#A5ACAF' }}>
        <div className="space-y-3">
          {clockInTime && (
            <p className="text-sm font-semibold" style={{ color: '#A5ACAF' }}>
              Clocked in: <span className="font-bold text-white">{clockInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickClockInOut('in')}
              disabled={clockLoading || clockedIn}
              className="flex-1 py-3 px-4 rounded-lg font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 border-2"
              style={clockedIn ? { background: '#999999' } : { background: '#004C54', borderColor: '#A5ACAF' }}
              onMouseEnter={(e) => !clockedIn && (e.currentTarget.style.background = '#003d46')}
              onMouseLeave={(e) => !clockedIn && (e.currentTarget.style.background = '#004C54')}
            >
              {clockLoading ? '⏳' : '🕐'} Clock In
            </button>
            <button
              type="button"
              onClick={() => handleQuickClockInOut('out')}
              disabled={clockLoading || !clockedIn}
              className="flex-1 py-3 px-4 rounded-lg font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 border-2"
              style={!clockedIn ? { background: '#999999' } : { background: '#A5ACAF', borderColor: '#004C54' }}
              onMouseEnter={(e) => clockedIn && (e.currentTarget.style.background = '#8e9499')}
              onMouseLeave={(e) => clockedIn && (e.currentTarget.style.background = '#A5ACAF')}
            >
              {clockLoading ? '⏳' : '🚪'} Clock Out
            </button>
          </div>
        </div>
      </div>

      {/* Activity Logging Section */}
      <div className="bg-white rounded-lg shadow p-6 sticky top-4 border-l-4" style={{ borderColor: '#004C54' }}>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Log Activity</h2>

        {/* Activity Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(['diaper', 'bottle', 'sleep', 'food', 'other', 'medicine', 'milestone'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActivityType(type)}
                className={`py-2 px-3 rounded-lg font-medium text-sm transition text-white`}
                style={activityType === type ? { background: '#004C54' } : { background: '#e5e7eb', color: '#374151' }}
                onMouseEnter={(e) => activityType !== type && (e.currentTarget.style.background = '#d1d5db')}
                onMouseLeave={(e) => activityType !== type && (e.currentTarget.style.background = '#e5e7eb')}
              >
                {type === 'diaper' && '💩'}
                {type === 'bottle' && '🍼'}
                {type === 'sleep' && '😴'}
                {type === 'food' && '🍽️'}
                {type === 'other' && '📝'}
                {type === 'medicine' && '💊'}
                {type === 'milestone' && '🌟'}
                {' ' + type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Diaper Type */}
        {activityType === 'diaper' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Diaper Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['wet', 'dry', 'poop'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDiaperType(type)}
                  className="py-2 px-3 rounded-lg font-medium text-sm transition"
                  style={diaperType === type ? { background: '#004C54', color: '#fff' } : { background: '#e5e7eb', color: '#374151' }}
                  onMouseEnter={(e) => diaperType !== type && (e.currentTarget.style.background = '#d1d5db')}
                  onMouseLeave={(e) => diaperType !== type && (e.currentTarget.style.background = '#e5e7eb')}
                >
                  {type === 'wet' && '💧 Wet'}
                  {type === 'dry' && '✨ Dry'}
                  {type === 'poop' && '💩 Poop'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amount for Feeding */}
        {activityType === 'bottle' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (oz)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}

        {/* Description */}
        {(activityType === 'food' || activityType === 'other' || activityType === 'medicine' || activityType === 'milestone') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activityType === 'medicine' ? 'Medicine Name' : activityType === 'milestone' ? 'Milestone' : 'Description'}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={activityType === 'medicine' ? 'e.g., Tylenol 2.5ml' : activityType === 'milestone' ? 'e.g., first smile' : 'e.g., oatmeal with banana'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#004C54' } as React.CSSProperties}
            />
          </div>
        )}

        {/* Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const d = new Date(`1970-01-01T${time}`);
                d.setMinutes(d.getMinutes() - 5);
                setTime(d.toTimeString().slice(0, 5));
              }}
              className="px-3 py-2 rounded-lg font-bold text-white border-2 active:scale-95 transition"
              style={{ background: '#004C54', borderColor: '#003d46' }}
            >
              −5
            </button>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-center text-lg font-semibold"
            />
            <button
              type="button"
              onClick={() => {
                const d = new Date(`1970-01-01T${time}`);
                d.setMinutes(d.getMinutes() + 5);
                setTime(d.toTimeString().slice(0, 5));
              }}
              className="px-3 py-2 rounded-lg font-bold text-white border-2 active:scale-95 transition"
              style={{ background: '#004C54', borderColor: '#003d46' }}
            >
              +5
            </button>
            <button
              type="button"
              onClick={() => setTime(getEasternTime())}
              className="px-3 py-2 rounded-lg font-bold text-white border-2 active:scale-95 transition text-sm"
              style={{ background: '#A5ACAF', borderColor: '#004C54', color: '#1a1a1a' }}
            >
              Now
            </button>
          </div>
        </div>

        {/* Submit Button */}
          <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: '#004C54' }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#003d46')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#004C54')}>
            {loading ? 'Saving...' : '➕ Log Activity'}
        </button>
      </div>
    </form>
  );
}
