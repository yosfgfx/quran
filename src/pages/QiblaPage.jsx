import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getUserLocation, getQiblaDirection, KAABA_COORDS } from '../services/locationService';

export default function QiblaPage() {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qiblaAngle, setQiblaAngle] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [deviceHeading, setDeviceHeading] = useState(null);
    const [compassSupported, setCompassSupported] = useState(true);

    useEffect(() => {
        loadQiblaDirection();
    }, []);

    async function loadQiblaDirection() {
        setLoading(true);
        setError(null);

        try {
            const coords = await getUserLocation();
            setUserLocation(coords);

            const angle = getQiblaDirection(coords.lat, coords.lng);
            setQiblaAngle(angle);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Request and handle device orientation (gyroscope/compass)
    useEffect(() => {
        if (!userLocation) return;

        async function requestOrientationPermission() {
            // iOS 13+ requires permission
            if (typeof DeviceOrientationEvent !== 'undefined' &&
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission === 'granted') {
                        enableCompass();
                    } else {
                        setCompassSupported(false);
                    }
                } catch (err) {
                    console.error('Orientation permission error:', err);
                    setCompassSupported(false);
                }
            } else if ('DeviceOrientationEvent' in window) {
                enableCompass();
            } else {
                setCompassSupported(false);
            }
        }

        function enableCompass() {
            window.addEventListener('deviceorientationabsolute', handleOrientation, true);
            window.addEventListener('deviceorientation', handleOrientation, true);
        }

        function handleOrientation(event) {
            let heading = null;

            // webkitCompassHeading for iOS
            if (event.webkitCompassHeading !== undefined) {
                heading = event.webkitCompassHeading;
            }
            // absolute orientation for Android
            else if (event.absolute === true && event.alpha !== null) {
                heading = 360 - event.alpha;
            }
            // fallback alpha
            else if (event.alpha !== null) {
                heading = 360 - event.alpha;
            }

            if (heading !== null) {
                setDeviceHeading(heading);
            }
        }

        requestOrientationPermission();

        return () => {
            window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
            window.removeEventListener('deviceorientation', handleOrientation, true);
        };
    }, [userLocation]);

    // Initialize map when user location is available
    useEffect(() => {
        if (!userLocation || !mapRef.current || mapInstanceRef.current) return;

        // Create map - Zoom to user location at street level
        const map = L.map(mapRef.current, {
            center: [userLocation.lat, userLocation.lng],
            zoom: 15, // Street level zoom
            zoomControl: true
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        // Custom user marker with compass arrow
        const userIcon = L.divIcon({
            className: 'custom-marker user-compass',
            html: `<div style="
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #059669, #10b981);
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            ">
                <div style="
                    position: absolute;
                    width: 0;
                    height: 0;
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-bottom: 16px solid #d4af37;
                    top: -12px;
                    transform: rotate(${qiblaAngle}deg);
                    transform-origin: center 24px;
                "></div>
                <span style="font-size: 16px;">📍</span>
            </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        // Custom Kaaba marker
        const kaabaIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #d4af37, #f4d03f);
                border: 3px solid white;
                border-radius: 8px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            ">🕋</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        // Add user marker
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
            .addTo(map)
            .bindPopup('موقعك الحالي - السهم يشير للقبلة');

        // Add Kaaba marker
        L.marker([KAABA_COORDS.lat, KAABA_COORDS.lng], { icon: kaabaIcon })
            .addTo(map)
            .bindPopup('الكعبة المشرفة');

        // Draw line from user to Kaaba
        L.polyline(
            [
                [userLocation.lat, userLocation.lng],
                [KAABA_COORDS.lat, KAABA_COORDS.lng]
            ],
            {
                color: '#d4af37',
                weight: 4,
                opacity: 0.9,
                dashArray: '12, 8'
            }
        ).addTo(map);

        // Add zoom buttons
        map.zoomControl.setPosition('bottomright');

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [userLocation, qiblaAngle]);

    // Rotate map based on device heading
    useEffect(() => {
        if (!mapInstanceRef.current || deviceHeading === null) return;

        const mapContainer = mapRef.current;
        if (mapContainer) {
            mapContainer.style.transform = `rotate(${-deviceHeading}deg)`;
            mapContainer.style.transition = 'transform 0.1s ease-out';
        }
    }, [deviceHeading]);

    if (loading) {
        return (
            <div className="page" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                gap: 'var(--space-lg)'
            }}>
                <div className="loading-spinner"></div>
                <p style={{ color: 'var(--text-muted)' }}>جاري تحديد موقعك والقبلة...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="page-header">
                    <h2 className="page-title">اتجاه القبلة</h2>
                </div>
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-xl)',
                    color: 'var(--text-secondary)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>🕋</div>
                    <p style={{ marginBottom: 'var(--space-md)' }}>{error}</p>
                    <button
                        onClick={loadQiblaDirection}
                        style={{
                            background: 'var(--gradient-royal)',
                            color: 'var(--gold-light)',
                            border: 'none',
                            padding: 'var(--space-md) var(--space-xl)',
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    // Calculate Qibla direction relative to device heading
    const relativeQibla = deviceHeading !== null
        ? (qiblaAngle - deviceHeading + 360) % 360
        : qiblaAngle;

    return (
        <div className="page">
            <div className="page-header">
                <h2 className="page-title">اتجاه القبلة</h2>
            </div>

            {/* Qibla Compass Card */}
            {qiblaAngle !== null && (
                <div style={{
                    background: 'var(--gradient-royal)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-xl)',
                    marginBottom: 'var(--space-xl)',
                    textAlign: 'center',
                    color: 'var(--gold-light)'
                }}>
                    {/* Compass Circle */}
                    <div style={{
                        width: 180,
                        height: 180,
                        margin: '0 auto var(--space-lg)',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        border: '3px solid rgba(255,255,255,0.3)',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Compass directions */}
                        <span style={{ position: 'absolute', top: 8, fontSize: '0.9rem', fontWeight: 700 }}>ش</span>
                        <span style={{ position: 'absolute', bottom: 8, fontSize: '0.9rem', fontWeight: 700 }}>ج</span>
                        <span style={{ position: 'absolute', right: 8, fontSize: '0.9rem', fontWeight: 700 }}>غ</span>
                        <span style={{ position: 'absolute', left: 8, fontSize: '0.9rem', fontWeight: 700 }}>شر</span>

                        {/* Qibla Arrow */}
                        <div style={{
                            transform: `rotate(${relativeQibla}deg)`,
                            transition: 'transform 0.3s ease-out',
                            transformOrigin: 'center'
                        }}>
                            <div style={{
                                width: 0,
                                height: 0,
                                borderLeft: '15px solid transparent',
                                borderRight: '15px solid transparent',
                                borderBottom: '60px solid #d4af37',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                            }}></div>
                        </div>

                        {/* Kaaba Icon */}
                        <div style={{
                            position: 'absolute',
                            fontSize: '2rem'
                        }}>🕋</div>
                    </div>

                    <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: 'var(--space-xs)' }}>
                        {deviceHeading !== null ? 'البوصلة نشطة - أدر جهازك' : 'اتجاه القبلة من موقعك'}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                        {Math.round(qiblaAngle)}°
                        <span style={{ fontSize: '1rem', marginRight: 'var(--space-sm)' }}>
                            {qiblaAngle < 45 ? 'شمالاً' :
                                qiblaAngle < 135 ? 'شرقاً' :
                                    qiblaAngle < 225 ? 'جنوباً' :
                                        qiblaAngle < 315 ? 'غرباً' : 'شمالاً'}
                        </span>
                    </div>

                    {!compassSupported && (
                        <div style={{
                            marginTop: 'var(--space-md)',
                            fontSize: '0.8rem',
                            opacity: 0.7,
                            background: 'rgba(255,255,255,0.1)',
                            padding: 'var(--space-sm) var(--space-md)',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            ⚠️ البوصلة غير مدعومة في هذا الجهاز
                        </div>
                    )}
                </div>
            )}

            {/* Map Container with rounded corners */}
            <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '3px solid var(--bg-secondary)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
                <div
                    ref={mapRef}
                    style={{
                        width: '100%',
                        height: '350px',
                        transformOrigin: 'center center'
                    }}
                />
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--space-xl)',
                marginTop: 'var(--space-lg)',
                fontSize: '0.9rem',
                color: 'var(--text-muted)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #059669, #10b981)'
                    }}></div>
                    <span>موقعك</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div style={{
                        width: 14,
                        height: 14,
                        borderRadius: '4px',
                        background: 'linear-gradient(135deg, #d4af37, #f4d03f)'
                    }}></div>
                    <span>الكعبة</span>
                </div>
            </div>

            {/* Instructions */}
            <div style={{
                textAlign: 'center',
                marginTop: 'var(--space-lg)',
                padding: 'var(--space-md)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
            }}>
                {deviceHeading !== null ? (
                    <p>🧭 أدر جهازك ليشير السهم الذهبي للأعلى - هذا اتجاه القبلة</p>
                ) : (
                    <p>📍 الخط الذهبي يظهر اتجاه القبلة من موقعك</p>
                )}
            </div>
        </div>
    );
}
