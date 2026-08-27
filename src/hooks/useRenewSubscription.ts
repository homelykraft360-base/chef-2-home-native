import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { usePaystack } from 'react-native-paystack-webview';
import { useSelector } from 'react-redux';

import { renewSubscription } from '../api/subscriptionApi';
import { verifyTransaction } from '../api/transactionApi';
import { refreshSubscriptionAfterRenew } from '../hooks/useGetSubscription';
import { currentUser } from '../store/authSlice';
import type { Subscription } from '../types';

const RENEW_CREATE_ERROR = "Couldn't start renewal.";
const RENEW_CONNECTION_ERROR = 'Check your connection and try again.';
const RENEW_SUCCESS = 'Subscription renewed.';
const RENEW_CANCEL =
  "Payment cancelled. Tap Renew when you're ready to try again.";
const RENEW_FAIL = "Payment didn't go through. Tap Renew to try again.";
const RENEW_MISSING_EMAIL =
  'Add an email address to your profile before paying (required by Paystack).';
const RENEW_PAYMENT_SETUP =
  "Couldn't start payment. Refresh and try Renew again.";
const RENEW_PAYER_ONLY = 'Only the payer can renew this subscription.';

function isConnectionError(error: unknown): boolean {
  const msg = `${error ?? ''}`.toLowerCase();
  return (
    msg.includes('network') ||
    msg.includes('connection') ||
    msg.includes('timeout') ||
    msg.includes('offline') ||
    msg.includes('failed to fetch')
  );
}

function isForbiddenError(error: unknown): boolean {
  const msg = `${error ?? ''}`.toLowerCase();
  return msg.includes('403') || msg.includes('only the household payer');
}

interface UseRenewSubscriptionOptions {
  onRenewed?: (subscription: Subscription) => void;
}

export default function useRenewSubscription(
  subscription: Subscription | null | undefined,
  options?: UseRenewSubscriptionOptions,
) {
  const [loading, setLoading] = useState(false);
  const user = useSelector(currentUser);
  const { popup } = usePaystack();
  const onRenewed = options?.onRenewed;

  const renew = useCallback(async () => {
    if (loading || !subscription) return;

    const email = user?.email?.trim();
    if (!email) {
      Alert.alert('Email required', RENEW_MISSING_EMAIL);
      return;
    }

    setLoading(true);

    const { invoice, error } = await renewSubscription();

    if (error || !invoice) {
      if (isForbiddenError(error)) {
        Alert.alert('Renewal', RENEW_PAYER_ONLY);
      } else if (isConnectionError(error)) {
        Alert.alert('Renewal', RENEW_CONNECTION_ERROR);
      } else {
        Alert.alert('Renewal', RENEW_CREATE_ERROR);
      }
      setLoading(false);
      return;
    }

    if (!invoice.transactionRef || !invoice.amount) {
      Alert.alert('Renewal', RENEW_PAYMENT_SETUP);
      setLoading(false);
      return;
    }

    const plan = subscription.subscriptionPlan;
    popup.checkout({
      email,
      amount: invoice.amount / 100,
      reference: invoice.transactionRef,
      metadata: {
        custom_fields: [
          { display_name: 'Plan', variable_name: 'plan', value: plan.name },
          {
            display_name: 'Plan ID',
            variable_name: 'plan_id',
            value: String(plan.id),
          },
          {
            display_name: 'Kind',
            variable_name: 'kind',
            value: 'subscription_renew',
          },
        ],
      },
      onSuccess: async (transaction) => {
        const reference = transaction?.reference ?? invoice.transactionRef;
        try {
          const { error: verifyError } = await verifyTransaction(reference);
          if (verifyError) {
            Alert.alert('Renewal', RENEW_FAIL);
            setLoading(false);
            return;
          }

          const refreshed = await refreshSubscriptionAfterRenew(subscription);

          if (!refreshed) {
            Alert.alert('Renewal', RENEW_SUCCESS);
            setLoading(false);
            return;
          }

          onRenewed?.(refreshed);
          Alert.alert('Renewal', RENEW_SUCCESS);
        } catch {
          Alert.alert('Renewal', RENEW_FAIL);
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {
        Alert.alert('Renewal', RENEW_CANCEL);
        setLoading(false);
      },
    });
  }, [loading, onRenewed, popup, subscription, user?.email]);

  return {
    loading,
    renew,
  };
}
