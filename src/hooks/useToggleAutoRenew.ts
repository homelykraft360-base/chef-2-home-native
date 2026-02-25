import { useCallback, useState } from 'react';

import { toggleAutoRenewal as apiToggleAutoRenewal } from '../api/subscriptionApi';
import type { GenericAPICallbackWithoutPayloadProps, Nullable, Subscription } from '../types';

export default function useToggleAutoRenew() {
  const [loading, setLoading] = useState(false);

  const toggleAutoRenewal = useCallback(
    async ({
      onError,
      onSuccess,
    }: GenericAPICallbackWithoutPayloadProps<Nullable<Subscription>>) => {
      setLoading(true);
      const { subscription, error } = await apiToggleAutoRenewal();
      if (error) {
        onError?.(String(error));
      } else {
        onSuccess?.(subscription ?? undefined);
      }
      setLoading(false);
    },
    [],
  );

  return { loading, toggleAutoRenewal };
}
