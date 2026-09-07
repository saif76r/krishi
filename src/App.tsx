import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenTab, BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { HubScreen } from './components/HubScreen';
import { YieldAdvisorWizard } from './components/YieldAdvisorWizard';
import { DiseaseScreen } from './components/DiseaseScreen';
import { CropInfoScreen } from './components/CropInfoScreen';
import { CropDetailScreen } from './components/CropDetailScreen';
import { SoilTestScreen } from './components/SoilTestScreen';
import { MarketScreen } from './components/MarketScreen';
import { WeatherScreen } from './components/WeatherScreen';
import { InputsScreen } from './components/InputsScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AuthScreens, AuthUserData } from './components/AuthScreens';
import { AIChatBotScreen } from './components/AIChatBotScreen';
import { testFirebaseConnection } from './lib/firebase';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('home');
  const [selectedCropId, setSelectedCropId] = useState<string>('rice');

  useEffect(() => {
    testFirebaseConnection().catch(() => {
      // Background non-blocking check
    });
  }, []);

  // Enforce mandatory authentication state from localStorage
  const [currentUser, setCurrentUser] = useState<AuthUserData | null>(() => {
    try {
      const saved = localStorage.getItem('krishi_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLogout = () => {
    try {
      localStorage.removeItem('krishi_current_user');
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    setCurrentTab('home');
  };

  const handleUpdateUser = (updatedUser: AuthUserData) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('krishi_current_user', JSON.stringify(updatedUser));
      if (updatedUser.name) {
        localStorage.setItem('krishi_farmer_name', updatedUser.name);
      }
      if (updatedUser.phone) {
        localStorage.setItem('krishi_farmer_phone', updatedUser.phone);
      }
    } catch (e) {
      console.warn('Update user storage note:', e);
    }
  };

  const navigateTo = (tab: ScreenTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCropDetail = (cropId: string) => {
    setSelectedCropId(cropId);
    setCurrentTab('crop-detail');
  };

  const handleOpenAdvisorFromSource = () => {
    setCurrentTab('advisor-wizard');
  };

  // If farmer is not registered or logged in, show Auth Screen ONLY
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[700px] shadow-sm sm:shadow-lg sm:rounded-3xl sm:border sm:border-stone-200 overflow-hidden flex flex-col">
          <AuthScreens
            onLoginSuccess={(userData) => {
              setCurrentUser(userData);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col items-center justify-start p-0 sm:p-4">
      {/* Main Container */}
      <main className="w-full max-w-md bg-white min-h-screen sm:min-h-[850px] shadow-sm sm:shadow-lg sm:rounded-3xl sm:border sm:border-stone-200 overflow-hidden flex flex-col">
        {/* Dynamic Content Area */}
        <div className="flex-1 px-4 pt-3 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <HomeScreen
                  onNavigate={navigateTo}
                  onOpenCropDetail={handleOpenCropDetail}
                  onOpenDisease={() => setCurrentTab('disease')}
                  farmerName={currentUser.name}
                  farmerPhoto={currentUser.photoUrl}
                />
              </motion.div>
            )}

            {currentTab === 'hub' && (
              <motion.div
                key="hub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <HubScreen onNavigate={navigateTo} />
              </motion.div>
            )}

            {currentTab === 'advisor-wizard' && (
              <motion.div
                key="advisor-wizard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <YieldAdvisorWizard
                  onBackToHome={() => setCurrentTab('home')}
                  onSelectCropDetail={handleOpenCropDetail}
                />
              </motion.div>
            )}

            {currentTab === 'disease' && (
              <motion.div
                key="disease"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DiseaseScreen onBack={() => setCurrentTab('home')} />
              </motion.div>
            )}

            {currentTab === 'crop-info' && (
              <motion.div
                key="crop-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CropInfoScreen
                  onBack={() => setCurrentTab('home')}
                  onSelectCrop={handleOpenCropDetail}
                />
              </motion.div>
            )}

            {currentTab === 'crop-detail' && (
              <motion.div
                key="crop-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CropDetailScreen
                  cropId={selectedCropId}
                  onBack={() => setCurrentTab('crop-info')}
                  onOpenAdvisor={handleOpenAdvisorFromSource}
                />
              </motion.div>
            )}

            {currentTab === 'soil-test' && (
              <motion.div
                key="soil-test"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SoilTestScreen
                  onBack={() => setCurrentTab('home')}
                  onOpenAdvisorWithSoil={() => setCurrentTab('advisor-wizard')}
                />
              </motion.div>
            )}

            {currentTab === 'market' && (
              <motion.div
                key="market"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MarketScreen onBack={() => setCurrentTab('home')} />
              </motion.div>
            )}

            {currentTab === 'weather' && (
              <motion.div
                key="weather"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <WeatherScreen onBack={() => setCurrentTab('home')} />
              </motion.div>
            )}

            {currentTab === 'inputs' && (
              <motion.div
                key="inputs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <InputsScreen onBack={() => setCurrentTab('home')} />
              </motion.div>
            )}

            {currentTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <NotificationsScreen
                  onBack={() => setCurrentTab('home')}
                  onSelectAction={(type) => {
                    if (type === 'weather') setCurrentTab('weather');
                    else if (type === 'task') setCurrentTab('advisor-wizard');
                    else if (type === 'alert') setCurrentTab('disease');
                    else if (type === 'market') setCurrentTab('market');
                    else setCurrentTab('home');
                  }}
                />
              </motion.div>
            )}

            {currentTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProfileScreen
                  onBack={() => setCurrentTab('home')}
                  onLogout={handleLogout}
                  onOpenAdvisor={() => setCurrentTab('advisor-wizard')}
                  user={currentUser}
                  onUpdateUser={handleUpdateUser}
                />
              </motion.div>
            )}

            {currentTab === 'chatbot' && (
              <motion.div
                key="chatbot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AIChatBotScreen onBack={() => setCurrentTab('home')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Persistent Bottom Nav Bar */}
        <div className="w-full mt-auto flex-shrink-0 z-40 bg-white">
          <BottomNav
            activeTab={currentTab}
            onSelectTab={navigateTo}
            unreadCount={2}
          />
        </div>
      </main>
    </div>
  );
}
