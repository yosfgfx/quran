// Quran API Service - Using api.alquran.cloud
// Provides Uthmani script text (الرسم العثماني)

const API_BASE = 'https://api.alquran.cloud/v1';

// Cache for API responses
const cache = new Map();

/**
 * Fetch with caching
 */
async function fetchWithCache(url) {
    if (cache.has(url)) {
        return cache.get(url);
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    cache.set(url, data);
    return data;
}

/**
 * Get all surahs
 */
export async function getAllSurahs() {
    const data = await fetchWithCache(`${API_BASE}/surah`);
    return data.data;
}

/**
 * Get single surah with Uthmani script
 * @param {number} surahNumber - Surah number (1-114)
 * @param {string} edition - Edition identifier (default: quran-uthmani)
 */
export async function getSurah(surahNumber, edition = 'quran-uthmani') {
    const data = await fetchWithCache(`${API_BASE}/surah/${surahNumber}/${edition}`);
    return data.data;
}

/**
 * Get surah with audio
 * @param {number} surahNumber - Surah number
 * @param {string} reciter - Reciter identifier
 */
export async function getSurahWithAudio(surahNumber, reciter = 'ar.alafasy') {
    const data = await fetchWithCache(`${API_BASE}/surah/${surahNumber}/${reciter}`);
    return data.data;
}

/**
 * Get single ayah
 * @param {number} surahNumber - Surah number
 * @param {number} ayahNumber - Ayah number
 */
export async function getAyah(surahNumber, ayahNumber) {
    const data = await fetchWithCache(`${API_BASE}/ayah/${surahNumber}:${ayahNumber}/quran-uthmani`);
    return data.data;
}

/**
 * Get ayah with audio
 */
export async function getAyahWithAudio(surahNumber, ayahNumber, reciter = 'ar.alafasy') {
    const data = await fetchWithCache(`${API_BASE}/ayah/${surahNumber}:${ayahNumber}/${reciter}`);
    return data.data;
}

/**
 * Get Tafsir for ayah
 * @param {number} surahNumber - Surah number
 * @param {number} ayahNumber - Ayah number
 * @param {string} tafsir - Tafsir edition (ar.muyassar, ar.jalalayn, etc.)
 */
export async function getTafsir(surahNumber, ayahNumber, tafsir = 'ar.muyassar') {
    const data = await fetchWithCache(`${API_BASE}/ayah/${surahNumber}:${ayahNumber}/${tafsir}`);
    return data.data;
}

/**
 * Search in Quran
 * @param {string} query - Search query
 */
export async function searchQuran(query) {
    const data = await fetchWithCache(`${API_BASE}/search/${encodeURIComponent(query)}/all/ar`);
    return data.data;
}

/**
 * Get Juz
 * @param {number} juzNumber - Juz number (1-30)
 */
export async function getJuz(juzNumber) {
    const data = await fetchWithCache(`${API_BASE}/juz/${juzNumber}/quran-uthmani`);
    return data.data;
}

/**
 * Get page
 * @param {number} pageNumber - Page number (1-604)
 */
export async function getPage(pageNumber) {
    const data = await fetchWithCache(`${API_BASE}/page/${pageNumber}/quran-uthmani`);
    return data.data;
}

/**
 * Available reciters - All available from API
 */
export const RECITERS = [
    { id: 'ar.alafasy', name: 'مشاري العفاسي', nameEn: 'Mishary Alafasy' },
    { id: 'ar.abdulsamad', name: 'عبد الباسط عبد الصمد (مرتل)', nameEn: 'Abdul Basit (Murattal)' },
    { id: 'ar.abdulsamadm', name: 'عبد الباسط عبد الصمد (مجوّد)', nameEn: 'Abdul Basit (Mujawwad)' },
    { id: 'ar.husary', name: 'محمود خليل الحصري', nameEn: 'Mahmoud Al-Husary' },
    { id: 'ar.husarymujawwad', name: 'محمود خليل الحصري (معلّم)', nameEn: 'Al-Husary (Muallim)' },
    { id: 'ar.minshawi', name: 'محمد صديق المنشاوي (مرتل)', nameEn: 'Al-Minshawi (Murattal)' },
    { id: 'ar.minshawimujawwad', name: 'محمد صديق المنشاوي (مجوّد)', nameEn: 'Al-Minshawi (Mujawwad)' },
    { id: 'ar.ahmedajamy', name: 'أحمد العجمي', nameEn: 'Ahmed Al-Ajamy' },
    { id: 'ar.hudhaify', name: 'علي الحذيفي', nameEn: 'Ali Al-Hudhaify' },
    { id: 'ar.shaatree', name: 'أبو بكر الشاطري', nameEn: 'Abu Bakr Al-Shatri' },
    { id: 'ar.rifai', name: 'هاني الرفاعي', nameEn: 'Hani Ar-Rifai' },
    { id: 'ar.saudalshuraim', name: 'سعود الشريم', nameEn: 'Saud Al-Shuraim' },
    { id: 'ar.sudais', name: 'عبد الرحمن السديس', nameEn: 'Abdul Rahman Al-Sudais' },
    { id: 'ar.tablpieces', name: 'محمد الطبلاوي', nameEn: 'Mohamed Al-Tablawi' },
    { id: 'ar.maaborani', name: 'إبراهيم الأخضر', nameEn: 'Ibrahim Al-Akhdar' },
    { id: 'ar.aaborani', name: 'ماهر المعيقلي', nameEn: 'Maher Al-Muaiqly' },
];

/**
 * Get reciters list
 */
export async function getReciters() {
    return RECITERS;
}

/**
 * Available tafsir editions
 */
export const TAFSIR_EDITIONS = [
    { id: 'ar.muyassar', name: 'التفسير الميسر' },
    { id: 'ar.jalalayn', name: 'تفسير الجلالين' },
    { id: 'ar.qurtubi', name: 'تفسير القرطبي' },
    { id: 'ar.baghawi', name: 'تفسير البغوي' },
    { id: 'ar.waseet', name: 'التفسير الوسيط' },
    { id: 'ar.miqbas', name: 'تفسير ابن عباس' },
];

export default {
    getAllSurahs,
    getSurah,
    getSurahWithAudio,
    getAyah,
    getAyahWithAudio,
    getTafsir,
    searchQuran,
    getJuz,
    getPage,
    RECITERS,
    TAFSIR_EDITIONS,
};
