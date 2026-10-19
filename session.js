import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabase } from './lib/supabase';
import { getProfile } from './backend';
import { getDestination } from './onboarding';

const legacyKeys = ['authToken', 'token', 'Token', 'userName', 'userAge', 'userSex', 'userEmail', 'userPhone'];

export async function clearSession() {
  const { error } = await getSupabase().auth.signOut({ scope: 'local' });
  if (error) throw error;
  await AsyncStorage.multiRemove(legacyKeys);
}

export async function restoreSession() {
  await AsyncStorage.multiRemove(legacyKeys);
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) return { name: 'Home' };
  try {
    return getDestination(await getProfile());
  } catch (error) {
    if ([401, 403].includes(error.status) || error.code === 'refresh_token_not_found') {
      await clearSession();
    }
    // Preserve a valid session on temporary network/schema errors; login can retry.
    return { name: 'Login' };
  }
}
