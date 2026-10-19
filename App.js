import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import Home from './components/Home'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import  Toast from 'react-native-toast-message';
import Register from './components/Register';
import Login from './components/Login';
import Info from './components/Info';
import ChatPage from './components/ChatPage';
import TermsScreen from './components/TermsScreen';
import * as Font from 'expo-font';
import GenderSelection from './components/GenderSelection';
import OldSelection from './components/OldSelection';
import WelcomeScreen from './components/WelcomeScreen';
import { restoreSession } from './session';
import { startSessionRefresh } from './lib/supabase';
import NameSelection from './components/NameSelection';

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState({ name: 'Home' });
  const [startupError, setStartupError] = useState(false);

  useEffect(() => {
    let active = true;
    let stopRefresh = () => {};
    async function initialize() {
      try {
        stopRefresh = startSessionRefresh();
        const [, destination] = await Promise.all([
          Font.loadAsync({
            PlaypenSans: require('./assets/fonts/Playpen_Sans/PlaypenSans-VariableFont_wght.ttf'),
            'Poppins-Bold': require('./assets/fonts/SofadiOne-Regular.ttf'),
          }),
          restoreSession(),
        ]);
        if (active) setInitialRoute(destination);
      } catch (error) {
        if (active) setStartupError(error.message || 'Unable to load the app.');
      } finally {
        if (active) setReady(true);
      }
    }
    initialize();
    return () => { active = false; stopRefresh(); };
  }, []);

  if (!ready) return <View style={styles.container}><ActivityIndicator /></View>;
  if (startupError) return <View style={styles.container}><Text>{startupError}</Text></View>;
  return (
    // <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute.name}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#353b8f',
            },
            headerTintColor: '#FFF',
            headerBackTitle: 'Back',
            headerTitleAlign: 'center',
          }}
        >
          <Stack.Screen
           options={{ title: '', animation: 'slide_from_bottom' }}
          name="Home" initialParams={initialRoute.name === "Home" ? initialRoute.params : undefined} component={Home} />
          <Stack.Screen
           options={{ title: '', animation: 'slide_from_bottom' }}
          name="Login" initialParams={initialRoute.name === "Login" ? initialRoute.params : undefined} component={Login}  />
           <Stack.Screen
           options={{ title: '', animation: 'slide_from_bottom' }}
          name="Register" initialParams={initialRoute.name === "Register" ? initialRoute.params : undefined} component={Register}  />
          <Stack.Screen
           options={{ title: 'Information', animation: 'slide_from_bottom' }}
          name="Info" initialParams={initialRoute.name === "Info" ? initialRoute.params : undefined} component={Info} />
            <Stack.Screen
           options={{ title: '', animation: 'slide_from_bottom' }}
          name="ChatPage" initialParams={initialRoute.name === "ChatPage" ? initialRoute.params : undefined} component={ChatPage} />
          <Stack.Screen
            options={{ title: 'Terms ', animation: 'slide_from_bottom' }}
            name="TermsScreen" initialParams={initialRoute.name === "TermsScreen" ? initialRoute.params : undefined} component={TermsScreen}
          />
          <Stack.Screen
            options={{ title: '', animation: 'slide_from_bottom' }}
            name="GenderSelection" initialParams={initialRoute.name === "GenderSelection" ? initialRoute.params : undefined} component={GenderSelection}
          />
               <Stack.Screen
            options={{ title: '', animation: 'slide_from_bottom' }}
            name="OldSelection" initialParams={initialRoute.name === "OldSelection" ? initialRoute.params : undefined} component={OldSelection}
          />
           <Stack.Screen
            options={{ title: '', animation: 'slide_from_bottom' }}
            name="WelcomeScreen" initialParams={initialRoute.name === "WelcomeScreen" ? initialRoute.params : undefined} component={WelcomeScreen}
          />
           <Stack.Screen
            options={{ title: '', animation: 'slide_from_bottom' }}
            name="NameSelection" initialParams={initialRoute.name === "NameSelection" ? initialRoute.params : undefined} component={NameSelection}
          />
        </Stack.Navigator>
        <Toast/>
      </NavigationContainer>
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
