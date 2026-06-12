'use client';

import { Activity, deleteActivity } from '@/lib/supabase';
import { useState } from 'react';

interface ActivityListProps {
  activities: Activity[];
  onActivityDeleted: (id: string) => void;
}

export default function ActivityList({ activities, onActivityDeleted }: ActivityListProps) {
  const [expandedDate, setExpandedDate] = useState<string>('Today');

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this activity?')) return;

    try {
      await deleteActivity(id);
      onActivityDeleted(id);
    } catch (error) {
      console.error('Failed to delete activity:', error);
      alert('Failed to delete activity');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getActivityEmoji = (activity: Activity) => {
    switch (activity.type) {
      case 'diaper':
        return activity.diaperType === 'poop' ? '💩' : activity.diaperType === 'dry' ? '✨' : '💧';
      case 'feeding':
        return '🍼';
      case 'sleep':
        return '😴';
      case 'food':
        return '🍽️';
      case 'other':
        return '📝';
      case 'injury':
        return '🩹';
      case 'clockIn':
        return '🕐';
      case 'clockOut':
        return '🚪';
      default:
        return '📌';
    }
  };

  const getActivityLabel = (activity: Activity) => {
    switch (activity.type) {
      case 'diaper':
        return `Diaper - ${activity.diaperType ? activity.diaperType.charAt(0).toUpperCase() + activity.diaperType.slice(1) : 'Unknown'}`;
      case 'feeding':
        return `Feeding ${activity.amount ? `- ${activity.amount} oz` : ''}`;
      case 'sleep':
        return 'Sleep/Nap';
      case 'food':
        return `Food - ${activity.description || 'Unknown'}`;
      case 'other':
        return `Other - ${activity.description || 'Activity'}`;
      case 'injury':
        return `Injury - ${activity.description || 'Unknown'}`;
      case 'clockIn':
        return 'Clocked In';
      case 'clockOut':
        return 'Clocked Out';
      default:
        return 'Activity';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center shadow-lg border-l-4" style={{ borderColor: '#004C54' }}>
        <div className="text-4xl mb-2">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No activities logged yet</h3>
        <p className="text-gray-600">Start by logging an activity above</p>
      </div>
    );
  }

  // Group activities by date
  const groupedActivities: Record<string, Activity[]> = {};
  activities.forEach((activity) => {
    const dateKey = formatDate(activity.timestamp);
    if (!groupedActivities[dateKey]) {
      groupedActivities[dateKey] = [];
    }
    groupedActivities[dateKey].push(activity);
  });

  // Sort dates with Today first
  const sortedDates = Object.keys(groupedActivities).sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    return b.localeCompare(a);
  });

  return (
    <div className="space-y-3">
      {sortedDates.map((date) => {
        const dayActivities = groupedActivities[date];
        const isExpanded = expandedDate === date;

        return (
          <div key={date} className="rounded-lg overflow-hidden shadow-lg border" style={{ borderColor: '#004C54' }}>
            {/* Accordion Header */}
            <button
              onClick={() => setExpandedDate(isExpanded ? '' : date)}
              className="w-full px-6 py-4 text-left font-bold text-white transition flex items-center justify-between hover:shadow-md"
              style={{ background: '#004C54' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#003d46')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#004C54')}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="text-lg">{date}</div>
                  <div className="text-sm opacity-75">{dayActivities.length} activities</div>
                </div>
              </div>
              <span className="text-2xl transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </button>

            {/* Accordion Content - 3-Column Grid */}
            {isExpanded && (
              <div className="bg-gray-50 p-6">
                {dayActivities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No activities for this day</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dayActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="bg-white rounded-lg p-4 shadow-md border-l-4 transition hover:shadow-lg"
                        style={{ borderColor: '#004C54' }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="text-3xl mt-1">{getActivityEmoji(activity)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 break-words">{getActivityLabel(activity)}</p>
                              <p className="text-sm text-gray-500 mt-1 font-medium">{formatTime(activity.timestamp)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="px-2 py-1 text-red-500 hover:bg-red-50 rounded transition text-sm flex-shrink-0 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
