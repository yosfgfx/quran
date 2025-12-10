import { useState } from 'react';
import { addReflection, getReflectionsForAyah } from '../services/journeyService';

export default function ReflectionModal({
    isOpen,
    onClose,
    surahNumber,
    ayahNumber,
    surahName,
    ayahText
}) {
    const [text, setText] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [previousReflections, setPreviousReflections] = useState([]);

    // Load previous reflections when modal opens
    useState(() => {
        if (isOpen && surahNumber && ayahNumber) {
            const reflections = getReflectionsForAyah(surahNumber, ayahNumber);
            setPreviousReflections(reflections);
        }
    }, [isOpen, surahNumber, ayahNumber]);

    const handleSave = async () => {
        if (!text.trim()) return;

        setSaving(true);
        try {
            addReflection(surahNumber, ayahNumber, text.trim(), surahName);
            setSaved(true);
            setTimeout(() => {
                setText('');
                setSaved(false);
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error saving reflection:', error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="reflection-backdrop"
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    zIndex: 499,
                    backdropFilter: 'blur(4px)'
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '85vh',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 500,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    background: 'var(--gradient-royal)',
                    padding: 'var(--space-lg)',
                    color: 'var(--gold-light)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-md)'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>💭 خاطرة جديدة</h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '50%',
                                width: 36,
                                height: 36,
                                cursor: 'pointer',
                                color: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Ayah Reference */}
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-md)',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{ opacity: 0.8, marginBottom: 'var(--space-xs)' }}>
                            {surahName} - الآية {ayahNumber}
                        </div>
                        {ayahText && (
                            <div style={{
                                fontFamily: "'KFGQPC HAFS Uthmanic Script', 'Amiri Quran', serif",
                                fontSize: '1.1rem',
                                lineHeight: 1.8,
                                maxHeight: '80px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {ayahText.substring(0, 100)}...
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div style={{
                    padding: 'var(--space-lg)',
                    flex: 1,
                    overflowY: 'auto'
                }}>
                    {/* Text Area */}
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="اكتب خاطرتك هنا... ماذا تعني لك هذه الآية؟ كيف تؤثر في حياتك؟"
                        style={{
                            width: '100%',
                            height: '150px',
                            padding: 'var(--space-md)',
                            border: '2px solid var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-arabic)',
                            fontSize: '1rem',
                            lineHeight: 1.8,
                            resize: 'none',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--gold-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--bg-secondary)'}
                    />

                    {/* Previous Reflections */}
                    {previousReflections.length > 0 && (
                        <div style={{ marginTop: 'var(--space-lg)' }}>
                            <h4 style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem',
                                marginBottom: 'var(--space-sm)'
                            }}>
                                خواطر سابقة على هذه الآية:
                            </h4>
                            {previousReflections.slice(0, 3).map((ref) => (
                                <div key={ref.id} style={{
                                    padding: 'var(--space-sm) var(--space-md)',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-sm)',
                                    marginBottom: 'var(--space-xs)',
                                    fontSize: '0.85rem',
                                    borderRight: '3px solid var(--gold-primary)'
                                }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                        {new Date(ref.createdAt).toLocaleDateString('ar-SA')}
                                    </div>
                                    <div style={{ color: 'var(--text-primary)' }}>
                                        {ref.text.substring(0, 100)}...
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: 'var(--space-md) var(--space-lg)',
                    borderTop: '1px solid var(--bg-secondary)',
                    display: 'flex',
                    gap: 'var(--space-md)'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: 'var(--space-md)',
                            border: '2px solid var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-arabic)',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!text.trim() || saving || saved}
                        style={{
                            flex: 2,
                            padding: 'var(--space-md)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            background: saved ? 'var(--emerald-primary)' : 'var(--gradient-gold)',
                            color: saved ? 'white' : 'var(--night-primary)',
                            fontFamily: 'var(--font-arabic)',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: text.trim() && !saving ? 'pointer' : 'not-allowed',
                            opacity: text.trim() ? 1 : 0.5,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {saved ? '✓ تم الحفظ' : saving ? 'جاري الحفظ...' : '💾 حفظ الخاطرة'}
                    </button>
                </div>
            </div>
        </>
    );
}
