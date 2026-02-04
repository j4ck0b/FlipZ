import { supabase } from '@/lib/AuthContext';

const parseSort = (sort) => {
  if (!sort) return null;
  const descending = sort.startsWith('-');
  return {
    column: descending ? sort.slice(1) : sort,
    ascending: !descending
  };
};

const runQuery = async (buildQuery, sort) => {
  const sortConfig = parseSort(sort);
  if (!sortConfig) {
    const { data, error } = await buildQuery();
    if (error) {
      console.error('Supabase query error:', error);
      return [];
    }
    return data || [];
  }

  const { column, ascending } = sortConfig;
  const primaryResult = await buildQuery().order(column, { ascending });
  if (!primaryResult.error) {
    return primaryResult.data || [];
  }

  const fallbackColumn = column === 'created_date' ? 'created_at' : column === 'created_at' ? 'created_date' : null;
  if (fallbackColumn) {
    const fallbackResult = await buildQuery().order(fallbackColumn, { ascending });
    if (!fallbackResult.error) {
      return fallbackResult.data || [];
    }
    console.error('Supabase query error:', primaryResult.error, fallbackResult.error);
    return [];
  }

  console.error('Supabase query error:', primaryResult.error);
  return [];
};

const createEntity = (tableName) => ({
  list: async (sort) => {
    const buildQuery = () => supabase.from(tableName).select('*');
    return runQuery(buildQuery, sort);
  },
  filter: async (query, sort) => {
    const buildQuery = () => {
      let req = supabase.from(tableName).select('*');
      if (query && Object.keys(query).length > 0) {
        req = req.match(query);
      }
      return req;
    };
    return runQuery(buildQuery, sort);
  },
  get: async (id) => {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
    if (error) {
      console.error('Supabase get error:', error);
      return null;
    }
    return data;
  },
  create: async (data) => {
    const { data: res, error } = await supabase.from(tableName).insert(data).select();
    if (error) {
      console.error('Supabase create error:', error);
      return null;
    }
    return res?.[0];
  },
  update: async (id, data) => {
    const { data: res, error } = await supabase.from(tableName).update(data).eq('id', id).select();
    if (error) {
      console.error('Supabase update error:', error);
      return null;
    }
    return res?.[0];
  },
  delete: async (id) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
      console.error('Supabase delete error:', error);
    }
  }
});

export const base44 = {
  auth: {
    // Sprawdza czy użytkownik jest zalogowany (TEGO BRAKOWAŁO)
    isAuthenticated: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    },
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
      window.location.href = '/login';
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
      window.location.href = '/login';
    },
    updateMe: async (updates) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Supabase auth error:', userError);
        return null;
      }

      const profilePayload = {
        id: user.id,
        email: user.email,
        ...updates
      };

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' })
        .select()
        .single();

      if (profileError) {
        console.error('Supabase profile update error:', profileError);
      }

      const metadataUpdates = {};
      if (updates?.full_name) metadataUpdates.full_name = updates.full_name;
      if (updates?.profile_picture) metadataUpdates.avatar_url = updates.profile_picture;
      if (Object.keys(metadataUpdates).length > 0) {
        const { error: metadataError } = await supabase.auth.updateUser({ data: metadataUpdates });
        if (metadataError) {
          console.error('Supabase metadata update error:', metadataError);
        }
      }

      return profileData || null;
    }
  },
  entities: {
    CardListing: createEntity('card_listings'),
    TradeOffer: createEntity('trade_offers'),
    TradeConversation: createEntity('trade_conversations'),
    Message: createEntity('messages'),
    LikedListing: createEntity('liked_listings'),
    User: createEntity('profiles'),
    TradePayment: createEntity('trade_payments'),
    ShippingLabel: createEntity('shipping_labels'),
    TradeReview: createEntity('trade_reviews'),
    SubscriptionPlan: createEntity('subscription_plans')
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
        const { data, error } = await supabase.storage.from('card-images').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('card-images').getPublicUrl(fileName);
        return { file_url: publicUrl };
      }
    }
  }
};
