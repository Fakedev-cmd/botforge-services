
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Package, ExternalLink, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  createdAt: string;
}

const Shop = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderForm, setOrderForm] = useState({
    requirements: '',
    discordUsername: ''
  });

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem('botforge_products') || '[]');
    setProducts(storedProducts);
  }, []);

  const handleProductSelect = (product: Product) => {
    if (!user) {
      toast({
        title: t('shop.loginRequired'),
        description: t('shop.loginRequiredDesc'),
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    setSelectedProduct(product);
  };

  const handleOrderSubmit = () => {
    if (!selectedProduct || !user) return;

    if (!orderForm.requirements.trim()) {
      toast({
        title: t('shop.missingRequirements'),
        description: t('shop.missingRequirementsDesc'),
        variant: "destructive",
      });
      return;
    }

    if (!orderForm.discordUsername.trim() || !orderForm.discordUsername.startsWith('@')) {
      toast({
        title: t('shop.invalidDiscord'),
        description: t('shop.invalidDiscordDesc'),
        variant: "destructive",
      });
      return;
    }

    const order = {
      id: Date.now().toString(),
      productName: selectedProduct.name,
      category: selectedProduct.category,
      price: selectedProduct.price,
      requirements: orderForm.requirements,
      discordUsername: orderForm.discordUsername,
      status: 'pending',
      userId: user.id,
      username: user.username,
      createdAt: new Date().toISOString(),
    };

    const existingOrders = JSON.parse(localStorage.getItem('botforge_orders') || '[]');
    existingOrders.push(order);
    localStorage.setItem('botforge_orders', JSON.stringify(existingOrders));

    toast({
      title: t('shop.orderPlaced'),
      description: t('shop.orderPlacedDesc'),
    });

    setSelectedProduct(null);
    setOrderForm({ requirements: '', discordUsername: '' });
  };

  const handleJoinDiscord = () => {
    window.open('https://discord.gg/4HHhks6NT3', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t('shop.title')}</h1>
          <p className="text-gray-400 text-lg">{t('shop.subtitle')}</p>
        </div>

        {!selectedProduct ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="bg-gray-800 border-gray-700 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                      ${product.price}+
                    </Badge>
                  </div>
                  <Badge variant="outline" className="border-gray-600 text-gray-400 w-fit">
                    {product.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4 line-clamp-3">{product.description}</p>
                  <Button 
                    onClick={() => handleProductSelect(product)}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white transition-all duration-300"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {t('shop.orderNow')}
                  </Button>
                </CardContent>
              </Card>
            ))}
            {products.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">{t('shop.noProducts')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <Button 
              onClick={() => setSelectedProduct(null)}
              variant="ghost"
              className="mb-6 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('shop.back')}
            </Button>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Product Details */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    {selectedProduct.name}
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                      ${selectedProduct.price}+
                    </Badge>
                  </CardTitle>
                  <Badge variant="outline" className="border-gray-600 text-gray-400 w-fit">
                    {selectedProduct.category}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-white font-medium mb-3">{t('shop.productDetails')}</h3>
                    <p className="text-gray-300 leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-blue-400 font-medium flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t('shop.discordRequired')}
                      </h3>
                      <Button
                        onClick={handleJoinDiscord}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t('shop.joinServer')}
                      </Button>
                    </div>
                    <p className="text-blue-300 text-sm">
                      {t('shop.discordDesc')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Form */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">{t('shop.placeOrder')}</CardTitle>
                  <p className="text-gray-400">{t('shop.placeOrderSubtitle')}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('shop.discordUser')}
                    </label>
                    <Input
                      value={orderForm.discordUsername}
                      onChange={(e) => setOrderForm({ ...orderForm, discordUsername: e.target.value })}
                      placeholder={t('shop.discordPlaceholder')}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      {t('shop.discordHint')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('shop.requirements')}
                    </label>
                    <Textarea
                      value={orderForm.requirements}
                      onChange={(e) => setOrderForm({ ...orderForm, requirements: e.target.value })}
                      placeholder={t('shop.requirementsPlaceholder')}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      rows={6}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleOrderSubmit}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-300"
                      disabled={!orderForm.requirements.trim() || !orderForm.discordUsername.trim()}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('shop.submitOrder')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
