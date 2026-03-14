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
      case 'SIGNUP': return <UserPlus className="h-4 w-4 text-blue-400" />;
      case 'DONATION': return <Heart className="h-4 w-4 text-rose-400" />;
      case 'COMMENT': return <MessageSquare className="h-4 w-4 text-amber-400" />;
      case 'PRAYER': return <Target className="h-4 w-4 text-emerald-400" />;
      case 'FORUM': return <Zap className="h-4 w-4 text-purple-400" />;
      default: return <Zap className="h-4 w-4 text-amber-400" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'SIGNUP': return 'bg-blue-500/10 border-blue-500/20';
      case 'DONATION': return 'bg-rose-500/10 border-rose-500/20';
      case 'COMMENT': return 'bg-amber-500/10 border-amber-500/20';
      case 'PRAYER': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'FORUM': return 'bg-purple-500/10 border-purple-500/20';
      default: return 'bg-amber-500/10 border-amber-500/20';
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          Live Engagement
        </h3>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Now</span>
        </div>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-all cursor-default group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getBgColor(event.type)}`}>
              {getIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-white font-bold text-sm truncate">{event.user}</p>
                <span className="text-[10px] text-gray-500 font-medium">{event.time}</span>
              </div>
              <p className="text-gray-400 text-xs line-clamp-1 group-hover:text-gray-300 transition-colors">{event.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-6 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-gray-400 text-xs font-bold hover:bg-white/[0.08] hover:text-white transition-all uppercase tracking-widest">
        View Activity Logs
      </button>
    </div>
  );
};

export default LiveEngagementFeed;
