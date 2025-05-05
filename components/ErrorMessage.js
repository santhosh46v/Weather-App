import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={30} color="#ff6b6b" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: 'center',
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    marginHorizontal: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ErrorMessage;
