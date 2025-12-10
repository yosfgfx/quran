import { useState } from 'react';

export default function DeveloperInfo() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Trigger Button */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem', // text-xs
                color: '#9ca3af', // text-gray-400
                marginTop: '4px',
                justifyContent: 'center'
            }}>
                <span style={{ opacity: 0.8 }}>تطوير: يوسف حميد</span>
                <button
                    type="button"
                    aria-label="معلومات المطور"
                    onClick={() => setIsOpen(true)}
                    style={{
                        padding: '4px',
                        borderRadius: '9999px',
                        lineHeight: 0,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: 'inherit'
                    }}
                    onMouseEnter={e => e.target.style.backgroundColor = 'rgba(31, 41, 55, 0.5)'}
                    onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                        <circle cx="12" cy="12" r="10" fill="#6366f1"></circle>
                        <text x="12" y="16" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold" fontFamily="sans-serif">i</text>
                    </svg>
                </button>
            </div>

            {/* Modal */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(2px)'
                }} onClick={() => setIsOpen(false)}>
                    <div
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                        style={{
                            position: 'relative',
                            background: '#030712', // bg-gray-950
                            border: '1px solid #1f2937', // border-gray-800
                            borderRadius: '1rem',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            maxWidth: '32rem', // max-w-lg
                            width: '90%',
                            padding: 0,
                            fontFamily: 'Poppins, Alexandria, Tajawal, sans-serif',
                            color: 'rgb(229, 231, 235)',
                            // bg-gray-950/97
                        }}
                    >
                        {/* Close Button */}
                        <button
                            aria-label="إغلاق"
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                color: '#9ca3af',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                zIndex: 10
                            }}
                            onMouseEnter={e => e.target.style.color = '#818cf8'} // hover:text-indigo-400
                            onMouseLeave={e => e.target.style.color = '#9ca3af'}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M6 6l12 12M6 18L18 6" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round"></path>
                            </svg>
                        </button>

                        <div className="signature-container" style={{ margin: 0, padding: 0 }}>
                            <div className="signature-content" style={{
                                display: 'table',
                                width: '100%',
                                background: 'rgba(31, 41, 55, 0.85)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                boxShadow: 'rgba(99, 102, 241, 0.08) 0px 8px 32px',
                                overflow: 'hidden',
                                padding: '20px',
                                boxSizing: 'border-box'
                            }}>
                                {/* Photo */}
                                <div className="photo-container" style={{
                                    display: 'table-cell',
                                    verticalAlign: 'bottom',
                                    width: '120px',
                                    paddingRight: '25px',
                                    paddingTop: '30px' // Added some top padding for alignment
                                }}>
                                    <img
                                        src="https://7ei2ai4qvm.ufs.sh/f/NKLCh9aej0JoCWlJcFgDwJRr8icS9WHOvNuDz5gh7x6ZU0oI"
                                        alt="Yousef Humaid"
                                        className="photo"
                                        style={{
                                            width: '90px',
                                            height: '250px',
                                            borderRadius: '80px',
                                            objectFit: 'cover',
                                            border: '2px solid rgba(255, 255, 255, 0.2)',
                                            boxShadow: 'rgba(0, 0, 0, 0.12) 0px 4px 12px',
                                            display: 'block'
                                        }}
                                    />
                                </div>

                                {/* Info */}
                                <div className="info-container" style={{ display: 'table-cell', verticalAlign: 'middle' }}>
                                    <h1 className="name" style={{
                                        fontSize: '20px',
                                        fontWeight: 600,
                                        direction: 'rtl',
                                        textAlign: 'left',
                                        margin: '0px 0px 4px',
                                        color: 'rgb(165, 180, 252)',
                                        letterSpacing: '0.5px'
                                    }}>
                                        يوسف حميد | Yousef Humaid
                                    </h1>
                                    <p className="role role-ar" style={{
                                        fontFamily: 'Tajawal, sans-serif',
                                        direction: 'rtl',
                                        textAlign: 'left',
                                        marginBottom: '2px',
                                        color: 'rgb(199, 210, 254)',
                                        fontSize: '14px',
                                        marginTop: 0
                                    }}>
                                        مصمم جرافيك | واجهات مستخدم | موشن جرافيك
                                    </p>
                                    <p className="role" style={{
                                        fontSize: '13px',
                                        fontWeight: 400,
                                        margin: '0px 0px 12px',
                                        color: 'rgb(161, 161, 170)',
                                        direction: 'ltr',
                                        textAlign: 'left'
                                    }}>
                                        Graphic | UI/UX | Motion Designer
                                    </p>
                                    <div className="divider" style={{
                                        height: '1px',
                                        background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.8), rgba(99, 102, 241, 0.2))',
                                        margin: '10px 0px'
                                    }}></div>

                                    {/* Contacts */}
                                    <div className="contact-info" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                                        <div className="contact-item" style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: 'rgb(161, 161, 170)', marginRight: '15px', direction: 'ltr', textAlign: 'left' }}>
                                            <svg className="icon" viewBox="0 0 24 24" style={{ width: '16px', height: '16px', marginRight: '6px', fill: 'rgb(99, 102, 241)' }}>
                                                <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"></path>
                                            </svg>
                                            <a href="mailto:yosfgfx@gmail.com" style={{ color: 'rgb(161, 161, 170)', textDecoration: 'none' }}>yosfgfx@gmail.com</a>
                                        </div>
                                        <div className="contact-item" style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: 'rgb(161, 161, 170)', marginRight: '15px', direction: 'ltr', textAlign: 'left' }}>
                                            <svg className="icon" viewBox="0 0 24 24" style={{ width: '16px', height: '16px', marginRight: '6px', fill: 'rgb(99, 102, 241)' }}>
                                                <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"></path>
                                            </svg>
                                            <a href="tel:+966530796557" style={{ color: 'rgb(161, 161, 170)', textDecoration: 'none' }}>+966 530 796 557</a>
                                        </div>
                                        <div className="contact-item" style={{ display: 'flex', alignItems: 'center', fontSize: '13px', direction: 'ltr', color: 'rgb(161, 161, 170)', marginRight: '15px' }}>
                                            <svg className="icon" viewBox="0 0 48 48" style={{ width: '16px', height: '16px', marginRight: '6px' }}>
                                                <path d="M5.00372 42.2311C5.00372 42.6557 5.35807 42.9999 5.79521 42.9999L42.2023 43C42.6394 43 42.9938 42.6558 42.9938 42.2313V41.3131C43.012 41.0364 43.049 39.6555 42.1388 38.1289C41.5648 37.1663 40.7318 36.3347 39.6628 35.6573C38.3696 34.8378 36.7245 34.244 34.7347 33.8865C34.72 33.8846 33.2446 33.689 31.7331 33.303C29.101 32.6307 28.8709 32.0357 28.8694 32.0299C28.8539 31.9711 28.8315 31.9146 28.8028 31.8615C28.7813 31.7505 28.7281 31.3328 28.8298 30.2136C29.088 27.371 30.6128 25.691 31.838 24.3412C32.2244 23.9155 32.5893 23.5134 32.8704 23.1191C34.0827 21.4181 34.1952 19.4839 34.2003 19.364C34.2003 19.1211 34.1724 18.9214 34.1127 18.7363C33.9937 18.3659 33.7698 18.1351 33.6063 17.9666L33.6052 17.9654C33.564 17.923 33.5251 17.8828 33.4933 17.8459C33.4812 17.8318 33.449 17.7945 33.4783 17.603C33.5859 16.8981 33.6505 16.3079 33.6815 15.7456C33.7367 14.7438 33.7798 13.2456 33.5214 11.7875C33.4895 11.5385 33.4347 11.2755 33.3494 10.9622C33.0764 9.95814 32.6378 9.09971 32.0284 8.39124C31.9236 8.27722 29.3756 5.5928 21.9788 5.04201C20.956 4.96586 19.9449 5.00688 18.9496 5.05775C18.7097 5.06961 18.3812 5.08589 18.0738 5.16554C17.3101 5.36337 17.1063 5.84743 17.0528 6.11834C16.9641 6.56708 17.12 6.91615 17.2231 7.14718L17.2231 7.1472L17.2231 7.14723C17.2381 7.18072 17.2566 7.22213 17.2243 7.32997C17.0526 7.59588 16.7825 7.83561 16.5071 8.06273C16.4275 8.13038 14.5727 9.72968 14.4707 11.8189C14.1957 13.4078 14.2165 15.8834 14.5417 17.5944C14.5606 17.6889 14.5885 17.8288 14.5432 17.9233L14.5432 17.9233C14.1935 18.2367 13.7971 18.5919 13.7981 19.4024C13.8023 19.4839 13.9148 21.4181 15.1272 23.1191C15.408 23.5131 15.7726 23.9149 16.1587 24.3403L16.1596 24.3412L16.1596 24.3413C17.3848 25.6911 18.9095 27.371 19.1678 30.2135C19.2694 31.3327 19.2162 31.7505 19.1947 31.8614C19.166 31.9145 19.1436 31.971 19.1282 32.0298C19.1266 32.0356 18.8974 32.6287 16.2772 33.2996C14.7656 33.6867 13.2775 33.8845 13.2331 33.8909C11.2994 34.2173 9.66438 34.7963 8.37351 35.6115C7.30813 36.2844 6.47354 37.1175 5.89289 38.0877C4.96517 39.6379 4.99025 41.0497 5.00372 41.3074V42.2311Z" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinejoin="round"></path>
                                            </svg>
                                            <a href="https://yosfgfx.github.io/cv" target="_blank" rel="noopener noreferrer" style={{ color: 'rgb(161, 161, 170)', textDecoration: 'none' }}>Portfolio</a>
                                        </div>
                                    </div>

                                    {/* Social Icons */}
                                    <div className="social-icons" style={{ display: 'flex', marginTop: '12px', marginRight: '12px', gap: '40px' }}>
                                        <a href="https://fb.me/yosfgfx" className="social-icon" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(31, 41, 55, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#6366f1">
                                                <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9 21.59 18.01 20.33 19.48 18.43C20.95 16.53 21.68 14.13 21.5 11.69C21.19 6.53 16.96 2.47 12 2.04Z"></path>
                                            </svg>
                                        </a>
                                        <a href="https://instagram.com/yosfgfx" className="social-icon" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(31, 41, 55, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#6366f1">
                                                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"></path>
                                            </svg>
                                        </a>
                                        <a href="https://linkedin.com/in/yosfgfx" className="social-icon" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(31, 41, 55, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#6366f1">
                                                <path d="M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19ZM18.5 18.5V13.2C18.5 12.3354 18.1565 11.5062 17.5452 10.8948C16.9338 10.2835 16.1046 9.94 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17C14.6813 12.17 15.0374 12.3175 15.2999 12.5801C15.5625 12.8426 15.71 13.1987 15.71 13.57V18.5H18.5ZM6.88 8.56C7.32556 8.56 7.75288 8.383 8.06794 8.06794C8.383 7.75288 8.56 7.32556 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19C6.43178 5.19 6.00193 5.36805 5.68499 5.68499C5.36805 6.00193 5.19 6.43178 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56ZM8.27 18.5V10.13H5.5V18.5H8.27Z"></path>
                                            </svg>
                                        </a>
                                        <a href="https://github.com/yosfgfx" className="social-icon" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(31, 41, 55, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#6366f1">
                                                <path d="M12 2C6.48 2 2 6.48 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21C9.5 20.77 9.5 20.14 9.5 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.5 20.68 14.5 21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 6.48 17.52 2 12 2Z"></path>
                                            </svg>
                                        </a>
                                        <a href="https://x.com/yosfgfx" className="social-icon" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(31, 41, 55, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                                            <svg width="12" height="12" viewBox="0 0 1200 1227" fill="#6366f1">
                                                <path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"></path>
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
