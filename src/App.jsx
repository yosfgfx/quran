import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useStore from './store/useStore';
import { getAllSurahs } from './services/quranAPI';
import { initTheme } from './services/storage';

// Components
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import AudioPlayer from './components/AudioPlayer';
import TafsirPanel from './components/TafsirPanel';
import SearchOverlay from './components/SearchOverlay';
import AIAssistant from './components/AIAssistant';

// Pages
import HomePage from './pages/HomePage';
import SurahPage from './pages/SurahPage';
import BookmarksPage from './pages/BookmarksPage';
import MemorizationPage from './pages/MemorizationPage';
import SettingsPage from './pages/SettingsPage';
import PrayerTimesPage from './pages/PrayerTimesPage';
import QiblaPage from './pages/QiblaPage';
import JourneyPage from './pages/JourneyPage';

function App() {
  const { loading, setLoading, setSurahs, audioVisible, audioMinimized } = useStore();

  useEffect(() => {
    // Initialize theme
    initTheme();

    // Load surahs
    async function loadSurahs() {
      try {
        const surahs = await getAllSurahs();
        setSurahs(surahs);
      } catch (error) {
        console.error('Failed to load surahs:', error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    }

    loadSurahs();
  }, [setSurahs, setLoading]);

  // Toggle body class for audio player visibility
  useEffect(() => {
    if (audioVisible && !audioMinimized) {
      document.body.classList.add('audio-player-visible');
    } else {
      document.body.classList.remove('audio-player-visible');
    }

    return () => {
      document.body.classList.remove('audio-player-visible');
    };
  }, [audioVisible, audioMinimized]);

  return (
    <div className="app">
      {loading && <LoadingScreen />}

      <Header />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/surah/:number" element={<SurahPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/memorization" element={<MemorizationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/prayer-times" element={<PrayerTimesPage />} />
          <Route path="/qibla" element={<QiblaPage />} />
          <Route path="/journey" element={<JourneyPage />} />
        </Routes>
      </main>

      <AudioPlayer />
      <TafsirPanel />
      <SearchOverlay />
      <AIAssistant />
    </div>
  );
}

export default App;
