import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { getAyahWithAudio, RECITERS } from '../services/quranAPI';

export default function AudioPlayer() {
    const navigate = useNavigate();
    const audioRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [showSettings, setShowSettings] = useState(false);

    const {
        audioVisible,
        setAudioVisible,
        audioMinimized,
        setAudioMinimized,
        isPlaying,
        setIsPlaying,
        currentSurah,
        currentAyah,
        setCurrentAyah,
        repeatMode,
        toggleRepeat,
        settings,
        setReciter,
    } = useStore();

    const [audioUrl, setAudioUrl] = useState(null);

    // Load audio when ayah or reciter changes
    useEffect(() => {
        if (currentSurah && currentAyah) {
            loadAudio();
        }
    }, [currentSurah?.number, currentAyah, settings.reciter]);

    async function loadAudio() {
        try {
            const data = await getAyahWithAudio(currentSurah.number, currentAyah, settings.reciter);
            setAudioUrl(data.audio);
        } catch (error) {
            console.error('Failed to load audio:', error);
        }
    }

    // Handle play/pause
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(() => setIsPlaying(false));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, audioUrl]);

    // Handle audio events
    function handleTimeUpdate() {
        if (audioRef.current) {
            const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(percent || 0);
        }
    }

    function handleEnded() {
        if (repeatMode) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        } else {
            if (currentAyah < currentSurah.numberOfAyahs) {
                setCurrentAyah(currentAyah + 1);
            } else {
                setIsPlaying(false);
            }
        }
    }

    function handlePrev() {
        if (currentAyah > 1) {
            setCurrentAyah(currentAyah - 1);
        }
    }

    function handleNext() {
        if (currentAyah < currentSurah?.numberOfAyahs) {
            setCurrentAyah(currentAyah + 1);
        }
    }

    function handleProgressClick(e) {
        if (audioRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = percent * audioRef.current.duration;
        }
    }

    function handleClose() {
        setIsPlaying(false);
        setAudioVisible(false);
        setAudioMinimized(false);
    }

    // Instant reciter change
    function handleReciterChange(reciterId) {
        setReciter(reciterId);
        setShowSettings(false);
        // Audio will reload automatically due to useEffect
    }

    const currentReciter = RECITERS.find(r => r.id === settings.reciter) || RECITERS[0];

    if (!audioVisible) return null;

    // Minimized mode
    if (audioMinimized) {
        return (
            <button
                className="audio-minimized-btn"
                onClick={() => setAudioMinimized(false)}
                aria-label="إظهار المشغل"
            >
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                {isPlaying && <span className="pulse-dot"></span>}
            </button>
        );
    }

    return (
        <>
            <div className="audio-player-modern visible">
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    onCanPlay={() => isPlaying && audioRef.current.play()}
                />

                {/* Top Actions */}
                <div className="player-top-actions">
                    {/* Current Reciter Quick Switch */}
                    <button
                        className="player-action-btn reciter-quick-btn"
                        onClick={() => setShowSettings(!showSettings)}
                        title={currentReciter.name}
                    >
                        <span className="reciter-name-short">{currentReciter.name.split(' ')[0]}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    <button
                        className="player-action-btn"
                        onClick={() => setAudioMinimized(true)}
                        title="تصغير"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <polyline points="4 14 10 14 10 20"></polyline>
                            <polyline points="20 10 14 10 14 4"></polyline>
                            <line x1="14" y1="10" x2="21" y2="3"></line>
                            <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                    </button>

                    <button
                        className="player-action-btn close-btn"
                        onClick={handleClose}
                        title="إغلاق"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Settings Panel - Reciter Selection */}
                {showSettings && (
                    <div className="player-settings-panel">
                        <div className="settings-header">
                            <span>🎙️ اختر القارئ</span>
                            <button onClick={() => setShowSettings(false)}>✕</button>
                        </div>
                        <div className="reciters-list">
                            {RECITERS.map(r => (
                                <button
                                    key={r.id}
                                    className={`reciter-option ${settings.reciter === r.id ? 'active' : ''}`}
                                    onClick={() => handleReciterChange(r.id)}
                                >
                                    <span className="reciter-name">{r.name}</span>
                                    {settings.reciter === r.id && <span className="check">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Player Content */}
                <div className="player-main">
                    {/* Info */}
                    <div className="player-info">
                        <span className="player-surah">{currentSurah?.name}</span>
                        <span className="player-ayah">الآية {currentAyah} من {currentSurah?.numberOfAyahs}</span>
                    </div>

                    {/* Controls */}
                    <div className="player-controls">
                        <button
                            className={`control-btn small ${repeatMode ? 'active' : ''}`}
                            onClick={toggleRepeat}
                            title="تكرار"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <polyline points="17 1 21 5 17 9"></polyline>
                                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                <polyline points="7 23 3 19 7 15"></polyline>
                                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                            </svg>
                        </button>

                        <button className="control-btn" onClick={handlePrev} title="السابق">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                                <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"></line>
                            </svg>
                        </button>

                        <button
                            className={`control-btn play-main ${isPlaying ? 'playing' : ''}`}
                            onClick={() => setIsPlaying(!isPlaying)}
                            title={isPlaying ? 'إيقاف' : 'تشغيل'}
                        >
                            {isPlaying ? (
                                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                    <rect x="6" y="4" width="4" height="16"></rect>
                                    <rect x="14" y="4" width="4" height="16"></rect>
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            )}
                        </button>

                        <button className="control-btn" onClick={handleNext} title="التالي">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                                <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"></line>
                            </svg>
                        </button>

                        <button
                            className="control-btn small"
                            onClick={() => navigate('/settings')}
                            title="الإعدادات"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Progress */}
                    <div className="player-progress" onClick={handleProgressClick}>
                        <div className="progress-track">
                            <div className="progress-fill-modern" style={{ width: `${progress}%` }}></div>
                            <div className="progress-thumb" style={{ left: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
