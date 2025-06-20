
-- Check if policies exist and create only the missing ones

-- Create policy for users to create their own tickets (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tickets' 
        AND policyname = 'Users can create their own tickets'
    ) THEN
        CREATE POLICY "Users can create their own tickets" 
          ON public.tickets 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Create policy for users to update their own tickets (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tickets' 
        AND policyname = 'Users can update their own tickets'
    ) THEN
        CREATE POLICY "Users can update their own tickets" 
          ON public.tickets 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Enable RLS on ticket_replies if not already enabled
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view replies to their tickets (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ticket_replies' 
        AND policyname = 'Users can view replies to their tickets'
    ) THEN
        CREATE POLICY "Users can view replies to their tickets" 
          ON public.ticket_replies 
          FOR SELECT 
          USING (EXISTS (
            SELECT 1 FROM public.tickets 
            WHERE tickets.id = ticket_replies.ticket_id 
            AND tickets.user_id = auth.uid()
          ) OR ticket_replies.user_id = auth.uid());
    END IF;
END $$;

-- Create policy for users to create replies (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ticket_replies' 
        AND policyname = 'Users can create replies'
    ) THEN
        CREATE POLICY "Users can create replies" 
          ON public.ticket_replies 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
