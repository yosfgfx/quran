import { create } from 'zustand';
import storage from '../services/storage';
import { RECITERS } from '../services/quranAPI';

// App Store using Zustand
const useStore = create((set, get) => ({
    // Theme
    theme: storage.getTheme(),
    toggleTheme: () => {
        const newTheme = storage.toggleTheme();
        set({ theme: newTheme });
    },

    // Settings
    settings: storage.getSettings(),
    updateSettings: (updates) => {
        const newSettings = storage.updateSettings(updates);
        set({ settings: newSettings });
    },

    // Current Surah
    currentSurah: null,
    setCurrentSurah: (surah) => set({ currentSurah: surah }),

    // Current Ayah (for audio/tafsir)
    currentAyah: null,
    setCurrentAyah: (ayah) => set({ currentAyah: ayah }),

    // Audio Player State
    isPlaying: false,
    audioVisible: false,
    audioMinimized: false,
    repeatMode: false,
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setAudioVisible: (visible) => set({ audioVisible: visible }),
    setAudioMinimized: (minimized) => set({ audioMinimized: minimized }),
    toggleRepeat: () => set((state) => ({ repeatMode: !state.repeatMode })),

    // Instant reciter change
    setReciter: (reciterId) => {
        const { settings } = get();
        const newSettings = { ...settings, reciter: reciterId };
        storage.updateSettings(newSettings);
        set({ settings: newSettings });
    },

    // Tafsir Panel
    tafsirOpen: false,
    tafsirData: null,
    setTafsirOpen: (open) => set({ tafsirOpen: open }),
    setTafsirData: (data) => set({ tafsirData: data }),

    // Search
    searchOpen: false,
    searchQuery: '',
    searchResults: [],
    setSearchOpen: (open) => set({ searchOpen: open }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSearchResults: (results) => set({ searchResults: results }),

    // Loading States
    loading: true,
    surahLoading: false,
    setLoading: (loading) => set({ loading }),
    setSurahLoading: (loading) => set({ surahLoading: loading }),

    // Bookmarks
    bookmarks: storage.getBookmarks(),
    addBookmark: (bookmark) => {
        const bookmarks = storage.addBookmark(bookmark);
        set({ bookmarks });
    },
    removeBookmark: (surah, ayah) => {
        const bookmarks = storage.removeBookmark(surah, ayah);
        set({ bookmarks });
    },

    // Last Read
    lastRead: storage.getLastRead(),
    setLastRead: (surah, ayah, surahName) => {
        storage.setLastRead(surah, ayah, surahName);
        set({ lastRead: { surah, ayah, surahName } });
    },

    // Memorization
    memorization: storage.getMemorization(),
    todayProgress: storage.getTodayProgress(),
    streak: storage.getStreak(),
    totalMemorized: storage.getTotalMemorized(),

    addMemorized: (surah, ayah) => {
        const data = storage.addMemorizedAyah(surah, ayah);
        set({
            memorization: data,
            todayProgress: storage.getTodayProgress(),
            streak: storage.getStreak(),
            totalMemorized: storage.getTotalMemorized(),
        });
    },

    // Surahs List
    surahs: [],
    setSurahs: (surahs) => set({ surahs }),

    // Filter
    filter: 'all',
    setFilter: (filter) => set({ filter }),

    // Get current reciter info
    getCurrentReciter: () => {
        const { settings } = get();
        return RECITERS.find(r => r.id === settings.reciter) || RECITERS[0];
    },
}));

export default useStore;
