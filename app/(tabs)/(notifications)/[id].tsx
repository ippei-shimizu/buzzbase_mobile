import * as Sentry from "@sentry/react-native";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { useManagementNotice } from "@hooks/useNotifications";
import { markdownToHtml } from "@utils/markdownToHtml";

export default function NoticeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notice, isLoading, isError, refetch } = useManagementNotice(
    id ? Number(id) : undefined,
  );
  const { width } = useWindowDimensions();
  const [webViewHeight, setWebViewHeight] = useState(300);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (isError || !notice) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>データの取得に失敗しました</Text>
        <Text style={styles.retryText} onPress={() => refetch()}>
          タップして再試行
        </Text>
      </View>
    );
  }

  const bodyHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          color: #D4D4D8;
          background-color: #2E2E2E;
          font-size: 15px;
          line-height: 1.6;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 0;
          word-wrap: break-word;
        }
        a { color: #d08000; text-decoration: underline; }
        h1, h2, h3, h4, h5, h6 { color: #F4F4F4; margin: 16px 0 8px; }
        h1 { font-size: 22px; }
        h2 { font-size: 19px; }
        h3 { font-size: 17px; }
        p { margin: 0 0 12px; }
        ul, ol { padding-left: 20px; margin: 4px 0 8px; line-height: 1.4; }
        li { margin: 0; padding: 0; }
        strong, b { color: #F4F4F4; }
        code { background: #424242; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
        pre { background: #424242; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 0 0 12px; }
        pre code { padding: 0; }
        blockquote { border-left: 3px solid #d08000; padding-left: 12px; color: #A1A1AA; margin: 0 0 12px; }
        hr { border: none; border-top: 1px solid #52525B; margin: 16px 0; }
        img { max-width: 100%; height: auto; border-radius: 8px; }
      </style>
    </head>
    <body>
      ${markdownToHtml(notice.body)}
      <script>
        window.addEventListener('load', function() {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ height: document.body.scrollHeight })
          );
        });
      </script>
    </body>
    </html>
  `;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{notice.title}</Text>
      <Text style={styles.date}>{notice.published_at}</Text>
      <WebView
        originWhitelist={["*"]}
        source={{ html: bodyHtml }}
        style={{
          width: width - 40,
          height: webViewHeight,
          backgroundColor: "#2E2E2E",
        }}
        scrollEnabled={false}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.height) {
              setWebViewHeight(data.height);
            }
          } catch (error) {
            Sentry.captureException(error, {
              tags: {
                source: "notification-detail",
                action: "webview-message",
              },
            });
          }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  content: {
    padding: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  title: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  date: {
    color: "#A1A1AA",
    fontSize: 14,
    marginBottom: 20,
  },
  errorText: {
    color: "#A1A1AA",
    fontSize: 16,
    marginBottom: 12,
  },
  retryText: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "600",
  },
});
