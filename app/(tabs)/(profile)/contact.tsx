import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

const CONTACT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfbVKEQcaWWG6b5bAL429RVHO3dkCvvhOcuvHhNA3vY3ZKdIg/viewform?embedded=true";

export default function ContactScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  const showFeedbackBanner = subject === "feedback";

  return (
    <View style={styles.container}>
      {showFeedbackBanner && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            アプリへのご意見・改善要望をお聞かせください
          </Text>
        </View>
      )}
      <WebView
        source={{ uri: CONTACT_URL }}
        style={styles.webview}
        onLoadEnd={() => setIsLoading(false)}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#d08000" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  webview: {
    flex: 1,
  },
  banner: {
    backgroundColor: "#3A3A3A",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#52525B",
  },
  bannerText: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
});
