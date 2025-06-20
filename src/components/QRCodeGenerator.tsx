
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { QrCode, Download } from 'lucide-react';

const QRCodeGenerator = () => {
  const [url, setUrl] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [settings, setSettings] = useState({
    size: 200,
    format: 'png',
    errorCorrection: 'M',
    margin: 1
  });

  const generateQRCode = () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to generate QR code.",
        variant: "destructive",
      });
      return;
    }

    // Create QR code with fixed cyan colors
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${settings.size}x${settings.size}&data=${encodeURIComponent(url)}&color=00b4d8&bgcolor=1f2937&qzone=${settings.margin}&format=${settings.format}&ecc=${settings.errorCorrection}`;
    setQrCodeData(qrApiUrl);

    toast({
      title: "QR Code Generated",
      description: "Your cyan QR code has been generated successfully.",
    });
  };

  const downloadQRCode = () => {
    if (!qrCodeData) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const totalHeight = settings.size + 70;
      canvas.width = settings.size + 50;
      canvas.height = totalHeight;
      
      // Set background
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR code
      const qrX = (canvas.width - settings.size) / 2;
      const qrY = 25;
      ctx.drawImage(img, qrX, qrY, settings.size, settings.size);
      
      // Add botforge text
      ctx.fillStyle = '#00b4d8';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('botforge', canvas.width / 2, settings.size + 45);
      
      // Download
      const link = document.createElement('a');
      link.download = `botforge-qr-${Date.now()}.${settings.format}`;
      link.href = canvas.toDataURL(`image/${settings.format}`);
      link.click();
    };
    
    img.crossOrigin = 'anonymous';
    img.src = qrCodeData;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="bg-card/50 backdrop-blur-sm border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center text-2xl">
            <QrCode className="mr-3 h-6 w-6 text-primary" />
            QR Code Generator
          </CardTitle>
          <p className="text-muted-foreground">Generate cyan QR codes with BotForge branding</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-foreground text-sm font-medium">URL to encode</Label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-foreground text-sm font-medium">Size</Label>
              <Slider
                value={[settings.size]}
                onValueChange={(value) => setSettings({...settings, size: value[0]})}
                max={400}
                min={100}
                step={10}
                className="mt-3"
              />
              <span className="text-muted-foreground text-xs mt-1 block">{settings.size}px</span>
            </div>
            <div>
              <Label className="text-foreground text-sm font-medium">Format</Label>
              <Select value={settings.format} onValueChange={(value) => setSettings({...settings, format: value})}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="svg">SVG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generateQRCode}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200"
          >
            <QrCode className="mr-2 h-4 w-4" />
            Generate QR Code
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center text-2xl">
            <Download className="mr-3 h-6 w-6 text-primary" />
            Preview
          </CardTitle>
          <p className="text-muted-foreground">Live preview of your QR code</p>
        </CardHeader>
        <CardContent>
          {qrCodeData ? (
            <div className="text-center space-y-6">
              <div className="inline-block p-6 rounded-xl shadow-2xl bg-gray-800">
                <img 
                  src={qrCodeData} 
                  alt="Generated QR Code" 
                  className="mx-auto rounded"
                />
                <p className="font-bold mt-4 text-primary text-lg">
                  botforge
                </p>
              </div>
              
              <Button
                onClick={downloadQRCode}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-200"
              >
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
              
              <div className="text-left space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-foreground font-medium">QR Code Details:</h4>
                <p className="text-muted-foreground text-sm">Size: {settings.size}x{settings.size}px</p>
                <p className="text-muted-foreground text-sm">Format: {settings.format.toUpperCase()}</p>
                <p className="text-muted-foreground text-sm">Colors: Cyan on Dark Gray</p>
                <p className="text-muted-foreground text-sm">URL: {url}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <QrCode className="mx-auto h-20 w-20 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Enter a URL and click "Generate QR Code" to see your preview</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeGenerator;
