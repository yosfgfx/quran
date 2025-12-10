import { useState, useEffect } from 'react';
import LogoSVG from '../assets/logo.svg';

export default function LoadingScreen() {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('جارٍ التهيئة...');
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const steps = [
            { progress: 15, status: 'تحميل الخطوط...' },
            { progress: 35, status: 'تحميل قائمة السور...' },
            { progress: 55, status: 'تهيئة مشغل الصوت...' },
            { progress: 75, status: 'تحميل الإعدادات...' },
            { progress: 90, status: 'التحقق من البيانات المحلية...' },
            { progress: 100, status: 'تم التحميل!' },
        ];

        let currentStep = 0;

        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                setProgress(steps[currentStep].progress);
                setStatus(steps[currentStep].status);
                currentStep++;
            } else {
                clearInterval(interval);
                setTimeout(() => setFadeOut(true), 300);
            }
        }, 180);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`loading-screen-modern ${fadeOut ? 'fade-out' : ''}`}>
            <div className="loading-content">
                {/* Animated Logo */}
                <div className="loading-logo-container">
                    <img src={LogoSVG} alt="شعار القرآن" className="loading-logo" />
                    <div className="loading-glow"></div>
                </div>

                {/* App Name */}
                <h1 className="loading-title">القرآن الكريم</h1>
                <p className="loading-subtitle">Quran Karim Pro</p>

                {/* Progress Bar */}
                <div className="loading-progress-container">
                    <div className="loading-progress-bar">
                        <div
                            className="loading-progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="loading-percentage">{progress}%</span>
                </div>

                {/* Status Text */}
                <p className="loading-status">{status}</p>

                {/* Ornament */}
                <div className="loading-ornament">
                    ﷽
                </div>
            </div>

            {/* Background Animation */}
            <div className="loading-bg-pattern"></div>
        </div>
    );
}
