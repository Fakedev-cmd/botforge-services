
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-cyan-400 mb-4">{t('notfound.title')}</h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">{t('notfound.subtitle')}</h2>
        <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
          {t('notfound.description')}
        </p>
        <Link to="/">
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm sm:text-base">
            <Home className="mr-2 h-4 w-4" />
            {t('notfound.home')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
