import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, RefreshCw, ChevronRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ChatbotWidget({ activePage }) {
    const { user } = useAuth();
    const isAdmin = activePage === 'admin';
    const [isOpen, setIsOpen] = useState(false);

    const getInitialMessages = (adminMode) => [
        {
            id: 1,
            sender: 'bot',
            text: adminMode
                ? `👋 Welcome Admin! I am your **NEC Recruitment Analytics Assistant**.\n\nAsk me about Global candidate rankings, total application stats, department breakdowns, or weightage scoring!`
                : `👋 Hello! I am the **NEC Recruitment AI Assistant**.\n\nI can answer dynamic questions based on our live recruitment database!\n\nWhat would you like to know today?`,
            quickOptions: adminMode
                ? ['🏆 Top Candidates', '📊 Total Applications', '🏫 Dept Breakdown', '💯 Active Weightage Rules', '⚙️ Dropdown Manager']
                : ['Available Posts', 'My Application Status', 'Eligibility Rules', 'Scoring Criteria', 'Required Docs', 'Contact Info'],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ];

    const [messages, setMessages] = useState(() => getInitialMessages(isAdmin));
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Reset messages when switching between Admin and Candidate pages
    useEffect(() => {
        setMessages(getInitialMessages(isAdmin));
    }, [activePage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

    const handleSendMessage = async (textToSend) => {
        const queryText = (textToSend || inputValue).trim();
        if (!queryText) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: queryText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!textToSend) setInputValue('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: queryText,
                    email: user?.email || null,
                    isAdmin: isAdmin
                })
            });

            const data = await res.json();
            setIsTyping(false);

            if (data.success) {
                if (data.targetEmail && isAdmin) {
                    window.dispatchEvent(new CustomEvent('openCandidateModal', { detail: { email: data.targetEmail } }));
                }
                const botMsg = {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: data.reply,
                    targetEmail: data.targetEmail || null,
                    quickOptions: data.quickOptions || [],
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages((prev) => [...prev, botMsg]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        sender: 'bot',
                        text: data.reply || 'Sorry, I could not process your query right now.',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]);
            }
        } catch (err) {
            setIsTyping(false);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: '⚠️ Network connection issue. Please make sure the server is running.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }
    };

    const formatMarkdownText = (text) => {
        if (!text) return '';
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/^• (.*$)/gim, '<li class="chatbot-list-item">$1</li>');
        formatted = formatted.replace(/\n\n/g, '<br/><br/>');
        formatted = formatted.replace(/\n/g, '<br/>');
        return formatted;
    };

    const handleClearHistory = () => {
        setMessages(getInitialMessages(isAdmin));
    };

    return (
        <div className="chatbot-widget-container">
            {/* Floating Trigger Button */}
            {!isOpen && (
                <button
                    type="button"
                    className={`chatbot-trigger-btn ${isAdmin ? 'admin-trigger' : ''}`}
                    onClick={() => setIsOpen(true)}
                    title={isAdmin ? "Ask NEC Admin Assistant" : "Ask NEC Recruitment Assistant"}
                >
                    {isAdmin ? <ShieldCheck size={24} className="chatbot-icon-pulse" /> : <Bot size={24} className="chatbot-icon-pulse" />}
                    <span className="chatbot-trigger-label">{isAdmin ? 'Admin AI' : 'Recruitment AI'}</span>
                    <span className="chatbot-pulse-ring"></span>
                </button>
            )}

            {/* Chatbot Window */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className={`chatbot-header ${isAdmin ? 'admin-header' : ''}`}>
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar-container">
                                {isAdmin ? <ShieldCheck size={20} className="chatbot-bot-avatar-icon" /> : <Bot size={20} className="chatbot-bot-avatar-icon" />}
                                <span className="chatbot-status-online"></span>
                            </div>
                            <div>
                                <h4 className="chatbot-title">
                                    {isAdmin ? 'NEC Admin Analytics Assistant' : 'NEC Recruitment Assistant'} <Sparkles size={14} className="sparkle-icon" />
                                </h4>
                                <p className="chatbot-subtitle">{isAdmin ? 'Live Recruitment Analytics Active' : 'Live Database Querying Active'}</p>
                            </div>
                        </div>
                        <div className="chatbot-header-actions">
                            <button
                                type="button"
                                className="chatbot-header-icon-btn"
                                onClick={handleClearHistory}
                                title="Reset Chat"
                            >
                                <RefreshCw size={15} />
                            </button>
                            <button
                                type="button"
                                className="chatbot-header-icon-btn"
                                onClick={() => setIsOpen(false)}
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="chatbot-messages-body">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`chatbot-msg-row ${msg.sender === 'user' ? 'msg-user' : 'msg-bot'}`}
                            >
                                {msg.sender === 'bot' && (
                                    <div className={`chatbot-msg-avatar ${isAdmin ? 'admin-avatar' : ''}`}>
                                        {isAdmin ? <ShieldCheck size={16} /> : <Bot size={16} />}
                                    </div>
                                )}

                                <div className="chatbot-msg-content-wrapper">
                                    <div
                                        className={`chatbot-msg-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}
                                        dangerouslySetInnerHTML={{ __html: formatMarkdownText(msg.text) }}
                                    />
                                    <span className="chatbot-msg-time">{msg.timestamp}</span>

                                    {/* Action button to open candidate profile modal */}
                                    {msg.sender === 'bot' && msg.targetEmail && isAdmin && (
                                        <button
                                            type="button"
                                            className="chatbot-chip-btn action-chip-btn"
                                            style={{ marginTop: '8px', background: '#3b82f6', color: '#ffffff', fontWeight: 'bold' }}
                                            onClick={() => window.dispatchEvent(new CustomEvent('openCandidateModal', { detail: { email: msg.targetEmail } }))}
                                        >
                                            👁️ Open Candidate Profile Modal <ChevronRight size={14} />
                                        </button>
                                    )}

                                    {/* Quick Suggestion Chips */}
                                    {msg.sender === 'bot' && msg.quickOptions && msg.quickOptions.length > 0 && (
                                        <div className="chatbot-quick-chips">
                                            {msg.quickOptions.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className="chatbot-chip-btn"
                                                    onClick={() => handleSendMessage(opt)}
                                                >
                                                    {opt} <ChevronRight size={12} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {msg.sender === 'user' && (
                                    <div className="chatbot-msg-avatar user-avatar">
                                        <User size={16} />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing Animation Indicator */}
                        {isTyping && (
                            <div className="chatbot-msg-row msg-bot">
                                <div className="chatbot-msg-avatar">
                                    {isAdmin ? <ShieldCheck size={16} /> : <Bot size={16} />}
                                </div>
                                <div className="chatbot-msg-bubble bubble-bot typing-bubble">
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form
                        className="chatbot-input-area"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                    >
                        <input
                            type="text"
                            className="chatbot-text-input"
                            placeholder={isAdmin ? "Ask about ranks, total apps, dept stats..." : "Ask about posts, scores, eligibility..."}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="chatbot-send-btn"
                            disabled={!inputValue.trim() || isTyping}
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
