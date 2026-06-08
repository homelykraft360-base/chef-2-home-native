import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { usePaystack } from 'react-native-paystack-webview';

import {
  dayOptions,
  planColorScheme,
  timeOptionsWithLabels,
} from '../../constants/booking';
import { CHEF_GREEN, CHEF_GREY, CHEF_ORANGE, GRAY_600 } from '../../constants/theme';
import useCreateInvoice from '../../hooks/useCreateInvoice';
import useGetCurrentUserDetails from '../../hooks/useGetCurrentUserDetails';
import useGetSubscriptionPlans from '../../hooks/useGetSubscriptionPlans';
import type {
  LogisticsProps,
  Meal,
  PreferenceProps,
  SubscriptionPlan,
} from '../../types';
import {
  computeBookingMonthlyTotalNaira,
  mapToSubscriptionCreationRequest,
} from '../../utils/booking.helper';
import {
  formatDate,
  formatToReadableNumber,
  formatToMoney,
} from '../../utils/string.utils';
import {
  getPlanSummaryPeriodDays,
  getPlanWeeklyVisitCap,
} from '../../utils/subscriptionPlan.utils';

import PricingBreakdownCard from './components/PricingBreakdownCard';

const initialLogistics: LogisticsProps = {
  location: '',
  weeklySessionsCount: 1,
  preference: undefined,
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

const SUMMARY_NOTES: Record<
  'cook-in' | 'delivery',
  { title: string; bullets: string[] }
> = {
  'cook-in': {
    title: 'Cook-in',
    bullets: [
      'Have ingredients and utensils ready for your chef.',
      'Ensure a safe kitchen with ventilation and running water.',
    ],
  },
  delivery: {
    title: 'Meal delivery',
    bullets: [
      'We source ingredients and your chef prepares meals in our kitchen.',
      'Meals are delivered on your selected days.',
    ],
  },
};

const CATEGORY_ORDER = ['starter', 'main', 'protein', 'side', 'swallow'] as const;

function dayLabel(day: string) {
  return `${day.charAt(0).toUpperCase()}${day.slice(1)}s`;
}

function getTimeMapping(value: string): string {
  if (value === 'morning') return '(8am - 9am)';
  if (value === 'afternoon') return '(2pm - 3pm)';
  return '--';
}

export default function BookingScreen() {
  const navigation = useNavigation();
  const { popup } = usePaystack();
  const { plans, loading: loadingPlans } = useGetSubscriptionPlans();
  const { user } = useGetCurrentUserDetails();
  const { createInvoice, loading: creatingInvoice } = useCreateInvoice();

  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>();
  const [logistics, setLogistics] = useState<LogisticsProps>(initialLogistics);
  const [preferences, setPreferences] =
    useState<PreferenceProps>(initialPreference);
  const [menuPlan, setMenuPlan] = useState<SubscriptionPlan | null>(null);

  const loading = loadingPlans;
  const readyToPay = step === 4;
  const hasPayEmail = Boolean(user?.email?.trim());

  const disabled = useMemo(() => {
    if (loading) return true;
    if (step === 0) return !selectedPlan;
    if (step === 1) {
      return (
        !logistics.preference ||
        (logistics.preference === 'cook-in' && !logistics.confirmKitchen)
      );
    }
    if (step === 2) {
      if (!logistics.location?.trim()) return true;
      if (logistics.selectedDays.length !== logistics.weeklySessionsCount) {
        return true;
      }
      return logistics.selectedDays.some(
        (day) => !logistics.selectedDayAndTime[day],
      );
    }
    if (step === 4 && !hasPayEmail) return true;
    return false;
  }, [loading, logistics, selectedPlan, step, hasPayEmail]);

  const onBack = () => setStep((s) => Math.max(0, s - 1));
  const onNext = () => setStep((s) => Math.min(4, s + 1));

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    const cap = getPlanWeeklyVisitCap(plan);
    setLogistics((prev) => {
      const nextSessions = Math.min(cap, Math.max(1, prev.weeklySessionsCount));
      let selectedDays = prev.selectedDays;
      let selectedDayAndTime = { ...prev.selectedDayAndTime };
      if (selectedDays.length > nextSessions) {
        selectedDays = selectedDays.slice(0, nextSessions);
        selectedDayAndTime = Object.fromEntries(
          selectedDays.map((d) => [d, prev.selectedDayAndTime[d] ?? '']),
        );
      }
      return {
        ...prev,
        weeklySessionsCount: nextSessions,
        selectedDays,
        selectedDayAndTime,
      };
    });
  };

  const handleWeeklySessionsDelta = (delta: 1 | -1) => {
    if (!selectedPlan) return;
    const cap = getPlanWeeklyVisitCap(selectedPlan);
    setLogistics((prev) => {
      const next = Math.min(cap, Math.max(1, prev.weeklySessionsCount + delta));
      let { selectedDays, selectedDayAndTime } = prev;
      if (selectedDays.length > next) {
        selectedDays = selectedDays.slice(0, next);
        selectedDayAndTime = Object.fromEntries(
          selectedDays.map((d) => [d, prev.selectedDayAndTime[d] ?? '']),
        );
      }
      return {
        ...prev,
        weeklySessionsCount: next,
        selectedDays,
        selectedDayAndTime,
      };
    });
  };

  const handleToggleDay = (day: string) => {
    setLogistics((prev) => {
      const isSelected = prev.selectedDays.includes(day);
      const updatedDays = isSelected
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day];
      const updatedDayAndTime = { ...prev.selectedDayAndTime };
      if (isSelected) delete updatedDayAndTime[day];
      return {
        ...prev,
        selectedDays: updatedDays,
        selectedDayAndTime: updatedDayAndTime,
      };
    });
  };

  const handleInitiatePayment = useCallback(
    (transactionRef?: string, amountKobo?: number) => {
      if (!selectedPlan || !user?.email) return;
      if (!transactionRef) {
        Alert.alert('Payment', 'Transaction reference is missing.');
        return;
      }
      const amountNaira =
        amountKobo != null && Number.isFinite(amountKobo)
          ? amountKobo / 100
          : computeBookingMonthlyTotalNaira(selectedPlan, logistics);

      popup.checkout({
        email: user.email,
        amount: amountNaira,
        reference: transactionRef,
        metadata: {
          custom_fields: [
            { display_name: 'Plan', variable_name: 'plan', value: selectedPlan.name },
            {
              display_name: 'Plan ID',
              variable_name: 'plan_id',
              value: String(selectedPlan.id),
            },
            {
              display_name: 'Weekly visit cap',
              variable_name: 'weekly_visit_cap',
              value: String(getPlanWeeklyVisitCap(selectedPlan)),
            },
          ],
        },
        onSuccess: () => setStep(5),
        onCancel: () => {},
      });
    },
    [popup, selectedPlan, user, logistics],
  );

  const handleCreateSubscription = () => {
    if (!selectedPlan) return;
    if (!hasPayEmail) {
      Alert.alert(
        'Email required',
        'Add an email address to your profile before paying (required by Paystack).',
      );
      return;
    }
    createInvoice({
      payload: mapToSubscriptionCreationRequest({
        plan: selectedPlan,
        logistics,
        preferences,
      }),
      onSuccess: (invoice) => {
        if (invoice?.transactionRef) {
          handleInitiatePayment(invoice.transactionRef, invoice.amount);
        }
      },
      onError: (err) => Alert.alert('Booking', String(err)),
    });
  };

  const monthlyTotalNaira = useMemo(
    () =>
      selectedPlan
        ? computeBookingMonthlyTotalNaira(selectedPlan, logistics)
        : 0,
    [selectedPlan, logistics],
  );

  const planCap = selectedPlan ? getPlanWeeklyVisitCap(selectedPlan) : 5;
  const dayPickCap = Math.max(
    1,
    Math.min(planCap, logistics.weeklySessionsCount),
  );
  const availableDays = dayOptions.slice(0, -1);

  const mealsByCategory = useMemo(() => {
    if (!menuPlan?.menus?.length) return null;
    const buckets: Record<string, Meal[]> = {
      starter: [],
      main: [],
      protein: [],
      side: [],
      swallow: [],
    };
    const seen = new Set<string>();
    for (const menu of menuPlan.menus) {
      for (const meal of menu.meals ?? []) {
        const cat = CATEGORY_ORDER.includes(
          meal.category as (typeof CATEGORY_ORDER)[number],
        )
          ? meal.category
          : 'main';
        const key = `${cat}-${meal.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        buckets[cat].push(meal);
      }
    }
    return buckets;
  }, [menuPlan]);

  if (loadingPlans) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={CHEF_ORANGE} />
      </View>
    );
  }

  if (step === 5) {
    return (
      <View style={styles.successWrap}>
        <Text style={styles.successTitle}>You&apos;re in!!</Text>
        <Text style={styles.successSub}>
          You&apos;ve successfully subscribed. Our team will follow up with next steps.
        </Text>
        <Button
          mode="contained"
          onPress={() => {
            setStep(0);
            setSelectedPlan(undefined);
            setLogistics(initialLogistics);
            setPreferences(initialPreference);
            navigation.dispatch(
              CommonActions.navigate({
                name: 'Main',
                params: { screen: 'Home' },
              }),
            );
          }}
          style={styles.successBtn}
        >
          Go home
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {step < 5 ? (
        <PricingBreakdownCard plan={selectedPlan} logistics={logistics} />
      ) : null}

      <Text style={styles.stepBadge}>STEP {step + 1} OF 5</Text>
      <Text style={styles.screenTitle}>
        {step === 0 && 'Choose a plan'}
        {step === 1 && 'Cooking logistics'}
        {step === 2 && 'Your schedule'}
        {step === 3 && 'Food preferences'}
        {step === 4 && 'Review'}
      </Text>

      {step === 0 && (
        <View style={styles.section}>
          {plans.map((plan, index) => {
            const accent =
              plan.colorScheme ?? planColorScheme[index % planColorScheme.length];
            const selected = selectedPlan?.id === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.planCard, selected && styles.planCardSelected]}
                onPress={() => handlePlanSelect(plan)}
                activeOpacity={0.85}
              >
                <View style={styles.planHeader}>
                  <Text style={[styles.planName, { color: accent }]}>{plan.name}</Text>
                  <View
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterSelected,
                    ]}
                  >
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>
                </View>
                <Text style={styles.planPrice}>
                  ₦{formatToReadableNumber(plan.amount / 100, false)}
                  <Text style={styles.planInterval}> /month</Text>
                </Text>
                {plan.description ? (
                  <Text style={styles.planDesc}>{plan.description}</Text>
                ) : null}
                {(plan.menus?.length ?? 0) > 0 ? (
                  <Button mode="text" compact onPress={() => setMenuPlan(plan)}>
                    View menu
                  </Button>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {step === 1 && logistics.preference && (
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>{SUMMARY_NOTES[logistics.preference].title}</Text>
          {SUMMARY_NOTES[logistics.preference].bullets.map((b) => (
            <Text key={b} style={styles.noteBullet}>
              • {b}
            </Text>
          ))}
        </View>
      )}

      {step === 1 && (
        <View style={styles.section}>
          <Text style={styles.label}>Cook-in or meal delivery?</Text>
          <View style={styles.row}>
            <Button
              mode={logistics.preference === 'cook-in' ? 'contained' : 'outlined'}
              onPress={() =>
                setLogistics((p) => ({ ...p, preference: 'cook-in' }))
              }
              style={styles.flexBtn}
            >
              Cook-in
            </Button>
            <Button
              mode={logistics.preference === 'delivery' ? 'contained' : 'outlined'}
              onPress={() =>
                setLogistics((p) => ({ ...p, preference: 'delivery' }))
              }
              style={styles.flexBtn}
            >
              Delivery
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
              <View
                style={[
                  styles.checkbox,
                  logistics.confirmKitchen && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.checkLabel}>
                I confirm I have utensils, appliances, and a suitable kitchen for my
                chef.
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {step === 2 && (
        <View style={styles.section}>
          <Text style={styles.label}>Location (Lagos)</Text>
          <View style={styles.row}>
            {(['', 'lagos-island', 'lagos-mainland'] as const).map((loc) => {
              const labels = ['Select', 'Lagos Island', 'Mainland'] as const;
              const idx = loc === '' ? 0 : loc === 'lagos-island' ? 1 : 2;
              return (
                <Button
                  key={String(loc)}
                  mode={logistics.location === loc ? 'contained' : 'outlined'}
                  compact
                  onPress={() =>
                    setLogistics((p) => ({
                      ...p,
                      location: loc as LogisticsProps['location'],
                    }))
                  }
                  style={styles.locBtn}
                >
                  {labels[idx]}
                </Button>
              );
            })}
          </View>

          <Text style={styles.label}>Weekly sessions</Text>
          <View style={styles.counterRow}>
            <Button
              mode="outlined"
              disabled={logistics.weeklySessionsCount <= 1}
              onPress={() => handleWeeklySessionsDelta(-1)}
            >
              −
            </Button>
            <Text style={styles.counterVal}>{logistics.weeklySessionsCount}</Text>
            <Button
              mode="contained"
              disabled={logistics.weeklySessionsCount >= planCap}
              onPress={() => handleWeeklySessionsDelta(1)}
            >
              +
            </Button>
          </View>

          <Text style={styles.label}>Visit days (select {dayPickCap})</Text>
          {availableDays.map((day) => {
            const disabledDay =
              logistics.selectedDays.length >= dayPickCap &&
              !logistics.selectedDays.includes(day);
            return (
              <TouchableOpacity
                key={day}
                style={styles.dayRow}
                disabled={disabledDay}
                onPress={() => handleToggleDay(day)}
              >
                <Text
                  style={[styles.dayText, disabledDay && styles.dayTextDisabled]}
                >
                  {dayLabel(day)}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    logistics.selectedDays.includes(day) && styles.checkboxChecked,
                  ]}
                />
              </TouchableOpacity>
            );
          })}

          {logistics.selectedDays.map((day) => (
            <View key={day} style={styles.timeBlock}>
              <Text style={styles.labelSmall}>
                Time on {day.charAt(0).toUpperCase() + day.slice(1)}
              </Text>
              <View style={styles.rowWrap}>
                {timeOptionsWithLabels
                  .filter((o) => o.value !== '')
                  .map((opt) => (
                    <Button
                      key={opt.value}
                      mode={
                        logistics.selectedDayAndTime[day] === opt.value
                          ? 'contained'
                          : 'outlined'
                      }
                      compact
                      style={styles.timeChip}
                      onPress={() =>
                        setLogistics((p) => ({
                          ...p,
                          selectedDayAndTime: {
                            ...p.selectedDayAndTime,
                            [day]: opt.value,
                          },
                        }))
                      }
                    >
                      {opt.value === 'morning' ? 'Morning' : 'Afternoon'}
                    </Button>
                  ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {step === 3 && (
        <View style={styles.section}>
          {(
            [
              ['allergies', 'Food allergies', 'Any allergies?'] as const,
              [
                'dietaryRestrictions',
                'Dietary restrictions',
                'Special dietary needs?',
              ] as const,
              ['cookingPreferences', 'Cooking preferences', 'Preferences?'] as const,
              ['additionalNotes', 'Additional notes', 'Anything else?'] as const,
            ] as const
          ).map(([key, label, ph]) => (
            <View key={key} style={styles.inputBlock}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                multiline
                placeholder={ph}
                value={(preferences[key] as string) ?? ''}
                onChangeText={(t) =>
                  setPreferences((p) => ({ ...p, [key]: t }))
                }
                maxLength={300}
              />
            </View>
          ))}
        </View>
      )}

      {step === 4 && selectedPlan && (
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            {(
              [
                ['Plan', selectedPlan.name],
                ['Start', formatDate(new Date())],
                [
                  'End',
                  formatDate(
                    new Date(
                      Date.now() + getPlanSummaryPeriodDays() * 86400000,
                    ),
                  ),
                ],
                [
                  'Location',
                  logistics.location === 'lagos-island'
                    ? 'Lagos Island'
                    : logistics.location === 'lagos-mainland'
                      ? 'Lagos Mainland'
                      : '--',
                ],
                [
                  'Weekly sessions',
                  `${logistics.weeklySessionsCount} (cap ${planCap})`,
                ],
                [
                  'Visit days',
                  logistics.selectedDays
                    .map(
                      (d) =>
                        `${d} ${getTimeMapping(logistics.selectedDayAndTime[d] ?? '')}`,
                    )
                    .join(', ') || '--',
                ],
                ['Allergies', preferences.allergies || '—'],
              ] as const
            ).map(([k, v]) => (
              <View key={k} style={styles.summaryRow}>
                <Text style={styles.summaryKey}>{k}</Text>
                <Text style={styles.summaryVal}>{v}</Text>
              </View>
            ))}
          </View>

          <View style={styles.payCard}>
            <Text style={[styles.planAccent, { color: CHEF_ORANGE }]}>
              Total
            </Text>
            <Text style={styles.payAmount}>
              {formatToMoney(monthlyTotalNaira, false)}
              <Text style={styles.payInterval}> /month</Text>
            </Text>
            <View style={styles.row}>
              <Button mode="outlined" onPress={onBack} style={styles.flexBtn}>
                Go back
              </Button>
              <Button
                mode="contained"
                disabled={!hasPayEmail || creatingInvoice}
                loading={creatingInvoice}
                onPress={handleCreateSubscription}
                style={styles.flexBtn}
              >
                Proceed to payment
              </Button>
            </View>
            {!hasPayEmail ? (
              <Text style={styles.warn}>Add an email on your account to pay.</Text>
            ) : null}
          </View>
        </View>
      )}

      {!(readyToPay && selectedPlan) ? (
        <View style={styles.actions}>
          <Button
            mode="outlined"
            disabled={step === 0}
            onPress={onBack}
            style={styles.flexBtn}
          >
            Go back
          </Button>
          <Button
            mode="contained"
            disabled={disabled}
            onPress={onNext}
            style={styles.flexBtn}
          >
            Continue
          </Button>
        </View>
      ) : null}

      <Modal visible={menuPlan !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Menu — {menuPlan?.name}
            </Text>
            <ScrollView style={styles.modalScroll}>
              {menuPlan && mealsByCategory
                ? CATEGORY_ORDER.map((cat) => {
                    const meals = mealsByCategory[cat];
                    if (!meals?.length) return null;
                    return (
                      <View key={cat} style={styles.menuCat}>
                        <Text style={styles.menuCatTitle}>{cat}</Text>
                        {meals.map((m) => (
                          <Text key={m.id} style={styles.menuItem}>
                            • {m.name}
                          </Text>
                        ))}
                      </View>
                    );
                  })
                : null}
            </ScrollView>
            <Button onPress={() => setMenuPlan(null)}>Close</Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#fafafa' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stepBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: CHEF_GREEN,
    marginBottom: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: CHEF_GREY,
    marginBottom: 20,
  },
  section: { marginBottom: 16 },
  label: {
    fontWeight: '600',
    color: CHEF_GREY,
    marginBottom: 8,
    marginTop: 8,
  },
  labelSmall: { fontWeight: '600', color: GRAY_600, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flexBtn: { flex: 1, minWidth: 120 },
  locBtn: { minWidth: 0, flex: 1 },
  planCard: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  planCardSelected: {
    borderColor: CHEF_ORANGE,
    backgroundColor: '#fff7ed',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  planPrice: { fontSize: 20, fontWeight: '700', color: CHEF_GREY, marginTop: 8 },
  planInterval: { fontSize: 14, fontWeight: '400', color: GRAY_600 },
  planDesc: { fontSize: 13, color: GRAY_600, marginTop: 8 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: CHEF_ORANGE },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: CHEF_ORANGE,
  },
  noteCard: {
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  noteTitle: { fontWeight: '700', marginBottom: 8, color: CHEF_GREY },
  noteBullet: { fontSize: 13, color: GRAY_600, marginBottom: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 4,
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: CHEF_ORANGE, borderColor: CHEF_ORANGE },
  checkLabel: { flex: 1, fontSize: 14, color: CHEF_GREY },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 8,
  },
  counterVal: { fontSize: 20, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  dayText: { fontSize: 15, textTransform: 'capitalize', color: CHEF_GREY },
  dayTextDisabled: { color: '#9ca3af' },
  timeBlock: { marginTop: 12 },
  timeChip: { marginRight: 4, marginBottom: 4 },
  inputBlock: { marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    minHeight: 88,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  summaryKey: { fontWeight: '600', color: GRAY_600, flexShrink: 0 },
  summaryVal: { flex: 1, textAlign: 'right', color: CHEF_GREY },
  payCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  planAccent: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  payAmount: { fontSize: 22, fontWeight: '700', color: CHEF_GREY, marginBottom: 16 },
  payInterval: { fontSize: 14, fontWeight: '400', color: GRAY_600 },
  warn: { fontSize: 12, color: '#b45309', textAlign: 'center', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 32 },
  successWrap: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: CHEF_GREY,
    marginBottom: 12,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 15,
    color: GRAY_600,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successBtn: { minWidth: 200 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: CHEF_GREY },
  modalScroll: { maxHeight: 360, marginBottom: 12 },
  menuCat: { marginBottom: 16 },
  menuCatTitle: {
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: 6,
    color: CHEF_ORANGE,
  },
  menuItem: { fontSize: 14, color: CHEF_GREY, marginBottom: 4 },
});
