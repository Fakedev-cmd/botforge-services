
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Shield, Scale } from 'lucide-react';

interface TermsUpdate {
  id: string;
  content: string;
  updatedBy: string;
  updatedByRole: string;
  updatedAt: string;
}

const TermsOfService = () => {
  const [termsHistory, setTermsHistory] = useState<TermsUpdate[]>([]);

  useEffect(() => {
    const storedTerms = JSON.parse(localStorage.getItem('botforge_terms') || '[]');
    if (storedTerms.length === 0) {
      // Initialize with default terms
      const defaultTerms: TermsUpdate = {
        id: '1',
        content: `1. Acceptance of Terms
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
These terms may be updated by authorized personnel. Users will be notified of changes.`,
        updatedBy: 'Salisphere',
        updatedByRole: 'owner',
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('botforge_terms', JSON.stringify([defaultTerms]));
      setTermsHistory([defaultTerms]);
    } else {
      setTermsHistory(storedTerms.sort((a: TermsUpdate, b: TermsUpdate) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
    }
  }, []);

  const getRoleDisplay = (role: string, username: string) => {
    switch (role) {
      case 'root':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-blue-600/20 text-blue-200 border border-blue-600/50">System ✓</Badge>
          </div>
        );
      case 'owner':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/50">Owner ✓</Badge>
          </div>
        );
      case 'developer':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{username}</span>
            <Badge className="bg-blue-300/20 text-blue-200 border border-blue-300/50">Developer</Badge>
          </div>
        );
      default:
        return <span className="text-white font-medium">{username}</span>;
    }
  };

  const currentTerms = termsHistory[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Simplified background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-gray-800 p-3 rounded-full border border-blue-500/20">
                  <Scale className="h-12 w-12 text-blue-400" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-6 animate-fade-in">
              Terms of Service
            </h1>
            
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 blur-xl rounded-lg"></div>
              <p className="relative text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-gray-800/50 p-6 rounded-2xl border border-blue-500/20">
                Please read our <span className="text-blue-400 font-semibold">terms and conditions</span> carefully before using our 
                <span className="text-blue-300 font-semibold"> services</span>
              </p>
            </div>
          </div>

          <Card className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-blue-500/20 hover:border-blue-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-bold flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <span>Current Terms of Service</span>
              </CardTitle>
              {currentTerms && (
                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated: {new Date(currentTerms.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>by</span>
                    {getRoleDisplay(currentTerms.updatedByRole, currentTerms.updatedBy)}
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {currentTerms ? (
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                  {currentTerms.content}
                </div>
              ) : (
                <p className="text-gray-400">No terms of service available.</p>
              )}
            </CardContent>
          </Card>

          {termsHistory.length > 1 && (
            <Card className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-blue-500/20 hover:border-blue-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-bold flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <span>Terms History</span>
                </CardTitle>
                <p className="text-gray-400 text-lg">Previous versions of our terms of service</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {termsHistory.slice(1).map((terms, index) => (
                    <div key={terms.id} className="p-6 border border-blue-500/20 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium text-lg">Version {termsHistory.length - index - 1}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(terms.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>by</span>
                            {getRoleDisplay(terms.updatedByRole, terms.updatedBy)}
                          </div>
                        </div>
                      </div>
                      <details className="text-gray-400">
                        <summary className="cursor-pointer hover:text-white transition-colors duration-200 font-medium">View content</summary>
                        <div className="mt-3 text-sm whitespace-pre-wrap leading-relaxed">
                          {terms.content}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
