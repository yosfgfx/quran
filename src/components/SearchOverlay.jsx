import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { searchQuran } from '../services/quranAPI';

// Topic keywords for searching by subject
const TOPICS = {
    'الصلاة': ['صلاة', 'صلوا', 'الصلاة', 'المصلين', 'ركوع', 'سجود'],
    'الزكاة': ['زكاة', 'الزكاة', 'صدقة', 'ينفقون', 'أنفقوا'],
    'الصيام': ['صيام', 'الصيام', 'صوم', 'رمضان'],
    'الحج': ['حج', 'الحج', 'عمرة', 'الكعبة', 'مكة'],
    'الجنة': ['جنة', 'الجنة', 'جنات', 'نعيم', 'فردوس'],
    'النار': ['نار', 'النار', 'جهنم', 'عذاب', 'سعير'],
    'التوبة': ['توبة', 'التوبة', 'استغفر', 'يتوب', 'التائبين'],
    'الصبر': ['صبر', 'الصبر', 'صابرين', 'اصبروا'],
    'الشكر': ['شكر', 'الشكر', 'شاكرين', 'اشكروا'],
    'الدعاء': ['دعاء', 'ادعوا', 'يدعون', 'دعوة'],
    'الرحمة': ['رحمة', 'الرحمة', 'رحيم', 'رحمان'],
    'العدل': ['عدل', 'العدل', 'قسط', 'ظلم'],
    'الأخلاق': ['خلق', 'أخلاق', 'حسن', 'معروف'],
    'القيامة': ['قيامة', 'القيامة', 'يوم الدين', 'البعث', 'الحساب'],
};

// Check if Web Speech API is supported
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = !!SpeechRecognition;

export default function SearchOverlay() {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const debounceRef = useRef(null);
    const resultsRef = useRef(null);
    const recognitionRef = useRef(null);
    const { searchOpen, setSearchOpen, surahs } = useStore();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [visibleResults, setVisibleResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState('ayah');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [voiceError, setVoiceError] = useState(null);

    // Initialize speech recognition
    useEffect(() => {
        if (speechSupported && !recognitionRef.current) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'ar-SA';
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setQuery(transcript);
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setVoiceError('فشل التعرف على الصوت');
                setIsListening(false);
                setTimeout(() => setVoiceError(null), 3000);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    // Toggle voice listening
    function toggleVoiceSearch() {
        if (!speechSupported) {
            setVoiceError('البحث الصوتي غير مدعوم في هذا المتصفح');
            setTimeout(() => setVoiceError(null), 3000);
            return;
        }

        if (isListening) {
            recognitionRef.current?.abort();
            setIsListening(false);
        } else {
            setVoiceError(null);
            recognitionRef.current?.start();
            setIsListening(true);
        }
    }

    // Focus input when opened
    useEffect(() => {
        if (searchOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [searchOpen]);

    // Real-time search with ultra-fast debounce
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!query.trim()) {
            setResults([]);
            setVisibleResults([]);
            return;
        }

        // Surah search - instant local regex search
        if (searchType === 'surah') {
            try {
                const regex = new RegExp(query, 'i');
                const filtered = surahs.filter(s =>
                    regex.test(s.name) ||
                    regex.test(s.englishName) ||
                    regex.test(s.englishNameTranslation) ||
                    s.number.toString() === query
                );
                setResults(filtered);
                setVisibleResults(filtered.slice(0, 10)); // Lazy: show first 10
            } catch (e) {
                // Invalid regex, use simple includes
                const filtered = surahs.filter(s =>
                    s.name.includes(query) ||
                    s.englishName.toLowerCase().includes(query.toLowerCase())
                );
                setResults(filtered);
                setVisibleResults(filtered.slice(0, 10));
            }
            return;
        }

        // Ayah/Tafsir search - fast debounced API call (50ms)
        if ((searchType === 'ayah' || searchType === 'tafsir') && query.length >= 2) {
            setLoading(true);
            debounceRef.current = setTimeout(async () => {
                try {
                    const data = await searchQuran(query);
                    const matches = data.matches || [];
                    setResults(matches);
                    setVisibleResults(matches.slice(0, 10)); // Lazy: show first 10
                } catch (error) {
                    console.error('Search failed:', error);
                    setResults([]);
                    setVisibleResults([]);
                } finally {
                    setLoading(false);
                }
            }, 50); // Ultra-fast 50ms debounce
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, searchType, surahs]);

    // Lazy loading: Load more results on scroll
    function loadMoreResults() {
        if (visibleResults.length < results.length) {
            setVisibleResults(results.slice(0, visibleResults.length + 10));
        }
    }

    // Topic search
    async function searchByTopic(topicName) {
        setSelectedTopic(topicName);
        setLoading(true);

        try {
            const keywords = TOPICS[topicName];
            const allResults = [];

            // Search for each keyword
            for (const keyword of keywords.slice(0, 2)) {
                try {
                    const data = await searchQuran(keyword);
                    if (data.matches) {
                        allResults.push(...data.matches);
                    }
                } catch (e) {
                    // Continue with other keywords
                }
            }

            // Remove duplicates
            const unique = allResults.filter((v, i, a) =>
                a.findIndex(t => t.number === v.number) === i
            );

            setResults(unique.slice(0, 30));
        } catch (error) {
            console.error('Topic search failed:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    function handleResultClick(result) {
        if (searchType === 'surah') {
            navigate(`/surah/${result.number}`);
        } else {
            navigate(`/surah/${result.surah?.number || result.number}?ayah=${result.numberInSurah || 1}`);
        }
        handleClose();
    }

    function handleClose() {
        setSearchOpen(false);
        setQuery('');
        setResults([]);
        setVisibleResults([]);
        setSelectedTopic(null);
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
        setIsListening(false);
    }

    if (!searchOpen) return null;

    return (
        <div className={`search-overlay ${searchOpen ? 'open' : ''}`} onClick={handleClose}>
            <div className="search-modal" onClick={e => e.stopPropagation()}>
                {/* Voice Error Message */}
                {voiceError && (
                    <div style={{
                        background: 'var(--error-color, #ff4444)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        fontSize: '0.85rem',
                        textAlign: 'center'
                    }}>
                        {voiceError}
                    </div>
                )}

                {/* Search Input */}
                <div className="search-input-container">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" width="22" height="22">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        placeholder={
                            isListening ? '🎤 جاري الاستماع...' :
                                searchType === 'surah' ? 'ابحث عن سورة...' :
                                    searchType === 'ayah' ? 'ابحث في الآيات...' :
                                        searchType === 'tafsir' ? 'ابحث في التفسير...' :
                                            'اختر موضوعاً...'
                        }
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        disabled={searchType === 'topic' || isListening}
                    />
                    {loading && (
                        <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                    )}
                    {/* Voice Search Button */}
                    <button
                        type="button"
                        className="icon-btn"
                        onClick={toggleVoiceSearch}
                        style={{
                            background: isListening ? 'var(--error-color, #ff4444)' : 'transparent',
                            animation: isListening ? 'pulse 1s infinite' : 'none'
                        }}
                        title="البحث الصوتي"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke={isListening ? 'white' : 'currentColor'} strokeWidth="2" width="20" height="20">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                    </button>
                    <button type="button" className="icon-btn" onClick={handleClose} style={{ background: 'transparent' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Search Type Tabs */}
                <div className="search-tabs">
                    <button
                        className={`filter-tab ${searchType === 'ayah' ? 'active' : ''}`}
                        onClick={() => { setSearchType('ayah'); setResults([]); setSelectedTopic(null); }}
                    >
                        الآيات
                    </button>
                    <button
                        className={`filter-tab ${searchType === 'surah' ? 'active' : ''}`}
                        onClick={() => { setSearchType('surah'); setResults([]); setSelectedTopic(null); }}
                    >
                        السور
                    </button>
                    <button
                        className={`filter-tab ${searchType === 'tafsir' ? 'active' : ''}`}
                        onClick={() => { setSearchType('tafsir'); setResults([]); setSelectedTopic(null); }}
                    >
                        التفسير
                    </button>
                    <button
                        className={`filter-tab ${searchType === 'topic' ? 'active' : ''}`}
                        onClick={() => { setSearchType('topic'); setResults([]); setQuery(''); }}
                    >
                        الموضوعات
                    </button>
                </div>

                {/* Topic Selection */}
                {searchType === 'topic' && !selectedTopic && (
                    <div className="topic-grid">
                        {Object.keys(TOPICS).map(topic => (
                            <button
                                key={topic}
                                className="topic-btn"
                                onClick={() => searchByTopic(topic)}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                )}

                {/* Selected Topic Header */}
                {selectedTopic && (
                    <div className="selected-topic">
                        <span>نتائج موضوع: {selectedTopic}</span>
                        <button onClick={() => { setSelectedTopic(null); setResults([]); }}>✕</button>
                    </div>
                )}

                {/* Results */}
                <div className="search-results">
                    {!loading && results.length === 0 && (query || selectedTopic) && searchType !== 'topic' && (
                        <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                            <p>لا توجد نتائج</p>
                        </div>
                    )}

                    {!loading && visibleResults.map((result, index) => (
                        <div
                            key={index}
                            className="search-result-item"
                            onClick={() => handleResultClick(result)}
                        >
                            {searchType === 'surah' ? (
                                <>
                                    <div className="surah-number" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                                        {result.number}
                                    </div>
                                    <div style={{ marginRight: 'var(--space-md)' }}>
                                        <div style={{ fontFamily: 'var(--font-quran)', fontSize: '1.2rem', color: 'var(--text-quran)' }}>
                                            {result.name}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {result.englishName} • {result.numberOfAyahs} آية
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ width: '100%' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: 'var(--space-xs)'
                                    }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                                            {result.surah?.name} - الآية {result.numberInSurah}
                                        </span>
                                        {searchType === 'tafsir' && (
                                            <span style={{
                                                fontSize: '0.7rem',
                                                background: 'var(--emerald-light)',
                                                color: 'white',
                                                padding: '2px 8px',
                                                borderRadius: 'var(--radius-full)'
                                            }}>
                                                تفسير
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        fontFamily: 'var(--font-quran)',
                                        fontSize: '1.1rem',
                                        lineHeight: 1.8,
                                        color: 'var(--text-quran)'
                                    }}>
                                        {result.text?.length > 150 ? result.text.substring(0, 150) + '...' : result.text}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Load More Button - Lazy Loading */}
                    {visibleResults.length < results.length && (
                        <button
                            onClick={loadMoreResults}
                            style={{
                                width: '100%',
                                padding: 'var(--space-md)',
                                background: 'var(--bg-secondary)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--gold-primary)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                marginTop: 'var(--space-sm)'
                            }}
                        >
                            عرض المزيد ({results.length - visibleResults.length} نتيجة)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
