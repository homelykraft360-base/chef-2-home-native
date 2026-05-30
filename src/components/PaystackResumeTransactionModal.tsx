import { useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { CHEF_GREY, CHEF_ORANGE } from '../constants/theme';

type BridgeEvent =
  | { event: 'success'; data: unknown }
  | { event: 'cancel' }
  | { event: 'error'; error: { message?: string } };

function paystackResumeHtml(accessCode: string): string {
  const code = JSON.stringify(accessCode);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paystack</title>
</head>
<body onload="openResume()" style="background-color:#fff;height:100vh;margin:0">
  <script src="https://js.paystack.co/v2/inline.js"></script>
  <script>
    function openResume() {
      try {
        var paystack = new PaystackPop();
        paystack.resumeTransaction(${code}, {
          onSuccess: function (response) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ event: 'success', data: response })
            );
          },
          onCancel: function () {
            window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'cancel' }));
          },
          onError: function (error) {
            var msg =
              error && error.message ? error.message : 'Could not load Paystack checkout';
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ event: 'error', error: { message: msg } })
            );
          },
          onLoad: function () {},
        });
      } catch (e) {
        var m = e && e.message ? e.message : String(e);
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ event: 'error', error: { message: m } })
        );
      }
    }
  </script>
</body>
</html>`;
}

type Props = {
  visible: boolean;
  accessCode: string;
  onMessageSuccess: () => void;
  onMessageCancel: () => void;
  onMessageError: (message: string) => void;
  onRequestClose: () => void;
};

export default function PaystackResumeTransactionModal({
  visible,
  accessCode,
  onMessageSuccess,
  onMessageCancel,
  onMessageError,
  onRequestClose,
}: Props) {
  const html = useMemo(() => paystackResumeHtml(accessCode), [accessCode]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as BridgeEvent;
      switch (data.event) {
        case 'success':
          onMessageSuccess();
          break;
        case 'cancel':
          onMessageCancel();
          break;
        case 'error':
          onMessageError(data.error?.message ?? 'Payment error');
          break;
        default:
          break;
      }
    } catch {
      onMessageError('Invalid response from checkout');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onRequestClose}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={onRequestClose} hitSlop={12}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={CHEF_ORANGE} />
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  closeText: { fontSize: 16, color: CHEF_GREY, fontWeight: '600' },
  loadingWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
