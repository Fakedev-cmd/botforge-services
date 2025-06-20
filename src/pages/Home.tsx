
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Shield, Zap, Code, Star, Users, Award, Sparkles, Terminal } from 'lucide-react';
import CommandLineEffect from '@/components/CommandLineEffect';

const Home = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* macOS-style background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <CommandLineEffect />
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-6 sm:mb-8 animate-fade-in tracking-tight">
              {t('home.title')}
            </h1>
            
            <div className="relative mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-xl rounded-2xl"></div>
              <p className="relative text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-200 max-w-4xl mx-auto mb-4 sm:mb-6 leading-relaxed backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-blue-500/20 shadow-xl">
                {t('home.subtitle')}
              </p>
            </div>
            
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
              {t('home.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4">
              <Link to="/shop">
                <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 shadow-lg w-full sm:w-auto">
                  <span className="relative z-10 flex items-center justify-center">
                    <Sparkles className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base lg:text-xl">{t('home.explore')}</span>
                  </span>
                </Button>
              </Link>
              {!user && (
                <Link to="/register">
                  <Button variant="outline" size="lg" className="border-2 border-cyan-400 text-cyan-600 dark:text-cyan-400 bg-white/80 dark:bg-transparent hover:bg-cyan-50 dark:hover:bg-cyan-400/10 px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/25 backdrop-blur-sm shadow-lg w-full sm:w-auto">
                    <Users className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base lg:text-xl">{t('home.join')}</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 px-4">
              <div className="text-center group">
                <div className="bg-white/80 dark:bg-gradient-to-r dark:from-blue-500/10 dark:to-cyan-500/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
                  <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{t('home.stats.bots')}</div>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-white/80 dark:bg-gradient-to-r dark:from-cyan-500/10 dark:to-blue-500/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-cyan-500/20 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">24/7</div>
                  <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{t('home.stats.support')}</div>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-white/80 dark:bg-gradient-to-r dark:from-blue-400/10 dark:to-cyan-400/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-500 dark:text-blue-300 mb-2">99.9%</div>
                  <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{t('home.stats.uptime')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-16 sm:py-24 bg-white/40 dark:bg-gradient-to-r dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-4 sm:mb-6 tracking-tight">
              {t('home.why.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
              {t('home.why.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="group bg-white/90 dark:bg-gradient-to-br dark:from-gray-800/80 dark:to-gray-900/80 border-blue-500/20 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6 sm:p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Code className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('home.features.custom.title')}</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.features.custom.desc')}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group bg-white/90 dark:bg-gradient-to-br dark:from-gray-800/80 dark:to-gray-900/80 border-blue-500/20 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/25 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6 sm:p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('home.features.security.title')}</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.features.security.desc')}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group bg-white/90 dark:bg-gradient-to-br dark:from-gray-800/80 dark:to-gray-900/80 border-blue-500/20 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6 sm:p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-r from-blue-400 to-cyan-400 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('home.features.fast.title')}</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.features.fast.desc')}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group bg-white/90 dark:bg-gradient-to-br dark:from-gray-800/80 dark:to-gray-900/80 border-blue-500/20 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/25 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6 sm:p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-400 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Terminal className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('home.features.expert.title')}</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.features.expert.desc')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-16 sm:py-32">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl rounded-full"></div>
            <div className="relative bg-white/90 dark:bg-gradient-to-r dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-blue-500/20 shadow-2xl">
              <Star className="h-12 w-12 sm:h-16 sm:w-16 text-cyan-500 mx-auto mb-6 sm:mb-8 animate-pulse" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-6 sm:mb-8 tracking-tight">
                {t('home.cta.title')}
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-8 sm:mb-12 leading-relaxed">
                {t('home.cta.subtitle')}
              </p>
              <Link to="/shop">
                <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-12 sm:px-16 py-4 sm:py-6 text-lg sm:text-xl lg:text-2xl rounded-2xl sm:rounded-3xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/50 shadow-xl">
                  <span className="relative z-10 flex items-center">
                    <Award className="mr-3 sm:mr-4 h-6 w-6 sm:h-8 sm:w-8" />
                    {t('home.cta.button')}
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
