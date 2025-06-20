
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const CreateTicketDialog = ({ open, onOpenChange, onTicketCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Account' | 'Orders' | 'Other' | ''>('');
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('available', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a ticket.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create ticket directly without auth.uid() dependency
      const ticketData = {
        id: crypto.randomUUID(),
        user_id: crypto.randomUUID(), // Create a UUID for the local user
        title: title.trim(),
        description: description.trim(),
        category: category as 'Account' | 'Orders' | 'Other',
        product_id: productId || null,
        status: 'open' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Creating ticket with data:', ticketData);

      const { data: ticketResult, error: ticketError } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select('id')
        .single();

      if (ticketError) {
        console.error('Ticket creation error:', ticketError);
        throw ticketError;
      }

      console.log('Ticket created successfully:', ticketResult);

      // Also create a user record for reference
      const userData = {
        id: ticketData.user_id,
        username: user.username,
        email: user.email || `${user.username}@local.app`,
        role: user.role || 'customer'
      };

      // Insert user record (ignore conflicts)
      await supabase
        .from('users')
        .upsert(userData, { 
          onConflict: 'id',
          ignoreDuplicates: true 
        });

      toast({
        title: "Success",
        description: "Your ticket has been created successfully.",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setProductId('');
      onOpenChange(false);
      onTicketCreated();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: `Failed to create ticket: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === '' || value === 'Account' || value === 'Orders' || value === 'Other') {
      setCategory(value as 'Account' | 'Orders' | 'Other' | '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 shadow-xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground text-2xl">Create Support Ticket</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill out the form below to create a new support ticket
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of your issue"
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="Account">Account</SelectItem>
                <SelectItem value="Orders">Orders</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Related Product (Optional)</Label>
            <Select value={productId} onValueChange={(value) => setProductId(value === 'none' ? '' : value)}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="Select a product (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="none">None</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of your issue"
              className="bg-background/50 border-border/50 min-h-[120px]"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketDialog;
