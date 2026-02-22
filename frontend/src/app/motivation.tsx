import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MotivationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Educational Resources</Text>
      <Text style={styles.placeholder}>Resources screen coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#6b7280',
  },
});
