import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function BookmarksPage() {
    const navigate = useNavigate();
    const { bookmarks, removeBookmark } = useStore();

    function handleClick(bookmark) {
        navigate(`/surah/${bookmark.surah}?ayah=${bookmark.ayah}`);
    }

    function handleRemove(e, surah, ayah) {
        e.stopPropagation();
        removeBookmark(surah, ayah);
    }

    return (
        <div className="page">
            <div className="page-header">
                <h2 className="page-title">الإشارات المرجعية</h2>
            </div>

            {bookmarks.length === 0 ? (
                <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p>لا توجد إشارات مرجعية بعد</p>
                    <p style={{ fontSize: '0.9rem', marginTop: 'var(--space-sm)' }}>
                        اضغط على أي آية ثم اختر الإشارة لحفظها هنا
                    </p>
                </div>
            ) : (
                <div className="bookmarks-list">
                    {bookmarks.map((bookmark, index) => (
                        <div
                            key={index}
                            className="bookmark-item"
                            onClick={() => handleClick(bookmark)}
                            style={{
                                background: 'var(--bg-card)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--space-lg)',
                                marginBottom: 'var(--space-md)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: 'var(--shadow-sm)',
                                transition: 'all var(--transition-fast)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <div className="surah-number" style={{ width: 40, height: 40 }}>
                                    {bookmark.surah}
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-quran)', fontSize: '1.3rem', color: 'var(--text-quran)' }}>
                                        {bookmark.surahName}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {bookmark.surahNameEn} • الآية {bookmark.ayah}
                                    </div>
                                </div>
                            </div>

                            <button
                                className="icon-btn"
                                onClick={(e) => handleRemove(e, bookmark.surah, bookmark.ayah)}
                                style={{ background: 'var(--bg-secondary)' }}
                                aria-label="حذف"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
