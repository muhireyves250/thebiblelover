import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Heart, MessageSquare, Target, Zap } from 'lucide-react';

interface EngagementEvent {
  id: string;
  type: 'SIGNUP' | 'DONATION' | 'COMMENT' | 'PRAYER';
  user: string;
  detail: string;
  time: string;
}

import { activityAPI } from '../services/api';

const LiveEngagementFeed: React.FC = () => {
  const [events, setEvents] = React.useState<EngagementEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await activityAPI.getRecent(5);
        if (response.success && response.data?.activity) {
          setEvents(response.data.activity);
        }
      } catch (err) {
        console.error('Failed to fetch activity:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'SIGNUP': return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'DONATION': return <Heart className="h-4 w-4 text-rose-600" />;
      case 'COMMENT': return <MessageSquare className="h-4 w-4 text-amber-700" />;
      case 'PRAYER': return <Target className="h-4 w-4 text-emerald-600" />;
      default: return <Zap className="h-4 w-4 text-amber-700" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'SIGNUP': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'DONATION': return 'bg-rose-50 dark:bg-rose-900/20';
      case 'COMMENT': return 'bg-amber-50 dark:bg-amber-900/20';
      case 'PRAYER': return 'bg-emerald-50 dark:bg-emerald-900/20';
      default: return 'bg-amber-50 dark:bg-amber-900/20';
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="bg-white dark:bg-[#141417] border border-gray-400 dark:border-white/20 rounded-lg shadow-sm p-5 md:p-6 h-full animate-pulse">
        <div className="h-4 w-32 bg-gray-100 dark:bg-white/10 rounded mb-4" />
        <div className="space-y-2.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 p-3 rounded-md">
              <div className="w-9 h-9 rounded-md bg-gray-100 dark:bg-white/10 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 bg-gray-100 dark:bg-white/10 rounded" />
                <div className="h-2.5 w-3/4 bg-gray-100 dark:bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#141417] border border-gray-400 dark:border-white/20 rounded-lg shadow-sm p-5 md:p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-700" />
          Live Engagement
        </h3>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No recent activity.</p>
      ) : (
        <div className="space-y-2.5">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex gap-3 p-3 rounded-md bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${getBgColor(event.type)}`}>
                {getIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-gray-900 dark:text-white font-bold text-sm truncate">{event.user}</p>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium shrink-0">{event.time}</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-1">{event.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveEngagementFeed;
