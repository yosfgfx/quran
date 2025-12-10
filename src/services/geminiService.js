// Gemini AI Service - Google Gemini API Integration
// Handles API key rotation and AI responses

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// API keys - direct (for now, will be secured via Netlify Functions later)
const API_KEYS = [
    'AIzaSyBYImcMPpm21ZKqA8sEB1zIbPVE0K9zsWk',
    'AIzaSyD3bDq56FtP97NEKgYkhT4haN8XJl7f1a8',
    'AIzaSyChoY7fqN3qlEQkG1IuaJLG6OK43VArA9E',
    'AIzaSyAUrkF2Rb3AEVAm3HnJyekSCmardF0kkRU',
    'AIzaSyAjGNZJUbh2Jt6FeABLpvlDxv-E9PbxjZI',
    'AIzaSyDhx4zrv2ovCJkHt6Xzzk5CjenoJXRjbIs',
    'AIzaSyAIIKp9I6qfNvIFoddrDqF0P-ZHsGWEapA',
    'AIzaSyDchT-SXd7DiXfN0GZ2lmAVYSSudvV5-YI',
    'AIzaSyCcQXy8BO9XCNdhv0TyOP78nnJf87taYfU',
    'AIzaSyBfALT0Y-2iwniC662Gkijb9myeUUNI5RI',
    'AIzaSyCRganF8c7_tGONAqJhXOKfnI8-rn484cY',
    'AIzaSyC60BR20RtYk396qWM-WXdoPMSw4phZIOk',
    'AIzaSyDgpFRYUDOPljc17HkHcKjbKYmWE6RHneU',
    'AIzaSyBnhif_486c8Auyy_XQ2rz-9hFLtYvgyGA',
    'AIzaSyCtpGkYvNHESoUWVSq5RirO9dGTcoHUDrQ',
    'AIzaSyCMhHV1XwBdlOgiYLTtFlb5Ani80lyiP7w',
    'AIzaSyAZrNKSYop4bs7ZtrrhUeSqH9V7vHSrHyo'
];

// Track current key index
let currentKeyIndex = 0;

// Get current API key
function getCurrentKey() {
    return API_KEYS[currentKeyIndex];
}

// Get next API key (rotation)
function getNextKey() {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return API_KEYS[currentKeyIndex];
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
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            getNextKey();
            if (retries > 0) {
                await new Promise(r => setTimeout(r, 300));
                return callGeminiAPI(prompt, retries - 1);
            }
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
