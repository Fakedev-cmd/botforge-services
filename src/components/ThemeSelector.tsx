
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Moon, Palette } from 'lucide-react';

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themes = [
    {
      id: 'light' as const,
      name: t('theme.light'),
      icon: Monitor,
      preview: 'bg-white border-gray-200'
    },
    {
      id: 'dark' as const,
      name: t('theme.dark'),
      icon: Moon,
      preview: 'bg-gray-900 border-gray-700'
    },
    {
      id: 'botforge' as const,
      name: t('theme.botforge'),
      icon: Palette,
      preview: 'bg-gradient-to-br from-gray-900 to-blue-900 border-blue-500'
    }
  ];

  return (
    <Card className="glass border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center text-lg sm:text-xl">
          <Palette className="mr-2 h-5 w-5" />
          {t('theme.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = theme === themeOption.id;
            
            return (
              <div key={themeOption.id} className="relative">
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-start h-auto p-3 sm:p-4 ${
                    isSelected 
                      ? 'bg-primary/20 text-primary border-primary/50' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setTheme(themeOption.id)}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 w-full">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${themeOption.preview} flex items-center justify-center`}>
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm sm:text-base">{themeOption.name}</div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground pt-2 border-t">
          {t('theme.desc')}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
