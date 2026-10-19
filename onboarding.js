export function getDestination(user) {
  if (!user || user.id == null) throw new Error('Missing user profile');
  const params = { userId: user };
  const accepted = value => value === true || value === 1 || value === '1';
  if (!accepted(user.terme_condition) || !accepted(user.agree)) {
    return { name: 'TermsScreen', params };
  }
  if (!user.name?.trim()) return { name: 'NameSelection', params };
  if (!user.sex) return { name: 'GenderSelection', params };
  if (!user.age) return { name: 'OldSelection', params };
  return { name: 'WelcomeScreen', params };
}

export function continueOnboarding(navigation, user) {
  const destination = getDestination(user);
  navigation.reset({ index: 0, routes: [destination] });
}
