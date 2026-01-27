import { createClient } from '@supabase/supabase-js'

// Dane Twojego projektu Supabase
const supabaseUrl = 'https://tazbxgi-suvkkogukmqbq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhemJ4Z2lzdXZra29ndWttcWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzEwNDIsImV4cCI6MjA4MzgwNzA0Mn0.wk8EWkJJxPU-blP8lMUX0x2ahKylhgLkkk98f9tauV0'

export const supabase = createClient(supabaseUrl, supabaseKey)

// To jest "mostek", który udaje Base44, żeby reszta Twojego kodu działała bez zmian
export const base44 = {
  auth: {
    me: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return {
        ...user,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        role: user.user_metadata?.role || 'user'
      };
    },
    logout: async (redirectUrl) => {
      await supabase.auth.signOut();
      if (redirectUrl) window.location.href = redirectUrl;
    },
    updateMe: async (data) => {
      const { data: updated, error } = await supabase.auth.updateUser({ data });
      if (error) throw error;
      return updated;
    }
  },
  entities: {
    CardListing: {
      filter: async (query) => {
        let req = supabase.from('card_listings').select('*');
        if (query) req = req.match(query);
        const { data } = await req.order('created_at', { ascending: false });
        return data || [];
      },
      create: async (data) => {
        const { data: created } = await supabase.from('card_listings').insert(data).select();
        return created?.[0];
      },
      update: async (id, data) => {
        const { data: updated } = await supabase.from('card_listings').update(data).eq('id', id).select();
        return updated?.[0];
      },
      delete: async (id) => {
        await supabase.from('card_listings').delete().eq('id', id);
      }
    },
    TradeOffer: {
      filter: async (query) => {
        let req = supabase.from('trade_offers').select('*');
        if (query) req = req.match(query);
        const { data } = await req.order('created_at', { ascending: false });
        return data || [];
      },
      create: async (data) => {
        const { data: created } = await supabase.from('trade_offers').insert(data).select();
        return created?.[0];
      },
      update: async (id, data) => {
        const { data: updated } = await supabase.from('trade_offers').update(data).eq('id', id).select();
        return updated?.[0];
      }
    }
  },
  functions: {
    invoke: async (name, body) => {
      return await supabase.functions.invoke(name, { body });
    }
  }
};
