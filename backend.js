import { getSupabase } from './lib/supabase';

const profileColumns = 'id,name,sex,age,terme_condition,agree';

function emailCredentials(email, password) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('Please enter a valid email address. Phone login is not enabled.');
  }
  return { email: normalized, password };
}

async function authenticatedUser() {
  const { data, error } = await getSupabase().auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Please log in again.');
  return data.user;
}

export async function getProfile() {
  const supabase = getSupabase();
  const user = await authenticatedUser();
  // Ignore existing rows so a resumed session never overwrites completed onboarding.
  const { error: insertError } = await supabase.from('profiles').upsert(
    { id: user.id }, { onConflict: 'id', ignoreDuplicates: true }
  );
  if (insertError) throw insertError;
  const { data, error } = await supabase.from('profiles').select(profileColumns).eq('id', user.id).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(changes) {
  const user = await authenticatedUser();
  const permitted = ['name', 'sex', 'age', 'terme_condition', 'agree'];
  if (!Object.keys(changes).length || Object.keys(changes).some(key => !permitted.includes(key))) {
    throw new Error('Invalid profile update.');
  }
  const { data, error } = await getSupabase().from('profiles')
    .update(changes).eq('id', user.id).select(profileColumns).single();
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { error } = await getSupabase().auth.signInWithPassword(emailCredentials(email, password));
  if (error) throw error;
  return getProfile();
}

export async function signUp(email, password) {
  const { data, error } = await getSupabase().auth.signUp(emailCredentials(email, password));
  if (error) throw error;
  // With email confirmation enabled there is no authenticated session yet.
  if (!data.session) return null;
  return getProfile();
}
