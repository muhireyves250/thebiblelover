import React from 'react';
import { Calendar, MapPin, Users, Trash2, Edit, Plus, Clock } from 'lucide-react';

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
    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => new Date(e.date) < new Date()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Events</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-bold">Manage gatherings & community events</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-md font-bold text-xs uppercase tracking-widest transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Event</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Upcoming</h3>
                    </div>

                    <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-3 space-y-3">
                        {upcomingEvents.map(event => (
                            <EventItem key={event.id} event={event} onEdit={() => onEdit(event)} onDelete={() => onDelete(event.id)} />
                        ))}
                        {upcomingEvents.length === 0 && (
                            <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">No upcoming events.</div>
                        )}
                    </div>
                </div>

                {/* Past */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Past Events</h3>
                    </div>

                    <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-3 space-y-3 opacity-75">
                        {pastEvents.map(event => (
                            <EventItem key={event.id} event={event} onEdit={() => onEdit(event)} onDelete={() => onDelete(event.id)} isPast />
                        ))}
                        {pastEvents.length === 0 && (
                            <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">No past events recorded.</div>
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
        <div className="p-3.5 rounded-lg border border-gray-200 dark:border-white/10 group hover:border-amber-300 dark:hover:border-amber-700/40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/10 flex-shrink-0 border border-gray-200 dark:border-white/10">
                    {event.thumbnail ? (
                        <img src={event.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{event.title}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 text-[9px] font-black uppercase tracking-widest">{event.type}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide flex-wrap">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{date.toLocaleDateString()}</span>
                        </span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{event.location}</span>
                        </span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1 text-amber-700">
                            <Users className="w-3 h-3" />
                            <span>{event._count?.rsvps || 0} RSVPs</span>
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                        onClick={onEdit}
                        className="p-2 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:text-amber-700 hover:border-amber-200 rounded-md transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
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
