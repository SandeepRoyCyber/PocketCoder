import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet,
  Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import useAppStore from '../store/appStore';

const SUGGESTIONS = [
  "Medicine tracker for my mother, one tablet every 6 hours",
  "Track my maid Sunita's salary, leaves and advances",
  "Home grocery tracker for rice, dal, oil, sugar, tea",
  "Directory of trusted plumbers, electricians, carpenters",
  "Monthly bill tracker with due dates and amounts",
];

export default function HomeScreen({ navigation }) {
  const [prompt, setPrompt] = useState('');
  const {
    isGenerating,
    generationProgress,
    error,
    setPrompt: storeSetPrompt,
    setGenerating,
    addProgress,
    setError,
    addApp,
    apps
  } = useAppStore();

  async function handleCreate() {
    if (!prompt.trim()) {
      Alert.alert('Tell me what to build', 'Describe the app you need.');
      return;
    }

    setGenerating(true);
    storeSetPrompt(prompt);

    try {
      // Step 1 — Generate JSON schema
      addProgress('Understanding your idea...');
      const { generateApp } = require('../engine/inference');
      const result = await generateApp(prompt);

      if (result.error) {
        setError(result.error);
        return;
      }

      addProgress('Building your app...');

      // Step 2 — Generate HTML
      const { generateHTML } = require('../renderer/generateHTML');
      const html = generateHTML(result.schema);

      addProgress('Almost ready...');

      // Step 3 — Save and navigate
      const newApp = addApp(result.schema, html);
      setPrompt('');

      navigation.navigate('Preview', { app: newApp });

    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>⚡</Text>
          <Text style={styles.headerTitle}>PocketCoder</Text>
          <Text style={styles.headerSubtitle}>
            Describe what you need. Get a working app.
          </Text>
        </View>

        {/* Prompt Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>What do you want to build?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Track my mother's medicines every 6 hours..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={prompt}
            onChangeText={setPrompt}
            editable={!isGenerating}
          />

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createBtn, isGenerating && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.createBtnText}>✨ Create My App</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Generation Progress */}
        {isGenerating && (
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Building your app...</Text>
            {generationProgress.map((msg, i) => (
              <View key={i} style={styles.progressRow}>
                <Text style={styles.progressDot}>✓</Text>
                <Text style={styles.progressText}>{msg}</Text>
              </View>
            ))}
            <ActivityIndicator
              color="#6366F1"
              style={{ marginTop: 12 }}
            />
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity onPress={() => useAppStore.getState().clearError()}>
              <Text style={styles.errorRetry}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Suggestions */}
        {!isGenerating && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>Try these ideas</Text>
            {SUGGESTIONS.map((suggestion, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionChip}
                onPress={() => setPrompt(suggestion)}
              >
                <Text style={styles.suggestionText}>💡 {suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* My Apps */}
        {apps.length > 0 && (
          <View style={styles.appsSection}>
            <Text style={styles.appsTitle}>My Apps ({apps.length})</Text>
            {apps.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={styles.appCard}
                onPress={() => navigation.navigate('Preview', { app })}
              >
                <Text style={styles.appIcon}>{app.icon}</Text>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.name}</Text>
                  <Text style={styles.appDesc} numberOfLines={1}>
                    {app.description}
                  </Text>
                </View>
                <Text style={styles.appArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 20, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: 28, marginTop: 12 },
  headerEmoji: { fontSize: 48, marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1E1B4B' },
  headerSubtitle: { fontSize: 15, color: '#6B7280', marginTop: 4, textAlign: 'center' },

  inputCard: {
    backgroundColor: 'white', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, marginBottom: 16
  },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  textInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 14, fontSize: 15, color: '#111827', minHeight: 100,
    textAlignVertical: 'top', marginBottom: 16
  },
  createBtn: {
    backgroundColor: '#6366F1', borderRadius: 12,
    padding: 16, alignItems: 'center'
  },
  createBtnDisabled: { backgroundColor: '#A5B4FC' },
  createBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

  progressCard: {
    backgroundColor: '#EEF2FF', borderRadius: 16, padding: 20, marginBottom: 16
  },
  progressTitle: { fontSize: 15, fontWeight: '600', color: '#4F46E5', marginBottom: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  progressDot: { color: '#10B981', fontSize: 14, marginRight: 8 },
  progressText: { fontSize: 14, color: '#374151', flex: 1 },

  errorCard: {
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16,
    marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between'
  },
  errorText: { fontSize: 14, color: '#DC2626', flex: 1 },
  errorRetry: { fontSize: 14, color: '#6366F1', fontWeight: '600' },

  suggestionsSection: { marginBottom: 24 },
  suggestionsTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  suggestionChip: {
    backgroundColor: 'white', borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB'
  },
  suggestionText: { fontSize: 14, color: '#374151' },

  appsSection: { marginBottom: 24 },
  appsTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  appCard: {
    backgroundColor: 'white', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2
  },
  appIcon: { fontSize: 28, marginRight: 12 },
  appInfo: { flex: 1 },
  appName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  appDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  appArrow: { fontSize: 24, color: '#D1D5DB' }
});
