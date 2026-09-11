import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventAPI } from '../services/api';
import type { Event } from '../services/api.d';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';

const Events = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'STUDY' | 'WORSHIP' | 'COMMUNITY'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const response = await eventAPI.getEvents();
            if (response.success && response.data) {
                setEvents(response.data);
            }
        } catch (err) {
            console.error('Failed to load events:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events
        .filter(e => filter === 'ALL' || e.type === filter)
        .filter(e => e.title.toLowerCase().includes(searchQuery.trim().toLowerCase()));
    const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= new Date());
    const pastEvents = filteredEvents.filter(e => new Date(e.date) < new Date());

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="Events Calendar"
                description="Join our upcoming Bible studies, worship sessions, and community gatherings. Find out what's happening at The Bible Lover."
            />
            <PageHeader
                title="Community Calendar"
                subtitle="Join us as we grow together in faith, knowledge, and fellowship."
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
                    <div className="flex flex-wrap gap-2">
                        {(['ALL', 'STUDY', 'WORSHIP', 'COMMUNITY'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border transition-colors ${filter === t
                                    ? 'bg-amber-700 text-white border-amber-700'
                                    : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                {t === 'ALL' ? 'All Events' : t.charAt(0) + t.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search events..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="bg-white border border-gray-300 rounded-lg shadow-sm h-[380px] animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No events found</h3>
                        <p className="text-gray-500 text-sm mt-1">Adjust your filters or check back later.</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* Upcoming Section */}
                        {upcomingEvents.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="w-1 h-4 bg-amber-700 rounded-sm" />
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Upcoming Gatherings</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {upcomingEvents.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Past Section */}
                        {pastEvents.length > 0 && (
                            <section className="opacity-75">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="w-1 h-4 bg-gray-400 rounded-sm" />
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Past Events</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {pastEvents.map((event) => (
                                        <EventCard key={event.id} event={event} isPast />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const EventCard = ({ event, isPast }: { event: Event, isPast?: boolean }) => {
    const date = new Date(event.date);

    return (
        <Link
            to={`/events/${event.id}`}
            className="group bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden hover:border-gray-400 hover:shadow-md transition-all flex flex-col h-full"
        >
            <div className="relative h-44 overflow-hidden">
                <img
                    src={event.thumbnail || "https://images.unsplash.com/photo-1544427928-c49dd24428c8?auto=format&fit=crop&q=80&w=800"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-sm">
                        {event.type}
                    </span>
                </div>
                {!isPast && (
                    <div className="absolute bottom-3 right-3 bg-black/70 px-3 py-1.5 rounded text-white">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300 leading-none mb-0.5">Joined</p>
                        <p className="text-sm font-bold leading-none">{event._count?.rsvps || 0}</p>
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-3">
                    <Calendar className="h-3.5 w-3.5" />
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <Clock className="h-3.5 w-3.5" />
                    {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-amber-700 transition-colors line-clamp-2">
                    {event.title}
                </h3>

                <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{event.location}</span>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                                <Users className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                        ))}
                        {event._count?.rsvps && event._count.rsvps > 3 && (
                            <div className="w-7 h-7 rounded-full border-2 border-white bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center">
                                +{event._count.rsvps - 3}
                            </div>
                        )}
                    </div>
                    <span className="p-2 border border-gray-200 rounded-full text-gray-400 group-hover:bg-amber-700 group-hover:border-amber-700 group-hover:text-white transition-colors">
                        <ArrowRight className="h-4 w-4" />
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default Events;
