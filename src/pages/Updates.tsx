
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Zap, Bell, Settings, Hammer, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Updates = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('updates')
        .select(`
          *,
          users(username, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
      // Fallback to localStorage for backwards compatibility
      const storedUpdates = JSON.parse(localStorage.getItem('botforge_updates') || '[]');
      setUpdates(storedUpdates.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role, username) => {
    switch (role) {
      case 'root':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-red-600/20 text-red-200 border border-red-600/50">System ✓</Badge>
          </div>
        );
      case 'owner':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-blue-600/20 text-blue-200 border border-blue-600/50">Owner ✓</Badge>
          </div>
        );
      case 'manager':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-purple-600/20 text-purple-200 border border-purple-600/50 flex items-center gap-1">
              Manager <Settings className="h-3 w-3" />
            </Badge>
          </div>
        );
      case 'developer':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-orange-500/20 text-orange-200 border border-orange-500/50 flex items-center gap-1">
              Developer <Hammer className="h-3 w-3" />
            </Badge>
          </div>
        );
      case 'customer':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-green-500/20 text-green-200 border border-green-500/50 flex items-center gap-1">
              Customer <Star className="h-3 w-3" />
            </Badge>
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
                  <Bell className="h-12 w-12 text-blue-400" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 mb-6 animate-fade-in">
              Latest Updates
            </h1>
            
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl rounded-lg"></div>
              <p className="relative text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-gray-800/50 p-6 rounded-2xl border border-blue-500/20">
                Stay updated with the <span className="text-blue-400 font-semibold">latest news</span> and 
                <span className="text-cyan-400 font-semibold"> improvements</span> to our services
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
              <p className="text-blue-300 mt-4">Loading updates...</p>
            </div>
          ) : updates.length > 0 ? (
            <div className="space-y-8">
              {updates.map((update, index) => (
                <Card key={update.id || index} className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-blue-500/20 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-white flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-8 h-8 rounded-lg flex items-center justify-center">
                          <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span>{update.title}</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2 text-blue-300 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(update.created_at || update.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-8 h-8 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      {update.users ? 
                        getRoleBadge(update.users.role, update.users.username) :
                        <span className="text-blue-300">System Update</span>
                      }
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: update.content }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl rounded-full"></div>
                <div className="relative bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-12 border border-blue-500/20">
                  <Clock className="h-16 w-16 text-blue-400 mx-auto mb-6 animate-pulse" />
                  <h3 className="text-3xl font-bold text-white mb-4">No Updates Yet</h3>
                  <p className="text-blue-300 text-lg">Check back later for the latest news and improvements</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Updates;
