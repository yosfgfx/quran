import { useState, useEffect } from 'react';
import { getUserLocation, getPrayerTimes, getNextPrayer, getCityName } from '../services/locationService';

// Prayer icons mapping
const PRAYER_ICONS = {
    fajr: '🌅',
    sunrise: '☀️',
    dhuhr: '🌞',
    asr: '🌤️',
    maghrib: '🌇',
    isha: '🌙'
};

const PRAYER_NAMES = {
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
};

export default function PrayerTimesPage() {
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState(null);
    const [cityName, setCityName] = useState('');

    useEffect(() => {
        loadPrayerTimes();
    }, []);

    async function loadPrayerTimes() {
        setLoading(true);
        setError(null);

        try {
            const coords = await getUserLocation();
            setLocation(coords);

            // Fetch prayer times and city name in parallel
            const [times, city] = await Promise.all([
                getPrayerTimes(coords.lat, coords.lng),
                getCityName(coords.lat, coords.lng)
            ]);

            setPrayerTimes(times);
            setNextPrayer(getNextPrayer(times));
            setCityName(city);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Update next prayer every minute
    useEffect(() => {
        if (!prayerTimes) return;

        const interval = setInterval(() => {
            setNextPrayer(getNextPrayer(prayerTimes));
        }, 60000);

        return () => clearInterval(interval);
    }, [prayerTimes]);

    if (loading) {
        return (
            <div className="page" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                gap: 'var(--space-lg)'
            }}>
                <div className="loading-spinner"></div>
                <p style={{ color: 'var(--text-muted)' }}>جاري تحديد موقعك...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="page-header">
                    <h2 className="page-title">مواقيت الصلاة</h2>
                </div>
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-xl)',
                    color: 'var(--text-secondary)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>📍</div>
                    <p style={{ marginBottom: 'var(--space-md)' }}>{error}</p>
                    <button
                        onClick={loadPrayerTimes}
                        style={{
                            background: 'var(--gradient-royal)',
                            color: 'var(--gold-light)',
                            border: 'none',
                            padding: 'var(--space-md) var(--space-xl)',
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

    // Calculate progress percentage between previous and next prayer
    function calculateProgress(times, next) {
        if (!times || !next) return 0;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Find next prayer minutes
        const [nextH, nextM] = next.time.split(':').map(Number);
        let nextMinutes = nextH * 60 + nextM;

        // Find previous prayer minutes
        let prevMinutes = 0;

        // Handle "Next is Fajr" special cases (crossing midnight)
        if (next.name === 'الفجر') {
            const [ishaH, ishaM] = times.isha.split(':').map(Number);

            if (next.remaining.includes('غداً') || next.remaining.includes('ساعة')) {
                // If remaining is long (tomorrow), current time is late night (after Isha)
                // Previous is Isha today
                prevMinutes = ishaH * 60 + ishaM;
                nextMinutes += 24 * 60; // Next fajr is tomorrow
            } else {
                // Early morning before Fajr
                // Previous is Isha yesterday
                prevMinutes = (ishaH * 60 + ishaM) - (24 * 60);
            }
        } else {
            // Normal case: find the prayer strictly before current time
            const prayerList = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
            let maxPrev = -9999;

            prayerList.forEach(p => {
                const [h, m] = times[p].split(':').map(Number);
                const mins = h * 60 + m;
                if (mins <= currentMinutes && mins > maxPrev) {
                    maxPrev = mins;
                }
            });

            // If we found a previous prayer today
            if (maxPrev !== -9999) {
                prevMinutes = maxPrev;
            } else {
                // Should not happen unless logic is off, fallback
                return 0;
            }
        }

        const totalDuration = nextMinutes - prevMinutes;
        const elapsed = currentMinutes - prevMinutes;

        if (totalDuration <= 0) return 0;
        return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    }

    return (
        <div className="page">
            <div className="page-header">
                <h2 className="page-title">مواقيت الصلاة</h2>
                {/* City Name - Prominent Display */}
                {cityName && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-sm)',
                        marginTop: 'var(--space-sm)',
                        color: 'var(--gold-primary)',
                        fontSize: '1.3rem',
                        fontWeight: 700
                    }}>
                        <span>📍</span>
                        <span>{cityName}</span>
                    </div>
                )}
            </div>

            {/* Hijri Date */}
            {prayerTimes && (
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-md)',
                    marginBottom: 'var(--space-lg)',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)'
                }}>
                    <div style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>
                        {prayerTimes.hijri}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {prayerTimes.hijriMonth} {prayerTimes.hijriYear}
                    </div>
                </div>
            )}

            {/* Next Prayer Card */}
            {nextPrayer && (
                <div style={{
                    background: 'var(--gradient-royal)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-xl)',
                    marginBottom: 'var(--space-xl)',
                    textAlign: 'center',
                    color: 'var(--gold-light)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: 'var(--space-sm)' }}>
                        الصلاة القادمة
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                        {nextPrayer.name}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono, monospace)' }}>
                        {nextPrayer.time}
                    </div>

                    {/* Progress Bar Container */}
                    <div style={{
                        marginTop: 'var(--space-lg)',
                        background: 'rgba(255,255,255,0.1)',
                        height: '8px',
                        borderRadius: '10px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Progress Fill */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0, // RTL
                            height: '100%',
                            width: `${Math.min(100, Math.max(0, calculateProgress(prayerTimes, nextPrayer)))}%`,
                            background: 'linear-gradient(270deg, #FCD34D 0%, #F59E0B 100%)',
                            borderRadius: '10px',
                            transition: 'width 1s linear',
                            boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
                        }} />
                    </div>

                    <div style={{
                        marginTop: 'var(--space-md)',
                        fontSize: '0.9rem',
                        background: 'rgba(255,255,255,0.15)',
                        padding: 'var(--space-sm) var(--space-md)',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-block',
                        fontWeight: 'bold'
                    }}>
                        ⏱️ متبقي: {nextPrayer.remaining}
                    </div>
                </div>
            )}

            {/* Prayer Times Grid */}
            <div style={{
                display: 'grid',
                gap: 'var(--space-md)'
            }}>
                {prayers.map(prayer => (
                    <div
                        key={prayer}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'var(--space-lg)',
                            background: nextPrayer?.name === PRAYER_NAMES[prayer]
                                ? 'var(--bg-highlight, rgba(212,175,55,0.1))'
                                : 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-lg)',
                            border: nextPrayer?.name === PRAYER_NAMES[prayer]
                                ? '2px solid var(--gold-primary)'
                                : '2px solid transparent'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <span style={{ fontSize: '1.5rem' }}>{PRAYER_ICONS[prayer]}</span>
                            <span style={{
                                fontWeight: 600,
                                color: nextPrayer?.name === PRAYER_NAMES[prayer]
                                    ? 'var(--gold-primary)'
                                    : 'var(--text-primary)'
                            }}>
                                {PRAYER_NAMES[prayer]}
                            </span>
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            color: 'var(--text-quran)'
                        }}>
                            {prayerTimes?.[prayer]}
                        </div>
                    </div>
                ))}
            </div>

            {/* Location info */}
            {location && (
                <div style={{
                    textAlign: 'center',
                    marginTop: 'var(--space-xl)',
                    padding: 'var(--space-md)',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                }}>
                    📍 {prayerTimes?.date}
                </div>
            )}
        </div>
    );
}
