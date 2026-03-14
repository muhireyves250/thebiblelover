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

    const filteredEvents = events.filter(e => filter === 'ALL' || e.type === filter);
    const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= new Date());
    const pastEvents = filteredEvents.filter(e => new Date(e.date) < new Date());

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'STUDY': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'WORSHIP': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'COMMUNITY': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <SEO 
                title="Events Calendar" 
                description="Join our upcoming Bible studies, worship sessions, and community gatherings. Find out what's happening at The Bible Lover."
            />
            <PageHeader
                title="Community Calendar"
                subtitle="Join us as we grow together in faith, knowledge, and fellowship."
                bgImage="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=2000"
            />

            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-16">
                    <div className="flex p-1 bg-white border border-gray-200 rounded-2xl shadow-sm">
                        {(['ALL', 'STUDY', 'WORSHIP', 'COMMUNITY'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === t
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {t === 'ALL' ? 'All Events' : t.charAt(0) + t.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <div className="relative group w-full md:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="bg-white rounded-[2rem] h-[400px] animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900">No events found</h3>
                        <p className="text-gray-500 mt-2">Adjust your filters or check back later.</p>
                    </div>
                ) : (
                    <div className="space-y-24">
                        {/* Upcoming Section */}
                        {upcomingEvents.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-10">
                                    <h2 className="text-3xl font-bold text-gray-900">Upcoming Gatherings</h2>
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {upcomingEvents.map((event) => (
                                        <EventCard key={event.id} event={event} getTypeColor={getTypeColor} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Past Section */}
                        {pastEvents.length > 0 && (
                            <section className="opacity-75 grayscale-[0.5]">
                                <div className="flex items-center gap-4 mb-10">
                                    <h2 className="text-3xl font-bold text-gray-600">Past Events</h2>
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {pastEvents.map((event) => (
                                        <EventCard key={event.id} event={event} getTypeColor={getTypeColor} isPast />
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

const EventCard = ({ event, getTypeColor, isPast }: { event: Event, getTypeColor: any, isPast?: boolean }) => {
    const date = new Date(event.date);

    return (
        <Link
            to={`/events/${event.id}`}
            className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
        >
            <div className="relative h-56 overflow-hidden">
                <img
                    src={event.thumbnail || "https://images.unsplash.com/photo-1544427928-c49dd24428c8?auto=format&fit=crop&q=80&w=800"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getTypeColor(event.type)}`}>
                        {event.type}
                    </span>
                </div>
                {!isPast && (
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-xl border border-white/20">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-0.5 leading-none">Joined</p>
                        <p className="text-base font-bold text-gray-900 leading-none">{event._count?.rsvps || 0}</p>
                    </div>
                )}
            </div>

            <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm mb-4">
                    <Calendar className="h-4 w-4" />
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    <span className="w-1 h-1 rounded-full bg-gray-300 mx-1"></span>
                    <Clock className="h-4 w-4" />
                    {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {event.title}
                </h3>

                <div className="flex items-center gap-2 text-gray-500 text-sm mb-8">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{event.location}</span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                                <Users className="h-4 w-4 text-gray-400" />
                            </div>
                        ))}
                        {event._count?.rsvps && event._count.rsvps > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center">
                                +{event._count.rsvps - 3}
                            </div>
                        )}
                    </div>
                    <span className="bg-gray-50 p-3 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all">
                        <ArrowRight className="h-5 w-5" />
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default Events;
