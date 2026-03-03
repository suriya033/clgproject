import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    Bus,
    MapPin,
    Clock,
    User,
    Navigation,
    Search,
    RefreshCw,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Transport = () => {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [trackingBus, setTrackingBus] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchBuses();
        const interval = setInterval(fetchBuses, 10000); // Poll all buses every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchBuses = async () => {
        try {
            if (!refreshing) setRefreshing(true);
            const res = await api.get('/college/buses');
            setBuses(res.data);
        } catch (err) {
            console.error('Error fetching buses:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filteredBuses = buses.filter(bus =>
        bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.route.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTrack = (bus) => {
        setTrackingBus(bus);
    };

    return (
        <div className="transport-page" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>College Transport</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time GPS tracking of college vehicles</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Enter bus number..."
                            style={{
                                padding: '0.75rem 1rem 0.75rem 2.8rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                width: '300px'
                            }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchBuses}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: trackingBus ? '1fr 1fr' : '1fr', gap: '2rem', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                            <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={40} />
                        </div>
                    ) : filteredBuses.length > 0 ? filteredBuses.map((bus) => {
                        const isLive = bus.location && (new Date() - new Date(bus.location.lastUpdated) < 300000); // Active in last 5 mins

                        return (
                            <motion.div
                                key={bus._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card"
                                style={{
                                    border: trackingBus?._id === bus._id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleTrack(bus)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                            <Bus size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{bus.busNumber}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isLive ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLive ? 'var(--success)' : '#cbd5e1' }} />
                                                {isLive ? 'Live Tracking' : 'Offline'}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                        Track
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <MapPin size={18} color="var(--text-muted)" style={{ marginTop: '3px' }} />
                                    <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>{bus.route}</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '1rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Driver</p>
                                        <p style={{ fontWeight: 600 }}>{bus.driverName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Last Updated</p>
                                        <p style={{ fontWeight: 600 }}>
                                            {bus.location?.lastUpdated ? new Date(bus.location.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                            <Bus size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No buses found matching your search.</p>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {trackingBus && (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="card"
                            style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.5rem' }}>Live Tracking: {trackingBus.busNumber}</h3>
                                <button onClick={() => setTrackingBus(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    ✕
                                </button>
                            </div>

                            <div style={{ width: '100%', height: '400px', backgroundColor: '#e2e8f0', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                {trackingBus.location?.lat ? (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0 }}
                                        src={`https://www.google.com/maps/embed/v1/place?key=dl2b4ikTisngkEATOb0rVcvnd56PUKds9GtDNQxh3aSEDzif&q=${trackingBus.location.lat},${trackingBus.location.lng}`}
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <AlertCircle size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                        <p style={{ fontWeight: 600 }}>Waiting for GPS signal...</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>The driver hasn't started the location sharing yet.</p>
                                    </div>
                                )}

                                {trackingBus.location?.lat && (
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.9)', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
                                        <div className="spin-slow" style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>LIVE</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '1rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>SPEED</p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: 800 }}>-- km/h</p>
                                </div>
                                <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '1rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>HEADING</p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: 800 }}>North East</p>
                                </div>
                                <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '1rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACCURACY</p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: 800 }}>High</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(128,0,0,0.05)', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <User size={24} color="var(--primary)" />
                                <div>
                                    <p style={{ fontWeight: 700 }}>Driver: {trackingBus.driverName}</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>Contact: {trackingBus.driverContact || 'Available in emergency'}</p>
                                </div>
                                <button className="btn-primary" style={{ marginLeft: 'auto', padding: '0.5rem' }}>
                                    <Navigation size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style sx>{`
                .spin-slow {
                    animation: spin 2s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Transport;
