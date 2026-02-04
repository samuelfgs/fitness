import React from 'react';
import { Activity } from '@/lib/types';
import { ACTIVITY_ICONS, ACTIVITY_COLORS } from '@/lib/constants';
import { format } from 'date-fns';

interface ActivityCardProps {
  activity: Activity;
  onDelete?: (id: string) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onDelete }) => {
  const Icon = ACTIVITY_ICONS[activity.type];
  const colorClass = ACTIVITY_COLORS[activity.type];

  return (
    <div className="bg-card rounded-3xl p-5 shadow-sm border border-border flex items-center justify-between mb-3">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-2xl ${colorClass}`}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className="font-bold text-card-foreground">{activity.type}</h3>
          <p className="text-xs text-muted-foreground font-medium">
            {format(new Date(activity.date), 'MMM d, h:mm a')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-black text-card-foreground text-lg">{activity.durationMinutes} min</p>
        {activity.caloriesBurned && (
          <p className="text-xs text-orange-500 font-bold">{activity.caloriesBurned} kcal</p>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;