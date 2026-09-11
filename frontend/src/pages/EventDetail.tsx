import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Share2, Heart, CheckCircle2, User as UserIcon, ExternalLink, X } from 'lucide-react';
import { eventAPI, authAPI } from '../services/api';
import type { Event } from '../services/api.d';

const EventDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [otherEvents, setOtherEvents] = useState<Event[]>([]);
    const [otherEventsLoading, setOtherEventsLoading] = useState(true);
    const [isRSVPed, setIsRSVPed] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showGuestForm, setShowGuestForm] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestSubmitting, setGuestSubmitting] = useState(false);
    const [guestError, setGuestError] = useState('');

    useEffect(() => {
        loadEvent();
        loadUser();
        if (id) setIsRSVPed(localStorage.getItem(`rsvped:${id}`) === '1');
    }, [id]);

    useEffect(() => {
        setOtherEventsLoading(true);
        eventAPI.getEvents().then((response) => {
            if (response.success && response.data) {
                setOtherEvents(response.data.filter((e) => e.id !== id).slice(0, 5));
            }
        }).finally(() => setOtherEventsLoading(false));
    }, [id]);

    const loadUser = async () => {
        try {
            const response = await authAPI.getProfile();
            if (response.success) {
                setCurrentUser(response.user);
            }
        } catch (err) {
            console.error('Failed to load user:', err);
        }
    };

    const loadEvent = async () => {
        if (!id) return;
        try {
            const response = await eventAPI.getEvent(id);
            if (response.success && response.data) {
                setEvent(response.data);
                // Check if current user is in RSVP list
                if (currentUser) {
                    setIsRSVPed(response.data.rsvps?.some((r: any) => r.id === currentUser.id) || false);
                }
            }
        } catch (err) {
            console.error('Failed to load event:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (event && currentUser) {
            setIsRSVPed(event.rsvps?.some((r: any) => r.id === currentUser.id) || false);
        }
    }, [event, currentUser]);

    const handleRSVP = async () => {
        if (!id) return;

        // A signed-in user's RSVP toggles server-side per account, no form
        // needed since we already have their name/email. A guest has to
        // fill in their details first, so open the form instead of calling
        // the API directly.
        if (!currentUser) {
            setShowGuestForm(true);
            return;
        }

        try {
            const response = await eventAPI.rsvp(id);
            if (response.success) {
                setIsRSVPed(response.rsvpStatus);
                loadEvent(); // Refresh to update count
            }
        } catch (err) {
            console.error('RSVP failed:', err);
        }
    };

    const handleGuestRSVP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setGuestSubmitting(true);
        setGuestError('');
        try {
            const response = await eventAPI.rsvp(id, { guestName, guestEmail });
            if (response.success) {
                localStorage.setItem(`rsvped:${id}`, '1');
                setIsRSVPed(true);
                setShowGuestForm(false);
                setGuestName('');
                setGuestEmail('');
                loadEvent();
            } else {
                setGuestError(response.message || 'Failed to RSVP. Please try again.');
            }
        } catch (err) {
            setGuestError('Failed to RSVP. Please try again.');
        } finally {
            setGuestSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <nav className="mb-6">
                        <span className="inline-block h-3 w-48 bg-gray-200 rounded animate-pulse" />
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <article className="lg:col-span-2">
                            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4" />
                                <div className="h-9 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
                                <div className="h-9 bg-gray-200 rounded animate-pulse w-1/2 mb-6" />
                                <div className="w-full h-64 md:h-80 bg-gray-200 rounded-lg animate-pulse mb-6" />
                                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-full mb-2" />
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-full mb-2" />
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                            </div>

                            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8">
                                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-6" />
                                <div className="flex flex-wrap gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                                    ))}
                                </div>
                            </div>
                        </article>

                        <aside className="lg:col-span-1 space-y-6">
                            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5">
                                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse mb-4" />
                                <dl className="space-y-1">
                                    {[Calendar, Clock, MapPin].map((Icon, i) => (
                                        <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                                            <dt className="flex items-center gap-2 text-gray-500">
                                                <Icon className="w-3.5 h-3.5 text-gray-300" />
                                                <span className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
                                            </dt>
                                            <dd className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    ))}
                                </dl>
                                <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                                    <div className="h-11 bg-gray-200 rounded-md animate-pulse" />
                                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 h-10 border border-gray-200 rounded-md bg-gray-100 animate-pulse" />
                                <div className="flex-1 h-10 border border-gray-200 rounded-md bg-gray-100 animate-pulse" />
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-serif text-gray-900 mb-4">Event not found</h2>
                <Link to="/events" className="text-amber-700 font-bold flex items-center gap-2 hover:text-amber-800 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Calendar
                </Link>
            </div>
        );
    }

    const startDate = new Date(event.date);
    const isToday = new Date(event.date).toLocaleDateString() === new Date().toLocaleDateString();

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Breadcrumb */}
                <nav className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                    <Link to="/" className="hover:text-amber-700 transition-colors">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/events" className="hover:text-amber-700 transition-colors">Events</Link>
                    <span className="mx-2">/</span>
                    <span className="text-amber-700">{event.type}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main column */}
                    <article className="lg:col-span-2">
                        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="inline-block px-2.5 py-1 bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded">
                                    {event.type}
                                </span>
                                {isToday && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-black uppercase tracking-widest rounded">
                                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                                        Live Today
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 leading-tight mb-6">
                                {event.title}
                            </h1>

                            {event.thumbnail && (
                                <div className="relative w-full h-64 md:h-80 mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                    <img
                                        src={event.thumbnail}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-1 h-4 bg-amber-700 rounded-sm" />
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">About this Event</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                {event.description}
                            </p>
                        </div>

                        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Users className="h-4 w-4 text-amber-700" />
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Who's Joining?</h3>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {event.rsvps && event.rsvps.length > 0 && (
                                    event.rsvps.map((rsvp: any) => (
                                        <div key={rsvp.id} className="group relative">
                                            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center overflow-hidden">
                                                {rsvp.profileImage ? (
                                                    <img src={rsvp.profileImage} alt={rsvp.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="h-5 w-5 text-amber-700" />
                                                )}
                                            </div>
                                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-bold bg-gray-900 text-white px-2 py-1 rounded z-10 pointer-events-none">
                                                {rsvp.name}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {event.guestRsvps && event.guestRsvps.length > 0 && (
                                    event.guestRsvps.map((rsvp) => (
                                        <div key={rsvp.id} className="group relative">
                                            <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                                                <UserIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-bold bg-gray-900 text-white px-2 py-1 rounded z-10 pointer-events-none">
                                                {rsvp.guestName}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {(!event.rsvps || event.rsvps.length === 0) && (!event.guestRsvps || event.guestRsvps.length === 0) && (
                                    <p className="text-gray-400 text-sm italic">No RSVPs yet. Be the first to join!</p>
                                )}
                            </div>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start">
                        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-4">Event Details</h3>
                            <dl className="space-y-1">
                                <div className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-100">
                                    <dt className="flex items-center gap-2 text-gray-500 text-sm shrink-0">
                                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                                        Date
                                    </dt>
                                    <dd className="font-bold text-gray-900 text-sm text-right">
                                        {startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </dd>
                                </div>
                                <div className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-100">
                                    <dt className="flex items-center gap-2 text-gray-500 text-sm shrink-0">
                                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                                        Time
                                    </dt>
                                    <dd className="font-bold text-gray-900 text-sm">
                                        {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </dd>
                                </div>
                                <div className="flex items-start justify-between gap-3 py-2.5">
                                    <dt className="flex items-center gap-2 text-gray-500 text-sm shrink-0">
                                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                                        Location
                                    </dt>
                                    <dd className="font-bold text-gray-900 text-sm text-right min-w-0">
                                        <span className="block truncate">{event.location}</span>
                                        {event.location.includes('http') && (
                                            <a href={event.location} target="_blank" rel="noopener noreferrer" className="text-amber-700 text-xs font-bold inline-flex items-center gap-1 mt-1 hover:text-amber-800 hover:underline">
                                                Open Link <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                                <button
                                    onClick={handleRSVP}
                                    disabled={isRSVPed && !currentUser}
                                    className={`w-full py-3 rounded-md text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${isRSVPed
                                        ? `bg-amber-50 text-amber-700 border border-amber-200 ${currentUser ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'cursor-default'}`
                                        : 'bg-amber-700 text-white hover:bg-amber-800'
                                        }`}
                                >
                                    {isRSVPed ? (
                                        <><CheckCircle2 className="h-4 w-4" /> {currentUser ? 'Selected to Join' : "You're Joining"}</>
                                    ) : (
                                        'Join this Event'
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                                    {event._count?.rsvps || 0} People are confirmed
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 py-2.5 border border-gray-300 rounded-md flex items-center justify-center gap-1.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                <Share2 className="h-4 w-4" /> Share
                            </button>
                            <button className="flex-1 py-2.5 border border-gray-300 rounded-md flex items-center justify-center gap-1.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                <Heart className="h-4 w-4" /> Save
                            </button>
                        </div>

                        {/* Other Events */}
                        {otherEventsLoading && otherEvents.length === 0 && (
                            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5">
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-4" />
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-16 h-16 rounded-md bg-gray-200 animate-pulse shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-2.5 w-16 bg-gray-200 rounded animate-pulse" />
                                                <div className="h-3.5 bg-gray-200 rounded animate-pulse w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {otherEvents.length > 0 && (
                            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Other Events</h3>
                                    <Link to="/events" className="text-[10px] font-bold text-amber-700 uppercase tracking-widest hover:text-amber-800 transition-colors">
                                        See All &rarr;
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {otherEvents.map((oe) => (
                                        <Link key={oe.id} to={`/events/${oe.id}`} className="flex items-start gap-3 group">
                                            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                                                <img
                                                    src={oe.thumbnail || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800'}
                                                    alt={oe.title}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="block text-[10px] font-black uppercase tracking-widest text-amber-700 mb-0.5">
                                                    {oe.type}
                                                </span>
                                                <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
                                                    {oe.title}
                                                </p>
                                                <span className="text-[11px] text-gray-400">
                                                    {new Date(oe.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {/* Guest RSVP Modal */}
            {showGuestForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white border border-gray-300 rounded-lg shadow-sm max-w-md w-full p-6 md:p-8 relative">
                        <button
                            onClick={() => setShowGuestForm(false)}
                            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1 h-4 bg-amber-700 rounded-sm" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Join this Event</span>
                            </div>
                            <p className="text-gray-500 text-sm">Tell us who's coming so we can prepare a spot for you.</p>
                        </div>

                        <form onSubmit={handleGuestRSVP} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Your Name</label>
                                <input
                                    required
                                    type="text"
                                    autoComplete="name"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email</label>
                                <input
                                    required
                                    type="email"
                                    autoComplete="email"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            {guestError && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                                    {guestError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={guestSubmitting}
                                className="w-full bg-amber-700 text-white py-3 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors disabled:opacity-50"
                            >
                                {guestSubmitting ? 'Joining…' : 'Confirm RSVP'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetail;
