import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Bot } from 'lucide-react';


const DiscordManager = () => {
  const [discordMessage, setDiscordMessage] = useState('');
  const [discordUserId, setDiscordUserId] = useState('');

  const handleSendDiscordMessage = async () => {
    if (!discordMessage.trim() || !discordUserId.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a Discord User ID and message.',
        variant: 'destructive',
      });
      return;
    }

    try {
        const res = await fetch('http://localhost:5001/send-dm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: discordUserId.trim(),
          message: discordMessage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Unknown error');
      }

      toast({
        title: 'Success',
        description: 'Message sent via Discord bot!',
      });

      setDiscordMessage('');
      setDiscordUserId('');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: `Failed to send message: ${err.message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Discord Bot Management</CardTitle>
        <p className="text-gray-400">Send messages to a user via Discord ID</p>
        <p className="text-red-400">This feature is unstable, please use it only when truly needed.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Discord User ID
          </label>
          <Input
            value={discordUserId}
            onChange={(e) => setDiscordUserId(e.target.value)}
            placeholder="Enter user's Discord ID"
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Message Content
          </label>
          <Textarea
            value={discordMessage}
            onChange={(e) => setDiscordMessage(e.target.value)}
            placeholder="Enter your message here..."
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            rows={4}
          />
        </div>

        <Button
          onClick={handleSendDiscordMessage}
          disabled={!discordMessage.trim() || !discordUserId.trim()}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          <Bot className="mr-2 h-4 w-4" />
          Send Discord Message
        </Button>
      </CardContent>
    </Card>
  );
};

export default DiscordManager;
