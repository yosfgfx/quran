// Local Storage Service for Quran App

const STORAGE_KEYS = {
    BOOKMARKS: 'quran_bookmarks',
    LAST_READ: 'quran_last_read',
    SETTINGS: 'quran_settings',
    MEMORIZATION: 'quran_memorization',
    THEME: 'quran_theme',
};

/**
 * Get item from localStorage with JSON parsing
 */
function getItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

/**
 * Set item in localStorage with JSON stringify
 */
function setItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

// =====================
// BOOKMARKS
// =====================

export function getBookmarks() {
    return getItem(STORAGE_KEYS.BOOKMARKS, []);
}

export function addBookmark(bookmark) {
    const bookmarks = getBookmarks();
    const exists = bookmarks.some(
        b => b.surah === bookmark.surah && b.ayah === bookmark.ayah
    );

    if (!exists) {
        bookmarks.unshift({
            ...bookmark,
            timestamp: Date.now(),
        });
        setItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
    }

    return bookmarks;
}

export function removeBookmark(surah, ayah) {
    const bookmarks = getBookmarks().filter(
        b => !(b.surah === surah && b.ayah === ayah)
    );
    setItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
    return bookmarks;
}

export function isBookmarked(surah, ayah) {
    return getBookmarks().some(b => b.surah === surah && b.ayah === ayah);
}

// =====================
// LAST READ POSITION
// =====================

export function getLastRead() {
    return getItem(STORAGE_KEYS.LAST_READ, null);
}

export function setLastRead(surah, ayah, surahName) {
    return setItem(STORAGE_KEYS.LAST_READ, {
        surah,
        ayah,
        surahName,
        timestamp: Date.now(),
    });
}

// =====================
// SETTINGS
// =====================

const DEFAULT_SETTINGS = {
    fontSize: 28,
    reciter: 'ar.alafasy',
    tafsir: 'ar.muyassar',
    dailyGoal: 5,
    showTranslation: false,
    autoPlayNext: true,
    aiAssistantVisible: true,
    quranFont: 'uthmanic', // 'uthmanic' = KFGQPC HAFS, 'amiri' = Amiri Quran
};

export function getSettings() {
    return { ...DEFAULT_SETTINGS, ...getItem(STORAGE_KEYS.SETTINGS, {}) };
}

export function updateSettings(updates) {
    const settings = getSettings();
    const newSettings = { ...settings, ...updates };
    setItem(STORAGE_KEYS.SETTINGS, newSettings);
    return newSettings;
}

// =====================
// THEME
// =====================

export function getTheme() {
    return getItem(STORAGE_KEYS.THEME, 'light');
}

export function setTheme(theme) {
    setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
}

export function toggleTheme() {
    const current = getTheme();
    const newTheme = current === 'light' ? 'dark' : 'light';
    return setTheme(newTheme);
}

// =====================
// MEMORIZATION
// =====================

export function getMemorization() {
    return getItem(STORAGE_KEYS.MEMORIZATION, {
        memorized: [],
        inProgress: [],
        dailyProgress: {},
        streak: 0,
        lastActiveDate: null,
    });
}

export function addMemorizedAyah(surah, ayah) {
    const data = getMemorization();
    const key = `${surah}:${ayah}`;

    if (!data.memorized.includes(key)) {
        data.memorized.push(key);

        // Update daily progress
        const today = new Date().toISOString().split('T')[0];
        if (!data.dailyProgress[today]) {
            data.dailyProgress[today] = 0;
        }
        data.dailyProgress[today]++;

        // Update streak
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (data.lastActiveDate === yesterday || data.lastActiveDate === today) {
            if (data.lastActiveDate !== today) {
                data.streak++;
            }
        } else {
            data.streak = 1;
        }
        data.lastActiveDate = today;

        setItem(STORAGE_KEYS.MEMORIZATION, data);
    }

    return data;
}

export function getTodayProgress() {
    const data = getMemorization();
    const today = new Date().toISOString().split('T')[0];
    return data.dailyProgress[today] || 0;
}

export function getStreak() {
    const data = getMemorization();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (data.lastActiveDate === today || data.lastActiveDate === yesterday) {
        return data.streak;
    }
    return 0;
}

export function getTotalMemorized() {
    return getMemorization().memorized.length;
}

// Initialize theme on load
export function initTheme() {
    const theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);
}

export default {
    getBookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getLastRead,
    setLastRead,
    getSettings,
    updateSettings,
    getTheme,
    setTheme,
    toggleTheme,
    getMemorization,
    addMemorizedAyah,
    getTodayProgress,
    getStreak,
    getTotalMemorized,
    initTheme,
};
