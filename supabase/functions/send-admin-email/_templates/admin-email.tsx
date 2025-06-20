
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Img,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface AdminEmailProps {
  subject: string
  content: string
  senderUsername: string
  senderRole: string
  qrCodes?: Array<{
    id: string
    text: string
    size: number
  }>
}

export const AdminEmail = ({
  subject,
  content,
  senderUsername,
  senderRole,
  qrCodes = [],
}: AdminEmailProps) => {
  const formatContent = (text: string) => {
    // Convert **text** to bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert [color:#hexcode]text[/color] to colored text
    formatted = formatted.replace(/\[color:(#[0-9a-fA-F]{6})\](.*?)\[\/color\]/g, '<span style="color: $1">$2</span>');
    
    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'root':
        return { text: 'System', color: '#ef4444', icon: '👑' };
      case 'owner':
        return { text: 'Owner', color: '#3b82f6', icon: '✓' };
      case 'manager':
        return { text: 'Manager', color: '#8b5cf6', icon: '⚙️' };
      case 'developer':
        return { text: 'Developer', color: '#f97316', icon: '💻' };
      default:
        return { text: 'Customer', color: '#10b981', icon: '👤' };
    }
  };

  const roleInfo = getRoleDisplay(senderRole);

  const generateQRCodeUrl = (text: string, size: number) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=FFFFFF&color=000000&format=png&ecc=M`;
  };

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={brandTitle}>BotForge</Heading>
          </Section>

          {/* Sender Info */}
          <Section style={senderSection}>
            <Text style={senderText}>
              Email from <strong>{senderUsername}</strong>
            </Text>
            <div style={{
              ...roleBadge,
              backgroundColor: roleInfo.color,
            }}>
              <span style={roleIcon}>{roleInfo.icon}</span>
              <span style={roleText}>{roleInfo.text}</span>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Content */}
          <Section style={contentSection}>
            <div 
              style={contentText}
              dangerouslySetInnerHTML={{ __html: formatContent(content) }}
            />
          </Section>

          {/* QR Codes */}
          {qrCodes.length > 0 && (
            <>
              <Hr style={divider} />
              <Section style={qrSection}>
                <Heading style={qrTitle}>QR Codes</Heading>
                <div style={qrContainer}>
                  {qrCodes.map((qr) => (
                    <div key={qr.id} style={qrCodeBlock}>
                      <Img
                        src={generateQRCodeUrl(qr.text, qr.size)}
                        alt="QR Code"
                        style={{ width: qr.size, height: qr.size, margin: '0 auto' }}
                      />
                      <Text style={qrFooter}>BotForge</Text>
                    </div>
                  ))}
                </div>
              </Section>
            </>
          )}

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent from BotForge Admin Panel
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminEmail;

// Styles
const main = {
  backgroundColor: '#0f0f23',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: '#ffffff',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const brandTitle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#6366f1',
  margin: '0',
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const senderSection = {
  marginBottom: '20px',
  textAlign: 'left' as const,
};

const senderText = {
  fontSize: '18px',
  margin: '0 0 10px 0',
  color: '#e2e8f0',
};

const roleBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#ffffff',
};

const roleIcon = {
  fontSize: '12px',
};

const roleText = {
  fontSize: '12px',
};

const divider = {
  borderColor: '#374151',
  margin: '20px 0',
};

const contentSection = {
  margin: '20px 0',
};

const contentText = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#e2e8f0',
  margin: '0',
};

const qrSection = {
  margin: '20px 0',
  textAlign: 'center' as const,
};

const qrTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#e2e8f0',
  marginBottom: '15px',
};

const qrContainer = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  justifyContent: 'center',
  gap: '20px',
};

const qrCodeBlock = {
  textAlign: 'center' as const,
  margin: '10px',
};

const qrFooter = {
  fontSize: '12px',
  color: '#9ca3af',
  marginTop: '8px',
  fontWeight: '500',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '30px',
};

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
};
