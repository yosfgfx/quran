// ==================================================================================
// ||                         نظام الأذكار الموحد                             ||
// ==================================================================================
(function() {
    // --- المسارات الأساسية لملفات البيانات ---
const MAIN_athkar_JSON_PATH = './assets/data/athkar.json'; // الملف الرئيسي الجديد
    const HUSN_ALMUSLIM_INDEX_PATH = './fallback-data/husn_ar.json'; // فهرس حصن المسلم

    // --- متغيرات لتخزين البيانات المحملة ---
    let mainathkarData = null; // لتخزين محتوى assets/data/athkar.json
    let husnAlmuslimIndexData = null; // لتخزين محتوى fallback-data/husn_ar.json (قائمة فئات حصن المسلم)
    let husnAlmuslimFullDetails = {}; // لتخزين محتوى فئات حصن المسلم التفصيلية بعد تحميلها

    // --- متغيرات الحالة ---
    let currentathkarCounters = {}; // لتتبع عدادات الأذكار { "zikr_id": current_count }
    let activeZikrAudioPlayer = null; // مشغل الصوت النشط للأذكار الفردية

    // --- عناصر واجهة المستخدم الرئيسية ---
    const athkarSection = document.getElementById('athkar-section');

    /**
     * دالة مساعدة لجلب بيانات JSON
     */
    async function fetchJsonData(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${path}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching JSON from ${path}:`, error);
            throw error; // إعادة رمي الخطأ لمعالجته في الدوال المستدعية
        }
    }

    /**
     * عرض رسالة تحميل
     */
    function showLoadingMessage(message = "جارٍ التحميل...") {
        if (!athkarSection) return;
        athkarSection.innerHTML = `
            <div class="text-center py-12">
                <div class="loader mx-auto mb-4"></div>
                <p class="text-slate-400">${message}</p>
            </div>
        `;
    }

    /**
     * عرض رسالة خطأ
     */
    function showErrorMessage(message, showRetryButton = false) {
        if (!athkarSection) return;
        let retryButtonHtml = '';
        if (showRetryButton) {
            retryButtonHtml = `
                <button id="retry-athkar-init" class="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg transition-colors mt-4">
                    إعادة المحاولة
                </button>
            `;
        }
        athkarSection.innerHTML = `
            <div class="container mx-auto px-4 py-8 text-center">
                 <div class="text-center mb-8">
                    <h2 class="text-4xl font-bold text-amber-400 mb-4">الأذكار والأدعية</h2>
                </div>
                <div class="bg-red-900/20 border border-red-900/30 rounded-xl p-6 text-center">
                    <div class="text-red-400 mb-4 text-xl">⚠️ ${message}</div>
                    ${retryButtonHtml}
                </div>
            </div>
        `;
        if (showRetryButton) {
            const retryButton = document.getElementById('retry-athkar-init');
            if (retryButton) {
                retryButton.addEventListener('click', initathkarSystem);
            }
        }
    }

    /**
     * تحميل البيانات الأساسية (ملف الأذكار الرئيسي وملف فهرس حصن المسلم)
     */
    async function loadInitialData() {
        try {
            // استخدام Promise.all لتحميل الملفات بالتوازي
            const [mainData, husnIndexData] = await Promise.all([
                fetchJsonData(MAIN_athkar_JSON_PATH),
                fetchJsonData(HUSN_ALMUSLIM_INDEX_PATH) // تحميل فهرس حصن المسلم دائمًا
            ]);

            console.log("Contenido de mainData:", mainData);

            if (!mainData || !mainData.categories || !mainData.athkar) {
                throw new Error("ملف الأذكار الرئيسي (`assets/data/athkar.json`) غير صالح أو فارغ.");
            }
            mainathkarData = mainData;

            if (!husnIndexData || !husnIndexData['العربية']) {
                 console.warn("ملف فهرس حصن المسلم (`fallback-data/husn_ar.json`) غير صالح أو لا يحتوي على قسم 'العربية'. ستعمل فئة حصن المسلم بشكل محدود.");
                 // يمكن التعامل مع هذا كخطأ غير فادح، ربما بتعطيل فئة حصن المسلم
                 husnAlmuslimIndexData = { 'العربية': [] }; // قيمة افتراضية فارغة لتجنب أخطاء لاحقة
            } else {
                husnAlmuslimIndexData = husnIndexData;
            }
            return true;
        } catch (error) {
            console.error("فشل تحميل البيانات الأولية:", error);
            showErrorMessage(`خطأ في تحميل بيانات الأذكار الأساسية. ${error.message}`, true);
            return false;
        }
    }


    /**
     * عرض الفئات الرئيسية من assets/data/athkar.json
     */
    function displayMainCategories() {
        if (!athkarSection || !mainathkarData || !mainathkarData.categories) {
            showErrorMessage("لا يمكن عرض الفئات، البيانات غير متوفرة.");
            return;
        }

        currentathkarCounters = {}; // إعادة تعيين العدادات عند الرجوع للفئات

        let html = `
            <div class="container mx-auto px-4 py-8">
                <div class="text-center mb-10">
                    <h2 class="text-4xl font-bold text-amber-400 mb-3">الأذكار والأدعية</h2>
                    <p class="text-lg text-slate-400">اختر تصنيفًا لعرض الأذكار أو الأدعية المتعلقة به.</p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        `;

        mainathkarData.categories.forEach(category => {
            html += `
                <div class="section-card rounded-xl p-6 cursor-pointer transition-all duration-300 ease-in-out hover:bg-slate-700/60 hover:border-amber-500/40 hover:shadow-xl transform hover:scale-[1.03]" data-category-id="${category.id}">
                    <div class="flex flex-col items-center text-center">
                        <div class="text-5xl mb-4">${category.icon || '📖'}</div>
                        <h3 class="text-xl font-semibold text-amber-400 mb-2">${category.name}</h3>
                        <p class="text-slate-400 text-sm">${category.description || ''}</p>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
        athkarSection.innerHTML = html;

        document.querySelectorAll('[data-category-id]').forEach(card => {
            card.addEventListener('click', function() {
                const categoryId = this.dataset.categoryId;
                if (categoryId === 'hisnmuslim') {
                    displayHusnAlmuslimSubCategories();
                } else {
                    displayathkarForMainCategory(categoryId);
                }
            });
        });
    }

    /**
     * عرض الأذكار لفئة رئيسية (من assets/data/athkar.json)
     */
    function displayathkarForMainCategory(categoryId) {
        const category = mainathkarData.categories.find(cat => cat.id === categoryId);
        if (!category) {
            showErrorMessage(`الفئة المطلوبة (${categoryId}) غير موجودة.`);
            return;
        }

        const athkarForCategory = mainathkarData.athkar.filter(zikr => zikr.category === categoryId);
        if (athkarForCategory.length === 0) {
             renderathkarList([], category.name, () => displayMainCategories()); // عرض قائمة فارغة مع زر عودة
             return;
        }
        
        // تحويل البيانات لتناسب renderathkarList
        const formattedathkar = athkarForCategory.map(zikr => ({
            id: `main_${zikr.id}`, // لضمان ID فريد للعدادات
            text: zikr.text,
            repeat: zikr.count || 1, // 'count' في ملفك هو 'repeat'
            source: zikr.source || '',
            description: zikr.description || '', // الوصف الإضافي
            audio: zikr.audio || null // إذا كان هناك حقل صوتي
        }));

        renderathkarList(formattedathkar, category.name, () => displayMainCategories());
    }

    /**
     * عرض فئات حصن المسلم الفرعية (من fallback-data/husn_ar.json)
     */
    function displayHusnAlmuslimSubCategories() {
        if (!husnAlmuslimIndexData || !husnAlmuslimIndexData['العربية'] || husnAlmuslimIndexData['العربية'].length === 0) {
            showErrorMessage("لا توجد فئات متاحة في حصن المسلم حاليًا أو فشل تحميلها.");
            // إضافة زر عودة إذا لزم الأمر
            const errorDiv = athkarSection.querySelector('.bg-red-900\\/20'); // يجب أن يكون CSS selector صالحًا
            if (errorDiv) {
                const backButton = document.createElement('button');
                backButton.id = 'back-to-main-categories-from-husn-error';
                backButton.className = 'bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors mt-3';
                backButton.innerHTML = '<svg class="w-4 h-4 inline ml-1 rtl:mr-1 rtl:ml-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg> العودة للفئات الرئيسية';
                backButton.addEventListener('click', displayMainCategories);
                errorDiv.appendChild(backButton);
            }
            return;
        }

        const husnCategories = husnAlmuslimIndexData['العربية'];
        let html = `
            <div class="container mx-auto px-4 py-8">
                <div class="flex justify-between items-center mb-8">
                    <button id="back-to-main-categories" class="flex items-center text-amber-400 hover:text-amber-300 transition-colors text-lg">
                        <svg class="w-5 h-5 rtl:rotate-180 ml-2 rtl:ml-0 rtl:mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
                        الفئات الرئيسية
                    </button>
                    <h2 class="text-3xl font-bold text-amber-400">فئات حصن المسلم</h2>
                    <div></div> <!-- Spacer -->
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        `;

        husnCategories.forEach(husnCat => {
            // استخدام ID كـ data attribute
            html += `
                <div class="section-card rounded-xl p-5 cursor-pointer transition-all hover:bg-slate-700/60 hover:border-amber-500/40" data-husn-id="${husnCat.ID}" data-husn-title="${husnCat.TITLE}" data-husn-text-url="${husnCat.TEXT}" data-husn-audio-url="${husnCat.AUDIO_URL || ''}">
                    <h3 class="text-lg font-semibold text-amber-300 mb-1">${husnCat.TITLE}</h3>
                    <p class="text-slate-400 text-xs">ID: ${husnCat.ID}</p>
                </div>
            `;
        });
        html += `</div></div>`;
        athkarSection.innerHTML = html;

        document.getElementById('back-to-main-categories').addEventListener('click', displayMainCategories);

        document.querySelectorAll('[data-husn-id]').forEach(card => {
            card.addEventListener('click', async function() {
                const husnId = this.dataset.husnId;
                const title = this.dataset.husnTitle;
                const textUrl = this.dataset.husnTextUrl;
                // const categoryAudioUrl = this.dataset.husnAudioUrl; // يمكن استخدامه إذا أردت صوتًا عامًا للفئة

                if (!textUrl || textUrl === "null" || textUrl === "") {
                    console.warn(`لا يوجد رابط نصي لفئة حصن المسلم: ${title} (ID: ${husnId})`);
                     // إذا كان هناك رابط صوتي عام، يمكن عرض بطاقة بسيطة للاستماع
                    if (this.dataset.husnAudioUrl && this.dataset.husnAudioUrl !== "null") {
                        renderathkarList([{
                            id: `husn_cat_audio_${husnId}`,
                            text: `للاستماع إلى "${title}"، اضغط على زر الاستماع.`,
                            repeat: 1,
                            source: 'حصن المسلم',
                            audio: this.dataset.husnAudioUrl
                        }], title, () => displayHusnAlmuslimSubCategories());
                    } else {
                        showErrorMessage(`لا توجد تفاصيل نصية أو صوتية لهذه الفئة من حصن المسلم: ${title}.`);
                        // تأكد من إضافة زر عودة هنا أيضًا
                        const errorDiv = athkarSection.querySelector('.bg-red-900\\/20');
                        if (errorDiv && !errorDiv.querySelector('#back-to-husn-categories-from-error')) {
                            const backBtn = document.createElement('button');
                            backBtn.id = 'back-to-husn-categories-from-error';
                            backBtn.className = 'bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg mt-3';
                            backBtn.innerHTML = '<svg class="w-4 h-4 inline ml-1 rtl:mr-1 rtl:ml-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg> العودة لفئات حصن المسلم';
                            backBtn.addEventListener('click', displayHusnAlmuslimSubCategories);
                            errorDiv.appendChild(backBtn);
                        }
                    }
                    return;
                }

                showLoadingMessage(`جار تحميل أذكار: ${title}...`);
                try {
                    let detailedathkar;
                    if (husnAlmuslimFullDetails[husnId]) {
                        detailedathkar = husnAlmuslimFullDetails[husnId];
                    } else {
                        const rawData = await fetchJsonData(textUrl);
                        // ملفات حصن المسلم قد تكون كائنًا يحتوي على مفتاح باسم الفئة، أو مصفوفة مباشرة
                        let dataArray;
                        if (rawData && rawData[title] && Array.isArray(rawData[title])) {
                            dataArray = rawData[title];
                        } else if (rawData && Array.isArray(rawData)) {
                            dataArray = rawData;
                        } else {
                            throw new Error("تنسيق بيانات حصن المسلم غير متوقع.");
                        }
                        
                        detailedathkar = dataArray.map((item, index) => ({
                            id: `husn_${husnId}_${index}`, // ID فريد
                            text: item.ZEKR || item.TEXT || "لا يوجد نص متوفر",
                            repeat: parseInt(item.REPEAT, 10) || 1,
                            source: item.BLESS || 'حصن المسلم',
                            description: item.DESCRIPTION || '', // إذا كان هناك وصف
                            audio: item.AUDIO_URL_PER_ZEKR || item.AUDIO_URL || null // صوت للذكر الفردي
                        }));
                        husnAlmuslimFullDetails[husnId] = detailedathkar;
                    }
                    renderathkarList(detailedathkar, title, () => displayHusnAlmuslimSubCategories());
                } catch (error) {
                    console.error(`خطأ في تحميل أو معالجة تفاصيل فئة حصن المسلم ${title}:`, error);
                    showErrorMessage(`فشل تحميل أذكار "${title}". ${error.message}`);
                     // تأكد من إضافة زر عودة هنا أيضًا
                    const errorDiv = athkarSection.querySelector('.bg-red-900\\/20');
                    if (errorDiv && !errorDiv.querySelector('#back-to-husn-categories-from-error-fetch')) {
                        const backBtn = document.createElement('button');
                        backBtn.id = 'back-to-husn-categories-from-error-fetch';
                        backBtn.className = 'bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg mt-3';
                        backBtn.innerHTML = '<svg class="w-4 h-4 inline ml-1 rtl:mr-1 rtl:ml-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg> العودة لفئات حصن المسلم';
                        backBtn.addEventListener('click', displayHusnAlmuslimSubCategories);
                        errorDiv.appendChild(backBtn);
                    }
                }
            });
        });
    }

    /**
     * عرض قائمة الأذكار الفعلية (البطاقات)
     * @param {Array} athkarArray - مصفوفة الأذكار للعرض
     * @param {String} categoryTitle - عنوان الفئة
     * @param {Function} backButtonAction - الدالة التي سيتم تنفيذها عند الضغط على زر العودة
     */
    function renderathkarList(athkarArray, categoryTitle, backButtonAction) {
        if (!athkarSection) return;
        
        let html = `
            <div class="container mx-auto px-4 py-8">
                <div class="flex justify-between items-center mb-6">
                    <button id="back-to-previous-list" class="flex items-center text-amber-400 hover:text-amber-300 transition-colors text-lg">
                        <svg class="w-5 h-5 rtl:rotate-180 ml-2 rtl:ml-0 rtl:mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
                        عودة
                    </button>
                    <h2 class="text-2xl md:text-3xl font-bold text-amber-400 text-center flex-grow">${categoryTitle}</h2>
                    <div class="w-16"></div> <!-- Spacer to balance the back button -->
                </div>
        `;

        if (athkarArray.length === 0) {
            html += `<div class="text-center p-6 bg-slate-800/50 rounded-lg text-slate-400">لا توجد أذكار متاحة لهذه الفئة حاليًا.</div>`;
        } else {
             html += `<div class="text-center text-slate-400 text-sm mb-6"><p>انقر على نص الذكر لتوسيعه أو طيه. انقر على زر "تم" لعد التكرارات.</p></div>`;
             html += `<div id="athkar-cards-container" class="space-y-6">`;
            athkarArray.forEach((zikr, index) => {
                const zikrId = zikr.id || `zikr_${Date.now()}_${index}`; // ضمان وجود ID للعداد
                const totalCount = parseInt(zikr.repeat, 10) || 1;
                
                // تهيئة العداد إذا لم يكن موجودًا أو إذا تم إعادة تحميل القائمة
                if (currentathkarCounters[zikrId] === undefined || currentathkarCounters[zikrId] > totalCount) {
                    currentathkarCounters[zikrId] = totalCount;
                }
                const currentCount = currentathkarCounters[zikrId];

                html += `
                    <div class="zikr-card section-card rounded-xl p-5 md:p-6 shadow-lg fade-in">
                        <div class="zikr-text-content text-slate-200 text-lg md:text-xl leading-relaxed whitespace-pre-line mb-4 font-quran-sm cursor-pointer collapse-content" data-zikr-id="${zikrId}_text">
                            ${(zikr.text || '').replace(/\\r\\n|\\n|\\r/g, '\n')}
                        </div>
                        
                        ${zikr.source ? `<div class="text-xs text-amber-400/80 mt-3 mb-1"><span class="font-semibold">المصدر/الفضل:</span> ${zikr.source}</div>` : ''}
                        ${zikr.description ? `<div class="text-xs text-slate-400 mb-3">${zikr.description}</div>` : ''}

                        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 pt-4 border-t border-slate-700">
                            <div class="flex items-center">
                                <span class="text-slate-300 ml-2 rtl:mr-2 rtl:ml-0 text-sm">التكرار:</span>
                                <span class="zikr-counter-display bg-amber-600/20 text-amber-300 px-3 py-1 rounded-full text-sm" id="counter-display-${zikrId}">
                                    ${currentCount} / ${totalCount}
                                </span>
                            </div>
                            
                            <div class="flex items-center gap-2 flex-wrap justify-center sm:justify-end rtl:justify-start">
                                ${totalCount > 0 ? `
                <button class="zikr-action-btn zikr-tasbih-btn rounded-xl px-3 py-1 ${currentCount === 0 ? 'bg-green-600 hover:bg-green-500 ' : 'bg-amber-600 hover:bg-amber-500'} " 
                                        data-zikr-id="${zikrId}" data-total-count="${totalCount}" title="تم">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
                                    <span class="btn-text">${currentCount === 0 ? 'تم' : 'تم'}</span>
                                </button>` : ''}
                                <button class="zikr-action-btn copy-zikr-btn rounded-xl px-3 py-1 bg-slate-600 hover:bg-slate-500" data-text="${zikr.text}" title="نسخ الذكر">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"></path><path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z"></path></svg>
                                    <span class="btn-text">نسخ</span>
                                </button>
                                <button class="zikr-action-btn share-zikr-btn rounded-xl px-3 py-1 bg-sky-600 hover:bg-sky-500" data-text="${zikr.text}" title="مشاركة الذكر">
                                     <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path></svg>
                                    <span class="btn-text">مشاركة</span>
                                </button>
                                ${zikr.audio ? `
                                <button class="zikr-action-btn play-zikr-audio-btn bg-emerald-600 hover:bg-emerald-500" data-audio-src="${zikr.audio}" data-zikr-id="${zikrId}_audio" title="استماع">
                                    <svg class="w-4 h-4 icon-play" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                                    <svg class="w-4 h-4 icon-pause hidden" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd"></path></svg>
                                    <svg class="w-4 h-4 icon-loading hidden animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    <span class="btn-text">استماع</span>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            html += `</div>`; // End #athkar-cards-container
        }
        html += `</div>`; // End .container
        athkarSection.innerHTML = html;

        // Event listener for back button
        document.getElementById('back-to-previous-list').addEventListener('click', backButtonAction);

        // Event listeners for zikr cards
        attachZikrCardEventListeners();
    }

    /**
     * ربط مستمعات الأحداث لبطاقات الأذكار (عداد، نسخ، مشاركة، صوت، توسيع/طي)
     */
    function attachZikrCardEventListeners() {
        // Expand/Collapse Zikr Text
        document.querySelectorAll('.zikr-text-content.collapse-content').forEach(content => {
            if (!content.hasCollapseListener) {
                content.addEventListener('click', function() {
                    this.classList.toggle('expanded');
                });
                content.hasCollapseListener = true;
            }
        });

        // Tasbih Counter Buttons
        document.querySelectorAll('.zikr-tasbih-btn').forEach(button => {
            button.addEventListener('click', handleTasbihClick);
        });

        // Copy Buttons
        document.querySelectorAll('.copy-zikr-btn').forEach(button => {
            button.addEventListener('click', handleCopyClick);
        });

        // Share Buttons
        document.querySelectorAll('.share-zikr-btn').forEach(button => {
            button.addEventListener('click', handleShareClick);
        });
        
        // Play Audio Buttons
        document.querySelectorAll('.play-zikr-audio-btn').forEach(button => {
            button.addEventListener('click', handlePlayZikrAudioClick);
        });
    }
    
    /**
     *  معالجة النقر على زر التم
     */
    function handleTasbihClick(event) {
        const button = event.currentTarget;
        const zikrId = button.dataset.zikrId;
        const totalCount = parseInt(button.dataset.totalCount);
        const counterDisplay = document.getElementById(`counter-display-${zikrId}`);
        const btnText = button.querySelector('.btn-text');

        if (currentathkarCounters[zikrId] > 0) {
            currentathkarCounters[zikrId]--;
            if (counterDisplay) {
                counterDisplay.textContent = `${currentathkarCounters[zikrId]} / ${totalCount}`;
            }
            // Add visual feedback (e.g., a quick pulse)
            button.classList.add('animate-pulse-once');
            setTimeout(() => button.classList.remove('animate-pulse-once'), 300);

            if (currentathkarCounters[zikrId] === 0) {
                if (btnText) btnText.textContent = 'تم';
                button.classList.remove('bg-amber-600', 'hover:bg-amber-500');
                button.classList.add('bg-green-600', 'hover:bg-green-500');
                showTemporaryMessage("أحسنت! لقد أتممت الذكر.", "success");
            }
        } else { // Reset counter
            currentathkarCounters[zikrId] = totalCount;
            if (counterDisplay) {
                counterDisplay.textContent = `${currentathkarCounters[zikrId]} / ${totalCount}`;
            }
            if (btnText) btnText.textContent = 'تم';
            button.classList.remove('bg-green-600', 'hover:bg-green-500');
            button.classList.add('bg-amber-600', 'hover:bg-amber-500');
        }
    }

    /**
     * معالجة النقر على زر النسخ
     */
    function handleCopyClick(event) {
        const button = event.currentTarget;
        const textToCopy = button.dataset.text;
        const btnText = button.querySelector('.btn-text');
        const originalText = btnText.textContent;

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                btnText.textContent = 'تم النسخ!';
                button.classList.add('bg-green-600');
                setTimeout(() => {
                    btnText.textContent = originalText;
                    button.classList.remove('bg-green-600');
                }, 2000);
            })
            .catch(err => {
                console.error('خطأ في نسخ النص:', err);
                btnText.textContent = 'فشل النسخ';
                setTimeout(() => { btnText.textContent = originalText; }, 2000);
            });
    }
    
    /**
     * معالجة النقر على زر المشاركة
     */
    function handleShareClick(event) {
        const button = event.currentTarget;
        const textToShare = button.dataset.text;
        const categoryTitle = athkarSection.querySelector('h2').textContent || "ذكر من القرآن والسنة";

        if (navigator.share) {
            navigator.share({
                title: `مشاركة: ${categoryTitle}`,
                text: textToShare,
            }).catch(err => console.error('خطأ في مشاركة النص:', err));
        } else {
            // Fallback for browsers that don't support navigator.share
            navigator.clipboard.writeText(textToShare)
                .then(() => showTemporaryMessage("تم نسخ الذكر للمشاركة.", "info"))
                .catch(err => console.error('خطأ في نسخ النص للمشاركة:', err));
        }
    }

    /**
     * معالجة النقر على زر تشغيل الصوت للذكر
     */
    function handlePlayZikrAudioClick(event) {
        const button = event.currentTarget;
        const audioSrc = button.dataset.audioSrc;
        const zikrAudioId = button.dataset.zikrId; // Used to identify the audio player instance

        const iconPlay = button.querySelector('.icon-play');
        const iconPause = button.querySelector('.icon-pause');
        const iconLoading = button.querySelector('.icon-loading');
        const btnText = button.querySelector('.btn-text');
        const originalBtnText = "استماع";

        // Function to reset other audio buttons
        const resetOtherAudioButtons = () => {
            document.querySelectorAll('.play-zikr-audio-btn.playing').forEach(otherBtn => {
                if (otherBtn !== button && otherBtn.audioPlayerInstance) {
                    otherBtn.audioPlayerInstance.pause();
                    otherBtn.classList.remove('playing');
                    otherBtn.querySelector('.icon-play').classList.remove('hidden');
                    otherBtn.querySelector('.icon-pause').classList.add('hidden');
                    otherBtn.querySelector('.icon-loading').classList.add('hidden');
                    otherBtn.querySelector('.btn-text').textContent = originalBtnText;
                }
            });
        };
        
        // Stop main Quran player if it's playing from another section
        if (window.quranPlayer && typeof window.quranPlayer.pause === 'function' && !window.quranPlayer.paused) {
            window.quranPlayer.pause();
             // You might want to update the UI of the main player as well
            const mainPlayPauseButton = document.getElementById('playPauseButton');
            if (mainPlayPauseButton) {
                 mainPlayPauseButton.innerHTML = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>`;
            }
        }


        if (button.audioPlayerInstance && !button.audioPlayerInstance.paused) { // Audio is playing, so pause it
            button.audioPlayerInstance.pause();
            button.classList.remove('playing');
            iconPlay.classList.remove('hidden');
            iconPause.classList.add('hidden');
            iconLoading.classList.add('hidden');
            btnText.textContent = originalBtnText;
        } else { // Audio is paused or not started
            resetOtherAudioButtons(); // Pause any other zikr audio

            if (!button.audioPlayerInstance || button.audioPlayerInstance.src !== audioSrc) {
                if (button.audioPlayerInstance) { // Clean up old instance if src changed
                     button.audioPlayerInstance.oncanplay = null;
                     button.audioPlayerInstance.onended = null;
                     button.audioPlayerInstance.onerror = null;
                }
                button.audioPlayerInstance = new Audio(audioSrc);
            }
            
            activeZikrAudioPlayer = button.audioPlayerInstance;
            button.classList.add('playing');
            iconPlay.classList.add('hidden');
            iconPause.classList.add('hidden');
            iconLoading.classList.remove('hidden');
            btnText.textContent = "تحميل...";

            activeZikrAudioPlayer.oncanplay = () => {
                iconLoading.classList.add('hidden');
                iconPause.classList.remove('hidden');
                btnText.textContent = "إيقاف";
            };
            activeZikrAudioPlayer.onended = () => {
                button.classList.remove('playing');
                iconPlay.classList.remove('hidden');
                iconPause.classList.add('hidden');
                iconLoading.classList.add('hidden');
                btnText.textContent = originalBtnText;
                activeZikrAudioPlayer = null;
            };
            activeZikrAudioPlayer.onerror = (e) => {
                console.error("Error playing zikr audio:", e);
                showTemporaryMessage("خطأ في تشغيل الملف الصوتي.", "error");
                button.classList.remove('playing');
                iconPlay.classList.remove('hidden');
                iconPause.classList.add('hidden');
                iconLoading.classList.add('hidden');
                btnText.textContent = originalBtnText;
                activeZikrAudioPlayer = null;
            };
            
            activeZikrAudioPlayer.play().catch(error => { // Catch immediate play errors
                 activeZikrAudioPlayer.onerror(error); // Trigger the onerror handler
            });
        }
    }
    
    /**
     * عرض رسالة مؤقتة
     */
    function showTemporaryMessage(message, type = 'info') {
        const messageContainer = document.createElement('div');
        messageContainer.className = `fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white text-sm z-[100] transition-opacity duration-300 ease-in-out opacity-0`;
        
        if (type === 'success') messageContainer.classList.add('bg-green-600');
        else if (type === 'error') messageContainer.classList.add('bg-red-600');
        else messageContainer.classList.add('bg-sky-600'); // info
        
        messageContainer.textContent = message;
        document.body.appendChild(messageContainer);

        // Fade in
        setTimeout(() => {
            messageContainer.classList.remove('opacity-0');
            messageContainer.classList.add('opacity-100');
        }, 10);

        // Fade out and remove
        setTimeout(() => {
            messageContainer.classList.remove('opacity-100');
            messageContainer.classList.add('opacity-0');
            setTimeout(() => {
                document.body.removeChild(messageContainer);
            }, 300);
        }, 3000);
    }


    /**
     * تهيئة نظام الأذكار بالكامل
     */
    async function initathkarSystem() {
        console.log("🔄 تهيئة نظام الأذكار...");
        if (!athkarSection) {
            console.error("قسم الأذكار (athkar-section) غير موجود في الصفحة!");
            // ربما عرض رسالة خطأ في مكان آخر إذا كان هذا القسم حيويًا
            return;
        }

        showLoadingMessage("جاري تهيئة قسم الأذكار...");

        const dataLoaded = await loadInitialData();
        if (dataLoaded) {
            displayMainCategories();
            console.log("✅ نظام الأذكار تم تهيئته بنجاح.");
        } else {
            console.error("❌ فشلت تهيئة نظام الأذكار بسبب عدم تحميل البيانات.");
            // showErrorMessage قد تم استدعاؤها بالفعل داخل loadInitialData
        }
    }

    // --- الربط بنظام التطبيق الرئيسي ---
    // هذه الدالة ستُستدعى عند النقر على أيقونة الأذكار في شريط التنقل
    // أو عند تفعيل قسم الأذكار لأول مرة.
    window.activateathkarSection = function() {
        // تحقق مما إذا كان قد تم تهيئته بالفعل لتجنب إعادة التهيئة غير الضرورية
        // (مثلاً، إذا كان mainathkarData موجودًا، فقد لا تحتاج لإعادة كل شيء)
        if (!mainathkarData) { // إذا لم يتم تحميل البيانات الأولية بعد
            initathkarSystem();
        } else {
            // إذا كانت البيانات محملة ولكن المستخدم قد يكون في صفحة أذكار، أعده إلى الفئات الرئيسية
            // أو ببساطة تأكد من أن القسم ظاهر
            console.log("athkar system already initialized. Ensuring main categories are shown or current view is active.");
            // إذا كنت تريد دائمًا البدء من الفئات الرئيسية عند إعادة تنشيط القسم:
            // displayMainCategories();
        }
         // إيقاف أي مشغل صوت رئيسي للقرآن إذا كان يعمل
        if (window.quranPlayer && typeof window.quranPlayer.pause === 'function' && !window.quranPlayer.paused) {
            window.quranPlayer.pause();
            // يمكنك أيضًا تحديث واجهة مستخدم مشغل القرآن إذا لزم الأمر
             const mainPlayPauseButton = document.getElementById('playPauseButton');
             if (mainPlayPauseButton && mainPlayPauseButton.querySelector('.icon-pause')) {
                 mainPlayPauseButton.querySelector('.icon-play').classList.remove('hidden');
                 mainPlayPauseButton.querySelector('.icon-pause').classList.add('hidden');
             }
             console.log("Main Quran player paused for athkar section.");
        }
    };

    // إذا كنت تريد تهيئة النظام مباشرة عند تحميل السكريبت (إذا كان قسم الأذكار هو الافتراضي)
    // document.addEventListener('DOMContentLoaded', initathkarSystem);
    // ولكن من الأفضل ربطه بحدث النقر على زر "الأذكار" في القائمة.

    // يمكنك تصدير دوال معينة إذا أردت استدعاءها من خارج هذا النطاق
    // window.athkarSystem = {
    //     init: initathkarSystem,
    //     displayMainCategories: displayMainCategories
    // };

})(); // IIFE لحماية النطاق
