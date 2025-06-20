
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Calendar, Trash2 } from 'lucide-react';

interface Update {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
}

interface UpdateManagerProps {
  updates: Update[];
  setUpdates: (updates: Update[]) => void;
  userRole: string;
}

const UpdateManager = ({ updates, setUpdates, userRole }: UpdateManagerProps) => {
  const handleDeleteUpdate = (updateId: string) => {
    if (userRole !== 'owner' && userRole !== 'root') return;
    
    const updatedUpdates = updates.filter(u => u.id !== updateId);
    setUpdates(updatedUpdates);
    localStorage.setItem('botforge_updates', JSON.stringify(updatedUpdates));
    
    toast({
      title: "Update Deleted",
      description: "Update has been removed successfully.",
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
      case 'developer':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-orange-500 text-white">Developer</Badge>
          </div>
        );
      case 'customer':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-green-500 text-white">Customer</Badge>
          </div>
        );
      default:
        return <span className="text-white font-medium">{username}</span>;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Update Management</CardTitle>
        <p className="text-gray-400">Manage project updates and announcements</p>
      </CardHeader>
      <CardContent>
        {updates.length > 0 ? (
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="p-4 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium text-lg">{update.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-gray-400 text-sm">By</span>
                      {getRoleDisplay(update.authorRole, update.authorName)}
                      <span className="text-gray-500 text-sm">
                        • {new Date(update.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteUpdate(update.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{update.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No updates yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpdateManager;
