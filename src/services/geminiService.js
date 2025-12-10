// Gemini AI Service - Google Gemini API Integration
// Handles API key rotation and AI responses

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Get all API keys from environment
function getAPIKeys() {
    const keys = [];
    for (let i = 1; i <= 17; i++) {
        const key = import.meta.env[`VITE_GEMINI_KEY_${i}`];
        if (key) keys.push(key);
    }
    return keys;
}

// Track current key index
let currentKeyIndex = 0;
let apiKeys = [];

// Initialize keys
function initKeys() {
    if (apiKeys.length === 0) {
        apiKeys = getAPIKeys();
    }
    return apiKeys;
}

// Get next API key (rotation)
function getNextKey() {
    const keys = initKeys();
    if (keys.length === 0) {
        console.error('No Gemini API keys configured');
        return null;
    }
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    return keys[currentKeyIndex];
}

// Get current API key
function getCurrentKey() {
    const keys = initKeys();
    if (keys.length === 0) return null;
    return keys[currentKeyIndex];
}

// System prompt for Quran context
const SYSTEM_PROMPT = `أنت مساعد ذكي متخصص في القرآن الكريم واسمك "مساعد قُرّ". تطبيق "قُرّ" يوفر:
- قراءة القرآن الكريم (114 سورة) بالرسم العثماني
- التفاسير المتعددة (الميسر، الجلالين، القرطبي، البغوي)
- مواقيت الصلاة حسب الموقع
- اتجاه القبلة بالبوصلة
- البحث في الآيات والسور
- حفظ الإشارات المرجعية
- تتبع رحلة القراءة

عندما يطلب المستخدم فتح صفحة أو تنفيذ أمر، أضف كائن JSON في نهاية ردك بالشكل:
###ACTION###{"action": "navigate", "page": "/surah/1"}###END###

الأوامر المتاحة:
- فتح سورة: {"action": "navigate", "page": "/surah/[رقم السورة]"}
- مواقيت الصلاة: {"action": "navigate", "page": "/prayer-times"}
- اتجاه القبلة: {"action": "navigate", "page": "/qibla"}
- البحث: {"action": "search", "query": "[نص البحث]"}
- فتح الصفحة الرئيسية: {"action": "navigate", "page": "/"}
- الإعدادات: {"action": "navigate", "page": "/settings"}
- رحلتي: {"action": "navigate", "page": "/journey"}
- حول التطبيق: {"action": "navigate", "page": "/about"}

أرقام بعض السور المشهورة:
الفاتحة:1، البقرة:2، آل عمران:3، النساء:4، المائدة:5، الأنعام:6، الأعراف:7، الأنفال:8، التوبة:9، يونس:10، هود:11، يوسف:12، الكهف:18، مريم:19، طه:20، الأنبياء:21، الحج:22، المؤمنون:23، النور:24، الفرقان:25، يس:36، الصافات:37، ص:38، الزمر:39، غافر:40، فصلت:41، الشورى:42، الزخرف:43، الدخان:44، الجاثية:45، الأحقاف:46، محمد:47، الفتح:48، الحجرات:49، ق:50، الذاريات:51، الطور:52، النجم:53، القمر:54، الرحمن:55، الواقعة:56، الحديد:57، المجادلة:58، الحشر:59، الممتحنة:60، الصف:61، الجمعة:62، المنافقون:63، التغابن:64، الطلاق:65، التحريم:66، الملك:67، القلم:68، الحاقة:69، المعارج:70، نوح:71، الجن:72، المزمل:73، المدثر:74، القيامة:75، الإنسان:76، المرسلات:77، النبأ:78، النازعات:79، عبس:80، التكوير:81، الانفطار:82، المطففين:83، الانشقاق:84، البروج:85، الطارق:86، الأعلى:87، الغاشية:88، الفجر:89، البلد:90، الشمس:91، الليل:92، الضحى:93، الشرح:94، التين:95، العلق:96، القدر:97، البينة:98، الزلزلة:99، العاديات:100، القارعة:101، التكاثر:102، العصر:103، الهمزة:104، الفيل:105، قريش:106، الماعون:107، الكوثر:108، الكافرون:109، النصر:110، المسد:111، الإخلاص:112، الفلق:113، الناس:114

قواعد مهمة:
1. أجب باللغة العربية دائماً
2. استخدم الإيموجي لجعل الردود ودية 🌙📖✨
3. إذا طُلب منك آية، اذكرها مع تفسير مختصر
4. كن مختصراً ومفيداً
5. إذا لم تعرف الإجابة، اقترح البحث في التطبيق
6. لا تتحدث عن مواضيع خارج نطاق القرآن والإسلام`;

// Call Gemini API
async function callGeminiAPI(prompt, retries = 3) {
    const key = getCurrentKey();
    if (!key) {
        throw new Error('No API key available');
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: SYSTEM_PROMPT },
                        { text: `\n\nالمستخدم: ${prompt}` }
                    ]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (response.status === 429 || response.status === 503) {
            // Rate limited - rotate to next key
            console.log('Rate limited, rotating API key...');
            getNextKey();
            if (retries > 0) {
                return callGeminiAPI(prompt, retries - 1);
            }
            throw new Error('All API keys rate limited');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini API error:', errorData);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No response from Gemini');
        }

        return parseResponse(text);
    } catch (error) {
        console.error('Gemini API call failed:', error);

        // Try next key on error
        if (retries > 0) {
            getNextKey();
            return callGeminiAPI(prompt, retries - 1);
        }

        throw error;
    }
}

// Parse response for actions
function parseResponse(text) {
    let action = null;
    let cleanText = text;

    // Extract action if present
    const actionMatch = text.match(/###ACTION###(.+?)###END###/s);
    if (actionMatch) {
        try {
            action = JSON.parse(actionMatch[1]);
            cleanText = text.replace(/###ACTION###.+?###END###/s, '').trim();
        } catch (e) {
            console.error('Failed to parse action:', e);
        }
    }

    return {
        text: cleanText,
        action
    };
}

// Main export function
export async function askGemini(question) {
    try {
        const result = await callGeminiAPI(question);
        return {
            answer: result.text,
            action: result.action,
            confidence: 0.95,
            source: 'gemini'
        };
    } catch (error) {
        console.error('Gemini error:', error);
        // Return fallback response
        return {
            answer: 'عذراً، حدث خطأ في الاتصال. جرب مرة أخرى. 🙏',
            action: null,
            confidence: 0.3,
            source: 'fallback'
        };
    }
}

// Get proactive suggestions
export function getProactiveSuggestions() {
    const hour = new Date().getHours();
    const suggestions = [];

    if (hour >= 4 && hour < 6) {
        suggestions.push({ text: '🌅 وقت صلاة الفجر', action: { action: 'navigate', page: '/prayer-times' } });
        suggestions.push({ text: '📖 ابدأ يومك بسورة الفاتحة', action: { action: 'navigate', page: '/surah/1' } });
    } else if (hour >= 6 && hour < 12) {
        suggestions.push({ text: '☀️ صباح الخير! اقرأ سورة الكهف', action: { action: 'navigate', page: '/surah/18' } });
    } else if (hour >= 12 && hour < 15) {
        suggestions.push({ text: '🕐 وقت صلاة الظهر', action: { action: 'navigate', page: '/prayer-times' } });
    } else if (hour >= 15 && hour < 18) {
        suggestions.push({ text: '🌤️ وقت صلاة العصر', action: { action: 'navigate', page: '/prayer-times' } });
    } else if (hour >= 18 && hour < 20) {
        suggestions.push({ text: '🌅 وقت صلاة المغرب', action: { action: 'navigate', page: '/prayer-times' } });
    } else if (hour >= 20 && hour < 23) {
        suggestions.push({ text: '🌙 وقت صلاة العشاء', action: { action: 'navigate', page: '/prayer-times' } });
        suggestions.push({ text: '📖 اختم يومك بسورة الملك', action: { action: 'navigate', page: '/surah/67' } });
    } else {
        suggestions.push({ text: '🌙 قيام الليل', action: { action: 'navigate', page: '/surah/73' } });
    }

    // Always add these
    suggestions.push({ text: '🧭 اتجاه القبلة', action: { action: 'navigate', page: '/qibla' } });
    suggestions.push({ text: '🔍 البحث في القرآن', action: { action: 'search', query: '' } });

    return suggestions.slice(0, 4);
}

export default {
    askGemini,
    getProactiveSuggestions
};
