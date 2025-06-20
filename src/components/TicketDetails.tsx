import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Lock, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const TicketDetails = ({ ticket, onBack, onUpdate }) => {
  const { user } = useAuth();
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingReplies, setFetchingReplies] = useState(true);

  useEffect(() => {
    fetchReplies();
  }, [ticket.id]);

  // Create a consistent UUID from local user ID
  const createUserUUID = (localUserId: string) => {
    const hash = btoa(localUserId).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
  };

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_replies')
        .select(`
          *,
          users(username, role)
        `)
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setFetchingReplies(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!newReply.trim()) return;

    setLoading(true);
    try {
      const userUuid = createUserUUID(user.id);

      // Ensure user exists in users table
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: userUuid,
          username: user.username,
          email: user.email,
          role: user.role || 'customer'
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (userError) {
        console.error('Error upserting user:', userError);
      }

      const { error } = await supabase
        .from('ticket_replies')
        .insert([{
          id: crypto.randomUUID(),
          ticket_id: ticket.id,
          user_id: userUuid,
          message: newReply.trim(),
          is_admin_reply: false,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setNewReply('');
      fetchReplies();
      toast({
        title: "Reply sent",
        description: "Your reply has been added to the ticket.",
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
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

  const getRoleBadge = (role) => {
    switch (role) {
      case 'root':
        return <Badge className="bg-red-500 text-white">System ✓</Badge>;
      case 'owner':
        return <Badge className="bg-blue-500 text-white">Owner ✓</Badge>;
      case 'manager':
        return <Badge className="bg-purple-500 text-white">Manager</Badge>;
      case 'developer':
        return <Badge className="bg-orange-500 text-white">Developer</Badge>;
      case 'customer':
        return <Badge className="bg-green-500 text-white">Customer</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
        </div>

        {/* Ticket Header */}
        <Card className="glass border-border/50 shadow-xl mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-foreground text-2xl">{ticket.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  {getCategoryBadge(ticket.category)}
                  {getStatusBadge(ticket.status)}
                  {ticket.products && (
                    <Badge variant="outline" className="border-primary/20 text-primary">
                      {ticket.products.name}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Created: {new Date(ticket.created_at).toLocaleDateString()}</p>
                {ticket.closed_at && (
                  <p>Closed: {new Date(ticket.closed_at).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{ticket.description}</p>
            {ticket.close_reason && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">Close Reason:</p>
                <p className="text-sm text-destructive/80">{ticket.close_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Replies */}
        <Card className="glass border-border/50 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Replies ({replies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fetchingReplies ? (
              <div className="text-center py-8">
                <div className="loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            ) : replies.length > 0 ? (
              <div className="space-y-4">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-4 rounded-lg border ${
                      reply.is_admin_reply
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-background/50 border-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">
                          {reply.users?.username || 'Unknown User'}
                        </span>
                        {getRoleBadge(reply.users?.role)}
                        {reply.is_admin_reply && (
                          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Staff Reply
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(reply.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{reply.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No replies yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reply Form */}
        {ticket.status === 'open' ? (
          <Card className="glass border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-foreground">Add Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Type your reply here..."
                  className="bg-background/50 border-border/50 min-h-[120px]"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleReplySubmit}
                    disabled={loading || !newReply.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass border-border/50 shadow-xl">
            <CardContent className="py-8 text-center">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">This ticket is closed and cannot receive new replies.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TicketDetails;
