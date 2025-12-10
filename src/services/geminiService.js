// Gemini AI Service - Google Gemini API Integration
// Handles API key rotation and AI responses

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// API keys (obfuscated for basic protection)
// Note: True security requires a backend proxy
const K = [
    'QUl6YVN5QllJbWNNUFBtMjFaS3FBOHNFQjF6SWJQVkUwSzl6c1dr',
    'QUl6YVN5RDNiRHE1NkZ0UDk3TkVLZ1lraFQ0aGFOOFhKbDdmMWE4',
    'QUl6YVN5Q2hvWTdmcU4zcWxFUWtHMUl1YUpMRzZPSzQzVkFyQTlF',
    'QUl6YVN5QVVya0YyUmIzQUVWQW0zSG5KeWVrU0NtYXJkRjBra1JV',
    'QUl6YVN5QWpHTlpKVWJoMkp0NkZlQUJMcHZsRHh2LUU5UGJ4alpJ',
    'QUl6YVN5RGh4NHpydjJvdkNKa0h0NlhzN2s1Q2plbm9KWFJqYlpJ',
    'QUl6YVN5QUlJS3A5STZxZk52SUZvZGRyRHFGMFAtWkhzR1dFYXBB',
    'QUl6YVN5RGNoVC1TWGQ3RGlYZk4wR1oybG1BVllTU3VkdlY1LVlJ',
    'QUl6YVN5Q2NRWHK4Qk85WENOZGh2MFR5T1A3OG5uSmY4N3RhWWZV',
    'QUl6YVN5QmZBTFQwWS0yaXduaUM2NjJHa2lqYjlteWVVVU5JNVJp',
    'QUl6YVN5Q1JnYW5GOGMtdEdPTkFxSmhYT0tmZm5JOC1ybjQ4NFI4',
    'QUl6YVN5QzYwQlIyMFJ0WWszOTZxV00tV1hkb1BNU3c0cGhaSU9r',
    'QUl6YVN5RGdwRlJZVURPUGxqYzE3SGtIY0tqYktZbVdFNlJIbmVV',
    'QUl6YVN5Qm5oaWZfNDg2YzhBdXl5X1hRMnJ6LTloRkx0WXZneUdB',
    'QUl6YVN5Q3RwR2tZdk5IRVNvVVdWU3E1UmlyTzlkR1Rjb0hVRHJR',
    'QUl6YVN5Q01oSFYxWHdCZGxPZ2lZTFR0RmxiNUFuaTgwbHlpUDd3',
    'QUl6YVN5QVpyTktTWW9wNGJzN1p0cnJoVWVTcUg5VjdoFNySHlv'
];

// Decode key
function d(s) {
    try {
        return atob(s);
    } catch {
        return null;
    }
}

// Track current key index
let currentKeyIndex = 0;

// Get current API key
function getCurrentKey() {
    if (K.length === 0) return null;
    return d(K[currentKeyIndex]);
}

// Get next API key (rotation)
function getNextKey() {
    if (K.length === 0) return null;
    currentKeyIndex = (currentKeyIndex + 1) % K.length;
    return d(K[currentKeyIndex]);
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

أرقام السور المشهورة:
الفاتحة:1، البقرة:2، آل عمران:3، النساء:4، المائدة:5، الكهف:18، مريم:19، طه:20، يس:36، الرحمن:55، الواقعة:56، الملك:67، الإخلاص:112، الفلق:113، الناس:114

قواعد:
1. أجب بالعربية دائماً
2. استخدم الإيموجي 🌙📖✨
3. كن مختصراً ومفيداً
4. لا تتحدث عن مواضيع خارج الإسلام`;

// Call Gemini API
async function callGeminiAPI(prompt, retries = 5) {
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
                    maxOutputTokens: 512,
                }
            })
        });

        if (response.status === 429 || response.status === 503 || response.status === 500) {
            // Rate limited or server error - rotate to next key
            getNextKey();
            if (retries > 0) {
                await new Promise(r => setTimeout(r, 500));
                return callGeminiAPI(prompt, retries - 1);
            }
            throw new Error('All API keys exhausted');
        }

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No response from Gemini');
        }

        return parseResponse(text);
    } catch (error) {
        // Try next key on error
        if (retries > 0) {
            getNextKey();
            await new Promise(r => setTimeout(r, 300));
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
            // Ignore parse errors
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

    suggestions.push({ text: '🧭 اتجاه القبلة', action: { action: 'navigate', page: '/qibla' } });
    suggestions.push({ text: '🔍 البحث في القرآن', action: { action: 'search', query: '' } });

    return suggestions.slice(0, 4);
}

export default {
    askGemini,
    getProactiveSuggestions
};
