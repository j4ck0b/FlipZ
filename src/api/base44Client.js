import { createClient } from '@supabase/supabase-js'

// Dane Twojego projektu z Supabase
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
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        role: user.user_metadata?.role || 'user'
      };
    },
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.user;
    },
    signup: async (email, password, fullName) => {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName } }
      });
      if (error) throw error;
      return data.user;
    },
    logout: async () => {
      await supabase.auth.signOut();
      window.location.href = '/Login';
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
        const { data: res } = await supabase.from('card_listings').insert(data).select();
        return res?.[0];
      },
      update: async (id, data) => {
        const { data: res } = await supabase.from('card_listings').update(data).eq('id', id).select();
        return res?.[0];
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
        const { data: res } = await supabase.from('trade_offers').insert(data).select();
        return res?.[0];
      }
    }
  },
  functions: {
    invoke: async (name, body) => {
      const { data } = await supabase.functions.invoke(name, { body });
      return { data };
    }
  }
};
