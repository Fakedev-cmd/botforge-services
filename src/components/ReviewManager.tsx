
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Star, Trash2, Settings } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface Review {
  id: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  orderId: string;
  createdAt: string;
}

interface ReviewManagerProps {
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  userRole: string;
}

const ReviewManager = ({ reviews, setReviews, userRole }: ReviewManagerProps) => {
  const { t } = useTranslation();
  const handleDeleteReview = (reviewId: string) => {
    if (userRole !== 'owner' && userRole !== 'root') return;
    
    const updatedReviews = reviews.filter(r => r.id !== reviewId);
    setReviews(updatedReviews);
    localStorage.setItem('botforge_reviews', JSON.stringify(updatedReviews));
    
    toast({
      title: t('reviewManager.deleted'),
      description: t('reviewManager.deletedDesc'),
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  const getRoleDisplay = (role: string, username: string) => {
    switch (role) {
      case 'root':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-red-500 text-white">{t('reviewManager.role.system')}</Badge>
          </div>
        );
      case 'owner':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-blue-500 text-white">{t('reviewManager.role.owner')}</Badge>
          </div>
        );
      case 'manager':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-purple-500 text-white flex items-center gap-1">
              {t('reviewManager.role.manager')} <Settings className="h-3 w-3" />
            </Badge>
          </div>
        );
      case 'developer':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-orange-500 text-white">{t('reviewManager.role.developer')}</Badge>
          </div>
        );
      case 'customer':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-green-500 text-white">{t('reviewManager.role.customer')}</Badge>
          </div>
        );
      default:
        return <span className="text-white font-medium">{username}</span>;
    }
  };

  return (
    <Card className="glass border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-foreground text-2xl">{t('reviewManager.title')}</CardTitle>
        <p className="text-muted-foreground">{t('reviewManager.subtitle')}</p>
      </CardHeader>
      <CardContent>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 border border-border/30 rounded-xl glass hover:border-border/50 transition-all duration-200 card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getRoleDisplay('customer', review.username)}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteReview(review.id)}
                      className="shadow-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('reviewManager.noReviews')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewManager;
