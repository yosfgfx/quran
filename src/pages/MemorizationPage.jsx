import useStore from '../store/useStore';

export default function MemorizationPage() {
    const {
        totalMemorized,
        streak,
        todayProgress,
        settings,
        surahs,
    } = useStore();

    const goalProgress = Math.min((todayProgress / settings.dailyGoal) * 100, 100);

    return (
        <div className="page">
            <div className="page-header">
                <h2 className="page-title">نظام الحفظ الذكي</h2>
            </div>

            <div className="memorization-content">
                {/* Stats Cards */}
                <div className="memorization-stats">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-value">{totalMemorized}</div>
                        <div className="stat-label">آيات محفوظة</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🔥</div>
                        <div className="stat-value">{streak}</div>
                        <div className="stat-label">أيام متتالية</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-value">{settings.dailyGoal}</div>
                        <div className="stat-label">الهدف اليومي</div>
                    </div>
                </div>

                {/* Daily Progress */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-xl)',
                    marginBottom: 'var(--space-xl)',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    <h3 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>
                        تقدم اليوم
                    </h3>
                    <div className="progress-bar" style={{ height: 12, background: 'var(--bg-secondary)' }}>
                        <div
                            className="progress-fill"
                            style={{
                                width: `${goalProgress}%`,
                                transition: 'width 0.5s ease',
                            }}
                        ></div>
                    </div>
                    <p style={{
                        textAlign: 'center',
                        marginTop: 'var(--space-md)',
                        color: 'var(--text-muted)',
                        fontSize: '0.95rem',
                    }}>
                        {todayProgress} / {settings.dailyGoal} آيات
                        {goalProgress >= 100 && ' 🎉'}
                    </p>
                </div>

                {/* Suggested Surahs */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-xl)',
                    marginBottom: 'var(--space-xl)',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    <h3 style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-primary)' }}>
                        💡 سور مقترحة للحفظ
                    </h3>

                    {/* Short Surahs (Juz Amma) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-md)' }}>
                        {surahs.slice(-10).reverse().map(surah => (
                            <div
                                key={surah.number}
                                style={{
                                    background: 'var(--gradient-royal)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-md)',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform var(--transition-fast)',
                                }}
                                onClick={() => window.location.href = `#/surah/${surah.number}`}
                            >
                                <div style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-quran)', fontSize: '1.1rem' }}>
                                    {surah.name}
                                </div>
                                <div style={{ color: 'var(--text-light-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                                    {surah.numberOfAyahs} آية
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tips */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.1) 0%, rgba(27, 67, 50, 0.1) 100%)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-xl)',
                    borderRight: '4px solid var(--gold-primary)',
                }}>
                    <h3 style={{ color: 'var(--gold-primary)', marginBottom: 'var(--space-md)' }}>
                        📝 نصائح للحفظ
                    </h3>
                    <ul style={{
                        listStyle: 'none',
                        color: 'var(--text-primary)',
                        lineHeight: 2,
                    }}>
                        <li>• كرّر كل آية 10 مرات قبل الانتقال للتالية</li>
                        <li>• اربط بين الآيات بالمعنى لا بالصوت فقط</li>
                        <li>• راجع ما حفظته قبل النوم وبعد الاستيقاظ</li>
                        <li>• استمع للتلاوة أثناء التنقل والعمل</li>
                        <li>• ثبّت وقتاً يومياً للحفظ والمراجعة</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
