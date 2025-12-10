// Journey Service - الرحلة الشخصية مع القرآن
// Smart memory, reflections, and progress tracking

const STORAGE_KEYS = {
    STATS: 'quran_journey_stats',
    REFLECTIONS: 'quran_reflections',
    JOURNEYS: 'quran_journeys_progress'
};

// =====================
// READING STATS (الذاكرة الذكية)
// =====================

function getStats() {
    const stored = localStorage.getItem(STORAGE_KEYS.STATS);
    return stored ? JSON.parse(stored) : {
        totalAyahsRead: 0,
        streak: { current: 0, best: 0, lastDate: null },
        frequentAyahs: [],
        frequentSurahs: {},
        readingHistory: [],
        firstUseDate: new Date().toISOString()
    };
}

function saveStats(stats) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

// Track when user reads an ayah
export function trackAyahRead(surahNumber, ayahNumber, surahName) {
    const stats = getStats();
    const today = new Date().toISOString().split('T')[0];

    // Update total
    stats.totalAyahsRead++;

    // Update streak
    if (stats.streak.lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (stats.streak.lastDate === yesterdayStr) {
            stats.streak.current++;
        } else if (stats.streak.lastDate !== today) {
            stats.streak.current = 1;
        }

        stats.streak.lastDate = today;
        stats.streak.best = Math.max(stats.streak.best, stats.streak.current);
    }

    // Track frequent ayahs
    const ayahKey = `${surahNumber}:${ayahNumber}`;
    const existingAyah = stats.frequentAyahs.find(a => a.key === ayahKey);
    if (existingAyah) {
        existingAyah.count++;
        existingAyah.lastVisit = Date.now();
    } else {
        stats.frequentAyahs.push({
            key: ayahKey,
            surah: surahNumber,
            ayah: ayahNumber,
            surahName,
            count: 1,
            lastVisit: Date.now()
        });
    }

    // Sort by frequency and keep top 20
    stats.frequentAyahs.sort((a, b) => b.count - a.count);
    stats.frequentAyahs = stats.frequentAyahs.slice(0, 20);

    // Track surah frequency
    stats.frequentSurahs[surahNumber] = (stats.frequentSurahs[surahNumber] || 0) + 1;

    // Add to reading history (keep last 100)
    stats.readingHistory.unshift({
        surah: surahNumber,
        ayah: ayahNumber,
        timestamp: Date.now()
    });
    stats.readingHistory = stats.readingHistory.slice(0, 100);

    saveStats(stats);
    return stats;
}

export function getReadingStats() {
    return getStats();
}

export function getMostFrequentSurah() {
    const stats = getStats();
    const surahs = Object.entries(stats.frequentSurahs);
    if (surahs.length === 0) return null;

    surahs.sort((a, b) => b[1] - a[1]);
    return parseInt(surahs[0][0]);
}

// =====================
// REFLECTIONS (الخواطر)
// =====================

function getReflections() {
    const stored = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
    return stored ? JSON.parse(stored) : [];
}

function saveReflections(reflections) {
    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
}

export function addReflection(surahNumber, ayahNumber, text, surahName) {
    const reflections = getReflections();
    const newReflection = {
        id: `ref_${Date.now()}`,
        surah: surahNumber,
        ayah: ayahNumber,
        surahName,
        text,
        createdAt: new Date().toISOString()
    };

    reflections.unshift(newReflection);
    saveReflections(reflections);
    return newReflection;
}

export function getAllReflections() {
    return getReflections();
}

export function getReflectionsForAyah(surahNumber, ayahNumber) {
    return getReflections().filter(
        r => r.surah === surahNumber && r.ayah === ayahNumber
    );
}

export function deleteReflection(id) {
    const reflections = getReflections().filter(r => r.id !== id);
    saveReflections(reflections);
}

// Get reflection from approximately one year ago
export function getYearOldReflection() {
    const reflections = getReflections();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const today = new Date();
    const todayDayMonth = `${today.getMonth()}-${today.getDate()}`;

    // Find reflection from same day last year (±3 days tolerance)
    return reflections.find(r => {
        const refDate = new Date(r.createdAt);
        const refDayMonth = `${refDate.getMonth()}-${refDate.getDate()}`;
        const daysDiff = Math.abs(today.getDate() - refDate.getDate());

        return refDate.getFullYear() < today.getFullYear() &&
            refDate.getMonth() === today.getMonth() &&
            daysDiff <= 3;
    });
}

// =====================
// THEMATIC JOURNEYS (المسارات)
// =====================

function getJourneyProgress() {
    const stored = localStorage.getItem(STORAGE_KEYS.JOURNEYS);
    return stored ? JSON.parse(stored) : {
        activeJourney: null,
        progress: {}
    };
}

function saveJourneyProgress(data) {
    localStorage.setItem(STORAGE_KEYS.JOURNEYS, JSON.stringify(data));
}

export function startJourney(journeyId, totalDays) {
    const data = getJourneyProgress();
    data.activeJourney = journeyId;
    data.progress[journeyId] = {
        startDate: new Date().toISOString(),
        currentDay: 1,
        completed: Array(totalDays).fill(false)
    };
    saveJourneyProgress(data);
    return data;
}

export function getActiveJourney() {
    const data = getJourneyProgress();
    if (!data.activeJourney) return null;

    return {
        id: data.activeJourney,
        ...data.progress[data.activeJourney]
    };
}

export function completeJourneyDay(journeyId, dayIndex) {
    const data = getJourneyProgress();
    if (data.progress[journeyId]) {
        data.progress[journeyId].completed[dayIndex] = true;
        data.progress[journeyId].currentDay = dayIndex + 2; // Move to next day
        saveJourneyProgress(data);
    }
    return data;
}

export function getJourneyInfo(journeyId) {
    const data = getJourneyProgress();
    return data.progress[journeyId] || null;
}

export function abandonJourney() {
    const data = getJourneyProgress();
    data.activeJourney = null;
    saveJourneyProgress(data);
}

// =====================
// SMART INTELLIGENCE (الذكاء)
// =====================

// Ayah topics mapping for pattern detection
const AYAH_TOPICS = {
    patience: [
        '2:153', '2:155', '2:156', '2:286', '3:139', '3:200', '8:46',
        '11:115', '16:127', '39:10', '94:5', '94:6'
    ],
    rizq: [
        '2:212', '3:37', '11:6', '29:60', '51:58', '65:2', '65:3', '67:15'
    ],
    peace: [
        '13:28', '48:4', '89:27', '89:28', '89:29', '89:30'
    ],
    forgiveness: [
        '39:53', '4:110', '25:70', '3:135', '3:136', '42:25'
    ],
    gratitude: [
        '14:7', '55:13', '16:18', '31:12', '34:13', '2:152'
    ],
    guidance: [
        '1:6', '2:2', '2:185', '3:8', '6:71', '7:43'
    ],
    death: [
        '3:185', '21:35', '29:57', '39:42', '62:8'
    ],
    family: [
        '25:74', '46:15', '31:14', '17:23', '17:24'
    ]
};

const TOPIC_NAMES = {
    patience: 'الصبر والابتلاء',
    rizq: 'الرزق والتوكل',
    peace: 'الطمأنينة والسكينة',
    forgiveness: 'المغفرة والتوبة',
    gratitude: 'الشكر والحمد',
    guidance: 'الهداية والنور',
    death: 'الموت والآخرة',
    family: 'الأسرة والوالدين'
};

// Track reading with time and topic analysis
export function trackAyahWithContext(surahNumber, ayahNumber, surahName) {
    const stats = getStats();
    const now = new Date();
    const hour = now.getHours();
    const ayahKey = `${surahNumber}:${ayahNumber}`;

    // Initialize patterns if not exist
    if (!stats.patterns) {
        stats.patterns = {
            readingTimes: { morning: 0, afternoon: 0, evening: 0, night: 0 },
            topicFrequency: {},
            weeklyActivity: Array(7).fill(0),
            searchHistory: []
        };
    }

    // Track reading time
    if (hour >= 4 && hour < 12) stats.patterns.readingTimes.morning++;
    else if (hour >= 12 && hour < 17) stats.patterns.readingTimes.afternoon++;
    else if (hour >= 17 && hour < 21) stats.patterns.readingTimes.evening++;
    else stats.patterns.readingTimes.night++;

    // Track day of week
    stats.patterns.weeklyActivity[now.getDay()]++;

    // Detect topic
    for (const [topic, ayahs] of Object.entries(AYAH_TOPICS)) {
        if (ayahs.includes(ayahKey)) {
            stats.patterns.topicFrequency[topic] = (stats.patterns.topicFrequency[topic] || 0) + 1;
        }
    }

    saveStats(stats);
    return trackAyahRead(surahNumber, ayahNumber, surahName);
}

// Track search queries for understanding interests
export function trackSearch(query) {
    const stats = getStats();
    if (!stats.patterns) {
        stats.patterns = {
            readingTimes: { morning: 0, afternoon: 0, evening: 0, night: 0 },
            topicFrequency: {},
            weeklyActivity: Array(7).fill(0),
            searchHistory: []
        };
    }

    stats.patterns.searchHistory.unshift({
        query,
        timestamp: Date.now()
    });
    stats.patterns.searchHistory = stats.patterns.searchHistory.slice(0, 50);

    saveStats(stats);
}

// Get preferred reading time
export function getPreferredReadingTime() {
    const stats = getStats();
    if (!stats.patterns?.readingTimes) return null;

    const times = stats.patterns.readingTimes;
    const maxTime = Math.max(times.morning, times.afternoon, times.evening, times.night);

    if (maxTime === 0) return null;

    if (times.morning === maxTime) return { period: 'morning', label: 'الصباح الباكر 🌅' };
    if (times.afternoon === maxTime) return { period: 'afternoon', label: 'بعد الظهر ☀️' };
    if (times.evening === maxTime) return { period: 'evening', label: 'المساء 🌆' };
    return { period: 'night', label: 'الليل 🌙' };
}

// Get dominant topic this week
export function getDominantTopic() {
    const stats = getStats();
    if (!stats.patterns?.topicFrequency) return null;

    const topics = Object.entries(stats.patterns.topicFrequency);
    if (topics.length === 0) return null;

    topics.sort((a, b) => b[1] - a[1]);
    const [topicId, count] = topics[0];

    if (count < 3) return null; // Need at least 3 reads to detect pattern

    return {
        id: topicId,
        name: TOPIC_NAMES[topicId],
        count
    };
}

// Generate smart contextual suggestion
export function getSmartSuggestion() {
    const stats = getStats();
    const suggestions = [];

    // Check for dominant topic
    const dominantTopic = getDominantTopic();
    if (dominantTopic) {
        suggestions.push({
            type: 'topic_pattern',
            icon: '🎯',
            message: `لاحظت أنك تقرأ آيات ${dominantTopic.name} كثيراً... هل تود التعمق في هذا الموضوع؟`,
            action: 'explore_topic',
            data: dominantTopic.id
        });
    }

    // Check for frequent ayah
    if (stats.frequentAyahs?.length > 0) {
        const topAyah = stats.frequentAyahs[0];
        if (topAyah.count >= 5) {
            suggestions.push({
                type: 'frequent_ayah',
                icon: '⭐',
                message: `آية "${topAyah.surahName} ${topAyah.ayah}" من آياتك المفضلة... هل كتبت خاطرة عنها؟`,
                action: 'write_reflection',
                data: { surah: topAyah.surah, ayah: topAyah.ayah }
            });
        }
    }

    // Check streak
    if (stats.streak?.current >= 7) {
        suggestions.push({
            type: 'streak',
            icon: '🔥',
            message: `ما شاء الله! ${stats.streak.current} أيام متواصلة من القراءة. استمر!`,
            action: null
        });
    } else if (stats.streak?.current === 0 && stats.streak?.best > 0) {
        suggestions.push({
            type: 'streak_recover',
            icon: '💪',
            message: `كان لديك سلسلة من ${stats.streak.best} أيام... هل تبدأ من جديد؟`,
            action: 'start_reading'
        });
    }

    // Check reading time preference
    const preferredTime = getPreferredReadingTime();
    if (preferredTime) {
        const now = new Date();
        const hour = now.getHours();
        const isPreferredTime = (
            (preferredTime.period === 'morning' && hour >= 4 && hour < 12) ||
            (preferredTime.period === 'afternoon' && hour >= 12 && hour < 17) ||
            (preferredTime.period === 'evening' && hour >= 17 && hour < 21) ||
            (preferredTime.period === 'night' && (hour >= 21 || hour < 4))
        );

        if (isPreferredTime) {
            suggestions.push({
                type: 'optimal_time',
                icon: '⏰',
                message: `هذا وقتك المفضل للقراءة (${preferredTime.label})`,
                action: null
            });
        }
    }

    // Year-old reflection reminder
    const oldReflection = getYearOldReflection();
    if (oldReflection) {
        suggestions.push({
            type: 'memory',
            icon: '📅',
            message: `قبل سنة كتبت على ${oldReflection.surahName} آية ${oldReflection.ayah}: "${oldReflection.text.substring(0, 50)}..."`,
            action: 'view_reflection',
            data: oldReflection,
            priority: 'high'
        });
    }

    // Return most relevant suggestion (prioritize memories)
    suggestions.sort((a, b) => {
        if (a.priority === 'high') return -1;
        if (b.priority === 'high') return 1;
        return 0;
    });

    return suggestions[0] || null;
}

// Get all smart insights
export function getAllInsights() {
    const stats = getStats();
    const insights = [];

    // Reading stats insight
    if (stats.totalAyahsRead > 0) {
        insights.push({
            icon: '📖',
            label: 'إجمالي القراءة',
            value: `${stats.totalAyahsRead} آية`
        });
    }

    // Streak insight
    if (stats.streak?.current > 0) {
        insights.push({
            icon: '🔥',
            label: 'أيام متواصلة',
            value: `${stats.streak.current} يوم`
        });
    }

    // Best streak
    if (stats.streak?.best > stats.streak?.current) {
        insights.push({
            icon: '🏆',
            label: 'أفضل سلسلة',
            value: `${stats.streak.best} يوم`
        });
    }

    // Preferred time
    const preferredTime = getPreferredReadingTime();
    if (preferredTime) {
        insights.push({
            icon: '⏰',
            label: 'الوقت المفضل',
            value: preferredTime.label
        });
    }

    // Dominant topic
    const topic = getDominantTopic();
    if (topic) {
        insights.push({
            icon: '🎯',
            label: 'الموضوع الأكثر',
            value: topic.name
        });
    }

    // Most read surah
    const surahs = Object.entries(stats.frequentSurahs || {});
    if (surahs.length > 0) {
        surahs.sort((a, b) => b[1] - a[1]);
        insights.push({
            icon: '⭐',
            label: 'السورة المفضلة',
            value: `سورة رقم ${surahs[0][0]}`
        });
    }

    // Reflections count
    const reflections = getReflections();
    if (reflections.length > 0) {
        insights.push({
            icon: '💭',
            label: 'الخواطر',
            value: `${reflections.length} خاطرة`
        });
    }

    return insights;
}

// =====================
// EXPORT ALL
// =====================

// End of service
