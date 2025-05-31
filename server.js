const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_PORT = process.env.CLIENT_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Gemini API Keys Management
let currentKeyIndex = parseInt(process.env.ACTIVE_GEMINI_KEY_INDEX) || 0;
const geminiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5
].filter(key => key && !key.includes('your_gemini'));

console.log(`تم تحميل ${geminiKeys.length} مفتاح API صالح`);

// Proxy endpoints for external APIs to handle CORS
app.get('/api/proxy/reciters', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://alquran.vip/APIs/reciters');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching reciters:', error);
    // استخدام بيانات محلية بديلة في حالة فشل الاتصال
    const fallbackReciters = require('./fallback-data/reciters.json');
    res.json(fallbackReciters);
  }
});

app.get('/api/proxy/athkar', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://alquran.vip/APIs/athkar');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching athkar:', error);
    // استخدام بيانات محلية بديلة في حالة فشل الاتصال
    const fallbackathkar = require('./fallback-data/athkar.json');
    res.json(fallbackathkar);
  }
});

app.get('/api/proxy/duas', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://alquran.vip/APIs/duas');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching duas:', error);
    // استخدام بيانات محلية بديلة في حالة فشل الاتصال
    const fallbackDuas = require('./fallback-data/duas.json');
    res.json(fallbackDuas);
  }
});

app.get('/api/proxy/prayer-times', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://alquran.vip/APIs/getPrayerTimes');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    // استخدام بيانات محلية بديلة في حالة فشل الاتصال
    const fallbackPrayerTimes = require('./fallback-data/prayer-times.json');
    res.json(fallbackPrayerTimes);
  }
});

app.get('/api/proxy/reciter-audio/:reciterId', async (req, res) => {
  try {
    const { reciterId } = req.params;
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://alquran.vip/APIs/reciterAudio?reciter_id=${reciterId}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching reciter audio:', error);
    // استخدام بيانات محلية بديلة في حالة فشل الاتصال
    const fallbackReciterAudio = require('./fallback-data/reciter-audio.json');
    res.json(fallbackReciterAudio);
  }
});

// نقطة نهاية API لحصن المسلم
app.get('/api/proxy/hisnmuslim', async (req, res) => {
  try {
    // قراءة ملف بيانات حصن المسلم
    const hisnData = require('./fallback-data/husn_ar.json');
    res.json(hisnData);
  } catch (error) {
    console.error('Error fetching hisnmuslim data:', error);
    res.status(500).json({ error: 'فشل في تحميل بيانات حصن المسلم' });
  }
});

// نقطة نهاية API لمحتوى ذكر محدد من حصن المسلم
app.get('/api/proxy/hisnmuslim/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://www.hisnmuslim.com/api/ar/${id}.json`);
    
    if (!response.ok) {
      throw new Error(`فشل في تحميل الذكر رقم ${id}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Error fetching hisnmuslim content for ID ${req.params.id}:`, error);
    // إرجاع بيانات فارغة في حالة الخطأ
    res.json({ title: "غير متاح", text: [] });
  }
});

// API Routes

// Get current Gemini API key
app.get('/api/gemini-key', (req, res) => {
  if (geminiKeys.length === 0) {
    return res.status(404).json({ error: 'لا توجد مفاتيح API متاحة' });
  }
  
  res.json({ 
    key: geminiKeys[currentKeyIndex],
    index: currentKeyIndex,
    totalKeys: geminiKeys.length 
  });
});

// Switch to next Gemini API key
app.post('/api/gemini-key/next', (req, res) => {
  if (geminiKeys.length === 0) {
    return res.status(404).json({ error: 'لا توجد مفاتيح API متاحة' });
  }
  
  currentKeyIndex = (currentKeyIndex + 1) % geminiKeys.length;
  
  res.json({ 
    key: geminiKeys[currentKeyIndex],
    index: currentKeyIndex,
    message: `تم التبديل إلى المفتاح رقم ${currentKeyIndex + 1}` 
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    geminiKeysAvailable: geminiKeys.length,
    currentKeyIndex: currentKeyIndex + 1,
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    serverPort: PORT,
    clientPort: CLIENT_PORT
  });
});

// Context API endpoint - provides contextual data for AI search
app.get('/api/context-data', (req, res) => {
  res.json({
    topics: [
      'الصلاة', 'الصيام', 'الزكاة', 'الحج', 'الإيمان', 'التوحيد', 
      'الأخلاق', 'الجنة', 'النار', 'يوم القيامة', 'قصص الأنبياء', 
      'آيات الأحكام', 'الصبر', 'الشكر', 'التوبة', 'العلم'
    ],
    commonQueries: [
      'آية الكرسي', 'سورة الإخلاص', 'آيات الرحمة', 'آيات السكينة',
      'آخر سورة البقرة', 'المعوذتين', 'الرقية الشرعية', 'آيات الشفاء'
    ],
    categories: {
      'التفسير': ['تفسير ابن كثير', 'تفسير السعدي', 'تفسير الطبري'],
      'القراءات': ['حفص عن عاصم', 'ورش عن نافع', 'قالون عن نافع'],
      'التجويد': ['أحكام النون الساكنة', 'المدود', 'أحكام الراء']
    }
  });
});

// Enhanced Gemini AI search endpoint
app.post('/api/ai-search', async (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  if (geminiKeys.length === 0) {
    return res.status(404).json({ error: 'لا توجد مفاتيح API متاحة' });
  }

  const currentKey = geminiKeys[currentKeyIndex];
  const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  const prompt = `
أنت مساعد ذكي متخصص في القرآن الكريم. المستخدم يبحث عن: "${query}"

قم بتحليل الاستعلام بعناية وقدم:

1. **تصحيح إملائي**: إذا كان هناك أخطاء إملائية، اقترح التصحيح الصحيح
2. **كلمات مفتاحية**: استخرج الكلمات المفتاحية الأساسية للبحث
3. **مرادفات ومعاني**: اقترح كلمات مرادفة أو معاني مشابهة
4. **تفسير المعنى**: إذا كان المستخدم يبحث بالمعنى، حدد الآيات المحتملة
5. **أرقام السور والآيات**: إذا ذُكرت أرقام، تأكد من صحتها
6. **البحث الجزئي**: إذا كان جزء من آية، اقترح الآيات المحتملة

أمثلة:
- إذا بحث عن "الرحمن الرحيم" → اقترح "بسم الله الرحمن الرحيم"
- إذا بحث عن "الصلاه" → صحح إلى "الصلاة"
- إذا بحث عن "آية الكرسي" → اقترح البحث في سورة البقرة آية 255
- إذا بحث عن "قل هو الله" → اقترح سورة الإخلاص

اجعل ردك مهيكلاً وواضحاً باستخدام JSON:
{
  "corrected_query": "النص المصحح",
  "keywords": ["كلمة1", "كلمة2"],
  "synonyms": ["مرادف1", "مرادف2"],
  "suggested_searches": ["اقتراح1", "اقتراح2"],
  "context": "تفسير أو سياق إضافي"
}
  `;

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${currentKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (response.status === 429) {
      // Rate limit hit, try next key
      currentKeyIndex = (currentKeyIndex + 1) % geminiKeys.length;
      return res.status(429).json({ 
        error: 'تم تجاوز حد الاستخدام، جاري المحاولة بمفتاح آخر',
        shouldRetry: true,
        nextKeyIndex: currentKeyIndex
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('لم يتم الحصول على استجابة من AI');
    }

    // Try to parse JSON response
    let parsedResponse;
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create structured response from text
        parsedResponse = {
          corrected_query: query,
          keywords: extractKeywords(aiResponse),
          synonyms: extractSynonyms(aiResponse),
          suggested_searches: extractSuggestions(aiResponse),
          context: aiResponse
        };
      }
    } catch (e) {
      // If JSON parsing fails, return raw response
      parsedResponse = {
        corrected_query: query,
        keywords: [query],
        synonyms: [],
        suggested_searches: [query],
        context: aiResponse
      };
    }

    res.json({
      success: true,
      data: parsedResponse,
      rawResponse: aiResponse,
      keyUsed: currentKeyIndex + 1
    });

  } catch (error) {
    console.error('Gemini AI search error:', error);
    res.status(500).json({ 
      error: 'حدث خطأ في البحث الذكي',
      details: error.message 
    });
  }
});

// Helper functions for text analysis
function extractKeywords(text) {
  const arabicWords = text.match(/[\u0600-\u06FF]+/g) || [];
  return [...new Set(arabicWords)].slice(0, 5);
}

function extractSynonyms(text) {
  const lines = text.split('\n');
  const synonyms = [];
  lines.forEach(line => {
    if (line.includes('مرادف') || line.includes('معنى')) {
      const words = line.match(/[\u0600-\u06FF]+/g) || [];
      synonyms.push(...words);
    }
  });
  return [...new Set(synonyms)].slice(0, 3);
}

function extractSuggestions(text) {
  const lines = text.split('\n');
  const suggestions = [];
  lines.forEach(line => {
    if (line.includes('اقترح') || line.includes('البحث')) {
      const match = line.match(/"([^"]+)"/);
      if (match) suggestions.push(match[1]);
    }
  });
  return suggestions.slice(0, 3);
}

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 خادم تطبيق القرآن الكريم يعمل على المنفذ ${PORT}`);
  console.log(`📱 افتح المتصفح على: http://localhost:${PORT}`);
  console.log(`🔑 مفاتيح Gemini المتاحة: ${geminiKeys.length}`);
  
  if (geminiKeys.length === 0) {
    console.log('⚠️  تحذير: لا توجد مفاتيح Gemini API صالحة. تأكد من ملف .env');
  }
});

module.exports = app;