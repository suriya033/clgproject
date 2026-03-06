import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    Bus, MapPin, Clock, User, Navigation, Search, RefreshCw, Loader2, AlertCircle, Info, ChevronRight, Map as MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const Transport = () => {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [trackingBus, setTrackingBus] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchBuses();
        const interval = setInterval(fetchBuses, 10000); // Live poll
        return () => clearInterval(interval);
    }, []);

    const fetchBuses = async () => {
        try {
            if (!loading) setRefreshing(true);
            const res = await api.get('/college/buses');
            setBuses(res.data);
        } catch (err) {
            console.error('GPS Link Error:', err);
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
        toast.info(`Initializing GPS Link: ${bus.busNumber}`, {
            icon: '📡',
            style: { borderRadius: '1rem', background: '#0f172a', color: 'white' }
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '1.5rem' }}>
                <MapIcon className="spin-slow" size={48} color="var(--primary)" />
                <p style={{ color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>BOOTING TRANSPORT GRID...</p>
            </div>
        );
    }

    return (
        <div className="transport-view animate-fade-in" style={{ display: 'grid', gridTemplateColumns: trackingBus ? '380px 1fr' : '1fr', gap: '1.5rem', transition: 'grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>

            {/* Bus Sidebar/List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="premium-card" style={{ padding: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Find vehicle ID..."
                            className="form-input"
                            style={{ paddingLeft: '3rem', fontSize: '0.875rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <AnimatePresence mode="popLayout">
                        {filteredBuses.map((bus) => {
                            const isLive = bus.location && (new Date() - new Date(bus.location.lastUpdated) < 300000);
                            const isActive = trackingBus?._id === bus._id;

                            return (
                                <motion.div
                                    key={bus._id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`premium-card ${isActive ? 'glass-effect' : ''}`}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '1.25rem',
                                        borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                                        borderWidth: isActive ? '2px' : '1px',
                                        boxShadow: isActive ? 'var(--shadow-premium)' : 'var(--shadow-md)'
                                    }}
                                    onClick={() => handleTrack(bus)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '12px',
                                                background: isLive ? 'rgba(16, 185, 129, 0.1)' : '#f1f5f9',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: isLive ? '#10b981' : '#94a3b8'
                                            }}>
                                                <Bus size={22} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '1.0625rem', fontWeight: 800 }}>{bus.busNumber}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isLive ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLive ? 'var(--success)' : '#cbd5e1' }} />
                                                    {isLive ? 'LIVE ON GRID' : 'TRANSPONDER OFFLINE'}
                                                </div>
                                            </div>
                                        </div>
                                        <motion.div animate={{ rotate: isActive ? 90 : 0 }}>
                                            <ChevronRight size={18} color="var(--text-muted)" />
                                        </motion.div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: 'var(--text-main)', fontSize: '0.8125rem', fontWeight: 600 }}>
                                        <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                                        <span>{bus.route}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Tracking View / Dashboard Placeholder */}
            <div style={{ height: 'calc(100vh - var(--topbar-height) - 4rem)', position: 'sticky', top: '1.5rem' }}>
                <AnimatePresence mode="wait">
                    {trackingBus ? (
                        <motion.div
                            key="tracking"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="premium-card"
                            style={{ height: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', letterSpacing: '-0.03em' }}>Vehicle Telemetry: {trackingBus.busNumber}</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Driver: {trackingBus.driverName || 'Grid Operator'}</p>
                                </div>
                                <Button variant="secondary" onClick={() => setTrackingBus(null)} icon={X}>Close Feed</Button>
                            </div>

                            <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: '1.5rem', overflow: 'hidden', position: 'relative', border: '1px solid var(--border)' }}>
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
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#f8fafc' }}>
                                        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '50%', boxShadow: 'var(--shadow-lg)' }}>
                                            <AlertCircle size={40} color="var(--primary)" />
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ fontWeight: 800, fontSize: '1.25rem' }}>Awaiting Initial Comms...</p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Vehicle is not currently broadcasting its coordinates.</p>
                                        </div>
                                    </div>
                                )}

                                {trackingBus.location?.lat && (
                                    <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(15, 23, 42, 0.9)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>SIGNAL ACQUIRED</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                <div style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '1.25rem' }}>
                                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Current Velocity</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>42 <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>km/h</span></p>
                                </div>
                                <div style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '1.25rem' }}>
                                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Status</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>Optimal</p>
                                </div>
                                <div style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '1.25rem' }}>
                                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Sync Freq</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>10 <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>sec</span></p>
                                </div>
                                <div style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '1.25rem' }}>
                                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Eta Dest</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>14 <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>min</span></p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="premium-card"
                            style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', border: '2px dashed var(--border)', background: 'transparent' }}
                        >
                            <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
                                <Navigation size={36} color="var(--text-muted)" />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Tactical Transport Feed</h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '300px', fontSize: '0.9375rem' }}>Select a vehicle from the telemetry listing to initialize active tracking.</p>
                            </div>
                            <Button variant="secondary" onClick={fetchBuses} icon={RefreshCw} loading={refreshing}>Reset Grid Scan</Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Transport;
