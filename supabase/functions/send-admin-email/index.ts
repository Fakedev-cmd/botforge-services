
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { AdminEmail } from './_templates/admin-email.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  senderUsername: string;
  senderRole: string;
  qrCodes?: Array<{
    id: string;
    text: string;
    size: number;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, content, senderUsername, senderRole, qrCodes = [] }: EmailRequest = await req.json();

    console.log('Sending admin email to:', to);
    console.log('From:', senderUsername, 'Role:', senderRole);

    // Render the email template
    const html = await renderAsync(
      React.createElement(AdminEmail, {
        subject,
        content,
        senderUsername,
        senderRole,
        qrCodes,
      })
    );

    // Send the email
    const emailResponse = await resend.emails.send({
      from: 'BotForge <onboarding@resend.dev>',
      to: [to],
      subject: `[BotForge] ${subject}`,
      html,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-admin-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
