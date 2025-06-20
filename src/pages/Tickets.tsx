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


interface Product {
  name: string;
}

interface TicketReply {
  id: string; 
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | string; // Puoi tipizzare meglio i possibili stati
  category: 'Account' | 'Orders' | 'Other' | string; // Puoi tipizzare meglio le possibili categorie
  created_at: string;
  products: Product | null; // La relazione product può essere presente o meno
  ticket_replies: TicketReply[] | null; // Le risposte possono essere un array o null
  reply_count?: number; // Aggiunto per il conteggio delle risposte calcolato
}

// --- Componente Principale ---

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]); // Tipizzato lo stato dei ticket
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null); // Tipizzato il ticket selezionato
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Tipizzato lo stato di errore

  useEffect(() => {
    if (user) {
      fetchTickets();
    } else {
      setLoading(false);
      setTickets([]);
      // Considera di mostrare un avviso o reindirizzare se l'utente non è loggato
    }
  }, [user]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usiamo 'as any' temporaneamente per superare i problemi di tipizzazione complessi di select Supabase
      // In un progetto più grande, potresti voler tipizzare la risposta di Supabase in modo più rigoroso
      const { data, error: supabaseError } = await supabase
        .from('tickets')
        .select(`
          *,
          products(name),
          ticket_replies(id)
        `) as { data: Ticket[] | null, error: any }; // Tipizzazione del risultato

      if (supabaseError) {
        throw supabaseError;
      }

      const formattedTickets: Ticket[] = (data || []).map(ticket => ({
        ...ticket,
        reply_count: ticket.ticket_replies ? ticket.ticket_replies.length : 0
      }));

      setTickets(formattedTickets);
    } catch (err: any) { // Tipizzato l'errore come 'any' per accedere a .message
      console.error('Errore nel caricamento dei ticket:', err);
      setError("Impossibile caricare i ticket. Per favore, riprova.");
      toast({
        title: "Errore",
        description: `Impossibile caricare i ticket: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => { // Tipizzato il parametro
    switch (status) {
      case 'open':
        return <Badge className="bg-green-500 text-white">Aperto</Badge>;
      case 'closed':
        return <Badge variant="destructive">Chiuso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => { // Tipizzato il parametro
    const colors: { [key: string]: string } = { // Tipizzato l'oggetto colors
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
          <h1 className="text-5xl font-bold gradient-text mb-4">Ticket di Supporto</h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Ricevi aiuto per il tuo account, ordini o altri problemi
          </p>
        </div>

        <div className="mb-8 flex justify-between items-center">
          <div className="flex space-x-4">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              <Clock className="h-3 w-3 mr-1" />
              {tickets.filter(t => t.status === 'open').length} Aperti
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              {tickets.filter(t => t.status === 'closed').length} Chiusi
            </Badge>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-primary hover:bg-primary/90 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Ticket
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p className="text-muted-foreground mt-4">Caricamento ticket...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>{error}</p>
            <Button onClick={fetchTickets} className="mt-4">Riprova a caricare i Ticket</Button>
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
                        {ticket.products && ticket.products.name && (
                          <span>Prodotto: {ticket.products.name}</span>
                        )}
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{ticket.reply_count} risposte</span>
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
            <p className="text-muted-foreground text-lg">Nessun ticket ancora</p>
            <p className="text-muted-foreground/70">Crea il tuo primo ticket di supporto per ricevere aiuto</p>
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