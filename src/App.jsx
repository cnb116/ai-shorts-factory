import { useState, useEffect } from 'react';
import Feed from './pages/Feed';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import Create from './pages/Create';
import BottomNav from './components/BottomNav';
import ThemeToggle from './components/ThemeToggle';
import OverlayGuideModal from './components/OverlayGuideModal';
import { trackEvent } from './utils/analytics';
import { mockVideos } from './data/mockVideos';
import './App.css';

import ShortsMaker from './pages/ShortsMaker';
import GadaTranslator from './pages/GadaTranslator';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [isHighlightActive, setIsHighlightActive] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [videos, setVideos] = useState(mockVideos);

  useEffect(() => {
    trackEvent('page_view', { page: currentView });
  }, [currentView]);

  const handleAddVideo = (newVideo) => {
    setVideos(prev => [newVideo, ...prev]);
    setIsCreateOpen(false);
    setCurrentView('home'); // Go to home to see the new video
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Feed isHighlightActive={isHighlightActive} videos={videos} />;
      case 'discover':
        return <Discover />;
      case 'profile':
        return <Profile />;
      case 'shorts-maker':
        return <ShortsMaker onBack={() => setCurrentView('home')} />;
      case 'gada-translator':
        return <GadaTranslator onBack={() => setCurrentView('home')} />;
      default:
        return <Feed isHighlightActive={isHighlightActive} videos={videos} />;
    }
  };

  return (
    <div id="app-container" className={`app-container theme-${theme}`}>
      <div className="top-controls">
        <button
          className="control-btn"
          onClick={() => setCurrentView('gada-translator')}
          title="Gada Translator"
        >
          🔨
        </button>
        <button
          className="control-btn"
          onClick={() => setCurrentView('shorts-maker')}
          title="AI Shorts Maker"
        >
          🤖
        </button>
        <button
          className="control-btn guide-btn"
          onClick={() => setIsGuideOpen(true)}
          title="How to use as Overlay"
        >
          ?
        </button>
        <button
          className={`control-btn highlight-btn ${isHighlightActive ? 'active' : ''}`}
          onClick={() => setIsHighlightActive(!isHighlightActive)}
          title="Toggle Highlight Effect"
        >
          ✨
        </button>
        <ThemeToggle currentTheme={theme} onThemeChange={setTheme} />
      </div>

      {renderView()}

      {isCreateOpen && (
        <Create
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          addShort={handleAddVideo}
        />
      )}

      <OverlayGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <BottomNav
        activeTab={currentView}
        onTabChange={setCurrentView}
        onOpenCreate={() => setIsCreateOpen(true)}
      />
    </div>
  );
}

export default App;
