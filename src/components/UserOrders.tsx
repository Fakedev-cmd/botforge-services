
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Calendar } from 'lucide-react';

interface Order {
  id: string;
  productName: string;
  category: string;
  price: number;
  requirements: string;
  status: string;
  userId: string;
  username: string;
  discordUsername: string;
  createdAt: string;
  orderId?: string;
  comments?: Array<{
    id: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    content: string;
    createdAt: string;
  }>;
}

const UserOrders = () => {
  const { user } = useAuth();
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      const allOrders = JSON.parse(localStorage.getItem('botforge_orders') || '[]');
      const filteredOrders = allOrders
        .filter((order: Order) => order.userId === user.id)
        .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUserOrders(filteredOrders);
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-green-500';
      case 'in_development': return 'bg-blue-500';
      case 'finishing': return 'bg-purple-500';
      case 'delivered': return 'bg-green-600';
      case 'declined': return 'bg-red-500';
      case 'canceled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
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
      default:
        return <span className="text-white font-medium">{username}</span>;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          My Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userOrders.length > 0 ? (
          <div className="space-y-4">
            {userOrders.map((order) => (
              <div key={order.id} className="p-4 border border-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-medium">{order.productName}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {order.orderId && (
                        <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                          #{order.orderId}
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-gray-600 text-gray-400">
                        {order.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(order.status)} text-white mb-2`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <div className="text-cyan-400 font-medium">${order.price}</div>
                    <div className="text-gray-500 text-sm flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {order.comments && order.comments.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-gray-300 font-medium mb-2">Updates:</h5>
                    <div className="space-y-2">
                      {order.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-700/50 p-3 rounded">
                          <div className="flex items-center justify-between mb-1">
                            {getRoleDisplay(comment.authorRole, comment.authorName)}
                            <span className="text-gray-500 text-xs">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No orders yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserOrders;
