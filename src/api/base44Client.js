import { createClient } from '@supabase/supabase-js'

// 1. DANE POŁĄCZENIA (Poprawiony adres bez myślnika!)
const supabaseUrl = 'https://tazbxgisuvkkogukmqbq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhemJ4Z2lzdXZra29ndWttcWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzEwNDIsImV4cCI6MjA4MzgwNzA0Mn0.wk8EWkJJxPU-blP8lMUX0x2ahKylhgLkkk98f9tauV0'

export const supabase = createClient(supabaseUrl, supabaseKey)

// 2. POMOCNIK DO TABEL (EMULATOR BASE44)
const createEntity = (tableName) => ({
  filter: async (query) => {
    let req = supabase.from(tableName).select('*');
    if (query) req = req.match(query);
    const { data } = await req.order('created_at', { ascending: false });
    return data || [];
  },
  get: async (id) => {
    const { data } = await supabase.from(tableName).select('*').eq('id', id).single();
    return data;
  },
  create: async (data) => {
    const { data: res } = await supabase.from(tableName).insert(data).select();
    return res?.[0];
  },
  update: async (id, data) => {
    const { data: res } = await supabase.from(tableName).update(data).eq('id', id).select();
    return res?.[0];
  },
  delete: async (id) => {
    await supabase.from(tableName).delete().eq('id', id);
  }
});

// 3. GŁÓWNY OBIEKT BASE44 (Dostosowany do Twojej strony)
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
    redirectToLogin: () => {
      window.location.href = '/Login';
    },
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.user;
    },
    signup: async (email, password, fullName) => {
      const { data, error } = await supabase.auth.signUp({
        email, 
        password,
        options: { data: { full_name: fullName } }
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
    CardListing: createEntity('card_listings'),
    TradeOffer: createEntity('trade_offers'),
    TradeConversation: createEntity('trade_conversations'),
    Message: createEntity('messages'),
    LikedListing: createEntity('liked_listings'),
    User: createEntity('profiles')
  },
  functions: {
    invoke: async (name, body) => {
      return await supabase.functions.invoke(name, { body });
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const fileName = `${Date.now()}-${file.name}`;
        // Wysyłamy do bucketu card-images (pamiętaj, aby go stworzyć w Supabase!)
        const { data, error } = await supabase.storage.from('card-images').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('card-images').getPublicUrl(fileName);
        return { file_url: publicUrl };
      }
    }
  }
};
