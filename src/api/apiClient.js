import { supabase } from '../lib/AuthContext';

const isAbortError = (error) => error?.name === 'AbortError' || String(error?.message || '').toLowerCase().includes('signal is aborted');

const applyFilters = (query, filters = {}) => {
  let nextQuery = query;

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (key === '$or' && Array.isArray(value)) {
      const orClauses = value
        .flatMap((clause) => Object.entries(clause || {}).map(([clauseKey, clauseValue]) => `${clauseKey}.eq.${clauseValue}`));

      if (orClauses.length > 0) {
        nextQuery = nextQuery.or(orClauses.join(','));
      }
      return;
    }

    if (value && typeof value === 'object' && Array.isArray(value.$in)) {
      nextQuery = nextQuery.in(key, value.$in);
      return;
    }

    nextQuery = nextQuery.eq(key, value);
  });

  return nextQuery;
};

const runOrderedQueryWithFallback = async (queryFactory, field, direction, limit) => {
  const execute = async (orderField) => queryFactory()
    .order(orderField, { ascending: direction })
    .limit(limit);

  let result = await execute(field);

  const shouldFallback = result.error?.code === '42703'
    || (field === 'created_at' && String(result.error?.message || '').toLowerCase().includes('created_at'));

  if (shouldFallback) {
    const fallbackField = field === 'created_at'
      ? 'created_date'
      : field === 'created_date'
        ? 'created_at'
        : null;

    if (fallbackField) {
      result = await execute(fallbackField);
    }
  }

  return result;
};

// Helper dla operacji na encjach
const createEntityHelper = (tableName) => ({
  async list(orderBy = '-created_at', limit = 1000) {
    const [field, direction] = orderBy.startsWith('-')
      ? [orderBy.slice(1), false]
      : [orderBy, true];

    const { data, error } = await runOrderedQueryWithFallback(
      () => supabase.from(tableName).select('*'),
      field,
      direction,
      limit
    );

    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async filter(filters = {}, orderBy = '-created_at', limit = 1000) {
    const [field, direction] = orderBy.startsWith('-')
      ? [orderBy.slice(1), false]
      : [orderBy, true];

    const { data, error } = await runOrderedQueryWithFallback(
      () => applyFilters(supabase.from(tableName).select('*'), filters),
      field,
      direction,
      limit
    );

    if (error) throw error;
    return data || [];
  },

  async create(data) {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async update(id, data) {
    const { data: result, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async delete(id) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
});

// Helper do wywoływania Supabase Edge Functions
const createFunctionHelper = () => ({
  async invoke(functionName, data = {}) {
    try {
      const { data: result, error } = await supabase.functions.invoke(functionName, {
        body: data
      });

      if (error) {
        const status = error?.context?.status;
        if (status === 404) {
          throw new Error(`Funkcja Supabase "${functionName}" nie jest wdrożona (404). Wdróż ją przed użyciem tej funkcji.`);
        }
        throw error;
      }
      return { data: result };
    } catch (error) {
      console.error(`Błąd funkcji ${functionName}:`, error);
      throw error;
    }
  }
});

// Helper autoryzacji — korzysta z supabase bezpośrednio
const createAuthHelper = () => ({
  async me() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      if (isAbortError(error)) return null;
      throw error;
    }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
});

// Helper do uploadu plików
const createStorageHelper = () => ({
  Core: {
    async UploadFile({ file }) {
      const fileName = `${Date.now()}-${file.name}`;
      const preferredBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'card-images';
      const buckets = [...new Set([preferredBucket, 'card-images', 'uploads'])];

      let lastError = null;

      for (const bucket of buckets) {
        const { error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

          return { file_url: publicUrl };
        }

        lastError = error;

        if (!String(error?.message || '').toLowerCase().includes('bucket')) {
          throw error;
        }
      }

      throw new Error('Bucket storage nie znaleziony. Utwórz bucket "card-images" (lub ustaw VITE_SUPABASE_STORAGE_BUCKET).');
    }
  }
});

// Placeholder logowania nawigacji
const createAppLogsHelper = () => ({
  async logUserInApp(pageName) {
    return { success: true };
  }
});

// Główny klient API
export const flipzApi = {
  entities: {
    CardListing: createEntityHelper('card_listings'),
    TradeOffer: createEntityHelper('trade_offers'),
    TradePayment: createEntityHelper('trade_payments'),
    ShippingLabel: createEntityHelper('shipping_labels'),
    User: createEntityHelper('profiles'),
    SubscriptionPlan: createEntityHelper('subscription_plans'),
    Message: createEntityHelper('messages'),
    Conversation: createEntityHelper('conversations'),
    TradeConversation: createEntityHelper('trade_conversations'),
    LikedListing: createEntityHelper('liked_listings'),
    TradeReview: createEntityHelper('trade_reviews'),
  },
  functions: createFunctionHelper(),
  auth: createAuthHelper(),
  integrations: createStorageHelper(),
  appLogs: createAppLogsHelper(),
};

// Eksport wstecznej kompatybilności (do usunięcia po pełnej migracji)
export const base44 = flipzApi;

export { supabase };
