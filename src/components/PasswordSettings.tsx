
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

const PasswordSettings = () => {
  const { user, changePassword } = useAuth();
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: t('password.missing'),
        description: t('password.missingDesc'),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t('password.mismatch'),
        description: t('password.mismatchDesc'),
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: t('password.short'),
        description: t('password.shortDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const success = await changePassword(currentPassword, newPassword);
      if (success) {
        toast({
          title: t('password.success'),
          description: t('password.successDesc'),
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: t('password.failed'),
          description: t('password.failedDesc'),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('password.error'),
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user || user.role === 'root') {
    return null;
  }

  return (
    <Card className="glass border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center text-lg sm:text-xl">
          <Lock className="mr-2 h-5 w-5" />
          {t('password.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {t('password.current')}
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full"
              placeholder={t('password.current')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {t('password.new')}
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full"
              placeholder={t('password.new')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {t('password.confirm')}
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full"
              placeholder={t('password.confirm')}
            />
          </div>
          <Button
            type="submit"
            disabled={isChangingPassword}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm sm:text-base"
          >
            {isChangingPassword ? t('password.changing') : t('password.change')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordSettings;
