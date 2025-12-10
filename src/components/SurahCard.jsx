import { useNavigate } from 'react-router-dom';

export default function SurahCard({ surah }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/surah/${surah.number}`);
    };

    return (
        <div className="surah-card" onClick={handleClick}>
            <div className="surah-card-header">
                <div className="surah-number">{surah.number}</div>
                <div className="surah-names">
                    <div className="surah-name-arabic">{surah.name}</div>
                    <div className="surah-name-english">{surah.englishName} - {surah.englishNameTranslation}</div>
                </div>
            </div>
            <div className="surah-card-footer">
                <span className="surah-info">{surah.numberOfAyahs} آية</span>
                <span className={`surah-type ${surah.revelationType.toLowerCase()}`}>
                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                </span>
            </div>
        </div>
    );
}
