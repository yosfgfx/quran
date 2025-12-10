import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    getReadingStats,
    getAllReflections,
    getSmartSuggestion,
    getAllInsights,
    getActiveJourney,
    startJourney,
    completeJourneyDay,
    getYearOldReflection
} from '../services/journeyService';
import { getAllPaths, getPathById, getPathDay } from '../data/thematicPaths';

export default function JourneyPage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [reflections, setReflections] = useState([]);
    const [suggestion, setSuggestion] = useState(null);
    const [insights, setInsights] = useState([]);
    const [paths, setPaths] = useState([]);
    const [activeJourney, setActiveJourney] = useState(null);
    const [currentDayContent, setCurrentDayContent] = useState(null);
    const [yearOldReflection, setYearOldReflection] = useState(null);
    const [showAllReflections, setShowAllReflections] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    function loadData() {
        setStats(getReadingStats());
        setReflections(getAllReflections());
        setSuggestion(getSmartSuggestion());
        setInsights(getAllInsights());
        setPaths(getAllPaths());
        setYearOldReflection(getYearOldReflection());

        const journey = getActiveJourney();
        setActiveJourney(journey);

        if (journey) {
            const dayContent = getPathDay(journey.id, journey.currentDay);
            setCurrentDayContent(dayContent);
        }
    }

    function handleStartJourney(pathId) {
        const path = getPathById(pathId);
        if (path) {
            startJourney(pathId, path.duration);
            loadData();
        }
    }

    function handleCompleteDay() {
        if (activeJourney) {
            completeJourneyDay(activeJourney.id, activeJourney.currentDay - 1);
            loadData();
        }
    }

    return (
        <div className="page">
            <div className="page-header">
                <h2 className="page-title">🛤️ رحلتي مع القرآن</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
                    نظام ذكي يفهم علاقتك الشخصية بالقرآن
                </p>
            </div>

            {/* Smart Suggestion Card */}
            {suggestion && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.15), rgba(27, 67, 50, 0.15))',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-lg)',
                    marginBottom: 'var(--space-xl)',
                    border: '2px solid var(--gold-primary)',
                    position: 'relative'
                }}>
                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-md)',
                        alignItems: 'flex-start'
                    }}>
                        <span style={{ fontSize: '2rem' }}>{suggestion.icon}</span>
                        <div>
                            <div style={{
                                color: 'var(--gold-primary)',
                                fontWeight: 600,
                                marginBottom: 'var(--space-xs)'
                            }}>
                                اقتراح ذكي
                            </div>
                            <p style={{
                                color: 'var(--text-primary)',
                                lineHeight: 1.7,
                                margin: 0
                            }}>
                                {suggestion.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Year Old Reflection Memory */}
            {yearOldReflection && (
                <div style={{
                    background: 'var(--gradient-royal)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-lg)',
                    marginBottom: 'var(--space-xl)',
                    color: 'var(--gold-light)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        marginBottom: 'var(--space-md)'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>📅</span>
                        <span style={{ fontWeight: 600 }}>ذكرى من العام الماضي</span>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-md)'
                    }}>
                        <div style={{ opacity: 0.8, fontSize: '0.85rem', marginBottom: 'var(--space-xs)' }}>
                            {yearOldReflection.surahName} - آية {yearOldReflection.ayah}
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.8, fontStyle: 'italic' }}>
                            "{yearOldReflection.text}"
                        </p>
                        <div style={{
                            marginTop: 'var(--space-sm)',
                            fontSize: '0.8rem',
                            opacity: 0.7
                        }}>
                            كُتبت في {new Date(yearOldReflection.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                    </div>
                </div>
            )}

            {/* Insights Grid */}
            {insights.length > 0 && (
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: 'var(--space-md)',
                        color: 'var(--text-primary)'
                    }}>
                        📊 إحصائياتك الشخصية
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: 'var(--space-md)'
                    }}>
                        {insights.map((insight, index) => (
                            <div key={index} style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--space-md)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xs)' }}>
                                    {insight.icon}
                                </div>
                                <div style={{
                                    color: 'var(--text-muted)',
                                    fontSize: '0.8rem',
                                    marginBottom: 'var(--space-xs)'
                                }}>
                                    {insight.label}
                                </div>
                                <div style={{
                                    color: 'var(--gold-primary)',
                                    fontWeight: 700,
                                    fontSize: '1.1rem'
                                }}>
                                    {insight.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Journey */}
            {activeJourney && currentDayContent && (
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: 'var(--space-md)',
                        color: 'var(--text-primary)'
                    }}>
                        🚀 رحلتك الحالية
                    </h3>
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-xl)',
                        padding: 'var(--space-lg)',
                        boxShadow: 'var(--shadow-md)',
                        border: '2px solid var(--emerald-primary)'
                    }}>
                        {/* Progress */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--space-md)'
                        }}>
                            <span style={{ fontWeight: 600, color: 'var(--emerald-primary)' }}>
                                اليوم {activeJourney.currentDay}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {activeJourney.completed.filter(Boolean).length} / {activeJourney.completed.length}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{
                            height: 8,
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-full)',
                            marginBottom: 'var(--space-lg)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${(activeJourney.completed.filter(Boolean).length / activeJourney.completed.length) * 100}%`,
                                background: 'var(--gradient-gold)',
                                borderRadius: 'var(--radius-full)',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>

                        {/* Day Content */}
                        <h4 style={{
                            color: 'var(--gold-primary)',
                            marginBottom: 'var(--space-sm)'
                        }}>
                            {currentDayContent.title}
                        </h4>

                        <div style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-md)',
                            marginBottom: 'var(--space-md)'
                        }}>
                            <div style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.85rem',
                                marginBottom: 'var(--space-xs)'
                            }}>
                                سورة {currentDayContent.surah} - آية {currentDayContent.ayah}
                            </div>
                            <p style={{
                                color: 'var(--text-primary)',
                                lineHeight: 1.8,
                                margin: 0
                            }}>
                                {currentDayContent.tafsir}
                            </p>
                        </div>

                        {/* Reflection Question */}
                        <div style={{
                            background: 'rgba(201, 162, 39, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-md)',
                            borderRight: '4px solid var(--gold-primary)',
                            marginBottom: 'var(--space-md)'
                        }}>
                            <div style={{
                                fontWeight: 600,
                                color: 'var(--gold-primary)',
                                marginBottom: 'var(--space-xs)'
                            }}>
                                💭 سؤال للتأمل:
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                                {currentDayContent.reflection}
                            </p>
                        </div>

                        <button
                            onClick={handleCompleteDay}
                            style={{
                                width: '100%',
                                padding: 'var(--space-md)',
                                background: 'var(--gradient-gold)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--night-primary)',
                                fontWeight: 700,
                                fontFamily: 'var(--font-arabic)',
                                fontSize: '1rem',
                                cursor: 'pointer'
                            }}
                        >
                            ✓ أكملت هذا اليوم
                        </button>
                    </div>
                </div>
            )}

            {/* Recent Reflections */}
            {reflections.length > 0 && (
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-md)'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>
                            💭 خواطرك الأخيرة
                        </h3>
                        {reflections.length > 3 && (
                            <button
                                onClick={() => setShowAllReflections(!showAllReflections)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--gold-primary)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {showAllReflections ? 'عرض أقل' : `عرض الكل (${reflections.length})`}
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {(showAllReflections ? reflections : reflections.slice(0, 3)).map((ref) => (
                            <div key={ref.id} style={{
                                background: 'var(--bg-card)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--space-md)',
                                boxShadow: 'var(--shadow-sm)',
                                borderRight: '4px solid var(--gold-primary)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 'var(--space-sm)'
                                }}>
                                    <Link
                                        to={`/surah/${ref.surah}?ayah=${ref.ayah}`}
                                        style={{
                                            color: 'var(--gold-primary)',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {ref.surahName} - آية {ref.ayah}
                                    </Link>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {new Date(ref.createdAt).toLocaleDateString('ar-SA')}
                                    </span>
                                </div>
                                <p style={{
                                    margin: 0,
                                    color: 'var(--text-primary)',
                                    lineHeight: 1.8
                                }}>
                                    {ref.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Thematic Paths */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 style={{
                    fontSize: '1.1rem',
                    marginBottom: 'var(--space-md)',
                    color: 'var(--text-primary)'
                }}>
                    🛤️ المسارات الروحية
                </h3>
                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    marginBottom: 'var(--space-md)'
                }}>
                    رحلات مصممة لظروف مختلفة في الحياة
                </p>

                <div style={{
                    display: 'grid',
                    gap: 'var(--space-md)'
                }}>
                    {paths.map((path) => (
                        <div key={path.id} style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-lg)',
                            boxShadow: 'var(--shadow-sm)',
                            border: activeJourney?.id === path.id
                                ? `2px solid ${path.color}`
                                : '2px solid transparent',
                            opacity: activeJourney && activeJourney.id !== path.id ? 0.6 : 1
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-md)'
                            }}>
                                <div style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 'var(--radius-md)',
                                    background: path.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem'
                                }}>
                                    {path.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{
                                        margin: 0,
                                        color: 'var(--text-primary)',
                                        marginBottom: 'var(--space-xs)'
                                    }}>
                                        {path.name}
                                    </h4>
                                    <p style={{
                                        margin: 0,
                                        color: 'var(--text-muted)',
                                        fontSize: '0.85rem'
                                    }}>
                                        {path.description}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{
                                        color: path.color,
                                        fontWeight: 700,
                                        fontSize: '1.2rem'
                                    }}>
                                        {path.duration}
                                    </div>
                                    <div style={{
                                        color: 'var(--text-muted)',
                                        fontSize: '0.75rem'
                                    }}>
                                        يوم
                                    </div>
                                </div>
                            </div>

                            {!activeJourney && (
                                <button
                                    onClick={() => handleStartJourney(path.id)}
                                    style={{
                                        width: '100%',
                                        marginTop: 'var(--space-md)',
                                        padding: 'var(--space-sm) var(--space-md)',
                                        background: path.color,
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontFamily: 'var(--font-arabic)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ابدأ الرحلة
                                </button>
                            )}

                            {activeJourney?.id === path.id && (
                                <div style={{
                                    marginTop: 'var(--space-md)',
                                    padding: 'var(--space-sm)',
                                    background: 'rgba(5, 150, 105, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center',
                                    color: 'var(--emerald-primary)',
                                    fontWeight: 600
                                }}>
                                    🚀 رحلتك الحالية
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {insights.length === 0 && reflections.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-2xl)',
                    color: 'var(--text-muted)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📖</div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>
                        ابدأ رحلتك
                    </h3>
                    <p>اقرأ القرآن واكتب خواطرك لبناء رحلتك الشخصية</p>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-block',
                            marginTop: 'var(--space-md)',
                            padding: 'var(--space-md) var(--space-xl)',
                            background: 'var(--gradient-gold)',
                            color: 'var(--night-primary)',
                            textDecoration: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600
                        }}
                    >
                        ابدأ القراءة
                    </Link>
                </div>
            )}
        </div>
    );
}
