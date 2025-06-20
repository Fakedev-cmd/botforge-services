
import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ExternalLink, Settings, ShoppingCart, User } from 'lucide-react';
import UserOrders from '@/components/UserOrders';
import PasswordSettings from '@/components/PasswordSettings';
import ThemeSelector from '@/components/ThemeSelector';
import LanguageSelector from '@/components/LanguageSelector';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AvatarUploader from "@/components/AvatarUploader";

const Profile = () => {
  const { user, logout, updateUserAvatar } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('profile');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: t('profile.logoutSuccess'),
      description: t('profile.logoutDesc'),
    });
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'root':
        return <Badge className="bg-red-500 text-white">{t('profile.role.system')}</Badge>;
      case 'owner':
        return <Badge className="bg-blue-500 text-white">{t('profile.role.owner')}</Badge>;
      case 'manager':
        return <Badge className="bg-purple-500 text-white flex items-center gap-1">
          {t('profile.role.manager')} <Settings className="h-3 w-3" />
        </Badge>;
      case 'developer':
        return <Badge className="bg-orange-500 text-white">{t('profile.role.developer')}</Badge>;
      case 'customer':
        return <Badge className="bg-green-500 text-white">{t('profile.role.customer')}</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-600 text-gray-400">{t('profile.role.user')}</Badge>;
    }
  };

  const handleJoinDiscord = () => {
    window.open('https://discord.gg/4HHhks6NT3', '_blank');
  };

  const handleAvatarUpload = async (filePath: string) => {
    await updateUserAvatar(filePath);
    toast({
      title: t('profile.avatar.updateSuccessTitle'),
      description: t('profile.avatar.updateSuccessDesc'),
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4">{t('profile.title')}</h1>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">
            {t('profile.subtitle')}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 mb-6 sm:mb-8 p-1 glass border-border/50 rounded-lg shadow-xl">
          <Button
            onClick={() => setActiveTab('profile')}
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            className={`${activeTab === 'profile' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'} text-sm sm:text-base`}
          >
            <User className="mr-2 h-4 w-4" />
            {t('profile.tab.profile')}
          </Button>
          <Button
            onClick={() => setActiveTab('orders')}
            variant={activeTab === 'orders' ? 'default' : 'ghost'}
            className={`${activeTab === 'orders' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'} text-sm sm:text-base`}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t('profile.tab.orders')}
          </Button>
          <Button
            onClick={() => setActiveTab('settings')}
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            className={`${activeTab === 'settings' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'} text-sm sm:text-base`}
          >
            <Settings className="mr-2 h-4 w-4" />
            {t('profile.tab.settings')}
          </Button>
        </div>

        {activeTab === 'profile' && (
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Profile Information */}
            <Card className="glass border-border/50 shadow-xl card-hover">
              <CardHeader className="items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={user.avatar_url} alt={user.username} />
                  <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                </Avatar>
                <CardTitle>{user.username}</CardTitle>
                {getRoleDisplay(user.role)}
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {t('profile.email')}
                  </label>
                  <span className="text-muted-foreground text-sm sm:text-base break-words">{user.email}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {t('profile.member')}
                  </label>
                  <span className="text-muted-foreground text-sm sm:text-base">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {t('profile.avatar.title')}
                  </label>
                  <AvatarUploader onUpload={handleAvatarUpload} />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass border-border/50 shadow-xl card-hover">
              <CardHeader>
                <CardTitle className="text-foreground text-lg sm:text-xl">{t('profile.actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleJoinDiscord}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-sm sm:text-base"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t('profile.discord')}
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="destructive" 
                  className="w-full shadow-lg text-sm sm:text-base"
                >
                  {t('profile.logout')}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'orders' && (
          <UserOrders />
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
            <LanguageSelector />
            <ThemeSelector />
            <PasswordSettings />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
