
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Bot, ArrowLeft, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  createdAt: string;
}

interface Order {
  id: string;
  productId: string;
  productName: string;
  category: string;
  price: number;
  requirements: string;
  status: string;
  userId: string;
  username: string;
  createdAt: string;
  comments?: Array<{
    id: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    content: string;
    createdAt: string;
  }>;
}

const ProductDetails = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const products = JSON.parse(localStorage.getItem('botforge_products') || '[]');
    const foundProduct = products.find((p: Product) => p.id === productId);
    setProduct(foundProduct || null);
  }, [productId]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Product not found</h2>
            <Button onClick={() => navigate('/shop')} className="bg-cyan-600 hover:bg-cyan-700">
              Back to Shop
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleOrder = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to place an order.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!requirements.trim()) {
      toast({
        title: "Requirements Missing",
        description: "Please describe what you need in your bot.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const order: Order = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
      requirements: requirements.trim(),
      status: 'pending',
      userId: user.id,
      username: user.username,
      createdAt: new Date().toISOString(),
      comments: []
    };

    const existingOrders = JSON.parse(localStorage.getItem('botforge_orders') || '[]');
    const updatedOrders = [...existingOrders, order];
    localStorage.setItem('botforge_orders', JSON.stringify(updatedOrders));

    setIsSubmitting(false);
    setRequirements('');

    toast({
      title: "Order Submitted!",
      description: "Your order has been submitted and is pending review.",
    });

    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          onClick={() => navigate('/shop')}
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Bot className="h-12 w-12 text-cyan-400" />
                <Badge className="bg-cyan-600 text-white text-lg px-3 py-1">
                  Starting from ${product.price}
                </Badge>
              </div>
              <CardTitle className="text-white text-2xl">{product.name}</CardTitle>
              <Badge variant="outline" className="border-gray-600 text-gray-400 w-fit">
                {product.category}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed text-lg">
                {product.description}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Place Your Order
              </CardTitle>
              <p className="text-gray-400">Tell us exactly what you need</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What do you need in your bot? *
                </label>
                <Textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Describe your requirements in detail..."
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
                  rows={5}
                />
              </div>

              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Order Summary</h4>
                <div className="flex justify-between items-center text-gray-300">
                  <span>{product.name}</span>
                  <span className="text-cyan-400 font-bold">${product.price}+</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Final price will be determined based on your requirements
                </p>
              </div>

              <Button
                onClick={handleOrder}
                disabled={isSubmitting || !requirements.trim()}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3"
              >
                {isSubmitting ? 'Submitting Order...' : 'Submit Order'}
              </Button>

              {!user && (
                <p className="text-gray-400 text-sm text-center">
                  <Button variant="link" onClick={() => navigate('/login')} className="text-cyan-400">
                    Log in
                  </Button>
                  or
                  <Button variant="link" onClick={() => navigate('/register')} className="text-cyan-400">
                    register
                  </Button>
                  to place an order
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
