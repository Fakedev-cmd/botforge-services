
import { useTranslation } from '@/contexts/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Languages, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const LanguageSelector = () => {
  const { language, setLanguage, t, availableLanguages } = useTranslation();

  const handleLanguageChange = (newLanguage: typeof language) => {
    console.log('Language changing from', language, 'to', newLanguage);
    setLanguage(newLanguage);
    console.log('Language changed, triggering toast');
    toast({
      title: t('language.changed'),
      description: t('language.changedDesc'),
    });
  };

  console.log('Current language in LanguageSelector:', language);
  console.log('Available languages:', availableLanguages);

  return (
    <Card className="glass border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <Languages className="mr-2 h-5 w-5" />
          {t('language.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('language.subtitle')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 max-h-64 overflow-y-auto">
          {availableLanguages.map((lang) => {
            const isSelected = language === lang.code;
            
            return (
              <Button
                key={lang.code}
                variant={isSelected ? "default" : "outline"}
                className={`w-full justify-start h-auto p-3 ${
                  isSelected 
                    ? 'bg-primary/20 text-primary border-primary/50' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm sm:text-base">{lang.name}</div>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground pt-2 border-t">
          {t('language.current')}: {availableLanguages.find(l => l.code === language)?.name}
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;
