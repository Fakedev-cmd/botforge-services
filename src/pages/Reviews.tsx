
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User, Sparkles, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';

const Reviews = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users(username, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Fallback to localStorage for backwards compatibility
      const storedReviews = JSON.parse(localStorage.getItem('botforge_reviews') || '[]');
      setReviews(storedReviews.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-blue-400 fill-current' : 'text-gray-500'}`}
      />
    ));
  };

  const getRoleBadge = (role, username) => {
    switch (role) {
      case 'root':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-red-600/20 text-red-200 border border-red-600/50">{t('reviews.role.system')}</Badge>
          </div>
        );
      case 'owner':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-blue-600/20 text-blue-200 border border-blue-600/50">{t('reviews.role.owner')}</Badge>
          </div>
        );
      case 'manager':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-cyan-600/20 text-cyan-200 border border-cyan-600/50 flex items-center gap-1">
              {t('reviews.role.manager')} <Settings className="h-3 w-3" />
            </Badge>
          </div>
        );
      case 'developer':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-orange-500/20 text-orange-200 border border-orange-500/50">{t('reviews.role.developer')}</Badge>
          </div>
        );
      case 'customer':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-green-500/20 text-green-200 border border-green-500/50">{t('reviews.role.customer')}</Badge>
          </div>
        );
      default:
        return <span className="text-white font-medium">{username}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Simplified background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-gray-800 p-3 rounded-full border border-blue-500/20">
                  <Sparkles className="h-12 w-12 text-blue-400" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 mb-6 animate-fade-in">
              {t('reviews.title')}
            </h1>
            
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl rounded-lg"></div>
              <p className="relative text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-gray-800/50 p-6 rounded-2xl border border-blue-500/20">
                {t('reviews.subtitle')}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p className="text-gray-400 mt-4">{t('common.loading')}</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-8">
              {reviews.map((review, index) => (
                <Card key={review.id || index} className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-blue-500/20 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-10 h-10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        {review.users ? 
                          getRoleBadge(review.users.role, review.users.username) :
                          <span className="text-white font-medium">{review.username}</span>
                        }
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-gray-400 text-sm">
                          {new Date(review.created_at || review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-300 leading-relaxed text-lg">{review.comment}</p>
                      {review.product_name && (
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="border-cyan-400/30 text-cyan-400 bg-cyan-400/10">
                            {review.product_name}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl rounded-full"></div>
                <div className="relative bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-12 border border-blue-500/20">
                  <Star className="h-16 w-16 text-blue-400 mx-auto mb-6 animate-pulse" />
                  <h3 className="text-3xl font-bold text-white mb-4">{t('reviews.none')}</h3>
                  <p className="text-gray-400 text-lg">{t('reviews.beFirst')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
