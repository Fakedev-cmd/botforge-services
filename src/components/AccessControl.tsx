
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

interface AccessControlProps {
  onAccessGranted: () => void;
}

const AccessControl = ({ onAccessGranted }: AccessControlProps) => {
  const [accessCode, setAccessCode] = useState('');

  const handleAccessCodeSubmit = () => {
    if (accessCode === 'ninnicornuto011') {
      onAccessGranted();
      toast({
        title: "Access Granted",
        description: "Welcome to the admin panel!",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid access code.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center">
            <Shield className="mr-2 h-5 w-5" />
            Admin Access Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Access Code
            </label>
            <Input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter access code"
              onKeyPress={(e) => e.key === 'Enter' && handleAccessCodeSubmit()}
            />
          </div>
          <Button 
            onClick={handleAccessCodeSubmit}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
          >
            Submit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessControl;
