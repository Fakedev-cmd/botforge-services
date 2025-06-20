
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { History, Trash2, Calendar, Settings } from 'lucide-react';

interface TermsUpdate {
  id: string;
  content: string;
  updatedBy: string;
  updatedByRole: string;
  updatedAt: string;
}

const ToSHistoryManager = () => {
  const { user } = useAuth();
  const [termsHistory, setTermsHistory] = useState<TermsUpdate[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<TermsUpdate | null>(null);

  useEffect(() => {
    loadTermsHistory();
  }, []);

  const loadTermsHistory = () => {
    const storedTerms = JSON.parse(localStorage.getItem('botforge_terms') || '[]');
    setTermsHistory(storedTerms.sort((a: TermsUpdate, b: TermsUpdate) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ));
  };

  const deleteTermsVersion = (versionId: string) => {
    const currentTerms = JSON.parse(localStorage.getItem('botforge_terms') || '[]');
    
    // Prevent deletion if it's the only version
    if (currentTerms.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the last remaining version of Terms of Service.",
        variant: "destructive",
      });
      return;
    }

    // Prevent deletion of the current (most recent) version
    const sortedTerms = currentTerms.sort((a: TermsUpdate, b: TermsUpdate) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    if (sortedTerms[0].id === versionId) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the current active version of Terms of Service.",
        variant: "destructive",
      });
      return;
    }

    const filteredTerms = currentTerms.filter((terms: TermsUpdate) => terms.id !== versionId);
    localStorage.setItem('botforge_terms', JSON.stringify(filteredTerms));
    
    loadTermsHistory();
    setSelectedTerms(null);
    
    toast({
      title: "Version Deleted",
      description: "Terms of Service version has been deleted successfully.",
    });
  };

  const getRoleDisplay = (role: string, username: string) => {
    switch (role) {
      case 'root':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-red-500 text-white">System ✓</Badge>
          </div>
        );
      case 'owner':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-blue-500 text-white">Owner ✓</Badge>
          </div>
        );
      case 'manager':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-purple-500 text-white flex items-center gap-1">
              Manager <Settings className="h-3 w-3" />
            </Badge>
          </div>
        );
      default:
        return <span className="text-white font-medium">{username}</span>;
    }
  };

  if (!user || (user.role !== 'owner' && user.role !== 'root')) {
    return null;
  }

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <History className="mr-2 h-5 w-5" />
          Terms of Service History
        </CardTitle>
        <p className="text-gray-400">Manage previous versions of Terms of Service</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {termsHistory.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No Terms of Service versions found.</p>
          ) : (
            termsHistory.map((terms, index) => (
              <div key={terms.id} className="p-4 border border-gray-700/50 rounded-lg bg-gray-900/30 backdrop-blur-sm hover:bg-gray-900/50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-white font-medium">
                        {index === 0 ? 'Current Version' : `Version ${termsHistory.length - index}`}
                      </h4>
                      {index === 0 && <Badge className="bg-green-500 text-white">Active</Badge>}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(terms.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>by</span>
                        {getRoleDisplay(terms.updatedByRole, terms.updatedBy)}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {terms.content.substring(0, 100)}...
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTerms(terms)}
                          className="bg-gray-700/50 backdrop-blur-sm border-gray-600 text-white hover:bg-gray-600/50"
                        >
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            {index === 0 ? 'Current Version' : `Version ${termsHistory.length - index}`}
                          </DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Updated on {new Date(terms.updatedAt).toLocaleDateString()} by {terms.updatedBy}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                          {terms.content}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {index !== 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Delete Terms Version</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Are you sure you want to delete this version of the Terms of Service? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end space-x-2 mt-4">
                            <DialogTrigger asChild>
                              <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                                Cancel
                              </Button>
                            </DialogTrigger>
                            <Button
                              variant="destructive"
                              onClick={() => deleteTermsVersion(terms.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Version
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ToSHistoryManager;
