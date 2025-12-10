import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import LogoSVG from '../assets/logo.svg';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme, setSearchOpen, lastRead } = useStore();

    const isHome = location.pathname === '/';

    return (
        <header className="header">
            <div className="header-container">
                {/* Menu / Back Button */}
                {!isHome ? (
                    <button
                        className="icon-btn back-btn"
                        onClick={() => navigate(-1)}
                        aria-label="رجوع"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                ) : (
                    <div style={{ width: 44 }} />
                )}

                {/* Logo */}
                <div className="logo" onClick={() => navigate('/')}>
                    <img src={LogoSVG} alt="شعار القرآن" className="logo-icon-img" />
                    <h1 className="logo-text">القرآن الكريم</h1>
                </div>

                {/* Actions */}
                <div className="header-actions">
                    {/* Search */}
                    <button
                        className="icon-btn"
                        onClick={() => setSearchOpen(true)}
                        aria-label="البحث"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>

                    {/* Bookmarks */}
                    <button
                        className="icon-btn"
                        onClick={() => navigate('/bookmarks')}
                        aria-label="المحفوظات"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        className="icon-btn theme-btn"
                        onClick={toggleTheme}
                        aria-label="تبديل الوضع"
                    >
                        {theme === 'light' ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Last Read Banner */}
            {isHome && lastRead && (
                <div
                    className="last-read-banner"
                    onClick={() => navigate(`/surah/${lastRead.surah}?ayah=${lastRead.ayah}`)}
                >
                    <span>متابعة القراءة: {lastRead.surahName} - الآية {lastRead.ayah}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            )}
        </header>
    );
}
