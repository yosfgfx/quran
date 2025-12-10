import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { askAI, getDailyVerse, getProactiveSuggestions } from '../services/AIService';
import useStore from '../store/useStore';

export default function AIAssistant() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { audioVisible, audioMinimized, settings, setSearchOpen } = useStore();

    // Return null if AI assistant is hidden
    if (settings.aiAssistantVisible === false) {
        return null;
    }

    // Initialize with daily verse and suggestions
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const daily = getDailyVerse();
            const suggestions = getProactiveSuggestions();
            setMessages([{
                type: 'ai',
                content: `🌙 آية اليوم:\n\n"${daily.text}"\n\n💡 ${daily.insight}`,
                suggestions: suggestions.map(s => s.text),
                proactiveActions: suggestions
            }]);
        }
    }, [isOpen, messages.length]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle action from AI response
    function handleAction(action) {
        if (!action) return;

        switch (action.action) {
            case 'navigate':
                navigate(action.page);
                setIsOpen(false);
                break;
            case 'search':
                setSearchOpen(true);
                setIsOpen(false);
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    async function handleSend() {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await askAI(userMessage);

            const aiMessage = {
                type: 'ai',
                content: response.answer,
                suggestions: response.suggestions,
                confidence: response.confidence,
                action: response.action
            };

            setMessages(prev => [...prev, aiMessage]);

            // Auto-execute navigation action if present
            if (response.action && response.action.action === 'navigate') {
                setTimeout(() => {
                    handleAction(response.action);
                }, 1500);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                type: 'ai',
                content: 'عذراً، حدث خطأ. حاول مرة أخرى. 🙏',
            }]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleSuggestionClick(suggestion, proactiveActions) {
        // Check if this suggestion has a direct action
        if (proactiveActions) {
            const actionItem = proactiveActions.find(s => s.text === suggestion);
            if (actionItem && actionItem.action) {
                handleAction(actionItem.action);
                return;
            }
        }
        setInput(suggestion);
    }

    const bottomOffset = audioVisible && !audioMinimized ? '120px' : '20px';

    return (
        <>
            {/* Floating Button */}
            <button
                className={`ai-assistant-btn ${isOpen ? 'hidden' : ''}`}
                onClick={() => setIsOpen(true)}
                style={{ bottom: bottomOffset }}
                aria-label="المساعد الذكي"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                </svg>
                <span className="ai-badge">AI</span>
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="ai-chat-panel" style={{ bottom: bottomOffset }}>
                    <div className="ai-chat-header">
                        <div className="ai-header-info">
                            <span className="ai-icon">🤖</span>
                            <span>مساعد قُرّ الذكي</span>
                            <span className="ai-powered-badge">Gemini AI</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="ai-close-btn">✕</button>
                    </div>

                    <div className="ai-chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`ai-message ${msg.type}`}>
                                <div className="message-content">{msg.content}</div>
                                {msg.action && msg.type === 'ai' && (
                                    <button
                                        className="action-btn"
                                        onClick={() => handleAction(msg.action)}
                                    >
                                        {msg.action.action === 'navigate' ? '🔗 انتقال' : '🔍 بحث'}
                                    </button>
                                )}
                                {msg.suggestions && (
                                    <div className="ai-suggestions">
                                        {msg.suggestions.map((s, j) => (
                                            <button
                                                key={j}
                                                onClick={() => handleSuggestionClick(s, msg.proactiveActions)}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="ai-message ai">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="ai-chat-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="اسأل عن القرآن، الصلاة، القبلة..."
                            disabled={loading}
                        />
                        <button onClick={handleSend} disabled={loading || !input.trim()}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="ai-quick-actions">
                        <button onClick={() => handleAction({ action: 'navigate', page: '/prayer-times' })}>🕐 الصلاة</button>
                        <button onClick={() => handleAction({ action: 'navigate', page: '/qibla' })}>🧭 القبلة</button>
                        <button onClick={() => handleAction({ action: 'navigate', page: '/surah/1' })}>📖 الفاتحة</button>
                        <button onClick={() => setInput('آيات عن الصبر')}>💪 الصبر</button>
                    </div>
                </div>
            )}
        </>
    );
}
