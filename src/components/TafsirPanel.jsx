import { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { getTafsir, TAFSIR_EDITIONS } from '../services/quranAPI';

export default function TafsirPanel() {
    const {
        tafsirOpen,
        setTafsirOpen,
        currentSurah,
        currentAyah,
        settings
    } = useStore();

    const [ayahText, setAyahText] = useState('');
    const [loading, setLoading] = useState(false);
    const [tafsirData, setTafsirData] = useState([]); // Array of all tafsirs
    const [activeCard, setActiveCard] = useState(0);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (tafsirOpen && currentSurah && currentAyah) {
            loadAllTafsirs();
        }
    }, [tafsirOpen, currentSurah?.number, currentAyah]);

    async function loadAllTafsirs() {
        setLoading(true);
        setTafsirData([]);
        setActiveCard(0);

        try {
            // Get ayah text first
            if (currentSurah.ayahs) {
                const ayah = currentSurah.ayahs.find(a => a.numberInSurah === currentAyah);
                if (ayah) {
                    setAyahText(ayah.text);
                }
            }

            // Load all tafsirs in parallel
            const tafsirPromises = TAFSIR_EDITIONS.map(async (edition) => {
                try {
                    const data = await getTafsir(currentSurah.number, currentAyah, edition.id);
                    return {
                        id: edition.id,
                        name: edition.name,
                        text: data.text,
                        error: null
                    };
                } catch (err) {
                    return {
                        id: edition.id,
                        name: edition.name,
                        text: null,
                        error: 'فشل في تحميل التفسير'
                    };
                }
            });

            const results = await Promise.all(tafsirPromises);
            setTafsirData(results);
        } catch (error) {
            console.error('Failed to load tafsirs:', error);
        } finally {
            setLoading(false);
        }
    }

    // Handle scroll to update active card indicator
    function handleScroll(e) {
        const container = e.target;
        const cardWidth = container.offsetWidth * 0.85; // 85% card width
        const scrollPos = container.scrollLeft;
        const newActive = Math.round(scrollPos / cardWidth);
        setActiveCard(Math.max(0, Math.min(newActive, tafsirData.length - 1)));
    }

    // Scroll to specific card
    function scrollToCard(index) {
        if (scrollContainerRef.current) {
            const cardWidth = scrollContainerRef.current.offsetWidth * 0.85;
            scrollContainerRef.current.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth'
            });
        }
    }

    if (!tafsirOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="tafsir-backdrop"
                onClick={() => setTafsirOpen(false)}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 399,
                    backdropFilter: 'blur(4px)',
                }}
            />

            {/* Panel */}
            <div className={`tafsir-panel ${tafsirOpen ? 'open' : ''}`} style={{
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="tafsir-header">
                    <h3 className="tafsir-title">مقارنة التفاسير</h3>
                    <button
                        className="icon-btn"
                        onClick={() => setTafsirOpen(false)}
                        style={{ background: 'rgba(255,255,255,0.2)' }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="tafsir-content" style={{ overflow: 'hidden', padding: 0 }}>
                    {/* Ayah Text */}
                    <div className="tafsir-ayah" style={{
                        padding: 'var(--space-lg)',
                        borderBottom: '1px solid var(--bg-secondary)',
                        margin: 0
                    }}>
                        <span style={{
                            fontFamily: "'KFGQPC HAFS Uthmanic Script', 'Amiri Quran', var(--font-quran)",
                            fontSize: '1.3rem',
                            lineHeight: 2
                        }}>
                            {ayahText}
                        </span>
                        <span className="ayah-number" style={{ marginRight: 'var(--space-sm)' }}>
                            {currentAyah}
                        </span>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 'var(--space-xl)',
                            gap: 'var(--space-md)'
                        }}>
                            <div className="loading-spinner" style={{ width: 24, height: 24 }}></div>
                            <span style={{ color: 'var(--text-muted)' }}>جاري تحميل التفاسير...</span>
                        </div>
                    )}

                    {/* Tafsir Cards Container */}
                    {!loading && tafsirData.length > 0 && (
                        <>
                            {/* Card Indicators */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 'var(--space-xs)',
                                padding: 'var(--space-md)',
                                background: 'var(--bg-primary)'
                            }}>
                                {tafsirData.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => scrollToCard(index)}
                                        style={{
                                            width: activeCard === index ? 24 : 8,
                                            height: 8,
                                            borderRadius: 'var(--radius-full)',
                                            background: activeCard === index
                                                ? 'var(--gold-primary)'
                                                : 'var(--bg-tertiary)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            padding: 0
                                        }}
                                        title={tafsirData[index]?.name}
                                    />
                                ))}
                            </div>

                            {/* Scrollable Cards */}
                            <div
                                ref={scrollContainerRef}
                                onScroll={handleScroll}
                                style={{
                                    display: 'flex',
                                    overflowX: 'auto',
                                    scrollSnapType: 'x mandatory',
                                    scrollBehavior: 'smooth',
                                    gap: 'var(--space-md)',
                                    padding: 'var(--space-md)',
                                    WebkitOverflowScrolling: 'touch',
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none'
                                }}
                            >
                                {tafsirData.map((tafsir, index) => (
                                    <div
                                        key={tafsir.id}
                                        style={{
                                            flex: '0 0 85%',
                                            scrollSnapAlign: 'center',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-xl)',
                                            padding: 'var(--space-lg)',
                                            maxHeight: '45vh',
                                            overflowY: 'auto',
                                            border: activeCard === index
                                                ? '2px solid var(--gold-primary)'
                                                : '2px solid transparent',
                                            transition: 'border 0.2s ease'
                                        }}
                                    >
                                        {/* Card Header */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-sm)',
                                            marginBottom: 'var(--space-md)',
                                            paddingBottom: 'var(--space-md)',
                                            borderBottom: '1px solid var(--bg-tertiary)'
                                        }}>
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 36,
                                                height: 36,
                                                background: 'var(--gradient-royal)',
                                                borderRadius: 'var(--radius-md)',
                                                color: 'var(--gold-light)',
                                                fontWeight: 700,
                                                fontSize: '0.9rem'
                                            }}>
                                                {index + 1}
                                            </span>
                                            <div>
                                                <h4 style={{
                                                    color: 'var(--gold-primary)',
                                                    fontWeight: 700,
                                                    fontSize: '1rem',
                                                    margin: 0
                                                }}>
                                                    📖 {tafsir.name}
                                                </h4>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    {currentSurah?.name} - الآية {currentAyah}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        {tafsir.error ? (
                                            <p style={{
                                                color: 'var(--red-primary, #ef4444)',
                                                textAlign: 'center',
                                                padding: 'var(--space-lg)'
                                            }}>
                                                ⚠️ {tafsir.error}
                                            </p>
                                        ) : (
                                            <p style={{
                                                lineHeight: 2,
                                                fontSize: '1rem',
                                                color: 'var(--text-primary)',
                                                textAlign: 'justify'
                                            }}>
                                                {tafsir.text}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Swipe Hint */}
                            <div style={{
                                textAlign: 'center',
                                padding: 'var(--space-sm)',
                                color: 'var(--text-muted)',
                                fontSize: '0.8rem'
                            }}>
                                ← مرر للمقارنة بين {tafsirData.length} تفاسير →
                            </div>
                        </>
                    )}

                    {/* No tafsirs */}
                    {!loading && tafsirData.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: 'var(--space-xl)',
                            color: 'var(--text-muted)'
                        }}>
                            <p>لا توجد تفاسير متاحة</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
