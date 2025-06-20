
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, Bold, Palette, QrCode, Trash2, ShieldCheck, Settings, Crown, User, Plus, Eye, X } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface QRCodeData {
  id: string;
  text: string;
  size: number;
}

const EmailComposer = () => {
  const { user, getAllUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [customEmail, setCustomEmail] = useState('');
  const [useCustomEmail, setUseCustomEmail] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      
      // Try Supabase first
      const { data: supabaseUsers, error } = await supabase
        .from('users')
        .select('id, username, email, role')
        .order('username');

      if (error) {
        console.error('Supabase error:', error);
      }

      console.log('Supabase users:', supabaseUsers);

      // Always get local users as well
      const localUsers = getAllUsers();
      console.log('Local users:', localUsers);

      // Combine and deduplicate users
      const allUsers = [];
      
      // Add Supabase users
      if (supabaseUsers && supabaseUsers.length > 0) {
        allUsers.push(...supabaseUsers);
      }
      
      // Add local users that aren't already in Supabase
      if (localUsers && localUsers.length > 0) {
        for (const localUser of localUsers) {
          const existsInSupabase = allUsers.some(su => su.username === localUser.username);
          if (!existsInSupabase) {
            allUsers.push({
              id: `local-${localUser.id}`,
              username: localUser.username,
              email: localUser.email || `${localUser.username}@local.dev`,
              role: localUser.role
            });
          }
        }
      }

      console.log('Final users list:', allUsers);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to local users only
      const localUsers = getAllUsers();
      if (localUsers && localUsers.length > 0) {
        const mappedUsers = localUsers.map(localUser => ({
          id: `local-${localUser.id}`,
          username: localUser.username,
          email: localUser.email || `${localUser.username}@local.dev`,
          role: localUser.role
        }));
        setUsers(mappedUsers);
      }
    }
  };

  const addQRCode = () => {
    const newQR: QRCodeData = {
      id: Date.now().toString(),
      text: '',
      size: 150
    };
    setQrCodes([...qrCodes, newQR]);
  };

  const updateQRCode = (id: string, field: keyof QRCodeData, value: string | number) => {
    setQrCodes(qrCodes.map(qr => 
      qr.id === id ? { ...qr, [field]: value } : qr
    ));
  };

  const removeQRCode = (id: string) => {
    setQrCodes(qrCodes.filter(qr => qr.id !== id));
  };

  const insertFormatting = (format: string, color?: string) => {
    const textarea = document.querySelector('#email-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    
    if (format === 'bold') {
      formattedText = `**${selectedText}**`;
    } else if (format === 'color' && color) {
      formattedText = `[color:${color}]${selectedText}[/color]`;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const formatContentForPreview = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[color:(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|[a-zA-Z]+)\](.*?)\[\/color\]/g, '<span style="color: $1">$2</span>')
      .replace(/\n/g, '<br>');
  };

  const handleSendEmail = async () => {
    let emailToUse = '';
    
    if (useCustomEmail) {
      emailToUse = customEmail;
    } else {
      const selectedUserData = users.find(u => u.id === selectedUser);
      emailToUse = selectedUserData?.email || '';
    }
    
    if (!emailToUse || !subject.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToUse)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowPreview(true);
    
    try {
      const emailData = {
        to: emailToUse,
        subject,
        content,
        senderUsername: user.username,
        senderRole: user.role,
        qrCodes: qrCodes.filter(qr => qr.text.trim())
      };

      console.log('Sending email with data:', emailData);

      const { data, error } = await supabase.functions.invoke('send-admin-email', {
        body: emailData
      });

      if (error) throw error;

      const recipientName = useCustomEmail ? emailToUse : users.find(u => u.id === selectedUser)?.username || emailToUse;

      toast({
        title: "Email Sent",
        description: `Email sent successfully to ${recipientName}`,
      });

      // Reset form
      setSelectedUser('');
      setCustomEmail('');
      setUseCustomEmail(false);
      setSubject('');
      setContent('');
      setQrCodes([]);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Email Preview",
        description: "Preview generated (email function temporarily disabled)",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'root':
        return <Crown className="h-3 w-3" />;
      case 'owner':
        return <ShieldCheck className="h-3 w-3" />;
      case 'manager':
        return <Settings className="h-3 w-3" />;
      case 'developer':
        return <User className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "flex items-center gap-1 text-xs";
    switch (role) {
      case 'root':
        return <Badge className={`${baseClasses} bg-blue-600/30 text-blue-200 border border-blue-600/50`}>System {getRoleIcon(role)}</Badge>;
      case 'owner':
        return <Badge className={`${baseClasses} bg-blue-500/30 text-blue-300 border border-blue-500/50`}>Owner {getRoleIcon(role)}</Badge>;
      case 'manager':
        return <Badge className={`${baseClasses} bg-blue-400/30 text-blue-300 border border-blue-400/50`}>Manager {getRoleIcon(role)}</Badge>;
      case 'developer':
        return <Badge className={`${baseClasses} bg-blue-300/30 text-blue-200 border border-blue-300/50`}>Developer</Badge>;
      default:
        return <Badge className={`${baseClasses} bg-blue-200/30 text-blue-100 border border-blue-200/50`}>Customer</Badge>;
    }
  };

  if (!user || (user.role !== 'owner' && user.role !== 'root' && user.role !== 'manager')) {
    return null;
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Email Composer */}
      <div className={`${showPreview ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
        <Card className="bg-gray-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center">
              <Mail className="mr-3 h-6 w-6" />
              Send Admin Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Type Selection */}
            <div className="space-y-4">
              <Label>Email Recipient *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!useCustomEmail ? "default" : "outline"}
                  onClick={() => setUseCustomEmail(false)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Select User
                </Button>
                <Button
                  type="button"
                  variant={useCustomEmail ? "default" : "outline"}
                  onClick={() => setUseCustomEmail(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Custom Email
                </Button>
              </div>
            </div>

            {/* User Selection or Custom Email Input */}
            {useCustomEmail ? (
              <div className="space-y-2">
                <Label htmlFor="custom-email">Email Address *</Label>
                <Input
                  id="custom-email"
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Enter custom email address"
                  className="bg-background/50 border-blue-500/30"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="user-select">Select User *</Label>
                {users.length === 0 ? (
                  <div className="p-4 border border-blue-500/20 rounded-lg bg-background/30 text-center">
                    <p className="text-blue-300">No users found. You can use custom email instead.</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={fetchUsers}
                      className="mt-2"
                    >
                      Retry Loading Users
                    </Button>
                  </div>
                ) : (
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="bg-background/50 border-blue-500/30">
                      <SelectValue placeholder="Choose a user to email..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-blue-500/30 max-h-60 overflow-y-auto">
                      {users.map((userData) => (
                        <SelectItem key={userData.id} value={userData.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{userData.username} ({userData.email})</span>
                            <div className="ml-2">
                              {getRoleBadge(userData.role)}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="bg-background/50 border-blue-500/30"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-content">Email Content *</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertFormatting('bold')}
                    className="h-8 px-2"
                  >
                    <Bold className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertFormatting('color', '#ef4444')}
                    className="h-8 px-2 text-red-500"
                  >
                    <Palette className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertFormatting('color', '#3b82f6')}
                    className="h-8 px-2 text-blue-500"
                  >
                    <Palette className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertFormatting('color', '#10b981')}
                    className="h-8 px-2 text-green-500"
                  >
                    <Palette className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Textarea
                id="email-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your email content here... Use **text** for bold, [color:#ff0000]text[/color] for colors"
                className="bg-background/50 border-blue-500/30 min-h-[200px]"
              />
              <div className="text-sm text-blue-300">
                Formatting tips: Use **text** for bold, [color:#ff0000]text[/color] for colored text
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>QR Codes (Optional)</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addQRCode}
                  className="flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Add QR Code
                </Button>
              </div>
              
              {qrCodes.map((qr, index) => (
                <div key={qr.id} className="p-4 border border-blue-500/20 rounded-lg bg-background/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">QR Code #{index + 1}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeQRCode(qr.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Content</Label>
                      <Input
                        value={qr.text}
                        onChange={(e) => updateQRCode(qr.id, 'text', e.target.value)}
                        placeholder="QR code content (URL, text, etc.)"
                        className="bg-background/50 border-blue-500/30"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Size (px)</Label>
                      <Input
                        type="number"
                        value={qr.size}
                        onChange={(e) => updateQRCode(qr.id, 'size', parseInt(e.target.value) || 150)}
                        min="100"
                        max="300"
                        className="bg-background/50 border-blue-500/30"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSendEmail}
                disabled={loading || (!useCustomEmail && !selectedUser) || (useCustomEmail && !customEmail.trim()) || !subject.trim() || !content.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? 'Sending...' : 'Send Email'}
              </Button>
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Preview Panel */}
      {showPreview && (
        <div className="w-1/2 transition-all duration-300">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-xl flex items-center">
                  <Eye className="mr-3 h-5 w-5" />
                  Email Preview
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-6 rounded-lg text-gray-900 space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>From:</strong> BotForge &lt;onboarding@resend.dev&gt;
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>To:</strong> {
                      useCustomEmail 
                        ? customEmail 
                        : users.find(u => u.id === selectedUser)?.email || 'No recipient selected'
                    }
                  </div>
                  <div className="text-lg font-semibold">
                    <strong>Subject:</strong> [BotForge] {subject || 'No subject'}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <strong>Sender:</strong> {user.username} ({user.role})
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: formatContentForPreview(content) || '<em>No content</em>' }} />
                  </div>
                  
                  {qrCodes.filter(qr => qr.text.trim()).length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-semibold mb-2">QR Codes:</h4>
                      <div className="space-y-2">
                        {qrCodes.filter(qr => qr.text.trim()).map((qr, index) => (
                          <div key={qr.id} className="bg-gray-100 p-3 rounded border">
                            <div className="text-xs text-gray-600">QR Code #{index + 1}</div>
                            <div className="text-sm">{qr.text}</div>
                            <div className="text-xs text-gray-500">Size: {qr.size}px</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmailComposer;
