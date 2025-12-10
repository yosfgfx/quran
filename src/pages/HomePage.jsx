import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import SurahCard from '../components/SurahCard';

export default function HomePage() {
    const navigate = useNavigate();
    const { surahs, filter, setFilter, lastRead } = useStore();

    // Filter surahs based on revelation type
    const filteredSurahs = surahs.filter(surah => {
        if (filter === 'all') return true;
        if (filter === 'meccan') return surah.revelationType === 'Meccan';
        if (filter === 'medinan') return surah.revelationType === 'Medinan';
        return true;
    });

    return (
        <div className="page">
            {/* Journey Card - Featured */}
            <button
                onClick={() => navigate('/journey')}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-lg)',
                    padding: 'var(--space-lg)',
                    background: 'var(--gradient-royal)',
                    border: 'none',
                    borderRadius: 'var(--radius-xl)',
                    cursor: 'pointer',
                    color: 'var(--gold-light)',
                    marginBottom: 'var(--space-lg)',
                    textAlign: 'right'
                }}
            >
                <span style={{ fontSize: '2.5rem' }}>🛤️</span>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 'var(--space-xs)' }}>
                        رحلتي مع القرآن
                    </div>
                    <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                        نظام ذكي يفهم علاقتك الشخصية بالقرآن
                    </div>
                </div>
            </button>

            {/* Quick Links */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-xl)'
            }}>
                <button
                    onClick={() => navigate('/prayer-times')}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        padding: 'var(--space-lg)',
                        background: 'var(--bg-secondary)',
                        border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>🕌</span>
                    <span style={{ fontWeight: 600 }}>مواقيت الصلاة</span>
                </button>
                <button
                    onClick={() => navigate('/qibla')}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        padding: 'var(--space-lg)',
                        background: 'var(--bg-secondary)',
                        border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>🕋</span>
                    <span style={{ fontWeight: 600 }}>اتجاه القبلة</span>
                </button>
            </div>

            <div className="page-header">
                <h2 className="page-title">سور القرآن الكريم</h2>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        الكل ({surahs.length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'meccan' ? 'active' : ''}`}
                        onClick={() => setFilter('meccan')}
                    >
                        مكية ({surahs.filter(s => s.revelationType === 'Meccan').length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'medinan' ? 'active' : ''}`}
                        onClick={() => setFilter('medinan')}
                    >
                        مدنية ({surahs.filter(s => s.revelationType === 'Medinan').length})
                    </button>
                </div>
            </div>

            {/* Surah Grid */}
            <div className="surah-grid">
                {filteredSurahs.length === 0 ? (
                    // Loading skeletons
                    Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="surah-card skeleton" style={{ height: 120 }}></div>
                    ))
                ) : (
                    filteredSurahs.map(surah => (
                        <SurahCard key={surah.number} surah={surah} />
                    ))
                )}
            </div>
        </div>
    );
}
