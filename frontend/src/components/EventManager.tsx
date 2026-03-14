import React from 'react';
import { Calendar, MapPin, Users, Trash2, Edit, Plus, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    type: string;
    thumbnail?: string;
    _count?: {
        rsvps: number;
    };
}

interface EventManagerProps {
    events: Event[];
    onAdd: () => void;
    onEdit: (event: Event) => void;
    onDelete: (id: string) => void;
}

const EventManager: React.FC<EventManagerProps> = ({ events, onAdd, onEdit, onDelete }) => {
    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => new Date(e.date) < new Date()).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-serif font-black text-white">Event Hub</h2>
                    <p className="text-[10px] text-amber-500/70 font-black uppercase tracking-[0.2em]">Manage Gatherings & Communities</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center space-x-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-amber-600/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Orchestrate Event</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 px-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Upcoming Horizons</h3>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/5">
                        {upcomingEvents.map(event => (
                            <EventItem key={event.id} event={event} onEdit={() => onEdit(event)} onDelete={() => onDelete(event.id)} />
                        ))}
                        {upcomingEvents.length === 0 && (
                            <div className="p-8 text-center text-white/30 text-xs">No upcoming events.</div>
                        )}
                    </div>
                </div>

                {/* Past */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 px-2">
                        <Calendar className="w-4 h-4 text-white/40" />
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Legacy Echoes (Past)</h3>
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/5 grayscale">
                        {pastEvents.map(event => (
                            <EventItem key={event.id} event={event} onEdit={() => onEdit(event)} onDelete={() => onDelete(event.id)} isPast />
                        ))}
                        {pastEvents.length === 0 && (
                            <div className="p-8 text-center text-white/30 text-xs">No past events recorded.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const EventItem = ({ event, onEdit, onDelete }: { event: Event, onEdit: () => void, onDelete: () => void, isPast?: boolean }) => {
    const date = new Date(event.date);
    return (
        <div className="p-4 group hover:bg-white/5 transition-all">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 flex-shrink-0 border border-white/10">
                    {event.thumbnail ? (
                        <img src={event.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white/20" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-bold text-white truncate">{event.title}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[8px] font-black uppercase tracking-widest">{event.type}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px] text-white/40 font-medium tracking-wide">
                        <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{date.toLocaleDateString()}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{event.location}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1 text-amber-500">
                            <Users className="w-3 h-3" />
                            <span>{event._count?.rsvps || 0} RSVPs</span>
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-all"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventManager;
