// Location Service for Quran App
// Provides geolocation, prayer times, and Qibla direction utilities

// Kaaba coordinates
export const KAABA_COORDS = {
    lat: 21.422556983751576,
    lng: 39.82618724818427
};

/**
 * Get user's current position
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('الموقع الجغرافي غير مدعوم في هذا المتصفح'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                let message = 'فشل في الحصول على الموقع';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'تم رفض إذن الوصول للموقع';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'معلومات الموقع غير متوفرة';
                        break;
                    case error.TIMEOUT:
                        message = 'انتهت مهلة طلب الموقع';
                        break;
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes cache
            }
        );
    });
}

/**
 * Calculate bearing (direction) from point A to point B
 * @returns {number} Bearing in degrees (0-360, where 0 is North)
 */
export function calculateBearing(lat1, lng1, lat2, lng2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lng2 - lng1);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    return (toDeg(θ) + 360) % 360;
}

/**
 * Calculate Qibla direction from user location
 * @returns {number} Qibla bearing in degrees
 */
export function getQiblaDirection(userLat, userLng) {
    return calculateBearing(userLat, userLng, KAABA_COORDS.lat, KAABA_COORDS.lng);
}

/**
 * Fetch prayer times from Aladhan API
 * @returns {Promise<Object>} Prayer times object
 */
export async function getPrayerTimes(lat, lng) {
    const today = new Date();
    const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

    const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lng}&method=4`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 200 && data.data) {
            const timings = data.data.timings;
            return {
                fajr: timings.Fajr,
                sunrise: timings.Sunrise,
                dhuhr: timings.Dhuhr,
                asr: timings.Asr,
                maghrib: timings.Maghrib,
                isha: timings.Isha,
                date: data.data.date.readable,
                hijri: data.data.date.hijri.date,
                hijriMonth: data.data.date.hijri.month.ar,
                hijriYear: data.data.date.hijri.year
            };
        }
        throw new Error('فشل في جلب مواقيت الصلاة');
    } catch (error) {
        console.error('Prayer times fetch error:', error);
        throw error;
    }
}

/**
 * Get next prayer info
 * @returns {{name: string, time: string, remaining: string}}
 */
export function getNextPrayer(prayerTimes) {
    const prayers = [
        { name: 'الفجر', time: prayerTimes.fajr },
        { name: 'الظهر', time: prayerTimes.dhuhr },
        { name: 'العصر', time: prayerTimes.asr },
        { name: 'المغرب', time: prayerTimes.maghrib },
        { name: 'العشاء', time: prayerTimes.isha }
    ];

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerMinutes = hours * 60 + minutes;

        if (prayerMinutes > currentMinutes) {
            const diff = prayerMinutes - currentMinutes;
            const hoursRemaining = Math.floor(diff / 60);
            const minsRemaining = diff % 60;

            return {
                name: prayer.name,
                time: prayer.time,
                remaining: hoursRemaining > 0
                    ? `${hoursRemaining} ساعة و ${minsRemaining} دقيقة`
                    : `${minsRemaining} دقيقة`
            };
        }
    }

    // After Isha, next is Fajr tomorrow
    return {
        name: 'الفجر',
        time: prayerTimes.fajr,
        remaining: 'غداً'
    };
}

/**
 * Get city name from coordinates using Nominatim reverse geocoding
 * @returns {Promise<string>} City/town name in Arabic
 */
export async function getCityName(lat, lng) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'QuranKarimApp/1.0'
            }
        });

        const data = await response.json();

        if (data && data.address) {
            // Try different address fields in order of preference
            return data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.municipality ||
                data.address.county ||
                data.address.state ||
                'موقعك الحالي';
        }

        return 'موقعك الحالي';
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return 'موقعك الحالي';
    }
}

export default {
    getUserLocation,
    calculateBearing,
    getQiblaDirection,
    getPrayerTimes,
    getNextPrayer,
    getCityName,
    KAABA_COORDS
};
