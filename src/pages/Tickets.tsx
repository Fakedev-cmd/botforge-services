
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import CreateTicketDialog from '@/components/CreateTicketDialog';
import TicketDetails from '@/components/TicketDetails';

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          products(name),
          ticket_replies(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-500 text-white">Open</Badge>;
      case 'closed':
        return <Badge variant="destructive">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category) => {
    const colors = {
      'Account': 'bg-blue-500 text-white',
      'Orders': 'bg-purple-500 text-white',
      'Other': 'bg-orange-500 text-white'
    };
    return <Badge className={colors[category] || 'bg-gray-500 text-white'}>{category}</Badge>;
  };

  if (selectedTicket) {
    return (
      <TicketDetails 
        ticket={selectedTicket} 
        onBack={() => setSelectedTicket(null)}
        onUpdate={fetchTickets}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold gradient-text mb-4">Support Tickets</h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Get help with your account, orders, or other issues
          </p>
        </div>

        <div className="mb-8 flex justify-between items-center">
          <div className="flex space-x-4">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              <Clock className="h-3 w-3 mr-1" />
              {tickets.filter(t => t.status === 'open').length} Open
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              {tickets.filter(t => t.status === 'closed').length} Closed
            </Badge>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-primary hover:bg-primary/90 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : tickets.length > 0 ? (
          <div className="grid gap-6">
            {tickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className="glass border-border/50 shadow-xl card-hover cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">{ticket.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getCategoryBadge(ticket.category)}
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        {ticket.products && (
                          <span>Product: {ticket.products.name}</span>
                        )}
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{ticket.ticket_replies?.[0]?.count || 0} replies</span>
                        </div>
                      </div>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No tickets yet</p>
            <p className="text-muted-foreground/70">Create your first support ticket to get help</p>
          </div>
        )}

        <CreateTicketDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onTicketCreated={fetchTickets}
        />
      </div>
    </div>
  );
};

export default Tickets;
