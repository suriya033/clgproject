import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, MoreHorizontal, User, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock AI Logic based on rules ---
const processQuery = (query) => {
    const text = query.toLowerCase();

    if (text.includes('search student') || text.includes('find student')) {
        return {
            type: 'student_search',
            message: `Student Found
Name: Rahul Kumar
Department: IT
Year: 3rd Year
Attendance: 82%`,
            warning: null,
            actions: ['View full profile', 'Edit details', 'View marks', 'View attendance report']
        };
    }

    if (text.includes('pending requests') || text.includes('leave requests') || text.includes('od requests')) {
        return {
            type: 'pending_requests',
            message: `There are 18 pending requests:
• 10 Leave Requests
• 5 OD Requests
• 3 Course Change Requests

Would you like to review them now?`,
            warning: null,
            actions: ['Review Now', 'Schedule for Later']
        };
    }

    if (text.includes('attendance report')) {
        return {
            type: 'report_gen',
            message: `Please select parameters for the report generation:
• Semester
• Date range
• Report format (PDF / Excel)`,
            warning: null,
            actions: ['Select Options', 'Cancel']
        };
    }

    if (text.includes('approve all') || text.includes('bulk approve')) {
        return {
            type: 'automation',
            message: 'Are you sure you want to approve all pending OD requests? This action cannot be undone.',
            warning: 'Requires Confirmation',
            actions: ['Confirm Approval', 'Cancel']
        };
    }

    if (text.includes('delete student') || text.includes('remove student')) {
        return {
            type: 'security',
            message: 'Are you sure you want to delete this student record? This action cannot be undone.',
            warning: 'Critical Action',
            actions: ['Confirm Delete', 'Cancel']
        };
    }

    // Default Error Handling
    return {
        type: 'error',
        message: `I couldn't understand the request. Please try using commands like:
• Search student [ID]
• Generate report [type]
• View requests
• Manage faculty`,
        warning: null,
        actions: []
    };
};

const AdminAssist = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Hello Admin. How can I assist you today? You can ask me to search students, view pending requests, or generate reports.', actions: [] }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking delay
        setTimeout(() => {
            const aiResponse = processQuery(userMsg.text);
            setMessages(prev => [...prev, {
                sender: 'ai',
                text: aiResponse.message,
                actions: aiResponse.actions,
                warning: aiResponse.warning
            }]);
            setIsTyping(false);
        }, 800);
    };

    const handleActionClick = (actionText) => {
        const userMsg = { sender: 'user', text: `Selected action: ${actionText}` };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'ai', text: `Action "${actionText}" acknowledged. Proceeding...`, actions: [] }]);
            setIsTyping(false);
        }, 600);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="btn-primary"
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            boxShadow: 'var(--shadow-premium)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                        }}
                    >
                        <Bot size={32} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? 'auto' : '560px'
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="premium-card"
                        style={{
                            width: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-premium)',
                            border: '1px solid var(--border)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1rem 1.25rem',
                            background: '#0f172a', /* Dark slate header */
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }} onClick={() => setIsMinimized(!isMinimized)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.4rem', borderRadius: '0.5rem' }}>
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>AdminAssist AI</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} /> Online
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                                    <Minimize2 size={18} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        {!isMinimized && (
                            <>
                                <div style={{
                                    flex: 1,
                                    padding: '1.25rem',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    background: '#f8fafc'
                                }}>
                                    {messages.map((msg, idx) => (
                                        <div key={idx} style={{
                                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                            maxWidth: '85%'
                                        }}>
                                            <div style={{
                                                padding: '0.875rem',
                                                borderRadius: '1rem',
                                                borderTopRightRadius: msg.sender === 'user' ? '0.25rem' : '1rem',
                                                borderTopLeftRadius: msg.sender === 'ai' ? '0.25rem' : '1rem',
                                                background: msg.sender === 'user' ? 'var(--primary)' : 'white',
                                                color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                                                boxShadow: msg.sender === 'ai' ? 'var(--shadow-sm)' : 'none',
                                                border: msg.sender === 'ai' ? '1px solid var(--border)' : 'none',
                                                fontSize: '0.875rem',
                                                lineHeight: 1.5,
                                                whiteSpace: 'pre-line'
                                            }}>
                                                {msg.warning && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: 800, marginBottom: '0.5rem' }}>
                                                        <AlertTriangle size={16} /> {msg.warning}
                                                    </div>
                                                )}
                                                {msg.text}
                                            </div>

                                            {/* Action Buttons */}
                                            {msg.actions && msg.actions.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                    {msg.actions.map(action => (
                                                        <button
                                                            key={action}
                                                            onClick={() => handleActionClick(action)}
                                                            className="btn"
                                                            style={{
                                                                padding: '0.4rem 0.8rem',
                                                                fontSize: '0.75rem',
                                                                background: 'white',
                                                                border: '1px solid var(--primary)',
                                                                color: 'var(--primary)',
                                                                borderRadius: '2rem'
                                                            }}
                                                        >
                                                            {action}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div style={{ alignSelf: 'flex-start', background: 'white', padding: '0.875rem', borderRadius: '1rem', borderTopLeftRadius: '0.25rem', border: '1px solid var(--border)' }}>
                                            <MoreHorizontal size={20} className="spin-slow" color="var(--text-muted)" />
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div style={{
                                    padding: '1rem',
                                    background: 'white',
                                    borderTop: '1px solid var(--border)',
                                    display: 'flex',
                                    gap: '0.75rem'
                                }}>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Command AdminAssist..."
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1rem',
                                            borderRadius: '2rem',
                                            border: '1px solid var(--border)',
                                            outline: 'none',
                                            fontSize: '0.875rem',
                                            background: '#f8fafc'
                                        }}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim()}
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '50%',
                                            background: input.trim() ? 'var(--primary)' : '#e2e8f0',
                                            color: 'white',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: input.trim() ? 'pointer' : 'not-allowed',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <Send size={18} style={{ marginLeft: '2px' }} />
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminAssist;
