import useStore from '../store/useStore';
import { RECITERS, TAFSIR_EDITIONS } from '../services/quranAPI';
import DeveloperInfo from '../components/DeveloperInfo';

export default function SettingsPage() {
    const { settings, updateSettings, theme, toggleTheme } = useStore();

    function handleFontSize(e) {
        updateSettings({ fontSize: parseInt(e.target.value) });
    }

    function handleReciter(e) {
        updateSettings({ reciter: e.target.value });
    }

    function handleTafsir(e) {
        updateSettings({ tafsir: e.target.value });
    }

    function handleDailyGoal(e) {
        const value = Math.max(1, Math.min(50, parseInt(e.target.value) || 5));
        updateSettings({ dailyGoal: value });
    }

    return (
        <div className="page">
            <div className="page-header">
                <h2 className="page-title">الإعدادات</h2>
            </div>

            <div className="settings-content">
                {/* Display Settings */}
                <div className="setting-group">
                    <h3 className="setting-group-title">العرض</h3>

                    <div className="setting-item">
                        <label htmlFor="font-size">حجم خط الآيات</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <input
                                type="range"
                                id="font-size"
                                min="20"
                                max="44"
                                value={settings.fontSize}
                                onChange={handleFontSize}
                            />
                            <span style={{ minWidth: 50, color: 'var(--text-muted)' }}>{settings.fontSize}px</span>
                        </div>
                    </div>

                    <div className="setting-item">
                        <label>الوضع الليلي</label>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <label>إظهار مساعد AI</label>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={settings.aiAssistantVisible !== false}
                                onChange={() => updateSettings({ aiAssistantVisible: !settings.aiAssistantVisible })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <label htmlFor="quran-font">خط القرآن</label>
                        <select
                            id="quran-font"
                            value={settings.quranFont || 'uthmanic'}
                            onChange={(e) => updateSettings({ quranFont: e.target.value })}
                        >
                            <option value="uthmanic">الرسم العثماني (KFGQPC)</option>
                            <option value="amiri">خط أميري القرآن</option>
                        </select>
                    </div>
                </div>

                {/* Audio Settings */}
                <div className="setting-group">
                    <h3 className="setting-group-title">الصوت</h3>

                    <div className="setting-item">
                        <label htmlFor="reciter">القارئ</label>
                        <select
                            id="reciter"
                            className="select-input"
                            value={settings.reciter}
                            onChange={handleReciter}
                        >
                            {RECITERS.map(reciter => (
                                <option key={reciter.id} value={reciter.id}>
                                    {reciter.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tafsir Settings */}
                <div className="setting-group">
                    <h3 className="setting-group-title">التفسير</h3>

                    <div className="setting-item">
                        <label htmlFor="tafsir">مصدر التفسير</label>
                        <select
                            id="tafsir"
                            className="select-input"
                            value={settings.tafsir}
                            onChange={handleTafsir}
                        >
                            {TAFSIR_EDITIONS.map(edition => (
                                <option key={edition.id} value={edition.id}>
                                    {edition.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Memorization Settings */}
                <div className="setting-group">
                    <h3 className="setting-group-title">الحفظ</h3>

                    <div className="setting-item">
                        <label htmlFor="daily-goal">الهدف اليومي (آيات)</label>
                        <input
                            type="number"
                            id="daily-goal"
                            className="number-input"
                            min="1"
                            max="50"
                            value={settings.dailyGoal}
                            onChange={handleDailyGoal}
                        />
                    </div>
                </div>

                {/* About */}
                <div className="setting-group">
                    <h3 className="setting-group-title">حول التطبيق</h3>

                    <div style={{ padding: 'var(--space-md)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        <p><strong>القرآن الكريم - Quran Karim Pro</strong></p>
                        <p>الإصدار 1.0.0</p>
                        <p style={{ marginTop: 'var(--space-md)', fontSize: '0.9rem' }}>
                            تطبيق متكامل لقراءة القرآن الكريم بالرسم العثماني، مع التلاوة والتفسير
                            ونظام ذكي للحفظ والمتابعة.
                        </p>
                        <p style={{ marginTop: 'var(--space-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            البيانات من: api.alquran.cloud
                        </p>
                    </div>

                    {/* Developer Info */}
                    <div style={{ marginTop: 'var(--space-sm)' }}>
                        <DeveloperInfo />
                    </div>
                </div>
            </div>
        </div>
    );
}
