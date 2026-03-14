import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Share2, Heart, CheckCircle2, User as UserIcon, ExternalLink } from 'lucide-react';
import { eventAPI, authAPI } from '../services/api';
import type { Event } from '../services/api.d';

const EventDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRSVPed, setIsRSVPed] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        loadEvent();
        loadUser();
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
        if (!currentUser) {
            // Handle redirect to login or show alert
            alert('Please log in to RSVP for events.');
            return;
        }
        if (!id) return;

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

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <h2 className="text-3xl font-bold mb-4">Event not found</h2>
                <Link to="/events" className="text-amber-600 font-bold flex items-center gap-2">
                    <ArrowLeft className="h-5 w-5" /> Back to Calendar
                </Link>
            </div>
        );
    }

    const startDate = new Date(event.date);

    return (
        <div className="min-h-screen bg-white">
            {/* Dynamic Background Header */}
            <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                <img
                    src={event.thumbnail || "https://images.unsplash.com/photo-1544427928-c49dd24428c8?auto=format&fit=crop&q=80&w=2000"}
                    alt=""
                    className="w-full h-full object-cover blur-sm scale-110 opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>

                <div className="absolute bottom-0 left-0 w-full px-4 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <Link to="/events" className="inline-flex items-center gap-2 text-gray-600 font-bold mb-8 hover:text-amber-600 transition-colors bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/50">
                            <ArrowLeft className="h-5 w-5" /> Back to Calendar
                        </Link>
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <span className="px-5 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-black uppercase tracking-widest border border-amber-200">
                                {event.type}
                            </span>
                            {new Date(event.date).toLocaleDateString() === new Date().toLocaleDateString() && (
                                <span className="px-5 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-black uppercase tracking-widest border border-red-200 animate-pulse">
                                    Live Today
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight md:max-w-4xl">
                            {event.title}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">About this Event</h2>
                            <p className="text-xl text-gray-600 leading-relaxed font-serif">
                                {event.description}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-[3rem] p-10 md:p-12 border border-blue-100/50">
                            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                <Users className="h-6 w-6 text-amber-600" />
                                Who's Joining?
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {event.rsvps && event.rsvps.length > 0 ? (
                                    event.rsvps.map((rsvp: any) => (
                                        <div key={rsvp.id} className="group relative">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-amber-500 transition-all">
                                                {rsvp.profileImage ? (
                                                    <img src={rsvp.profileImage} alt={rsvp.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="h-6 w-6 text-gray-300" />
                                                )}
                                            </div>
                                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap text-[10px] font-bold bg-gray-900 text-white px-2 py-1 rounded-md z-10 pointer-events-none">
                                                {rsvp.name}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 italic">No RSVPs yet. Be the first to join!</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="relative">
                        <div className="sticky top-32 space-y-8">
                            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl shadow-gray-200/50">
                                <div className="space-y-8 mb-10">
                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                                            <Calendar className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Date</p>
                                            <p className="text-lg font-bold text-gray-900">{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                                            <Clock className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Time</p>
                                            <p className="text-lg font-bold text-gray-900">{startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                                            <MapPin className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Location</p>
                                            <p className="text-lg font-bold text-gray-900 truncate">{event.location}</p>
                                            {event.location.includes('http') && (
                                                <a href={event.location} target="_blank" rel="noopener noreferrer" className="text-amber-600 text-xs font-bold inline-flex items-center gap-1 mt-1 hover:underline">
                                                    Open Link <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={handleRSVP}
                                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl ${isRSVPed
                                            ? 'bg-amber-100 text-amber-700 hover:bg-red-50 hover:text-red-600 border border-amber-200'
                                            : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/30'
                                            } flex items-center justify-center gap-3`}
                                    >
                                        {isRSVPed ? (
                                            <><CheckCircle2 className="h-5 w-5" /> Selected to Join</>
                                        ) : (
                                            'Join this Event'
                                        )}
                                    </button>
                                    <p className="text-center text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                                        {event._count?.rsvps || 0} People are confirmed
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 py-4 bg-gray-50 rounded-2xl flex items-center justify-center gap-2 font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                                    <Share2 className="h-5 w-5" /> Share
                                </button>
                                <button className="flex-1 py-4 bg-gray-50 rounded-2xl flex items-center justify-center gap-2 font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                                    <Heart className="h-5 w-5" /> Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
