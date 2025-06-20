
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Ban, Trash2, ShieldCheck, Settings, Hammer, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RootPanelProps {
  users: any[];
  setUsers: (users: any[]) => void;
  banUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  getAllUsers: () => any[];
}

const RootPanel = ({ users, setUsers, banUser, deleteUser, getAllUsers }: RootPanelProps) => {
  const { unbanUser } = useAuth();

  const handleBanUser = (userId: string) => {
    banUser(userId);
    setUsers(getAllUsers());
    toast({
      title: "User Banned",
      description: "User has been banned successfully.",
    });
  };

  const handleUnbanUser = (userId: string) => {
    unbanUser(userId);
    setUsers(getAllUsers());
    toast({
      title: "User Unbanned",
      description: "User has been unbanned successfully.",
    });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    setUsers(getAllUsers());
    toast({
      title: "User Deleted",
      description: "User has been deleted successfully.",
    });
  };

  const getRoleDisplay = (role: string, username: string) => {
    switch (role) {
      case 'root':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-red-600/30 text-red-200 border border-red-600/50">System ✓</Badge>
          </div>
        );
      case 'owner':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-blue-600/30 text-blue-200 border border-blue-600/50">Owner ✓</Badge>
          </div>
        );
      case 'manager':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-purple-600/30 text-purple-200 border border-purple-600/50 flex items-center gap-1">
              Manager <Settings className="h-3 w-3" />
            </Badge>
          </div>
        );
      case 'developer':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-orange-500/30 text-orange-200 border border-orange-500/50 flex items-center gap-1">
              Developer <Hammer className="h-3 w-3" />
            </Badge>
          </div>
        );
      case 'customer':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-green-500/30 text-green-200 border border-green-500/50 flex items-center gap-1">
              Customer <Star className="h-3 w-3" />
            </Badge>
          </div>
        );
      default:
        return <span className="text-white font-medium">{username}</span>;
    }
  };

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl card-hover">
      <CardHeader>
        <CardTitle className="text-blue-400 text-2xl">Root Control Panel</CardTitle>
        <p className="text-blue-300">System administrator controls</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <h3 className="text-white font-medium text-lg">Advanced User Management</h3>
          {users.map((usr) => (
            <div key={usr.id} className="flex items-center justify-between p-6 border border-blue-500/20 rounded-xl bg-gray-900/30 backdrop-blur-sm hover:border-blue-400/40 transition-all duration-200 card-hover">
              <div>
                <div className="flex items-center space-x-3">
                  {getRoleDisplay(usr.role, usr.username)}
                  {usr.banned && <Badge variant="destructive" className="bg-red-500/20 text-red-300 border border-red-500/50">BANNED</Badge>}
                </div>
                <p className="text-blue-300 text-sm mt-1">{usr.email}</p>
                {usr.discordId && (
                  <p className="text-blue-300 text-sm">Discord ID: {usr.discordId}</p>
                )}
                <p className="text-blue-400/70 text-sm">Joined: {new Date(usr.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="flex space-x-2">
                {usr.role !== 'root' && (
                  <>
                    {!usr.banned ? (
                      <Button
                        size="sm"
                        onClick={() => handleBanUser(usr.id)}
                        className="bg-red-600 hover:bg-red-700 shadow-lg"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleUnbanUser(usr.id)}
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleDeleteUser(usr.id)}
                      variant="destructive"
                      className="shadow-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RootPanel;
