import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Share, ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import useAppStore from '../store/appStore';

export default function PreviewScreen({ route, navigation }) {
  const { app } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const { deleteApp } = useAppStore();

  function handleDelete() {
    Alert.alert(
      'Delete App',
      `Are you sure you want to delete "${app.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteApp(app.id);
            navigation.goBack();
          }
        }
      ]
    );
  }

  function handleShare() {
    Share.share({
      message: `Check out my app "${app.name}" built with PocketCoder ⚡`,
      title: app.name
    });
  }

  return (
    <View style={styles.container}>

      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: app.color }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.appTitleRow}>
          <Text style={styles.appIcon}>{app.icon}</Text>
          <Text style={styles.appTitle} numberOfLines={1}>{app.name}</Text>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* WebView */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading your app...</Text>
        </View>
      )}

      <WebView
        source={{ html: app.html }}
        style={styles.webview}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        onShouldStartLoadWithRequest={(request) => {
          // Block all external navigation — sandbox security
          if (request.url.startsWith('http') &&
              !request.url.startsWith('about')) {
            return false;
          }
          return true;
        }}
      />

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.bottomBtnText}>⚡ Create New</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBtn, styles.deleteBtn]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteBtnText}>🗑 Delete</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 50, paddingBottom: 14,
    paddingHorizontal: 16, justifyContent: 'space-between'
  },
  backBtn: { padding: 4 },
  backText: { color: 'white', fontSize: 15, fontWeight: '600' },
  appTitleRow: {
    flexDirection: 'row', alignItems: 'center',
    flex: 1, justifyContent: 'center', gap: 8
  },
  appIcon: { fontSize: 20 },
  appTitle: { color: 'white', fontSize: 16, fontWeight: '700', maxWidth: 180 },
  shareBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8
  },
  shareText: { color: 'white', fontSize: 14, fontWeight: '600' },

  loadingOverlay: {
    position: 'absolute', top: 120, left: 0, right: 0,
    alignItems: 'center', zIndex: 10, paddingTop: 60
  },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 15 },

  webview: { flex: 1 },

  bottomBar: {
    flexDirection: 'row', padding: 16, gap: 12,
    backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB'
  },
  bottomBtn: {
    flex: 1, backgroundColor: '#6366F1', borderRadius: 12,
    padding: 14, alignItems: 'center'
  },
  bottomBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  deleteBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  deleteBtnText: { color: '#DC2626', fontSize: 15, fontWeight: '600' }
});
