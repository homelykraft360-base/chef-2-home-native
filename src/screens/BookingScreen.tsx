import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { usePaystack } from 'react-native-paystack-webview';

import { persistInvoiceCreation } from '../api/invoiceApi';
import useGetCurrentUserDetails from '../hooks/useGetCurrentUserDetails';
import useGetSubscriptionPlans from '../hooks/useGetSubscriptionPlans';
import type {
  LogisticsProps,
  PreferenceProps,
  SubscriptionCreationRequest,
  SubscriptionPlan,
} from '../types';
import { currentUser } from '../store/authSlice';
import { formatToMoney } from '../utils/string.utils';

const initialLogistics: LogisticsProps = {
  preference: undefined,
  ingredients: undefined,
  frequency: '',
  selectedDays: [],
  selectedDayAndTime: {},
  confirmKitchen: false,
};

const initialPreference: PreferenceProps = {
  allergies: '',
  cookingPreferences: '',
  dietaryRestrictions: '',
  additionalNotes: '',
};

function mapToSubscriptionCreationRequest({
  plan,
  logistics,
  preferences,
}: {
  plan: SubscriptionPlan;
  logistics: LogisticsProps;
  preferences: PreferenceProps;
}): SubscriptionCreationRequest {
  return {
    subscriptionPlanId: plan.id,
    procureIngredients: logistics.ingredients === 'include',
    delivery: logistics.preference === 'delivery',
    autoRenewal: true,
    preferences,
    visitingDays: logistics.selectedDayAndTime,
  };
}

export default function BookingScreen() {
  const user = useSelector(currentUser);
  const { plans, loading: loadingPlans } = useGetSubscriptionPlans();
  useGetCurrentUserDetails();
  const { popup } = usePaystack();

  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>();
  const [logistics, setLogistics] = useState<LogisticsProps>(initialLogistics);
  const [preferences, setPreferences] = useState<PreferenceProps>(initialPreference);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);

  const canProceed = useMemo(() => {
    if (loadingPlans) return false;
    if (step === 0) return !!selectedPlan;
    if (step === 1) {
      return (
        !!logistics.preference &&
        !!logistics.ingredients &&
        (logistics.preference !== 'cook-in' || logistics.confirmKitchen)
      );
    }
    return true;
  }, [loadingPlans, step, selectedPlan, logistics]);

  const handleNext = useCallback(() => {
    if (step < 2) setStep((s) => s + 1);
    else {
      if (!selectedPlan || !user) return;
      setCreatingInvoice(true);
      const payload = mapToSubscriptionCreationRequest({
        plan: selectedPlan,
        logistics,
        preferences,
      });
      persistInvoiceCreation(payload)
        .then(({ invoice, error }) => {
          setCreatingInvoice(false);
          if (error) return;
          if (invoice?.transactionRef) {
            setPaymentRef(invoice.transactionRef);
            setStep(3);
          }
        })
        .catch(() => setCreatingInvoice(false));
    }
  }, [step, selectedPlan, logistics, preferences, user]);

  const handleBack = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  if (loadingPlans) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {step === 0 && 'Choose a plan'}
        {step === 1 && 'Logistics'}
        {step === 2 && 'Preferences'}
        {step === 3 && 'Payment'}
      </Text>

      {step === 0 && (
        <View style={styles.planList}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan?.id === plan.id && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan(plan)}
            >
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planAmount}>{formatToMoney(plan.amount)}</Text>
              <Text style={styles.planInterval}>
                {plan.frequency} times {plan.interval}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {step === 1 && (
        <View style={styles.form}>
          <Text style={styles.label}>Visit type</Text>
          <View style={styles.row}>
            <Button
              mode={logistics.preference === 'cook-in' ? 'contained' : 'outlined'}
              onPress={() =>
                setLogistics((p) => ({ ...p, preference: 'cook-in' }))
              }
            >
              Cook-in
            </Button>
            <Button
              mode={logistics.preference === 'delivery' ? 'contained' : 'outlined'}
              onPress={() =>
                setLogistics((p) => ({ ...p, preference: 'delivery' }))
              }
            >
              Delivery
            </Button>
          </View>
          <Text style={styles.label}>Ingredients</Text>
          <View style={styles.row}>
            <Button
              mode={logistics.ingredients === 'include' ? 'contained' : 'outlined'}
              onPress={() =>
                setLogistics((p) => ({ ...p, ingredients: 'include' }))
              }
            >
              Include
            </Button>
            <Button
              mode={logistics.ingredients === 'exclude' ? 'contained' : 'outlined'}
              onPress={() =>
                setLogistics((p) => ({ ...p, ingredients: 'exclude' }))
              }
            >
              Exclude
            </Button>
          </View>
          {logistics.preference === 'cook-in' && (
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() =>
                setLogistics((p) => ({
                  ...p,
                  confirmKitchen: !p.confirmKitchen,
                }))
              }
            >
              <Text>I confirm I have a kitchen</Text>
              <View
                style={[
                  styles.checkbox,
                  logistics.confirmKitchen && styles.checkboxChecked,
                ]}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {step === 2 && (
        <View style={styles.form}>
          <Text style={styles.label}>Allergies (optional)</Text>
          <Text style={styles.hint}>
            Leave blank if none. Used for meal planning.
          </Text>
          <Text style={styles.label}>Dietary / cooking notes (optional)</Text>
          <Text style={styles.hint}>
            Preferences and restrictions for your chef.
          </Text>
        </View>
      )}

      {step === 3 && selectedPlan && paymentRef && user && (
        <View style={styles.form}>
          <Text style={styles.successText}>
            Invoice created. Reference: {paymentRef}
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              popup.checkout({
                email: user.email,
                amount: Math.round(selectedPlan.amount / 100),
                reference: paymentRef,
                plan: selectedPlan.paystackPlanId ?? undefined,
                metadata: {
                  custom_fields: [
                    { display_name: 'Plan', variable_name: 'plan', value: selectedPlan.name },
                    { display_name: 'Plan ID', variable_name: 'plan_id', value: String(selectedPlan.id) },
                  ],
                },
                onSuccess: () => {
                  setStep(0);
                  setSelectedPlan(undefined);
                  setPaymentRef(null);
                  setLogistics(initialLogistics);
                  setPreferences(initialPreference);
                },
                onCancel: () => {},
                onError: () => {},
              });
            }}
            style={styles.payBtn}
          >
            Pay with Paystack
          </Button>
        </View>
      )}

      <View style={styles.actions}>
        {step > 0 && step < 3 && (
          <Button mode="outlined" onPress={handleBack} style={styles.btn}>
            Back
          </Button>
        )}
        {step < 3 && (
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={!canProceed || creatingInvoice}
            loading={creatingInvoice}
            style={styles.btn}
          >
            {step === 2 ? 'Create invoice & pay' : 'Next'}
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 24 },
  planList: { gap: 12 },
  planCard: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
  },
  planCardSelected: { borderColor: '#e65100', backgroundColor: '#fff3e0' },
  planName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  planAmount: { fontSize: 16, color: '#e65100', marginBottom: 4 },
  planInterval: { fontSize: 12, color: '#666' },
  form: { marginBottom: 24 },
  label: { fontWeight: '600', marginBottom: 8 },
  hint: { fontSize: 12, color: '#666', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 4,
  },
  checkboxChecked: { backgroundColor: '#e65100', borderColor: '#e65100' },
  successText: { marginBottom: 8 },
  payBtn: { marginTop: 16 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btn: { flex: 1 },
});
