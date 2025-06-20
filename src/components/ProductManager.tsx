
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  createdAt: string;
}

interface ProductManagerProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  userRole: string;
}

const ProductManager = ({ products, setProducts, userRole }: ProductManagerProps) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: 'discord bot' as string,
    customCategory: ''
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const finalCategory = newProduct.category === 'other' ? newProduct.customCategory : newProduct.category;

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      description: newProduct.description,
      category: finalCategory,
      createdAt: new Date().toISOString(),
    };

    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    localStorage.setItem('botforge_products', JSON.stringify(updatedProducts));

    setNewProduct({ name: '', price: '', description: '', category: 'discord bot', customCategory: '' });
    toast({
      title: "Product Added",
      description: "New product has been added successfully!",
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (userRole !== 'owner' && userRole !== 'root') return;
    
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    localStorage.setItem('botforge_products', JSON.stringify(updatedProducts));
    
    toast({
      title: "Product Deleted",
      description: "Product has been removed successfully.",
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Add Product Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Add New Product
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Product Name
            </label>
            <Input
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              placeholder="e.g., Discord Bot"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="custom discord bot">Custom Discord Bot</SelectItem>
                <SelectItem value="discord bot">Discord Bot</SelectItem>
                <SelectItem value="graphic">Graphic</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {newProduct.category === 'other' && (
              <Input
                value={newProduct.customCategory}
                onChange={(e) => setNewProduct({ ...newProduct, customCategory: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 mt-2"
                placeholder="Enter custom category"
              />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Starting Price ($)
            </label>
            <Input
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              placeholder="5"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <Textarea
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              placeholder="Describe the product features and benefits..."
              rows={4}
            />
          </div>
          <Button 
            onClick={handleAddProduct}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Add Product
          </Button>
        </CardContent>
      </Card>

      {/* Current Products with Delete */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Current Products</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="p-4 border border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium">{product.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-cyan-600 text-white">
                        ${product.price}+
                      </Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-gray-600 text-gray-400 mb-2">
                    {product.category}
                  </Badge>
                  <p className="text-gray-400 text-sm">{product.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No products added yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManager;
