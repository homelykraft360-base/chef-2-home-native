import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Checkbox } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { usePaystack } from 'react-native-paystack-webview';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import PaystackResumeTransactionModal from '../components/PaystackResumeTransactionModal';
import ShoppingNotesSheet from '../components/ShoppingNotesSheet';
import {
  CHEF_GREEN,
  CHEF_GREY,
  CHEF_ORANGE,
  ERROR_RED,
  GRAY_100,
  GRAY_400,
  GRAY_600,
} from '../constants/theme';
import useGetCurrentUserDetails from '../hooks/useGetCurrentUserDetails';
import useMealPlanIngredients from '../hooks/useMealPlanIngredients';
import type {
  ExclusionReason,
  MealPlanIngredientRow,
  MealPlanMealRow,
} from '../types';
import { formatToMoney } from '../utils/string.utils';
import { weekRangeLabel } from '../utils/week';

type IngredientCheckoutRouteParams = {
  IngredientCheckout: { mealPlanId: number };
};

function dayLabel(day: string) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function IngredientToggle({
  isExcluded,
  onPress,
  disabled,
}: {
  isExcluded: boolean;
  onPress: (reason: ExclusionReason) => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.excludeBox}
      onPress={() => onPress('have')}
      disabled={disabled}
      activeOpacity={0.6}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isExcluded, disabled }}
      accessibilityLabel="Exclude ingredient"
    >
      <Checkbox.Android
        status={isExcluded ? 'checked' : 'unchecked'}
        color={CHEF_ORANGE}
        disabled={disabled}
      />
    </TouchableOpacity>
  );
}

function IngredientRow({
  row,
  onToggle,
  disabled,
  showTopBorder = true,
}: {
  row: MealPlanIngredientRow;
  onToggle: (ingredientId: number, reason: ExclusionReason) => void;
  disabled?: boolean;
  showTopBorder?: boolean;
}) {
  return (
    <View
      style={[styles.ingredientRow, showTopBorder && styles.ingredientRowBorder]}
    >
      <View style={styles.ingredientText}>
        <Text
          style={[
            styles.ingredientName,
            row.isExcluded && styles.ingredientNameExcluded,
          ]}
        >
          {row.name}
        </Text>
        {row.quantity ? (
          <Text style={styles.ingredientMeta}>
            {row.quantity} {row.unit ?? ''}
          </Text>
        ) : null}
      </View>
      <IngredientToggle
        isExcluded={row.isExcluded}
        disabled={disabled}
        onPress={(reason) => onToggle(row.ingredientId, reason)}
      />
    </View>
  );
}

function MealCard({
  meal,
  onToggle,
  disabled,
}: {
  meal: MealPlanMealRow;
  onToggle: (
    mealPlanDayId: number,
    mealId: number,
    ingredientId: number,
    reason: ExclusionReason,
  ) => void;
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const ingredientCount = meal.ingredients.length;

  return (
    <View style={styles.mealCard}>
      <TouchableOpacity
        style={styles.mealHeader}
        onPress={() => setExpanded((open) => !open)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${meal.mealName} ingredients`}
      >
        <View style={styles.mealHeaderText}>
          <Text style={styles.mealDay}>{dayLabel(meal.dayOfWeek)}</Text>
          <Text style={styles.mealName}>{meal.mealName}</Text>
          <Text style={styles.mealIngredientMeta}>
            {ingredientCount}{' '}
            {ingredientCount === 1 ? 'ingredient' : 'ingredients'}
          </Text>
        </View>
        <View style={styles.mealHeaderEnd}>
          <Text style={styles.mealSubtotal}>
            {formatToMoney((meal.mealSubtotalKobo / 100).toFixed(2))}
          </Text>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={GRAY_600}
          />
        </View>
      </TouchableOpacity>
      {expanded ? (
        <View style={styles.ingredientsList}>
          <Text style={styles.ingredientsListLabel}>Ingredients</Text>
          {meal.ingredients.map((ing, index) => (
            <IngredientRow
              key={`${meal.mealPlanDayId}:${meal.mealId}:${ing.ingredientId}`}
              row={ing}
              disabled={disabled}
              showTopBorder={index > 0}
              onToggle={(ingredientId, reason) =>
                onToggle(meal.mealPlanDayId, meal.mealId, ingredientId, reason)
              }
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function IngredientCheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<IngredientCheckoutRouteParams, 'IngredientCheckout'>>();
  const { mealPlanId } = route.params ?? { mealPlanId: 0 };
  const { popup } = usePaystack();
  const [paystackResumeCode, setPaystackResumeCode] = useState<string | null>(null);
  const [shoppingNotes, setShoppingNotes] = useState('');
  const [notesSheetOpen, setNotesSheetOpen] = useState(false);
  const { user } = useGetCurrentUserDetails();
  const {
    breakdown,
    loading,
    error,
    paying,
    toggleIngredient,
    checkout,
    refetch,
  } = useMealPlanIngredients(mealPlanId);

  const disabled = useMemo(
    () =>
      !breakdown ||
      breakdown.paymentStatus !== 'unpaid' ||
      paying,
    [breakdown, paying],
  );

  useEffect(() => {
    if (!breakdown) return;
    setShoppingNotes(breakdown.shoppingNotes ?? '');
  }, [breakdown?.mealPlanId, breakdown?.shoppingNotes]);

  const notesReadOnly = breakdown?.paymentStatus === 'paid';
  const displayedNotes = notesReadOnly
    ? breakdown?.effectiveShoppingNotes ?? ''
    : shoppingNotes;

  const closePaystackResume = useCallback(() => {
    setPaystackResumeCode(null);
  }, []);

  const handlePay = useCallback(async () => {
    if (!user?.email || !breakdown) return;
    const checkoutResp = await checkout(shoppingNotes.trim() || null);
    if (!checkoutResp) return;

    // Backend already called Paystack `transaction/initialize`; the inline SDK
    // must resume with `access_code`. A fresh `checkout()` would conflict with
    // the server-created reference and the WebView often stays blank.
    const accessCode =
      typeof checkoutResp.accessCode === 'string'
        ? checkoutResp.accessCode.trim()
        : '';
    if (accessCode) {
      setPaystackResumeCode(accessCode);
      return;
    }

    popup.checkout({
      email: user.email,
      amount: checkoutResp.amount / 100,
      reference: checkoutResp.reference,
      metadata: {
        custom_fields: [
          {
            display_name: 'Kind',
            variable_name: 'kind',
            value: 'weekly_ingredients',
          },
          {
            display_name: 'Meal plan',
            variable_name: 'meal_plan_id',
            value: String(breakdown.mealPlanId),
          },
        ],
      },
      onSuccess: () => {
        Alert.alert('Payment', 'Ingredient payment successful.');
        refetch();
        navigation.goBack();
      },
      onCancel: () => {},
    });
  }, [breakdown, checkout, navigation, popup, refetch, shoppingNotes, user]);

  if (loading || !breakdown) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={CHEF_ORANGE} />
      </View>
    );
  }

  if (!breakdown.meals.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No meals selected</Text>
        <Text style={styles.emptyBody}>
          Pick meals for this week before reviewing ingredients.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {paystackResumeCode ? (
        <PaystackResumeTransactionModal
          visible
          accessCode={paystackResumeCode}
          onMessageSuccess={() => {
            closePaystackResume();
            Alert.alert('Payment', 'Ingredient payment successful.');
            refetch();
            navigation.goBack();
          }}
          onMessageCancel={closePaystackResume}
          onMessageError={(message) => {
            closePaystackResume();
            Alert.alert('Payment', message);
          }}
          onRequestClose={closePaystackResume}
        />
      ) : null}
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          breakdown.paymentStatus === 'paid' && styles.scrollPaidNoFooter,
        ]}
      >
        <Text style={styles.weekHeading}>
          Week of {weekRangeLabel(breakdown.weekStart)}
        </Text>
        {error && <Text style={styles.errorBanner}>{error}</Text>}
        {breakdown.cutoffPassed && breakdown.paymentStatus !== 'unpaid' && (
          <Text style={styles.lockedBanner}>
            Cutoff has passed — ingredients are locked for this week.
          </Text>
        )}
        {breakdown.cutoffPassed && breakdown.paymentStatus === 'unpaid' && (
          <Text style={styles.lockedBanner}>
            This week has started, but you can still complete your ingredient
            payment below.
          </Text>
        )}
        {breakdown.paymentStatus === 'paid' && (
          <Text style={styles.paidBanner}>You've paid for this week.</Text>
        )}
        {breakdown.paymentStatus === 'pending' && (
          <Text style={styles.pendingBanner}>
            Payment is being processed — refresh in a few minutes.
          </Text>
        )}
        {breakdown.paymentStatus !== 'paid' && !breakdown.cutoffPassed ? (
          <Text style={styles.disclaimerBanner}>
            Tick the checkbox next to any ingredient you already have to exclude
            it. We'll only charge you for what we'll buy.
          </Text>
        ) : null}

        {breakdown.meals.map((meal) => (
          <MealCard
            key={`${meal.mealPlanDayId}:${meal.mealId}`}
            meal={meal}
            disabled={disabled}
            onToggle={toggleIngredient}
          />
        ))}

        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Shopping notes</Text>
          <Text style={styles.notesHint}>
            Tell your chef about brands, substitutes, or items to avoid before we
            shop.
          </Text>
          {displayedNotes.trim() ? (
            <Text style={styles.notesPreview} numberOfLines={3}>
              {displayedNotes}
            </Text>
          ) : (
            <Text style={styles.notesEmpty}>No notes added yet.</Text>
          )}
          <TouchableOpacity
            style={styles.notesBtn}
            onPress={() => setNotesSheetOpen(true)}
            disabled={paying}
          >
            <MaterialCommunityIcons
              name="note-text-outline"
              size={18}
              color={CHEF_ORANGE}
            />
            <Text style={styles.notesBtnText}>
              {notesReadOnly
                ? 'View shopping notes'
                : shoppingNotes.trim()
                  ? 'Edit shopping notes'
                  : 'Add shopping notes'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Gross total</Text>
            <Text style={styles.totalValue}>
              {formatToMoney((breakdown.grossTotalKobo / 100).toFixed(2))}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Excluded</Text>
            <Text style={styles.totalValue}>
              −{formatToMoney((breakdown.excludedTotalKobo / 100).toFixed(2))}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.payableRow]}>
            <Text style={styles.payableLabel}>
              {breakdown.paymentStatus === 'paid' ? 'Paid' : 'Payable'}
            </Text>
            <Text style={styles.payableValue}>
              {formatToMoney((breakdown.payableTotalKobo / 100).toFixed(2))}
            </Text>
          </View>
        </View>
      </ScrollView>

      {breakdown.paymentStatus !== 'paid' ? (
        <View style={styles.footer}>
          <Button
            mode="contained"
            buttonColor={CHEF_ORANGE}
            textColor="#fff"
            loading={paying}
            disabled={
              disabled ||
              breakdown.payableTotalKobo <= 0 ||
              !user?.email
            }
            onPress={handlePay}
            style={styles.payButton}
          >
            Pay {formatToMoney((breakdown.payableTotalKobo / 100).toFixed(2))}
          </Button>
        </View>
      ) : null}

      <ShoppingNotesSheet
        visible={notesSheetOpen}
        value={displayedNotes}
        onChange={setShoppingNotes}
        onClose={() => setNotesSheetOpen(false)}
        readOnly={notesReadOnly}
        title={notesReadOnly ? 'Shopping notes' : 'Shopping notes (optional)'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 16, paddingBottom: 120 },
  scrollPaidNoFooter: { paddingBottom: 24 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CHEF_GREY,
    marginBottom: 8,
  },
  emptyBody: { color: GRAY_600, textAlign: 'center' },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  mealHeaderText: { flex: 1 },
  mealHeaderEnd: {
    alignItems: 'flex-end',
    gap: 4,
  },
  mealDay: { color: GRAY_600, fontSize: 12, marginBottom: 2 },
  mealName: { fontSize: 16, fontWeight: '600', color: CHEF_GREY },
  mealIngredientMeta: {
    fontSize: 12,
    color: GRAY_600,
    marginTop: 6,
  },
  mealSubtotal: { fontSize: 14, fontWeight: '600', color: CHEF_GREEN },
  ingredientsList: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  ingredientsListLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: CHEF_GREY,
    marginBottom: 10,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  ingredientRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    marginTop: 4,
    paddingTop: 12,
  },
  ingredientText: { flex: 1 },
  ingredientName: { fontSize: 14, color: CHEF_GREY, fontWeight: '500' },
  ingredientNameExcluded: {
    color: GRAY_400,
    textDecorationLine: 'line-through',
  },
  ingredientMeta: { fontSize: 12, color: GRAY_600, marginTop: 2 },
  weekHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: CHEF_GREY,
    marginBottom: 8,
  },
  excludeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 4,
  },
  disclaimerBanner: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    color: '#9a3412',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CHEF_GREY,
    marginBottom: 6,
  },
  notesHint: {
    fontSize: 13,
    color: GRAY_600,
    lineHeight: 18,
    marginBottom: 10,
  },
  notesPreview: {
    fontSize: 14,
    color: CHEF_GREY,
    lineHeight: 20,
    marginBottom: 10,
  },
  notesEmpty: {
    fontSize: 14,
    color: GRAY_400,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  notesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  notesBtnText: { fontSize: 14, fontWeight: '600', color: CHEF_ORANGE },
  totalsCard: {
    backgroundColor: GRAY_100,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: { color: GRAY_600, fontSize: 14 },
  totalValue: { color: CHEF_GREY, fontSize: 14, fontVariant: ['tabular-nums'] },
  payableRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
    paddingTop: 10,
  },
  payableLabel: { color: CHEF_GREY, fontWeight: '700', fontSize: 16 },
  payableValue: {
    color: CHEF_ORANGE,
    fontWeight: '700',
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  payButton: { borderRadius: 12, paddingVertical: 4 },
  errorBanner: {
    backgroundColor: '#fef2f2',
    color: ERROR_RED,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  lockedBanner: {
    backgroundColor: GRAY_100,
    color: GRAY_600,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  paidBanner: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  pendingBanner: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
});
