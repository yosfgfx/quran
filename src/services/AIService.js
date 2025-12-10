// AI Service for Quran App
// Enhanced with Google Gemini AI integration

import { searchQuran, getAyah, getTafsir } from './quranAPI';
import { askGemini, getProactiveSuggestions } from './geminiService';

// Surah names mapping for Arabic detection
const SURAH_NAMES = {
    'الفاتحة': 1, 'البقرة': 2, 'آل عمران': 3, 'النساء': 4, 'المائدة': 5,
    'الأنعام': 6, 'الأعراف': 7, 'الأنفال': 8, 'التوبة': 9, 'يونس': 10,
    'هود': 11, 'يوسف': 12, 'الرعد': 13, 'إبراهيم': 14, 'الحجر': 15,
    'النحل': 16, 'الإسراء': 17, 'الكهف': 18, 'مريم': 19, 'طه': 20,
    'الأنبياء': 21, 'الحج': 22, 'المؤمنون': 23, 'النور': 24, 'الفرقان': 25,
    'الشعراء': 26, 'النمل': 27, 'القصص': 28, 'العنكبوت': 29, 'الروم': 30,
    'لقمان': 31, 'السجدة': 32, 'الأحزاب': 33, 'سبأ': 34, 'فاطر': 35,
    'يس': 36, 'الصافات': 37, 'ص': 38, 'الزمر': 39, 'غافر': 40,
    'فصلت': 41, 'الشورى': 42, 'الزخرف': 43, 'الدخان': 44, 'الجاثية': 45,
    'الأحقاف': 46, 'محمد': 47, 'الفتح': 48, 'الحجرات': 49, 'ق': 50,
    'الذاريات': 51, 'الطور': 52, 'النجم': 53, 'القمر': 54, 'الرحمن': 55,
    'الواقعة': 56, 'الحديد': 57, 'المجادلة': 58, 'الحشر': 59, 'الممتحنة': 60,
    'الصف': 61, 'الجمعة': 62, 'المنافقون': 63, 'التغابن': 64, 'الطلاق': 65,
    'التحريم': 66, 'الملك': 67, 'القلم': 68, 'الحاقة': 69, 'المعارج': 70,
    'نوح': 71, 'الجن': 72, 'المزمل': 73, 'المدثر': 74, 'القيامة': 75,
    'الإنسان': 76, 'المرسلات': 77, 'النبأ': 78, 'النازعات': 79, 'عبس': 80,
    'التكوير': 81, 'الانفطار': 82, 'المطففين': 83, 'الانشقاق': 84, 'البروج': 85,
    'الطارق': 86, 'الأعلى': 87, 'الغاشية': 88, 'الفجر': 89, 'البلد': 90,
    'الشمس': 91, 'الليل': 92, 'الضحى': 93, 'الشرح': 94, 'التين': 95,
    'العلق': 96, 'القدر': 97, 'البينة': 98, 'الزلزلة': 99, 'العاديات': 100,
    'القارعة': 101, 'التكاثر': 102, 'العصر': 103, 'الهمزة': 104, 'الفيل': 105,
    'قريش': 106, 'الماعون': 107, 'الكوثر': 108, 'الكافرون': 109, 'النصر': 110,
    'المسد': 111, 'الإخلاص': 112, 'الفلق': 113, 'الناس': 114,
};

/**
 * Detect verse request patterns in user question
 */
function detectVerseRequest(question) {
    const ayahSurahPattern = /(?:الآية|آية)\s*(\d+)\s*(?:من\s*)?(?:سورة\s*)?([\u0600-\u06FF]+)/i;
    const surahAyahPattern = /(?:سورة\s*)([\u0600-\u06FF]+)\s*(?:الآية|آية)\s*(\d+)/i;
    const readSurahPattern = /(?:اقرأ|أعطني|اعرض)\s*(?:لي\s*)?(?:آية\s*)?(?:من\s*)?(?:سورة\s*)([\u0600-\u06FF]+)/i;

    let match = question.match(ayahSurahPattern);
    if (match) {
        const surahName = match[2];
        const surahNumber = SURAH_NAMES[surahName];
        if (surahNumber) {
            return { type: 'specific', surah: surahNumber, ayah: parseInt(match[1]), surahName };
        }
    }

    match = question.match(surahAyahPattern);
    if (match) {
        const surahName = match[1];
        const surahNumber = SURAH_NAMES[surahName];
        if (surahNumber) {
            return { type: 'specific', surah: surahNumber, ayah: parseInt(match[2]), surahName };
        }
    }

    match = question.match(readSurahPattern);
    if (match) {
        const surahName = match[1];
        const surahNumber = SURAH_NAMES[surahName];
        if (surahNumber) {
            return { type: 'surah', surah: surahNumber, surahName };
        }
    }

    const searchPattern = /(?:آيات|آية)\s*(?:عن|في|حول)\s*([\u0600-\u06FF\s]+)/i;
    match = question.match(searchPattern);
    if (match) {
        return { type: 'search', query: match[1].trim() };
    }

    return null;
}

/**
 * AI-powered semantic search
 */
export async function aiSearch(query) {
    try {
        const response = await askGemini(`ابحث عن: ${query}`);
        return {
            query,
            results: [],
            aiSuggestions: [response.answer],
            action: response.action
        };
    } catch (error) {
        console.error('AI Search failed:', error);
        return {
            query,
            results: [],
            aiSuggestions: ['جرب البحث في القرآن الكريم']
        };
    }
}

/**
 * Get AI explanation for a verse
 */
export async function getAIExplanation(surah, ayah, text) {
    try {
        const response = await askGemini(`اشرح لي الآية ${ayah} من سورة رقم ${surah}: "${text}"`);
        return {
            summary: response.answer,
            context: '',
            lessons: [],
            relatedTopics: [],
            action: response.action
        };
    } catch (error) {
        return {
            summary: `هذه الآية ${ayah} من سورة رقم ${surah} تتحدث عن موضوع مهم.`,
            context: '',
            lessons: [],
            relatedTopics: []
        };
    }
}

/**
 * AI Chat assistant - Enhanced with Gemini
 */
export async function askAI(question) {
    // First, try local verse detection for faster response
    const verseRequest = detectVerseRequest(question);

    if (verseRequest) {
        try {
            if (verseRequest.type === 'specific') {
                const ayahData = await getAyah(verseRequest.surah, verseRequest.ayah);
                let tafsirData = null;
                try {
                    tafsirData = await getTafsir(verseRequest.surah, verseRequest.ayah, 'ar.muyassar');
                } catch (e) {
                    console.log('Tafsir not available');
                }

                let response = `📖 سورة ${verseRequest.surahName} - الآية ${verseRequest.ayah}\n\n`;
                response += `﴿ ${ayahData.text} ﴾\n\n`;

                if (tafsirData) {
                    response += `📝 التفسير:\n${tafsirData.text}`;
                }

                return {
                    answer: response,
                    confidence: 1.0,
                    sources: ['القرآن الكريم', 'التفسير الميسر'],
                    suggestions: [
                        `اقرأ الآية ${verseRequest.ayah + 1} من سورة ${verseRequest.surahName}`,
                        'عرض تفسير آخر للآية',
                    ],
                    action: { action: 'navigate', page: `/surah/${verseRequest.surah}?ayah=${verseRequest.ayah}` }
                };
            }

            if (verseRequest.type === 'surah') {
                const ayahData = await getAyah(verseRequest.surah, 1);

                return {
                    answer: `📖 سورة ${verseRequest.surahName}\n\nأول آية:\n﴿ ${ayahData.text} ﴾\n\nللاستماع للسورة كاملة، سأفتح لك صفحة السورة.`,
                    confidence: 1.0,
                    sources: ['القرآن الكريم'],
                    suggestions: [
                        `اقرأ الآية 2 من سورة ${verseRequest.surahName}`,
                    ],
                    action: { action: 'navigate', page: `/surah/${verseRequest.surah}` }
                };
            }

            if (verseRequest.type === 'search') {
                try {
                    const searchResults = await searchQuran(verseRequest.query);
                    if (searchResults.matches && searchResults.matches.length > 0) {
                        const topResults = searchResults.matches.slice(0, 3);
                        let response = `🔍 آيات عن "${verseRequest.query}":\n\n`;

                        for (const match of topResults) {
                            response += `• سورة ${match.surah.englishName} (${match.numberInSurah}):\n`;
                            response += `﴿ ${match.text} ﴾\n\n`;
                        }

                        response += `وجدت ${searchResults.count} نتيجة.`;

                        return {
                            answer: response,
                            confidence: 0.95,
                            sources: ['البحث في القرآن'],
                            suggestions: topResults.map(r => `تفسير الآية ${r.numberInSurah} من سورة ${r.surah.englishName}`),
                        };
                    }
                } catch (e) {
                    console.log('Search failed:', e);
                }
            }
        } catch (error) {
            console.error('Error fetching verse:', error);
        }
    }

    // Use Gemini AI for all other questions
    try {
        const geminiResponse = await askGemini(question);
        return {
            answer: geminiResponse.answer,
            confidence: geminiResponse.confidence,
            sources: ['مساعد قُرّ الذكي'],
            suggestions: getProactiveSuggestions().map(s => s.text),
            action: geminiResponse.action
        };
    } catch (error) {
        console.error('Gemini failed:', error);
        return {
            answer: `سؤالك عن "${question}" سؤال جيد. القرآن الكريم يحتوي على الكثير من الإجابات والحكم.\n\n💡 جرب أن تطلب:\n• "الآية 5 من سورة الفاتحة"\n• "آيات عن الصبر"\n• "افتح سورة الكهف"`,
            confidence: 0.7,
            suggestions: [
                'الآية 1 من سورة الفاتحة',
                'آيات عن الرحمة',
                'مواقيت الصلاة',
            ],
        };
    }
}

/**
 * Get daily verse with AI insight
 */
export function getDailyVerse() {
    const dailyVerses = [
        { surah: 2, ayah: 286, text: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', insight: 'تذكير بأن الله لا يحملنا فوق طاقتنا' },
        { surah: 94, ayah: 5, text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', insight: 'وعد إلهي بأن الفرج قادم مع كل ضيق' },
        { surah: 13, ayah: 28, text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', insight: 'سر الراحة النفسية في ذكر الله' },
        { surah: 3, ayah: 139, text: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ', insight: 'دعوة للثقة بالنفس والتفاؤل' },
        { surah: 65, ayah: 3, text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', insight: 'التوكل على الله كفاية' },
    ];

    const today = new Date().getDate() % dailyVerses.length;
    return dailyVerses[today];
}

/**
 * Get proactive suggestions based on time
 */
export { getProactiveSuggestions };

export default {
    aiSearch,
    getAIExplanation,
    askAI,
    getDailyVerse,
    getProactiveSuggestions,
};
