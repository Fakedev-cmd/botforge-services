import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { MessageSquare, Eye, Lock, Trash2, Send, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const TicketManager = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [closeReason, setCloseReason] = useState('');
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  // Create a consistent UUID from local user ID
  const createUserUUID = (localUserId: string) => {
    const hash = btoa(localUserId).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          products(name),
          users(username, role),
          ticket_replies(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchReplies = async (ticketId) => {
    try {
      const { data, error } = await supabase
        .from('ticket_replies')
        .select(`
          *,
          users(username, role)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    fetchReplies(ticket.id);
  };

  const handleReplySubmit = async () => {
    if (!newReply.trim() || !selectedTicket) return;

    setLoading(true);
    try {
      const userUuid = createUserUUID(user.id);

      // Ensure admin user exists in users table
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: userUuid,
          username: user.username,
          email: user.email || `${user.username}@admin.local`,
          role: user.role || 'manager'
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (userError) {
        console.error('Error upserting admin user:', userError);
      }

      const { error } = await supabase
        .from('ticket_replies')
        .insert([{
          id: crypto.randomUUID(),
          ticket_id: selectedTicket.id,
          user_id: userUuid,
          message: newReply.trim(),
          is_admin_reply: true,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setNewReply('');
      fetchReplies(selectedTicket.id);
      fetchTickets();
      toast({
        title: "Reply sent",
        description: "Your reply has been added to the ticket.",
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    setLoading(true);
    try {
      const userUuid = createUserUUID(user.id);

      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'closed',
          closed_by: userUuid,
          closed_at: new Date().toISOString(),
          close_reason: closeReason.trim() || null
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      setShowCloseDialog(false);
      setCloseReason('');
      setSelectedTicket({ ...selectedTicket, status: 'closed' });
      fetchTickets();
      toast({
        title: "Ticket closed",
        description: "The ticket has been closed successfully.",
      });
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast({
        title: "Error",
        description: "Failed to close ticket.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;

      setTickets(tickets.filter(t => t.id !== ticketId));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
        setReplies([]);
      }
      toast({
        title: "Ticket deleted",
        description: "The ticket has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: "Error",
        description: "Failed to delete ticket.",
        variant: "destructive",
      });
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

  const getRoleBadge = (role, username) => {
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
    <Card className="glass border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-foreground text-2xl">Ticket Management</CardTitle>
        <p className="text-muted-foreground">Manage and respond to support tickets</p>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tickets List */}
          <div className="space-y-4">
            <h3 className="text-foreground font-medium text-lg">All Tickets</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedTicket?.id === ticket.id
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/30 hover:border-border/50 bg-background/30'
                  }`}
                  onClick={() => handleTicketSelect(ticket)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getCategoryBadge(ticket.category)}
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTicket(ticket.id);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h4 className="text-foreground font-medium mb-1">{ticket.title}</h4>
                  <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                    {ticket.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                      {getRoleBadge(ticket.users?.role, ticket.users?.username)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>{ticket.ticket_replies?.[0]?.count || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Details */}
          {selectedTicket ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground font-medium text-lg">Ticket Details</h3>
                <div className="flex space-x-2">
                  {selectedTicket.status === 'open' && (
                    <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Lock className="h-4 w-4 mr-1" />
                          Close
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass border-border/50">
                        <DialogHeader>
                          <DialogTitle>Close Ticket</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="closeReason">Close Reason (Optional)</Label>
                            <Textarea
                              id="closeReason"
                              value={closeReason}
                              onChange={(e) => setCloseReason(e.target.value)}
                              placeholder="Reason for closing this ticket..."
                              className="bg-background/50 border-border/50"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" onClick={() => setShowCloseDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCloseTicket} disabled={loading}>
                              Close Ticket
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              <div className="p-4 border border-border/30 rounded-lg bg-background/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-foreground font-medium">{selectedTicket.title}</h4>
                    <div className="flex space-x-2">
                      {getCategoryBadge(selectedTicket.category)}
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{selectedTicket.description}</p>
                  {selectedTicket.products && (
                    <p className="text-muted-foreground text-sm">
                      Product: {selectedTicket.products.name}
                    </p>
                  )}
                  <p className="text-muted-foreground text-sm">
                    Created: {new Date(selectedTicket.created_at).toLocaleString()}
                  </p>
                  {selectedTicket.close_reason && (
                    <div className="p-2 bg-destructive/10 border border-destructive/20 rounded">
                      <p className="text-sm text-destructive font-medium">Close Reason:</p>
                      <p className="text-sm text-destructive/80">{selectedTicket.close_reason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-3 rounded-lg border ${
                      reply.is_admin_reply
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-background/30 border-border/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {getRoleBadge(reply.users?.role, reply.users?.username)}
                        {reply.is_admin_reply && (
                          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Staff
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(reply.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-foreground text-sm">{reply.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {selectedTicket.status === 'open' && (
                <div className="space-y-3">
                  <Textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Type your reply..."
                    className="bg-background/50 border-border/50"
                  />
                  <Button
                    onClick={handleReplySubmit}
                    disabled={loading || !newReply.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Select a ticket to view details</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketManager;
