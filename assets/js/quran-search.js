/**
 * محرك بحث سريع للقرآن الكريم
 * يستخدم خوارزميات فهرسة وبحث متقدمة للبحث السريع في نصوص القرآن
 */

class QuranSearchEngine {
  constructor() {
    this.searchIndex = null;
    this.ayahsMap = new Map();
    this.isInitialized = false;
    this.normalizeAlif = true;
    this.normalizeHamza = true;
    this.normalizeYa = true;
    this.removeTashkeel = true;
    this.removeTatweel = true;
  }

  /**
   * تهيئة محرك البحث
   * @param {Array} surahs - مصفوفة السور
   * @returns {Promise<boolean>} - وعد يشير إلى نجاح التهيئة
   */
  async initialize(surahs) {
    if (!surahs || !Array.isArray(surahs) || surahs.length === 0) {
      console.error('❌ خطأ: لم يتم توفير بيانات صالحة للقرآن');
      return false;
    }

    try {
      console.time('⏱️ وقت تهيئة محرك البحث');
      
      // إنشاء فهرس البحث
      this.searchIndex = {};
      this.ayahsMap.clear();
      
      // معالجة كل سورة
      for (const surah of surahs) {
        if (!surah.ayahs || !Array.isArray(surah.ayahs)) continue;
        
        // معالجة كل آية
        for (const ayah of surah.ayahs) {
          // تخزين الآية في الخريطة للوصول السريع
          const ayahKey = `${surah.number}:${ayah.numberInSurah}`;
          this.ayahsMap.set(ayahKey, {
            text: ayah.text,
            surah: surah.number,
            surahName: surah.name,
            ayahNumber: ayah.numberInSurah,
            page: ayah.page || null,
            juz: ayah.juz || null,
            globalNumber: ayah.number || null
          });
          
          // تحليل نص الآية إلى كلمات
          const normalizedText = this._normalizeText(ayah.text);
          const words = normalizedText.split(/\s+/);
          
          // فهرسة كل كلمة
          words.forEach((word, position) => {
            if (word.length < 2) return; // تجاهل الكلمات القصيرة جداً
            
            // إضافة الكلمة إلى الفهرس
            if (!this.searchIndex[word]) {
              this.searchIndex[word] = [];
            }
            
            // تخزين موقع الكلمة في الآية
            this.searchIndex[word].push({
              ayahKey,
              position
            });
            
            // إضافة أجزاء من الكلمة للبحث الجزئي (للكلمات الطويلة)
            if (word.length > 3) {
              for (let i = 2; i < Math.min(word.length, 6); i++) {
                const prefix = word.substring(0, i);
                if (!this.searchIndex[prefix]) {
                  this.searchIndex[prefix] = [];
                }
                this.searchIndex[prefix].push({
                  ayahKey,
                  position,
                  partial: true
                });
              }
            }
          });
        }
      }
      
      this.isInitialized = true;
      console.timeEnd('⏱️ وقت تهيئة محرك البحث');
      console.log(`✅ تم تهيئة محرك البحث: ${this.ayahsMap.size} آية، ${Object.keys(this.searchIndex).length} مدخل في الفهرس`);
      
      return true;
    } catch (error) {
      console.error('❌ خطأ في تهيئة محرك البحث:', error);
      return false;
    }
  }

  /**
   * البحث في القرآن الكريم
   * @param {string} query - نص البحث
   * @param {Object} options - خيارات البحث
   * @returns {Array} - نتائج البحث
   */
  search(query, options = {}) {
    if (!this.isInitialized) {
      console.error('❌ محرك البحث غير مهيأ بعد');
      return [];
    }

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return [];
    }

    console.time('⏱️ وقت البحث');
    
    try {
      // تحضير الاستعلام
      const normalizedQuery = this._normalizeText(query);
      const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 1);
      
      if (queryWords.length === 0) {
        return [];
      }

      // خيارات البحث
      const {
        exactMatch = false,
        limit = 50,
        includeSurahInfo = true,
        includeText = true,
        sortByRelevance = true
      } = options;
      
      // نتائج البحث
      let results = new Map();
      
      if (exactMatch && normalizedQuery.length > 2) {
        // البحث عن النص الكامل
        for (const [ayahKey, ayahData] of this.ayahsMap.entries()) {
          const normalizedText = this._normalizeText(ayahData.text);
          if (normalizedText.includes(normalizedQuery)) {
            results.set(ayahKey, { 
              ayahKey, 
              score: 100,
              matchType: 'exact',
              matches: [normalizedQuery]
            });
          }
        }
      } else {
        // البحث عن كل كلمة على حدة
        const wordMatches = new Map();
        
        // البحث عن كل كلمة في الاستعلام
        for (const word of queryWords) {
          const matches = this._findWordMatches(word);
          
          // تخزين نتائج البحث لكل كلمة
          for (const match of matches) {
            if (!wordMatches.has(match.ayahKey)) {
              wordMatches.set(match.ayahKey, { 
                words: new Set(),
                partialWords: new Set(),
                positions: []
              });
            }
            
            const ayahMatch = wordMatches.get(match.ayahKey);
            
            if (match.partial) {
              ayahMatch.partialWords.add(word);
            } else {
              ayahMatch.words.add(word);
            }
            
            ayahMatch.positions.push(match.position);
          }
        }
        
        // حساب درجة التطابق لكل آية
        for (const [ayahKey, matchData] of wordMatches.entries()) {
          const exactWordMatches = matchData.words.size;
          const partialWordMatches = matchData.partialWords.size;
          
          // حساب درجة التطابق بناءً على عدد الكلمات المتطابقة
          let score = 0;
          
          // الكلمات المتطابقة تماماً لها وزن أكبر
          score += (exactWordMatches / queryWords.length) * 80;
          
          // الكلمات المتطابقة جزئياً لها وزن أقل
          score += (partialWordMatches / queryWords.length) * 20;
          
          // إضافة نتيجة البحث إذا كانت درجة التطابق كافية
          if (score > 0) {
            results.set(ayahKey, {
              ayahKey,
              score,
              matchType: exactWordMatches === queryWords.length ? 'full' : 'partial',
              matches: [...matchData.words, ...matchData.partialWords]
            });
          }
        }
      }
      
      // تحويل النتائج إلى مصفوفة
      let resultsArray = Array.from(results.values());
      
      // ترتيب النتائج حسب درجة التطابق
      if (sortByRelevance) {
        resultsArray.sort((a, b) => b.score - a.score);
      }
      
      // تحديد عدد النتائج
      if (limit > 0) {
        resultsArray = resultsArray.slice(0, limit);
      }
      
      // إضافة معلومات إضافية للنتائج
      const enhancedResults = resultsArray.map(result => {
        const [surahNumber, ayahNumber] = result.ayahKey.split(':').map(Number);
        const ayahData = this.ayahsMap.get(result.ayahKey);
        
        const enhancedResult = {
          score: result.score,
          matchType: result.matchType,
          surah: surahNumber,
          ayah: ayahNumber,
          globalNumber: ayahData.globalNumber
        };
        
        if (includeSurahInfo) {
          enhancedResult.surahName = ayahData.surahName;
        }
        
        if (includeText) {
          enhancedResult.text = ayahData.text;
          
          // تمييز الكلمات المتطابقة في النص
          if (result.matches && result.matches.length > 0) {
            enhancedResult.highlightedText = this._highlightMatches(
              ayahData.text,
              Array.from(result.matches)
            );
          }
        }
        
        return enhancedResult;
      });
      
      console.timeEnd('⏱️ وقت البحث');
      return enhancedResults;
    } catch (error) {
      console.error('❌ خطأ في البحث:', error);
      return [];
    }
  }

  /**
   * البحث عن تطابقات للكلمة في الفهرس
   * @param {string} word - الكلمة المراد البحث عنها
   * @returns {Array} - نتائج البحث
   */
  _findWordMatches(word) {
    if (!word || word.length < 2) return [];
    
    // البحث عن تطابق كامل أولاً
    const exactMatches = this.searchIndex[word] || [];
    
    // إذا كانت الكلمة قصيرة، نكتفي بالتطابق الكامل
    if (word.length < 3) {
      return exactMatches;
    }
    
    // للكلمات الطويلة، نبحث عن تطابقات جزئية إذا لم نجد تطابقاً كاملاً
    if (exactMatches.length === 0) {
      // البحث عن تطابقات للجزء الأول من الكلمة
      for (let i = Math.min(word.length, 5); i >= 2; i--) {
        const prefix = word.substring(0, i);
        const prefixMatches = this.searchIndex[prefix] || [];
        if (prefixMatches.length > 0) {
          return prefixMatches;
        }
      }
    }
    
    return exactMatches;
  }

  /**
   * تطبيع النص لتحسين البحث
   * @param {string} text - النص المراد تطبيعه
   * @returns {string} - النص المطبع
   */
  _normalizeText(text) {
    if (!text) return '';
    
    let normalized = text;
    
    // إزالة التشكيل
    if (this.removeTashkeel) {
      normalized = normalized.replace(/[\u064B-\u0652]/g, '');
    }
    
    // إزالة التطويل
    if (this.removeTatweel) {
      normalized = normalized.replace(/\u0640/g, '');
    }
    
    // توحيد الألف
    if (this.normalizeAlif) {
      normalized = normalized.replace(/[أإآا]/g, 'ا');
    }
    
    // توحيد الهمزة
    if (this.normalizeHamza) {
      normalized = normalized.replace(/[ؤئ]/g, 'ء');
    }
    
    // توحيد الياء
    if (this.normalizeYa) {
      normalized = normalized.replace(/[ىي]/g, 'ي');
    }
    
    return normalized.trim();
  }

  /**
   * تمييز الكلمات المتطابقة في النص
   * @param {string} text - النص الأصلي
   * @param {Array} matches - الكلمات المتطابقة
   * @returns {string} - النص مع تمييز الكلمات المتطابقة
   */
  _highlightMatches(text, matches) {
    if (!text || !matches || matches.length === 0) return text;
    
    let highlightedText = text;
    const normalizedText = this._normalizeText(text);
    
    // ترتيب الكلمات المتطابقة حسب الطول (من الأطول إلى الأقصر)
    // لتجنب تداخل التمييزات
    matches.sort((a, b) => b.length - a.length);
    
    for (const match of matches) {
      if (!match || match.length < 2) continue;
      
      const normalizedMatch = this._normalizeText(match);
      let startIndex = 0;
      
      // البحث عن كل تطابق في النص
      while (true) {
        const matchIndex = normalizedText.indexOf(normalizedMatch, startIndex);
        if (matchIndex === -1) break;
        
        // تحديد النص الأصلي المقابل للتطابق
        const originalMatch = text.substring(matchIndex, matchIndex + match.length);
        
        // تمييز النص المتطابق
        highlightedText = highlightedText.replace(
          originalMatch,
          `<mark class="bg-amber-300 text-slate-900 rounded px-0.5">${originalMatch}</mark>`
        );
        
        startIndex = matchIndex + normalizedMatch.length;
      }
    }
    
    return highlightedText;
  }

  /**
   * تعيين خيارات التطبيع
   * @param {Object} options - خيارات التطبيع
   */
  setNormalizationOptions(options) {
    if (options.normalizeAlif !== undefined) this.normalizeAlif = options.normalizeAlif;
    if (options.normalizeHamza !== undefined) this.normalizeHamza = options.normalizeHamza;
    if (options.normalizeYa !== undefined) this.normalizeYa = options.normalizeYa;
    if (options.removeTashkeel !== undefined) this.removeTashkeel = options.removeTashkeel;
    if (options.removeTatweel !== undefined) this.removeTatweel = options.removeTatweel;
  }
}

// تصدير محرك البحث للاستخدام في التطبيق
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuranSearchEngine;
} else if (typeof window !== 'undefined') {
  window.QuranSearchEngine = QuranSearchEngine;
} 