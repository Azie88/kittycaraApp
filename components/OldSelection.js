import React, { useState,useRef,useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Font from 'expo-font';
import { updateProfile } from '../backend';
import { continueOnboarding } from '../onboarding';

const OldSelection = ({ navigation,route }) => {
  const { userId } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [age, setAge] = useState('');
  const [isAgeValid, setIsAgeValid] = useState(false);

  const handleAgeChange = (value) => {
    const numericValue = parseInt(value, 10);
    if (/^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && numericValue > 0 && numericValue <= 120) {
      setAge(value);
      setIsAgeValid(true);
    } else {
      setAge(value);
      setIsAgeValid(false);
    }
  };
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      'PlaypenSans': require('../assets/fonts/Playpen_Sans/PlaypenSans-VariableFont_wght.ttf'), // Assurez-vous que le chemin est correct
      'Poppins-Bold': require('../assets/fonts/SofadiOne-Regular.ttf'), // Assurez-vous que le chemin est correct
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);
  const onSubmitAge = async () => {
    if (!isAgeValid || isLoading) return;
    setIsLoading(true);

    try {
      // Appel à l'API pour mettre à jour le profil
      const user = await updateProfile({ age: Number(age) });
      continueOnboarding(navigation, user);
    } catch {
      Alert.alert('Unable to save', 'Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How old are you?</Text>
      <TextInput
        style={styles.input}
        placeholder="years old"
        keyboardType="numeric"
        value={age}
        onChangeText={handleAgeChange}
      />

      {/* Bouton "Next" */}
      <TouchableOpacity
        style={[styles.nextButton, isAgeValid ? styles.activeButton : styles.inactiveButton]}
        onPress={onSubmitAge}
        disabled={!isAgeValid || isLoading}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DADAE6',
  },
  title: {
    fontSize: 28,
    fontFamily: 'PlaypenSans', // Assurez-vous que cette police est bien chargée
    color: '#353b8f',
    marginBottom: 50,
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#353b8f',
    borderWidth: 2,
    borderRadius: 25,
    paddingLeft: 15,
    fontSize: 18,
    fontFamily: 'PlaypenSans', // Assurez-vous que cette police est bien chargée
    marginBottom: 20,
  },
  nextButton: {
    width: '80%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 50,
  },
  activeButton: {
    backgroundColor: '#353b8f', // Le bouton devient violet quand l'âge est valide
  },
  inactiveButton: {
    backgroundColor: '#E0E0E0', // Le bouton est grisé quand l'âge est invalide
  },
  nextButtonText: {
    fontSize: 18,
    fontFamily: 'PlaypenSans', // Assurez-vous que cette police est bien chargée
    color: '#fff',
  },
});

export default OldSelection;
