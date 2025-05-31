/**
 * نظام الأذكار والأدعية - يعتمد على ملف JSON
 * يقوم بتحميل الأذكار من ملف JSON وعرضها حسب التصنيف
 */

// متغيرات عامة
let athkarData = null;
let currentCategory = null;
let athkarCounters = {};

// تحميل بيانات الأذكار من ملف JSON
async function loadathkarData() {
  try {
    // التحقق من وجود البيانات في التخزين المحلي أولاً
    const cachedData = localStorage.getItem('athkar-data');
    const cacheTimestamp = localStorage.getItem('athkar-data-timestamp');
    const now = Date.now();
    const cacheAge = cacheTimestamp ? (now - parseInt(cacheTimestamp)) / (1000 * 60 * 60 * 24) : 999;
    
    // استخدام البيانات المخزنة إذا كانت حديثة (أقل من 7 أيام)
    if (cachedData && cacheAge < 7) {
      console.log('✅ استخدام بيانات الأذكار من التخزين المحلي');
      athkarData = JSON.parse(cachedData);
      return athkarData;
    }
    
    // تحميل البيانات من الملف
    console.log('🔄 تحميل بيانات الأذكار من الملف...');
    const response = await fetch('./assets/data/athkar.json');
    
    if (!response.ok) {
      throw new Error(`فشل تحميل بيانات الأذكار: ${response.status}`);
    }
    
    athkarData = await response.json();
    
    // حفظ البيانات في التخزين المحلي
    localStorage.setItem('athkar-data', JSON.stringify(athkarData));
    localStorage.setItem('athkar-data-timestamp', now.toString());
    
    console.log('✅ تم تحميل بيانات الأذكار بنجاح');
    return athkarData;
    
  } catch (error) {
    console.error('❌ خطأ في تحميل بيانات الأذكار:', error);
    showathkarError('حدث خطأ أثناء تحميل بيانات الأذكار');
    return null;
  }
}

// عرض فئات الأذكار
function displayathkarCategories() {
  if (!athkarData || !athkarData.categories) {
    console.error('❌ بيانات الأذكار غير متوفرة');
    return;
  }
  
  const athkarSection = document.getElementById('athkar-section');
  if (!athkarSection) return;
  
  // إنشاء محتوى قسم الأذكار
  let html = `
    <div class="text-center mb-8">
      <h2 class="text-4xl font-bold text-amber-400 mb-4">الأذكار والأدعية</h2>
      <p class="text-lg text-slate-400">مجموعة من الأذكار والأدعية المأثورة</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  `;
  
  // إضافة بطاقات الفئات
  athkarData.categories.forEach(category => {
    html += `
      <div class="section-card rounded-xl p-6 cursor-pointer transition-all hover:bg-slate-700/50 hover:border-amber-500/30 hover:transform hover:scale-[1.02]" data-athkar-category="${category.id}">
        <div class="text-center">
          <div class="text-4xl mb-4">${category.icon}</div>
          <h3 class="text-xl font-semibold text-amber-400 mb-2">${category.name}</h3>
          <p class="text-slate-400">${category.description}</p>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  
  // تعيين المحتوى
  athkarSection.innerHTML = html;
  
  // إضافة مستمعات الأحداث
  document.querySelectorAll('[data-athkar-category]').forEach(card => {
    card.addEventListener('click', () => {
      const categoryId = card.getAttribute('data-athkar-category');
      displayathkarByCategory(categoryId);
    });
  });
}

// عرض الأذكار حسب الفئة
function displayathkarByCategory(categoryId) {
  if (!athkarData) return;
  
  // البحث عن الفئة
  const category = athkarData.categories.find(c => c.id === categoryId);
  if (!category) {
    console.error(`❌ فئة الأذكار غير موجودة: ${categoryId}`);
    return;
  }
  
  // تحديد الأذكار المنتمية للفئة
  const categoryathkar = athkarData.athkar.filter(thikr => thikr.category === categoryId);
  
  if (categoryathkar.length === 0) {
    showathkarError(`لا توجد أذكار في فئة ${category.name}`);
    return;
  }
  
  // تعيين الفئة الحالية
  currentCategory = categoryId;
  
  // إنشاء محتوى صفحة الأذكار
  const athkarSection = document.getElementById('athkar-section');
  if (!athkarSection) return;
  
  let html = `
    <div class="mb-6 flex items-center justify-between">
      <button id="back-to-categories" class="flex items-center text-amber-400 hover:text-amber-300 transition-colors">
        <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        العودة للفئات
      </button>
      <h2 class="text-2xl font-bold text-amber-400">${category.name}</h2>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="athkar-cards">
  `;
  
  // إضافة بطاقات الأذكار
  categoryathkar.forEach(thikr => {
    // تهيئة عداد الذكر إذا لم يكن موجوداً
    if (!athkarCounters[thikr.id]) {
      athkarCounters[thikr.id] = thikr.count;
    }
    
    html += `
      <div class="thikr-card bg-slate-800/80 rounded-xl p-6 border border-slate-700 hover:border-amber-500/30 transition-all">
        <div class="font-quran-sm text-slate-200 mb-4 leading-relaxed text-right">${thikr.text}</div>
        <div class="text-sm text-amber-400 mb-2">${thikr.source}</div>
        <div class="text-sm text-slate-400 mb-4">${thikr.description || ''}</div>
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <span class="text-slate-400 ml-2">التكرار:</span>
            <span class="bg-amber-600/20 text-amber-400 px-3 py-1 rounded-full" id="counter-${thikr.id}">${athkarCounters[thikr.id]}/${thikr.count}</span>
          </div>
          <button class="thikr-counter-btn bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors" data-thikr-id="${thikr.id}" data-total-count="${thikr.count}">
            تسبيح
          </button>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  
  // تعيين المحتوى
  athkarSection.innerHTML = html;
  
  // إضافة مستمعات الأحداث
  document.getElementById('back-to-categories').addEventListener('click', () => {
    displayathkarCategories();
  });
  
  // إضافة مستمعات أحداث لأزرار العد
  document.querySelectorAll('.thikr-counter-btn').forEach(button => {
    button.addEventListener('click', handlethikrCounter);
  });
}

// معالجة نقرات عداد الذكر
function handlethikrCounter(event) {
  const button = event.currentTarget;
  const thikrId = parseInt(button.getAttribute('data-thikr-id'));
  const totalCount = parseInt(button.getAttribute('data-total-count'));
  
  // تحديث العداد
  if (athkarCounters[thikrId] > 0) {
    athkarCounters[thikrId]--;
    
    // تحديث عرض العداد
    const counterElement = document.getElementById(`counter-${thikrId}`);
    if (counterElement) {
      counterElement.textContent = `${athkarCounters[thikrId]}/${totalCount}`;
      
      // إضافة تأثير بصري
      counterElement.classList.add('bg-green-600/20', 'text-green-400');
      setTimeout(() => {
        counterElement.classList.remove('bg-green-600/20', 'text-green-400');
      }, 300);
    }
    
    // إذا وصل العداد إلى الصفر
    if (athkarCounters[thikrId] === 0) {
      button.textContent = 'تم';
      button.classList.remove('bg-amber-600', 'hover:bg-amber-500');
      button.classList.add('bg-green-600', 'hover:bg-green-500');
      
      // إضافة تأثير الاهتزاز
      button.classList.add('animate-pulse');
      
      // عرض رسالة
      showCompletionMessage(thikrId);
    }
  } else {
    // إعادة تعيين العداد
    athkarCounters[thikrId] = totalCount;
    
    // تحديث عرض العداد
    const counterElement = document.getElementById(`counter-${thikrId}`);
    if (counterElement) {
      counterElement.textContent = `${athkarCounters[thikrId]}/${totalCount}`;
    }
    
    // إعادة تعيين الزر
    button.textContent = 'تسبيح';
    button.classList.remove('bg-green-600', 'hover:bg-green-500', 'animate-pulse');
    button.classList.add('bg-amber-600', 'hover:bg-amber-500');
  }
}

// عرض رسالة إكمال الذكر
function showCompletionMessage(thikrId) {
  // إنشاء رسالة مؤقتة
  const messageElement = document.createElement('div');
  messageElement.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-600/90 text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in';
  messageElement.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      تم إكمال الذكر بنجاح
    </div>
  `;
  
  // إضافة الرسالة للصفحة
  document.body.appendChild(messageElement);
  
  // إزالة الرسالة بعد 3 ثوانٍ
  setTimeout(() => {
    messageElement.classList.add('fade-out');
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 500);
  }, 3000);
}

// عرض رسالة خطأ
function showathkarError(message) {
  const athkarSection = document.getElementById('athkar-section');
  if (!athkarSection) return;
  
  athkarSection.innerHTML = `
    <div class="text-center mb-8">
      <h2 class="text-4xl font-bold text-amber-400 mb-4">الأذكار والأدعية</h2>
    </div>
    <div class="bg-red-900/20 border border-red-900/30 rounded-xl p-6 text-center">
      <div class="text-red-400 mb-4">❌ ${message}</div>
      <button id="retry-athkar-load" class="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors">
        إعادة المحاولة
      </button>
    </div>
  `;
  
  // إضافة مستمع حدث لزر إعادة المحاولة
  document.getElementById('retry-athkar-load').addEventListener('click', initathkar);
}

// مشاركة الذكر
function sharethikr(thikrId) {
  if (!athkarData) return;
  
  const thikr = athkarData.athkar.find(z => z.id === thikrId);
  if (!thikr) return;
  
  const shareText = `${thikr.text}\n\n${thikr.source}\n${thikr.description || ''}`;
  
  try {
    if (navigator.share) {
      navigator.share({
        title: 'مشاركة ذكر',
        text: shareText
      });
    } else {
      // نسخ النص إلى الحافظة
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // عرض رسالة تأكيد
      alert('تم نسخ الذكر إلى الحافظة');
    }
  } catch (error) {
    console.error('خطأ في مشاركة الذكر:', error);
  }
}

// دالة التهيئة
async function initathkar() {
  try {
    // عرض رسالة التحميل
    const athkarSection = document.getElementById('athkar-section');
    if (athkarSection) {
      athkarSection.innerHTML = `
        <div class="text-center py-12">
          <div class="loader mx-auto mb-4"></div>
          <p class="text-slate-400">جار تحميل الأذكار...</p>
        </div>
      `;
    }
    
    // تحميل بيانات الأذكار
    await loadathkarData();
    
    // عرض فئات الأذكار
    displayathkarCategories();
    
  } catch (error) {
    console.error('❌ خطأ في تهيئة نظام الأذكار:', error);
    showathkarError('حدث خطأ أثناء تحميل نظام الأذكار');
  }
}

// تصدير الدوال للاستخدام في الملفات الأخرى
window.athkarSystem = {
  init: initathkar,
  displayCategories: displayathkarCategories,
  displayByCategory: displayathkarByCategory,
  share: sharethikr
};