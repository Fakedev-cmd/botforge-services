
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Truck,
  ShoppingCart,
  MessageSquare
} from 'lucide-react';

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

interface OrderManagerProps {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  user: any;
  showPending?: boolean;
}

const OrderManager = ({ orders, setOrders, user, showPending = false }: OrderManagerProps) => {
  const [orderComments, setOrderComments] = useState<{[key: string]: string}>({});
  const [editingPrice, setEditingPrice] = useState<{[key: string]: string}>({});

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const acceptedOrders = orders.filter(order => 
    ['accepted', 'in_development', 'finishing', 'delivered', 'canceled'].includes(order.status)
  );

  const displayOrders = showPending ? pendingOrders : acceptedOrders;

  const handleOrderAction = (orderId: string, action: 'accept' | 'decline') => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        if (action === 'accept') {
          return {
            ...order,
            status: 'accepted',
            orderId: `BF${Date.now().toString().slice(-6)}`
          };
        } else {
          return { ...order, status: 'declined' };
        }
      }
      return order;
    });

    setOrders(updatedOrders);
    localStorage.setItem('botforge_orders', JSON.stringify(updatedOrders));

    toast({
      title: action === 'accept' ? "Order Accepted" : "Order Declined",
      description: `Order has been ${action}ed successfully.`,
    });
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );

    setOrders(updatedOrders);
    localStorage.setItem('botforge_orders', JSON.stringify(updatedOrders));

    toast({
      title: "Status Updated",
      description: "Order status has been updated successfully.",
    });
  };

  const handlePriceUpdate = (orderId: string) => {
    const newPrice = parseFloat(editingPrice[orderId]);
    if (isNaN(newPrice) || newPrice < 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, price: newPrice } : order
    );

    setOrders(updatedOrders);
    localStorage.setItem('botforge_orders', JSON.stringify(updatedOrders));
    setEditingPrice({ ...editingPrice, [orderId]: '' });

    toast({
      title: "Price Updated",
      description: "Order price has been updated successfully.",
    });
  };

  const handleAddComment = (orderId: string) => {
    const comment = orderComments[orderId];
    if (!comment?.trim()) return;

    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const newComment = {
          id: Date.now().toString(),
          authorId: user.id,
          authorName: user.username,
          authorRole: user.role,
          content: comment.trim(),
          createdAt: new Date().toISOString()
        };
        
        return {
          ...order,
          comments: [...(order.comments || []), newComment]
        };
      }
      return order;
    });

    setOrders(updatedOrders);
    localStorage.setItem('botforge_orders', JSON.stringify(updatedOrders));
    setOrderComments({ ...orderComments, [orderId]: '' });

    toast({
      title: "Comment Added",
      description: "Your comment has been added to the order.",
    });
  };

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

  const isDeveloper = user.role === 'developer';
  const isOwner = user.role === 'owner';
  const isRoot = user.role === 'root';

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">
          {showPending ? 'Pending Orders' : 'All Orders'}
        </CardTitle>
        <p className="text-gray-400">
          {showPending ? 'Review and approve/decline incoming orders' : 'Manage order statuses and communicate with customers'}
        </p>
      </CardHeader>
      <CardContent>
        {displayOrders.length > 0 ? (
          <div className="space-y-6">
            {displayOrders.map((order) => (
              <div key={order.id} className="p-6 border border-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-medium text-lg">{order.productName}</h4>
                    <p className="text-gray-400">by {order.username}</p>
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
                    {order.discordUsername && (
                      <p className="text-gray-400 text-sm">Discord: {order.discordUsername}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <span className="text-cyan-400 font-medium">${order.price}</span>
                        {!showPending && (isDeveloper || isOwner || isRoot) && (
                          <div className="flex items-center space-x-1">
                            <Input
                              type="number"
                              value={editingPrice[order.id] || ''}
                              onChange={(e) => setEditingPrice({ ...editingPrice, [order.id]: e.target.value })}
                              placeholder="New price"
                              className="bg-gray-700 border-gray-600 text-white w-20 h-8 text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => handlePriceUpdate(order.id)}
                              disabled={!editingPrice[order.id]}
                              className="bg-cyan-600 hover:bg-cyan-700 h-8 px-2"
                            >
                              Update
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 font-medium mb-2">Requirements:</label>
                  <p className="text-gray-400 bg-gray-700/50 p-3 rounded leading-relaxed">
                    {order.requirements}
                  </p>
                </div>
                
                {showPending ? (
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => handleOrderAction(order.id, 'accept')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept Order
                    </Button>
                    <Button 
                      onClick={() => handleOrderAction(order.id, 'decline')}
                      variant="destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline Order
                    </Button>
                  </div>
                ) : (
                  <>
                    {order.status !== 'delivered' && order.status !== 'declined' && order.status !== 'canceled' && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {order.status === 'accepted' && (
                          <Button 
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'in_development')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Start Development
                          </Button>
                        )}
                        {order.status === 'in_development' && (
                          <Button 
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'finishing')}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Move to Finishing
                          </Button>
                        )}
                        {order.status === 'finishing' && (
                          <Button 
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'delivered')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            Mark as Delivered
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, 'canceled')}
                          variant="destructive"
                        >
                          Cancel Order
                        </Button>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex space-x-3">
                        <Input
                          value={orderComments[order.id] || ''}
                          onChange={(e) => setOrderComments({ ...orderComments, [order.id]: e.target.value })}
                          placeholder="Add a comment for the customer..."
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                        <Button 
                          onClick={() => handleAddComment(order.id)}
                          disabled={!orderComments[order.id]?.trim()}
                          size="sm"
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Comment
                        </Button>
                      </div>

                      {order.comments && order.comments.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-gray-300 font-medium">Comments:</h5>
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
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {showPending ? (
              <>
                <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No pending orders</p>
              </>
            ) : (
              <>
                <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No orders yet</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderManager;
