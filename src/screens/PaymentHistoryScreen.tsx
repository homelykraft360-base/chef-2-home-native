import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { CHEF_ORANGE } from '../constants/theme';
import useGetInvoiceHistory from '../hooks/useGetInvoiceHistory';
import PaymentHistory from './booking/components/PaymentHistory';

export default function PaymentHistoryScreen() {
  const {
    invoices,
    loading,
    error,
    refetch,
  } = useGetInvoiceHistory();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!error) return;
    Alert.alert('Could not load payment history', error);
  }, [error]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={CHEF_ORANGE}
          colors={[CHEF_ORANGE]}
          progressBackgroundColor="#fff"
        />
      }
    >
      <PaymentHistory invoices={invoices} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingBottom: 48 },
});
