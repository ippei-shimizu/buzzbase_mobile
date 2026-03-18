import React, { useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const CONTACT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfbVKEQcaWWG6b5bAL429RVHO3dkCvvhOcuvHhNA3vY3ZKdIg/viewform?embedded=true";

export default function ContactScreen() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.container}>
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
});
