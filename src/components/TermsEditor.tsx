
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { FileText, Save } from 'lucide-react';
import ToSHistoryManager from './ToSHistoryManager';

interface TermsUpdate {
  id: string;
  content: string;
  updatedBy: string;
  updatedByRole: string;
  updatedAt: string;
}

const TermsEditor = () => {
  const { user } = useAuth();
  const [termsContent, setTermsContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const storedTerms = JSON.parse(localStorage.getItem('botforge_terms') || '[]');
    if (storedTerms.length > 0) {
      setTermsContent(storedTerms[0].content);
    } else {
      setTermsContent(`1. Acceptance of Terms
By using BotForge services, you agree to these terms and conditions.

2. Service Description
BotForge provides custom Discord bot development and related services.

3. User Responsibilities
- Provide accurate information when placing orders
- Maintain Discord account for product delivery
- Respect intellectual property rights

4. Payment Terms
- Prices are subject to change based on requirements
- Payment required before service delivery
- No refunds after service completion

5. Discord Integration
- Products delivered via Discord bot
- Must join our Discord server for delivery
- Provide valid Discord username for orders

6. Reviews and Feedback
- Only customers with delivered orders may leave reviews
- One review per delivered product
- Reviews must be honest and constructive

7. Privacy and Data
- We collect minimal necessary information
- Discord usernames stored for delivery purposes
- No personal data shared with third parties

8. Prohibited Activities
- Spam or abuse of services
- Reverse engineering of delivered products
- Violation of Discord Terms of Service

9. Limitation of Liability
BotForge is not liable for indirect damages or service interruptions.

10. Terms Updates
These terms may be updated by authorized personnel. Users will be notified of changes.`);
    }
  }, []);

  const handleUpdateTerms = () => {
    if (!user || (user.role !== 'owner' && user.role !== 'root')) return;
    
    if (!termsContent.trim()) {
      toast({
        title: "Empty Content",
        description: "Terms of Service cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    const newTermsUpdate: TermsUpdate = {
      id: Date.now().toString(),
      content: termsContent.trim(),
      updatedBy: user.username,
      updatedByRole: user.role,
      updatedAt: new Date().toISOString()
    };

    const currentTerms = JSON.parse(localStorage.getItem('botforge_terms') || '[]');
    const updatedTerms = [newTermsUpdate, ...currentTerms];
    
    localStorage.setItem('botforge_terms', JSON.stringify(updatedTerms));

    setIsUpdating(false);
    toast({
      title: "Terms Updated",
      description: "Terms of Service have been updated successfully.",
    });
  };

  if (!user || (user.role !== 'owner' && user.role !== 'root')) {
    return null;
  }

  return (
    <Tabs defaultValue="editor" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 bg-gray-700 border-gray-600">
        <TabsTrigger value="editor" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
          Edit Terms
        </TabsTrigger>
        <TabsTrigger value="history" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
          Version History
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="editor">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Edit Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Terms Content
              </label>
              <Textarea
                value={termsContent}
                onChange={(e) => setTermsContent(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-96"
                placeholder="Enter the terms of service content..."
              />
            </div>
            <Button
              onClick={handleUpdateTerms}
              disabled={isUpdating}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {isUpdating ? "Updating..." : "Update Terms"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="history">
        <ToSHistoryManager />
      </TabsContent>
    </Tabs>
  );
};

export default TermsEditor;
