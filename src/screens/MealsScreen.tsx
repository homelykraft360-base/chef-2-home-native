import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import {
  createMealPlan,
  fetchMealPlansInRange,
  updateMealPlan,
} from '../api/mealPlanApi';
import { fetchMeals } from '../api/mealsApi';
import {
  CHEF_GREEN,
  CHEF_GREY,
  CHEF_ORANGE,
  ERROR_RED,
  GRAY_100,
  GRAY_400,
  GRAY_600,
} from '../constants/theme';
import useGetMealPlanForWeek from '../hooks/useGetMealPlanForWeek';
import useGetSubscription from '../hooks/useGetSubscription';
import useSaveMealPlan from '../hooks/useSaveMealPlan';
import type {
  DayOfWeek,
  Meal,
  MealPlanDay,
  MealPlanDayInput,
  MealSelectionSource,
  Subscription,
} from '../types';
import {
  addWeeks,
  currentWeekStart,
  isCutoffPassed,
  weekOptionsForSubscription,
  weekRangeLabel,
} from '../utils/week';
import { capitalizeString } from '../utils/url.utils';

const MAX_PER_DAY = 5;
const PAGE_LIMIT = 100;
const CATEGORY_ORDER = ['starter', 'main', 'protein', 'side', 'swallow'] as const;
const UNCATEGORIZED = 'other';

type VisitingDayEntry = { day: DayOfWeek; timeOfDay: string };

type DaySelections = Record<DayOfWeek, Set<number>>;

const SOURCE_LABEL: Record<MealSelectionSource, string | null> = {
  user: null,
  prior_week: 'Auto-filled from last week',
  admin_default: 'Using default selection',
};

const DAY_ORDER: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

function parseVisitingDays(sub: Subscription | null): VisitingDayEntry[] {
  if (!sub?.visitingDays || typeof sub.visitingDays !== 'object') return [];
  const entries: VisitingDayEntry[] = [];
  for (const [rawDay, rawTime] of Object.entries(sub.visitingDays as Record<string, string>)) {
    const day = String(rawDay).toLowerCase() as DayOfWeek;
    if (!DAY_ORDER.includes(day)) continue;
    entries.push({ day, timeOfDay: String(rawTime).toLowerCase() });
  }
  entries.sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
  return entries;
}

function emptySelections(visitingDays: VisitingDayEntry[]): DaySelections {
  return visitingDays.reduce((acc, { day }) => {
    acc[day] = new Set<number>();
    return acc;
  }, {} as DaySelections);
}

function seedSelectionsFromPlan(
  visitingDays: VisitingDayEntry[],
  planDays: MealPlanDay[],
): DaySelections {
  const next = emptySelections(visitingDays);
  for (const pd of planDays) {
    if (next[pd.dayOfWeek]) {
      next[pd.dayOfWeek] = new Set(pd.meals.map((m) => m.id));
    }
  }
  return next;
}

export default function MealsScreen() {
  const navigation = useNavigation();
  const { subscription, loading: subscriptionLoading } = useGetSubscription();

  const weekOptions = useMemo(
    () =>
      weekOptionsForSubscription(
        subscription?.lastPaid,
        subscription?.expiresAt,
      ),
    [subscription?.lastPaid, subscription?.expiresAt],
  );

  const [selectedWeek, setSelectedWeek] = useState<string>(currentWeekStart());

  // If subscription-bound options don't include the current week (e.g. user
  // landed on a week past their period), snap to the first available option.
  useEffect(() => {
    if (weekOptions.length === 0) return;
    if (!weekOptions.includes(selectedWeek)) {
      setSelectedWeek(weekOptions[0]);
    }
  }, [weekOptions, selectedWeek]);

  const {
    mealPlan,
    loading: planLoading,
    error: planError,
    refetch: refetchPlan,
  } = useGetMealPlanForWeek(selectedWeek);

  const { saveMealPlan, loading: saving } = useSaveMealPlan();
  const [bulkSaving, setBulkSaving] = useState(false);

  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [mealsError, setMealsError] = useState<string | null>(null);
  const [mealsLoading, setMealsLoading] = useState(false);

  const visitingDays = useMemo(
    () => parseVisitingDays(subscription ?? null),
    [subscription],
  );

  const [selections, setSelections] = useState<DaySelections>({} as DaySelections);
  const [activeDay, setActiveDay] = useState<DayOfWeek | null>(null);
  const [applyToAll, setApplyToAll] = useState(false);
  const [shoppingNotes, setShoppingNotes] = useState('');

  const planDayMap = useMemo(() => {
    const map = new Map<DayOfWeek, MealPlanDay>();
    for (const d of mealPlan?.days ?? []) map.set(d.dayOfWeek, d);
    return map;
  }, [mealPlan?.days]);

  const mealSections = useMemo(() => {
    if (!meals?.length) return [];
    const buckets = new Map<string, Meal[]>();
    for (const meal of meals) {
      const key = (meal.category ?? UNCATEGORIZED).toLowerCase();
      const existing = buckets.get(key);
      if (existing) existing.push(meal);
      else buckets.set(key, [meal]);
    }
    const sections: { title: string; data: Meal[] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const bucket = buckets.get(cat);
      if (bucket?.length) {
        sections.push({ title: cat, data: bucket });
        buckets.delete(cat);
      }
    }
    for (const cat of [...buckets.keys()].sort()) {
      sections.push({ title: cat, data: buckets.get(cat)! });
    }
    return sections;
  }, [meals]);

  const isActive = subscription?.status === 'active';

  useEffect(() => {
    if (!isActive) return;
    let cancelled = false;
    const load = async () => {
      setMealsLoading(true);
      setMealsError(null);
      const { meals: result, error } = await fetchMeals({
        limit: PAGE_LIMIT,
        page: 0,
      });
      if (cancelled) return;
      if (error) setMealsError(String(error));
      else setMeals(result ?? []);
      setMealsLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isActive]);

  useEffect(() => {
    if (!visitingDays.length) {
      setSelections({} as DaySelections);
      setActiveDay(null);
      return;
    }
    const seeded = mealPlan
      ? seedSelectionsFromPlan(visitingDays, mealPlan.days)
      : emptySelections(visitingDays);
    setSelections(seeded);
    setActiveDay((prev) => (prev && seeded[prev] ? prev : visitingDays[0].day));
  }, [mealPlan, visitingDays]);

  useEffect(() => {
    setShoppingNotes(mealPlan?.shoppingNotes ?? '');
  }, [mealPlan?.id, mealPlan?.shoppingNotes]);

  const dayLocked = useCallback(
    (weekStart: string, day: DayOfWeek, timeOfDay: string) =>
      isCutoffPassed(weekStart, day, timeOfDay),
    [],
  );

  // Ingredient checkout is only meaningful for the current week or the next.
  const payableWeeks = useMemo(() => {
    const cur = currentWeekStart();
    return new Set([cur, addWeeks(cur, 1)]);
  }, []);
  const canReviewSelectedWeek = payableWeeks.has(selectedWeek);
  const mealPlanIdForReview = mealPlan?.id;
  /** Past weeks: still show Review when weekly ingredients were never paid. */
  const unpaidPastIngredientWeek =
    mealPlanIdForReview != null &&
    mealPlan?.ingredientPaymentStatus === 'unpaid' &&
    selectedWeek < currentWeekStart();
  const canOpenIngredientCheckout =
    mealPlanIdForReview != null &&
    (canReviewSelectedWeek || unpaidPastIngredientWeek);

  const ingredientsPaidForWeek =
    mealPlan?.ingredientPaymentStatus === 'paid';

  useEffect(() => {
    if (mealPlan?.ingredientPaymentStatus === 'paid' && applyToAll) {
      setApplyToAll(false);
    }
  }, [mealPlan?.ingredientPaymentStatus, mealPlan?.weekStart, applyToAll]);

  const toggleMeal = useCallback((day: DayOfWeek, mealId: number) => {
    setSelections((prev) => {
      const current = prev[day] ?? new Set<number>();
      const next = new Set(current);
      if (next.has(mealId)) {
        next.delete(mealId);
      } else if (next.size < MAX_PER_DAY) {
        next.add(mealId);
      }
      return { ...prev, [day]: next };
    });
  }, []);

  const buildPayloadForWeek = useCallback(
    (weekStart: string): MealPlanDayInput[] =>
      visitingDays
        .filter(({ day, timeOfDay }) => !dayLocked(weekStart, day, timeOfDay))
        .map(({ day }) => ({
          dayOfWeek: day,
          mealIds: Array.from(selections[day] ?? []),
        }))
        .filter((d) => d.mealIds.length > 0),
    [visitingDays, selections, dayLocked],
  );

  const saveSingleWeek = () => {
    if (ingredientsPaidForWeek) return;
    const payloadDays = buildPayloadForWeek(selectedWeek);
    if (payloadDays.length === 0) {
      Alert.alert(
        'Nothing to save',
        'Pick at least one meal for a day that is still open.',
      );
      return;
    }

    saveMealPlan({
      payload: {
        weekStart: selectedWeek,
        days: payloadDays,
        existingPlanId: mealPlan?.id,
        shoppingNotes: shoppingNotes.trim() || null,
      },
      onSuccess: () => {
        Alert.alert(
          'Saved',
          `Your meals for ${weekRangeLabel(selectedWeek)} are locked in.`,
        );
        refetchPlan();
      },
      onError: (err) => Alert.alert('Could not save', err),
    });
  };

  const saveAllWeeks = async () => {
    if (weekOptions.length === 0) return;
    if (ingredientsPaidForWeek) return;
    setBulkSaving(true);
    try {
      const first = weekOptions[0];
      const last = weekOptions[weekOptions.length - 1];
      const { mealPlans, error: rangeError } = await fetchMealPlansInRange(
        first,
        last,
      );
      if (rangeError) {
        Alert.alert('Could not save', String(rangeError));
        return;
      }
      const existingIdByWeek = new Map(
        mealPlans.map((p) => [p.weekStart, p.id]),
      );

      const results = await Promise.all(
        weekOptions.map(async (week) => {
          const payloadDays = buildPayloadForWeek(week);
          if (payloadDays.length === 0) {
            return { week, skipped: true as const };
          }
          const existingId = existingIdByWeek.get(week);
          const res = existingId
            ? await updateMealPlan(existingId, {
                days: payloadDays,
                shoppingNotes: shoppingNotes.trim() || null,
              })
            : await createMealPlan({
                weekStart: week,
                days: payloadDays,
                shoppingNotes: shoppingNotes.trim() || null,
              });
          return { week, skipped: false as const, error: res.error };
        }),
      );

      const failures = results.filter(
        (r): r is { week: string; skipped: false; error: string } =>
          !r.skipped && !!r.error,
      );
      const saved = results.filter((r) => !r.skipped && !('error' in r && r.error));

      if (failures.length > 0) {
        Alert.alert(
          'Partially saved',
          `Saved ${saved.length} of ${weekOptions.length} weeks. ${failures.length} failed: ${failures[0].error}`,
        );
      } else {
        Alert.alert(
          'Saved',
          `Applied selections to ${saved.length} week${saved.length === 1 ? '' : 's'}.`,
        );
      }
      refetchPlan();
    } finally {
      setBulkSaving(false);
    }
  };

  const onConfirm = () => {
    if (applyToAll) {
      saveAllWeeks();
    } else {
      saveSingleWeek();
    }
  };

  const goToBooking = () => {
    const parent = navigation.getParent();
    if (parent) {
      (parent as { navigate: (name: string) => void }).navigate('Booking');
    }
  };

  if (subscriptionLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={CHEF_ORANGE} />
      </View>
    );
  }

  if (!isActive) {
    return (
      <View style={[styles.centered, styles.padded]}>
        <Image
          source={require('../../assets/images/utensils.png')}
          style={styles.gateImage}
          resizeMode="contain"
        />
        <Text style={styles.gateTitle}>Start a subscription to plan meals</Text>
        <Text style={styles.gateBody}>
          Weekly meal selection is part of an active Chef2Home subscription.
        </Text>
        <Button mode="contained" onPress={goToBooking} style={styles.primaryBtn}>
          Start your subscription
        </Button>
      </View>
    );
  }

  if (!visitingDays.length) {
    return (
      <View style={[styles.centered, styles.padded]}>
        <Text style={styles.gateTitle}>No visiting days set</Text>
        <Text style={styles.gateBody}>
          Set your visiting days on your subscription, then come back to plan meals.
        </Text>
      </View>
    );
  }

  if (weekOptions.length === 0) {
    return (
      <View style={[styles.centered, styles.padded]}>
        <Text style={styles.gateTitle}>Subscription period has ended</Text>
        <Text style={styles.gateBody}>
          Renew your subscription to plan meals for upcoming weeks.
        </Text>
      </View>
    );
  }

  const isLoading = mealsLoading || planLoading;
  const loadError = mealsError ?? planError;
  const activeDayInfo = visitingDays.find((d) => d.day === activeDay) ?? visitingDays[0];
  const activeSelection = selections[activeDayInfo.day] ?? new Set<number>();
  const activeLocked =
    dayLocked(selectedWeek, activeDayInfo.day, activeDayInfo.timeOfDay) ||
    ingredientsPaidForWeek;
  const activePlanDay = planDayMap.get(activeDayInfo.day);
  const activeSourceLabel = activePlanDay && SOURCE_LABEL[activePlanDay.source];
  const savingAny = saving || bulkSaving;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Plan your meals</Text>
          <View style={styles.applyToAllWrap}>
            <Text style={styles.applyToAllLabel}>Apply to all</Text>
            <Switch
              value={applyToAll}
              onValueChange={setApplyToAll}
              disabled={ingredientsPaidForWeek || savingAny}
              trackColor={{ false: '#d1d5db', true: CHEF_ORANGE }}
              thumbColor="#fff"
            />
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekStrip}
        >
          {weekOptions.map((w) => {
            const selected = w === selectedWeek;
            return (
              <TouchableOpacity
                key={w}
                onPress={() => setSelectedWeek(w)}
                disabled={savingAny}
                style={[
                  styles.weekChip,
                  selected && styles.weekChipSelected,
                  savingAny && styles.chipDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.weekChipText,
                    selected && styles.weekChipTextSelected,
                  ]}
                >
                  {weekRangeLabel(w)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.dayStrip}>
          {visitingDays.map(({ day, timeOfDay }) => {
            const locked =
              dayLocked(selectedWeek, day, timeOfDay) || ingredientsPaidForWeek;
            const count = selections[day]?.size ?? 0;
            const selected = activeDay === day;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setActiveDay(day)}
                disabled={savingAny}
                style={[
                  styles.dayChip,
                  selected && styles.dayChipSelected,
                  savingAny && styles.chipDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.dayChipDay,
                    selected && styles.dayChipDaySelected,
                  ]}
                >
                  {capitalizeString(day).slice(0, 3)}
                </Text>
                <Text
                  style={[
                    styles.dayChipMeta,
                    selected && styles.dayChipMetaSelected,
                  ]}
                >
                  {locked ? 'Locked' : `${count}/${MAX_PER_DAY}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.activeDayHeader}>
          <Text style={styles.activeDayTitle}>
            {capitalizeString(activeDayInfo.day)} · {capitalizeString(activeDayInfo.timeOfDay)}
          </Text>
          {ingredientsPaidForWeek ? (
            <Text style={styles.lockedTag}>Ingredients paid — selections locked</Text>
          ) : activeLocked ? (
            <Text style={styles.lockedTag}>Cutoff passed — locked</Text>
          ) : (
            <Text style={styles.counter}>
              {activeSelection.size} / {MAX_PER_DAY} selected
            </Text>
          )}
          {activeSourceLabel ? (
            <Text style={styles.sourceTag}>{activeSourceLabel}</Text>
          ) : null}
        </View>

        {!ingredientsPaidForWeek ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Shopping notes (optional)</Text>
            <Text style={styles.notesHint}>
              Brand preferences, substitutes, or items to avoid — saved for this week.
            </Text>
            <TextInput
              style={styles.notesInput}
              value={shoppingNotes}
              onChangeText={setShoppingNotes}
              placeholder="e.g. Use Gino tomato paste, no cilantro"
              placeholderTextColor={GRAY_400}
              multiline
              maxLength={2000}
              editable={!savingAny && !activeLocked}
            />
          </View>
        ) : mealPlan?.effectiveShoppingNotes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Shopping notes</Text>
            <Text style={styles.notesReadonly}>{mealPlan.effectiveShoppingNotes}</Text>
          </View>
        ) : null}
      </View>

      {isLoading && !meals ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={CHEF_ORANGE} />
        </View>
      ) : loadError ? (
        <View style={[styles.centered, styles.padded]}>
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : (
        <View style={styles.listWrap}>
          <SectionList
            sections={mealSections}
            keyExtractor={(m) => String(m.id)}
            stickySectionHeadersEnabled
            contentContainerStyle={styles.listContent}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{section.title}</Text>
              </View>
            )}
            renderItem={({ item }) => {
              const isSelected = activeSelection.has(item.id);
              const capReached = activeSelection.size >= MAX_PER_DAY;
              const isDisabled =
                activeLocked || (!isSelected && capReached) || savingAny;
              return (
                <TouchableOpacity
                  style={[
                    styles.row,
                    isSelected && styles.rowSelected,
                    isDisabled && styles.rowDisabled,
                  ]}
                  onPress={() => toggleMeal(activeDayInfo.day, item.id)}
                  disabled={isDisabled}
                  activeOpacity={0.7}
                >
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, styles.thumbPlaceholder]}>
                      <MaterialCommunityIcons
                        name="silverware-fork-knife"
                        size={26}
                        color={CHEF_ORANGE}
                      />
                    </View>
                  )}
                  <View style={styles.rowBody}>
                    <Text style={styles.mealName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.description ? (
                      <Text style={styles.mealDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.mutedText}>No meals available yet.</Text>
              </View>
            }
          />
          {planLoading && meals ? (
            <View style={styles.loadingOverlay} pointerEvents="auto">
              <View style={styles.loadingPill}>
                <ActivityIndicator size="large" color={CHEF_ORANGE} />
                <Text style={styles.loadingLabel}>
                  Loading {weekRangeLabel(selectedWeek)}…
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      )}

      {!ingredientsPaidForWeek || canOpenIngredientCheckout ? (
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            {!ingredientsPaidForWeek ? (
              <Button
                mode="contained"
                onPress={onConfirm}
                loading={savingAny}
                disabled={savingAny}
                style={[styles.primaryBtn, styles.footerBtn]}
              >
                Save
              </Button>
            ) : null}
            {canOpenIngredientCheckout ? (
              <Button
                mode="outlined"
                textColor={CHEF_ORANGE}
                disabled={savingAny}
                onPress={() =>
                  (
                    navigation as unknown as {
                      navigate: (
                        name: 'IngredientCheckout',
                        params: { mealPlanId: number },
                      ) => void;
                    }
                  ).navigate('IngredientCheckout', {
                    mealPlanId: mealPlanIdForReview,
                  })
                }
                style={[styles.outlinedBtn, styles.footerBtn]}
              >
                Review
              </Button>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  padded: { padding: 24 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: CHEF_GREEN,
  },
  applyToAllWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  applyToAllLabel: { fontSize: 13, color: GRAY_600, fontWeight: '600' },
  weekStrip: { gap: 8, paddingVertical: 8, paddingRight: 16 },
  weekChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  weekChipSelected: { backgroundColor: CHEF_ORANGE, borderColor: CHEF_ORANGE },
  weekChipText: { fontSize: 12, color: GRAY_600, fontWeight: '500' },
  weekChipTextSelected: { color: '#fff', fontWeight: '700' },
  dayStrip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  dayChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  dayChipSelected: { borderColor: CHEF_ORANGE, backgroundColor: '#fff8f0' },
  dayChipDay: { fontSize: 12, fontWeight: '700', color: CHEF_GREY },
  dayChipDaySelected: { color: CHEF_ORANGE },
  dayChipMeta: { fontSize: 11, color: GRAY_600, marginTop: 2 },
  dayChipMetaSelected: { color: CHEF_ORANGE, fontWeight: '600' },
  activeDayHeader: { paddingHorizontal: 4, paddingTop: 16 },
  activeDayTitle: { fontSize: 16, fontWeight: '700', color: CHEF_GREY },
  counter: {
    fontSize: 13,
    color: CHEF_ORANGE,
    fontWeight: '600',
    marginTop: 4,
  },
  lockedTag: { fontSize: 12, color: ERROR_RED, marginTop: 4, fontWeight: '600' },
  sourceTag: { fontSize: 12, color: GRAY_600, marginTop: 4, fontStyle: 'italic' },
  notesBox: { marginTop: 12, paddingHorizontal: 4 },
  notesLabel: { fontSize: 14, fontWeight: '600', color: CHEF_GREY },
  notesHint: { fontSize: 12, color: GRAY_600, marginTop: 4, marginBottom: 8 },
  notesInput: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: CHEF_GREY,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  notesReadonly: { fontSize: 14, color: GRAY_600, marginTop: 6 },
  listWrap: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120 },
  sectionHeader: {
    backgroundColor: '#fafafa',
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: GRAY_600,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250,250,250,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingPill: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  loadingLabel: {
    marginTop: 10,
    fontSize: 13,
    color: CHEF_GREY,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowSelected: { borderColor: CHEF_ORANGE, backgroundColor: '#fff8f0' },
  rowDisabled: { opacity: 0.45 },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: GRAY_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbPlaceholder: { backgroundColor: '#fff3e0' },
  rowBody: { flex: 1, marginHorizontal: 12, minWidth: 0 },
  mealName: { fontSize: 15, fontWeight: '600', color: CHEF_GREY },
  mealDesc: { fontSize: 12, color: GRAY_600, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: GRAY_400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: { borderColor: CHEF_ORANGE, backgroundColor: CHEF_ORANGE },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  primaryBtn: { backgroundColor: CHEF_ORANGE, borderRadius: 12 },
  outlinedBtn: { borderRadius: 12, borderColor: CHEF_ORANGE },
  footerRow: { flexDirection: 'row', gap: 8 },
  footerBtn: { flex: 1 },
  chipDisabled: { opacity: 0.45 },
  errorText: { color: ERROR_RED, textAlign: 'center' },
  mutedText: { color: GRAY_600 },
  gateImage: { height: 120, marginBottom: 16 },
  gateTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  gateBody: {
    fontSize: 14,
    color: GRAY_600,
    textAlign: 'center',
    marginBottom: 24,
  },
});
