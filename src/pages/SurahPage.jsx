import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';
import { getSurah } from '../services/quranAPI';
import { isBookmarked, addBookmark, removeBookmark, setLastRead as saveLastRead } from '../services/storage';
import { trackAyahWithContext } from '../services/journeyService';
import ReflectionModal from '../components/ReflectionModal';

// Component to render a single surah block
function SurahBlock({ surah, isFirst, onAyahClick, activeAyah, activeSurah, settings, onPlayAyah, onTafsir, onBookmark, onShare, onReflection, bookmarked }) {
    const showBismillah = surah.number !== 1 && surah.number !== 9;

    return (
        <div className="surah-block" id={`surah-${surah.number}`}>
            {/* Surah Header */}
            <div className="surah-block-header">
                <div className="surah-number-badge">{surah.number}</div>
                <h2 className="surah-block-title">{surah.name}</h2>
                <p className="surah-block-meta">
                    {surah.englishName} • {surah.numberOfAyahs} آية •
                    <span className={`revelation-badge ${surah.revelationType.toLowerCase()}`}>
                        {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                    </span>
                </p>
            </div>

            {/* Bismillah */}
            {showBismillah && (
                <div className="bismillah-container">
                    <span className="bismillah">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</span>
                </div>
            )}

            {/* Ayat */}
            <div
                className="ayat-container"
                style={{
                    fontSize: `${settings.fontSize}px`,
                    fontFamily: settings.quranFont === 'amiri'
                        ? "'Amiri Quran', 'Amiri', serif"
                        : "'KFGQPC HAFS Uthmanic Script', 'Amiri Quran', serif"
                }}
            >
                {surah.ayahs?.map((ayah) => (
                    <span
                        key={`${surah.number}-${ayah.numberInSurah}`}
                        id={`ayah-${surah.number}-${ayah.numberInSurah}`}
                        className={`ayah ${activeSurah === surah.number && activeAyah === ayah.numberInSurah ? 'active' : ''}`}
                        onClick={() => onAyahClick(surah, ayah)}
                    >
                        {ayah.text}
                        <span className="ayah-number">{ayah.numberInSurah}</span>

                        {/* Ayah Actions */}
                        {activeSurah === surah.number && activeAyah === ayah.numberInSurah && (
                            <span className="ayah-actions" style={{
                                display: 'inline-flex',
                                gap: '4px',
                                marginRight: '8px',
                                verticalAlign: 'middle',
                            }}>
                                <button
                                    className="ayah-action-btn"
                                    onClick={(e) => onPlayAyah(surah, ayah, e)}
                                    title="تشغيل"
                                    style={{
                                        width: 28,
                                        height: 28,
                                        border: 'none',
                                        borderRadius: '50%',
                                        background: 'var(--gold-primary)',
                                        color: 'var(--night-primary)',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                </button>
                                <button
                                    className="ayah-action-btn"
                                    onClick={(e) => onTafsir(surah, ayah, e)}
                                    title="التفسير"
                                    style={{
                                        width: 28,
                                        height: 28,
                                        border: 'none',
                                        borderRadius: '50%',
                                        background: 'var(--emerald-primary)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                    </svg>
                                </button>
                                <button
                                    className="ayah-action-btn"
                                    onClick={(e) => { e.stopPropagation(); onBookmark(surah, ayah); }}
                                    title={bookmarked ? "إزالة الإشارة" : "إضافة إشارة"}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        border: 'none',
                                        borderRadius: '50%',
                                        background: bookmarked ? 'var(--gold-primary)' : 'var(--bg-secondary)',
                                        color: bookmarked ? 'var(--night-primary)' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="14" height="14">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                </button>
                                <button
                                    className="ayah-action-btn"
                                    onClick={(e) => { e.stopPropagation(); onShare(surah, ayah); }}
                                    title="مشاركة"
                                    style={{
                                        width: 28,
                                        height: 28,
                                        border: 'none',
                                        borderRadius: '50%',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                        <circle cx="18" cy="5" r="3"></circle>
                                        <circle cx="6" cy="12" r="3"></circle>
                                        <circle cx="18" cy="19" r="3"></circle>
                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                    </svg>
                                </button>
                                <button
                                    className="ayah-action-btn"
                                    onClick={(e) => { e.stopPropagation(); onReflection(surah, ayah); }}
                                    title="كتابة خاطرة"
                                    style={{
                                        width: 28,
                                        height: 28,
                                        border: 'none',
                                        borderRadius: '50%',
                                        background: 'var(--night-secondary)',
                                        color: 'var(--gold-primary)',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    💭
                                </button>
                            </span>
                        )}
                    </span>
                ))}
            </div>

            {/* End of Surah Divider */}
            <div className="surah-end-divider">
                <div className="divider-ornament">❁</div>
                <span>انتهت سورة {surah.name}</span>
            </div>
        </div>
    );
}

export default function SurahPage() {
    const { number } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialAyah = searchParams.get('ayah');
    const containerRef = useRef(null);
    const loadingRef = useRef(null);
    const observerRef = useRef(null);

    const {
        setCurrentSurah,
        setCurrentAyah,
        setAudioVisible,
        setIsPlaying,
        setTafsirOpen,
        setTafsirData,
        setLastRead,
        settings,
        surahs,
        audioVisible,
    } = useStore();

    const [loadedSurahs, setLoadedSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeAyah, setActiveAyah] = useState(null);
    const [activeSurah, setActiveSurah] = useState(null);
    const [bookmarked, setBookmarked] = useState(false);
    const [showBookmarkRibbon, setShowBookmarkRibbon] = useState(false);

    // Reflection modal state
    const [reflectionModalOpen, setReflectionModalOpen] = useState(false);
    const [reflectionAyah, setReflectionAyah] = useState(null);
    const [reflectionSurah, setReflectionSurah] = useState(null);

    // Load initial surah
    useEffect(() => {
        async function loadInitialSurah() {
            setLoading(true);
            setLoadedSurahs([]);
            setActiveAyah(null);
            setActiveSurah(null);

            try {
                const surah = await getSurah(parseInt(number));
                setLoadedSurahs([surah]);
                setCurrentSurah(surah);

                // Scroll to specific ayah if provided
                if (initialAyah) {
                    setTimeout(() => {
                        const el = document.getElementById(`ayah-${number}-${initialAyah}`);
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            setActiveAyah(parseInt(initialAyah));
                            setActiveSurah(parseInt(number));
                        }
                    }, 500);
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } catch (error) {
                console.error('Failed to load surah:', error);
            } finally {
                setLoading(false);
            }
        }

        loadInitialSurah();
    }, [number, setCurrentSurah, initialAyah]);

    // Infinite scroll - load next surah when reaching bottom
    useEffect(() => {
        if (!loadingRef.current || loading) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !loadingMore && loadedSurahs.length > 0) {
                    loadNextSurah();
                }
            },
            {
                root: null,
                rootMargin: '200px',
                threshold: 0.1,
            }
        );

        observerRef.current.observe(loadingRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadedSurahs, loadingMore, loading]);

    // Load next surah (thread-style)
    async function loadNextSurah() {
        if (loadingMore || loadedSurahs.length === 0) return;

        const lastSurah = loadedSurahs[loadedSurahs.length - 1];
        const nextNumber = lastSurah.number >= 114 ? 1 : lastSurah.number + 1;

        // Don't load more than 5 surahs at once for performance
        if (loadedSurahs.length >= 5) return;

        setLoadingMore(true);

        try {
            const nextSurah = await getSurah(nextNumber);
            setLoadedSurahs(prev => [...prev, nextSurah]);
        } catch (error) {
            console.error('Failed to load next surah:', error);
        } finally {
            setLoadingMore(false);
        }
    }

    // Handle ayah click
    function handleAyahClick(surah, ayah) {
        setActiveAyah(ayah.numberInSurah);
        setActiveSurah(surah.number);
        setCurrentSurah(surah);
        setCurrentAyah(ayah.numberInSurah);
        setAudioVisible(true);
        setShowBookmarkRibbon(true);

        // Save last read position
        setLastRead(surah.number, ayah.numberInSurah, surah.name);

        // Track for smart journey insights
        trackAyahWithContext(surah.number, ayah.numberInSurah, surah.name);
    }

    // Handle play audio
    function handlePlayAyah(surah, ayah, e) {
        e.stopPropagation();
        setCurrentSurah(surah);
        setCurrentAyah(ayah.numberInSurah);
        setAudioVisible(true);
        setIsPlaying(true);
    }

    // Handle tafsir
    function handleTafsir(surah, ayah, e) {
        e.stopPropagation();
        setCurrentSurah(surah); // Fix: Update context to prevent audio 404s
        setCurrentAyah(ayah.numberInSurah);
        setTafsirData({
            surah: surah,
            ayah: ayah.numberInSurah,
            text: ayah.text,
        });
        setTafsirOpen(true);
    }

    // Handle bookmark
    function handleBookmark(surah, ayah) {
        const isMarked = isBookmarked(surah.number, ayah.numberInSurah);
        if (isMarked) {
            removeBookmark(surah.number, ayah.numberInSurah);
        } else {
            addBookmark({
                surah: surah.number,
                ayah: ayah.numberInSurah,
                surahName: surah.name,
                surahNameEn: surah.englishName,
            });
        }
        setBookmarked(!isMarked);
    }

    // Handle share
    async function handleShare(surah, ayah) {
        if (!ayah) return;

        const shareText = `﴿${ayah.text}﴾\n[سورة ${surah.name} - الآية ${ayah.numberInSurah}]`;
        const shareUrl = `${window.location.origin}/surah/${surah.number}?ayah=${ayah.numberInSurah}`;

        const shareData = {
            title: 'القرآن الكريم',
            text: shareText,
            url: shareUrl
        };

        // Try native share first
        try {
            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                return; // Share successful
            }
        } catch (err) {
            console.log('Native share failed or cancelled:', err);
            // Continue to fallback
        }

        // Fallback: Copy to clipboard
        try {
            await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
            showToast('تم نسخ الآية والرابط');
        } catch (err) {
            console.error('Clipboard copy failed:', err);
            showToast('فشل النسخ: المتصفح لا يدعم هذه الميزة');
        }
    }

    // Handle reflection
    function handleReflection(surah, ayah) {
        setReflectionSurah(surah);
        setReflectionAyah(ayah);
        setReflectionModalOpen(true);
    }

    // Handle save position
    function handleSavePosition() {
        if (!activeSurah || !activeAyah) return;

        const surah = loadedSurahs.find(s => s.number === activeSurah);
        if (surah) {
            saveLastRead(surah.number, activeAyah, surah.name);
            setLastRead(surah.number, activeAyah, surah.name);
            setShowBookmarkRibbon(false);
            showToast('تم حفظ موضع القراءة');
        }
    }

    // Show toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
      position: fixed;
      bottom: ${audioVisible ? '140px' : '100px'};
      left: 50%;
      transform: translateX(-50%);
      background: var(--gradient-royal);
      color: var(--gold-light);
      padding: 12px 24px;
      border-radius: 30px;
      font-size: 14px;
      z-index: 9999;
      animation: fadeInUp 0.3s ease;
    `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Check bookmark status
    useEffect(() => {
        if (activeSurah && activeAyah) {
            setBookmarked(isBookmarked(activeSurah, activeAyah));
        }
    }, [activeSurah, activeAyah]);

    // Navigate to prev/next surah (for header navigation)
    function goToPrevSurah() {
        const currentNum = parseInt(number);
        const prevNumber = currentNum <= 1 ? 114 : currentNum - 1;
        navigate(`/surah/${prevNumber}`);
    }

    function goToNextSurah() {
        const currentNum = parseInt(number);
        const nextNumber = currentNum >= 114 ? 1 : currentNum + 1;
        navigate(`/surah/${nextNumber}`);
    }

    if (loading) {
        return (
            <div className="page surah-reader">
                <div className="skeleton" style={{ height: 60, marginBottom: 'var(--space-lg)' }}></div>
                <div className="skeleton" style={{ height: 40, width: 300, margin: '0 auto var(--space-xl)' }}></div>
                <div className="skeleton" style={{ height: 400 }}></div>
            </div>
        );
    }

    if (loadedSurahs.length === 0) {
        return (
            <div className="page empty-state">
                <p>عذراً، لم نتمكن من تحميل السورة</p>
            </div>
        );
    }

    const firstSurah = loadedSurahs[0];
    const prevSurah = surahs.find(s => s.number === (firstSurah.number <= 1 ? 114 : firstSurah.number - 1));
    const nextSurah = surahs.find(s => s.number === (firstSurah.number >= 114 ? 1 : firstSurah.number + 1));

    return (
        <div className="page surah-reader thread-mode" ref={containerRef}>
            {/* Header Navigation */}
            <div className="reader-header-enhanced">
                <div className="surah-nav">
                    <button className="surah-nav-btn" onClick={goToPrevSurah} title={prevSurah?.name}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <span className="nav-label">{prevSurah?.name}</span>
                    </button>
                </div>

                <div className="reader-info-centered">
                    <div className="surah-number-badge">{firstSurah.number}</div>
                    <h1 className="reader-title-large">{firstSurah.name}</h1>
                    <p className="reader-meta-enhanced">
                        وضع القراءة المتصلة
                    </p>
                </div>

                <div className="surah-nav">
                    <button className="surah-nav-btn" onClick={goToNextSurah} title={nextSurah?.name}>
                        <span className="nav-label">{nextSurah?.name}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Thread of Surahs */}
            <div className="surahs-thread">
                {loadedSurahs.map((surah, index) => (
                    <SurahBlock
                        key={surah.number}
                        surah={surah}
                        isFirst={index === 0}
                        onAyahClick={handleAyahClick}
                        activeAyah={activeAyah}
                        activeSurah={activeSurah}
                        settings={settings}
                        onPlayAyah={handlePlayAyah}
                        onTafsir={handleTafsir}
                        onBookmark={handleBookmark}
                        onShare={handleShare}
                        onReflection={handleReflection}
                        bookmarked={bookmarked && activeSurah === surah.number}
                    />
                ))}
            </div>

            {/* Loading More Indicator */}
            <div
                ref={loadingRef}
                className="load-more-trigger"
                style={{ paddingBottom: audioVisible ? '140px' : '80px' }}
            >
                {loadingMore ? (
                    <div className="loading-more">
                        <div className="loading-spinner"></div>
                        <p>جارٍ تحميل السورة التالية...</p>
                    </div>
                ) : loadedSurahs.length < 5 ? (
                    <div className="scroll-hint">
                        <div className="scroll-arrow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <polyline points="7 13 12 18 17 13"></polyline>
                                <polyline points="7 6 12 11 17 6"></polyline>
                            </svg>
                        </div>
                        <span>استمر بالسكرول لتحميل المزيد</span>
                    </div>
                ) : (
                    <div className="max-loaded">
                        <p>تم تحميل 5 سور • <button onClick={() => setLoadedSurahs([loadedSurahs[loadedSurahs.length - 1]])}>ابدأ من هنا</button></p>
                    </div>
                )}
            </div>

            {/* Bookmark Ribbon */}
            {showBookmarkRibbon && activeAyah && activeSurah && (
                <div
                    className="bookmark-ribbon"
                    style={{ bottom: audioVisible ? '100px' : '80px' }}
                >
                    <div className="ribbon-content">
                        <span className="ribbon-text">
                            الآية {activeAyah} من سورة {loadedSurahs.find(s => s.number === activeSurah)?.name}
                        </span>
                        <button className="ribbon-btn" onClick={handleSavePosition}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>حفظ موضع القراءة</span>
                        </button>
                        <button
                            className="ribbon-close"
                            onClick={() => setShowBookmarkRibbon(false)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Reflection Modal */}
            <ReflectionModal
                isOpen={reflectionModalOpen}
                onClose={() => setReflectionModalOpen(false)}
                surah={reflectionSurah}
                ayah={reflectionAyah}
            />
        </div>
    );
}
// Version: 1.1.0 (Cache Buster for Reflection Fix)
