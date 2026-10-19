import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

let client;
export function getSupabase() {
  if (client) return client;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || url.includes('your-project') || key.includes('your-publishable')) {
    throw new Error('Supabase is not configured. Follow SUPABASE_SETUP.md and restart Expo.');
  }
  if (!key.startsWith('sb_publishable_')) {
    throw new Error('Use the Supabase publishable key (sb_publishable_), never a secret or service-role key.');
  }
  client = createClient(url, key, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

export function startSessionRefresh() {
  const supabase = getSupabase();
  if (Platform.OS === 'web') return () => {};
  const refresh = state => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  };
  refresh(AppState.currentState);
  const subscription = AppState.addEventListener('change', refresh);
  return () => {
    subscription.remove();
    supabase.auth.stopAutoRefresh();
  };
}
