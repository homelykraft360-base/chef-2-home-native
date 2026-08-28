import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Card, Snackbar } from 'react-native-paper';
import { useSelector } from 'react-redux';

import {
  CHEF_ORANGE,
  GRAY_100,
  GRAY_400,
  GRAY_600,
} from '../../constants/theme';
import { currentUser } from '../../store/authSlice';
import useHouseholdMembers from '../../hooks/useHouseholdMembers';
import useHouseholdMutations from '../../hooks/useHouseholdMutations';
import type { HouseholdManagement, SubscriptionMember } from '../../types';

function memberLabel(
  member: SubscriptionMember,
  currentUserId?: number,
): string {
  if (currentUserId != null && member.userId === currentUserId) {
    return 'You';
  }
  if (member.inviteEmail) return member.inviteEmail;
  if (member.invitePhone) return member.invitePhone;
  return member.userId ? `User #${member.userId}` : 'Member';
}

function memberChipName(
  member: SubscriptionMember,
  currentUserId?: number,
): string {
  if (currentUserId != null && member.userId === currentUserId) {
    return 'You';
  }
  if (member.inviteEmail) return member.inviteEmail.split('@')[0];
  if (member.invitePhone) return member.invitePhone;
  return 'Member';
}

type QuotaDraft = number;

export default function HouseholdTab() {
  const user = useSelector(currentUser);
  const {
    members,
    seatsUsed,
    householdManagement,
    weeklySessionsPool,
    loading,
    error,
    refetch,
  } = useHouseholdMembers();

  const {
    inviteLoading,
    modeLoading,
    quotasLoading,
    resendLoading,
    removeLoading,
    inviteMember,
    updateMode,
    updateQuotas,
    resendInvite,
    removeMember,
  } = useHouseholdMutations();

  const [inviteChannel, setInviteChannel] = useState<'email' | 'phone'>('email');
  const [inviteValue, setInviteValue] = useState('');
  const [drafts, setDrafts] = useState<Record<number, QuotaDraft>>({});
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const activeMembers = useMemo(
    () => members.filter((m) => m.status !== 'removed'),
    [members],
  );

  const pendingCount = useMemo(
    () => activeMembers.filter((m) => m.status === 'invited').length,
    [activeMembers],
  );

  const sessionPoolFromSub = weeklySessionsPool || 8;

  const editableMembers = useMemo(
    () =>
      activeMembers.filter(
        (m) => m.role !== 'payer' && m.status === 'active',
      ),
    [activeMembers],
  );

  const getDraftSessions = useCallback(
    (member: SubscriptionMember): number =>
      drafts[member.id] ?? member.weeklySessionsQuota ?? 0,
    [drafts],
  );

  const assignedSessions = useMemo(
    () =>
      editableMembers.reduce((sum, member) => sum + getDraftSessions(member), 0),
    [editableMembers, getDraftSessions],
  );

  const payerSessions = sessionPoolFromSub - assignedSessions;
  const sessionsOver = assignedSessions > sessionPoolFromSub;
  const hasDirtyQuotas = Object.keys(drafts).length > 0;

  const seatSummary =
    pendingCount > 0
      ? `${seatsUsed} of 4 seats used · ${pendingCount} pending`
      : `${seatsUsed} of 4 seats used`;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleModeChange = (mode: HouseholdManagement) => {
    if (mode === householdManagement || modeLoading) return;
    updateMode({
      payload: mode,
      onSuccess: () => {
        void refetch();
      },
      onError: () => {
        setSnackbar("Couldn't update household mode. Check your connection and try again.");
      },
    });
  };

  const handleInvite = () => {
    const trimmed = inviteValue.trim();
    if (!trimmed) return;

    if (seatsUsed >= 4) {
      setSnackbar(
        'This household is full. Remove a member or wait for a pending invite to expire.',
      );
      return;
    }

    inviteMember({
      payload:
        inviteChannel === 'email'
          ? { inviteEmail: trimmed }
          : { invitePhone: trimmed },
      onSuccess: () => {
        setInviteValue('');
        setSnackbar('Invite sent.');
        void refetch();
      },
      onError: () => {
        setSnackbar("Couldn't send invite. Check the contact and try again.");
      },
    });
  };

  const handleUpdateQuotas = (member: SubscriptionMember) => {
    const sessions = getDraftSessions(member);
    updateQuotas({
      payload: {
        memberId: member.id,
        weeklySessionsQuota: sessions,
      },
      onSuccess: () => {
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[member.id];
          return next;
        });
        setSnackbar('Quotas updated.');
        void refetch();
      },
      onError: () => {
        setSnackbar(
          "Couldn't update quotas. Reduce another member's allocation and try again.",
        );
      },
    });
  };

  const handleResend = (memberId: number) => {
    resendInvite({
      payload: memberId,
      onSuccess: () => {
        setSnackbar('Invite resent.');
        void refetch();
      },
      onError: () => {
        setSnackbar("Couldn't send invite. Check the contact and try again.");
      },
    });
  };

  const handleRemove = (member: SubscriptionMember) => {
    if (member.role === 'payer') {
      setSnackbar("Can't remove the payer while the subscription is active.");
      return;
    }
    const name = memberChipName(member, user?.id);
    Alert.alert(
      `Remove ${name} from household?`,
      'They will lose access immediately. Their meal plans and visits stay in history but they can\'t use the shared subscription.',
      [
        { text: 'Keep member', style: 'cancel' },
        {
          text: 'Remove from household',
          style: 'destructive',
          onPress: () => {
            removeMember({
              payload: member.id,
              onSuccess: () => {
                setSnackbar('Member removed from household.');
                void refetch();
              },
              onError: () => {
                setSnackbar("Couldn't send invite. Check the contact and try again.");
              },
            });
          },
        },
      ],
    );
  };

  const setDraftSessions = (memberId: number, value: string) => {
    const member = editableMembers.find((m) => m.id === memberId);
    if (!member) return;
    const parsed = Math.max(0, parseInt(value.replace(/\D/g, ''), 10) || 0);
    setDrafts((prev) => ({
      ...prev,
      [memberId]: parsed,
    }));
  };

  if (loading && !refreshing && members.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={CHEF_ORANGE} />
        <Text style={styles.loadingText}>Loading household…</Text>
      </View>
    );
  }

  if (error && members.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn't load household.</Text>
        <Text style={styles.errorSub}>Pull to refresh or try again.</Text>
        <Button mode="contained" onPress={() => void refetch()} style={styles.retryBtn}>
          Try again
        </Button>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
      >
        <Text style={styles.seatSummary}>{seatSummary}</Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionLabel}>How meals are managed</Text>
            <ModeRadio
              label="Payer assigns"
              helper="Only you can edit visit days and meal plans for members."
              selected={householdManagement === 'payer_assigns'}
              onPress={() => handleModeChange('payer_assigns')}
              disabled={modeLoading}
            />
            <ModeRadio
              label="Members pick"
              helper="Each member edits their own meals and visits within their quotas."
              selected={householdManagement === 'members_pick'}
              onPress={() => handleModeChange('members_pick')}
              disabled={modeLoading}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionLabel}>Invite a member</Text>
            <View style={styles.segmentRow}>
              <Button
                mode={inviteChannel === 'email' ? 'contained' : 'outlined'}
                onPress={() => setInviteChannel('email')}
                style={styles.segmentBtn}
                compact
              >
                Email
              </Button>
              <Button
                mode={inviteChannel === 'phone' ? 'contained' : 'outlined'}
                onPress={() => setInviteChannel('phone')}
                style={styles.segmentBtn}
                compact
              >
                Phone
              </Button>
            </View>
            <Text style={styles.fieldLabel}>
              {inviteChannel === 'email' ? 'Email address' : 'Phone number'}
            </Text>
            <TextInput
              style={styles.input}
              value={inviteValue}
              onChangeText={setInviteValue}
              placeholder={
                inviteChannel === 'email' ? 'name@example.com' : '8123456789'
              }
              keyboardType={inviteChannel === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
            />
            <Button
              mode="contained"
              onPress={handleInvite}
              loading={inviteLoading}
              disabled={inviteLoading || !inviteValue.trim()}
              style={styles.cta}
            >
              Send invite
            </Button>
          </Card.Content>
        </Card>

        <Text style={styles.sectionLabel}>Members</Text>
        {activeMembers.map((member) => {
          const isPayer = member.role === 'payer';
          const canEditSessions =
            member.role !== 'payer' && member.status === 'active';
          const draftSessions = getDraftSessions(member);
          const isDirty = drafts[member.id] != null;
          return (
            <Card key={member.id} style={styles.memberCard}>
              <Card.Content>
                <View style={styles.memberHeader}>
                  <Text style={styles.memberName}>
                    {memberLabel(member, user?.id)}
                  </Text>
                  <View style={styles.badgeRow}>
                    <Text style={styles.badge}>
                      {member.role === 'payer' ? 'Payer' : 'Member'}
                    </Text>
                    <Text style={styles.badge}>
                      {member.status === 'invited' ? 'Invited' : 'Active'}
                    </Text>
                  </View>
                </View>
                {isPayer ? (
                  <>
                    <Text style={styles.quotaLabel}>Sessions / month</Text>
                    <Text style={styles.payerSessionsValue}>
                      {payerSessions} of {sessionPoolFromSub} for you
                    </Text>
                    <Text style={styles.payerSessionsHint}>
                      {assignedSessions === 0
                        ? 'Your plan includes this many chef visits per billing month. None are assigned to members yet, so you use all of them.'
                        : `${assignedSessions} assigned to members below; the rest are yours this month.`}
                    </Text>
                  </>
                ) : canEditSessions ? (
                  <>
                    <Text style={styles.quotaLabel}>Sessions / month</Text>
                    <TextInput
                      style={styles.input}
                      value={String(draftSessions)}
                      onChangeText={(v) => setDraftSessions(member.id, v)}
                      keyboardType="number-pad"
                    />
                    {isDirty ? (
                      <Button
                        mode="outlined"
                        onPress={() => handleUpdateQuotas(member)}
                        loading={quotasLoading}
                        disabled={quotasLoading || sessionsOver}
                        style={styles.memberAction}
                      >
                        Update sessions
                      </Button>
                    ) : null}
                  </>
                ) : null}
                {member.status === 'invited' ? (
                  <Button
                    mode="text"
                    onPress={() => handleResend(member.id)}
                    loading={resendLoading}
                    disabled={resendLoading}
                  >
                    Resend invite
                  </Button>
                ) : null}
                {member.role !== 'payer' ? (
                  <Button
                    mode="text"
                    textColor="#b91c1c"
                    onPress={() => handleRemove(member)}
                    loading={removeLoading}
                    disabled={removeLoading}
                  >
                    Remove member
                  </Button>
                ) : null}
              </Card.Content>
            </Card>
          );
        })}

        <Text style={styles.poolLine}>
          Household limit: {sessionPoolFromSub} visits/month · Assigned to members:{' '}
          {assignedSessions} · Your visits: {payerSessions}
        </Text>
        {sessionsOver ? (
          <Text style={styles.overCap}>Sessions exceed household limit.</Text>
        ) : null}
        {hasDirtyQuotas && !sessionsOver ? (
          <Text style={styles.hint}>Update sessions on each changed member above.</Text>
        ) : null}
      </ScrollView>

      <Snackbar
        visible={snackbar != null}
        onDismiss={() => setSnackbar(null)}
        duration={2500}
        style={styles.snackbar}
      >
        {snackbar}
      </Snackbar>
    </>
  );
}

function ModeRadio({
  label,
  helper,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  helper: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.radioRow}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <View style={styles.radioTextWrap}>
        <Text style={styles.radioLabel}>{label}</Text>
        <Text style={styles.radioHelper}>{helper}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: 16, paddingBottom: 80 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: { marginTop: 12, color: GRAY_600 },
  errorTitle: { fontSize: 16, fontWeight: '600', color: '#101928', marginBottom: 8 },
  errorSub: { fontSize: 14, color: GRAY_600, textAlign: 'center', marginBottom: 16 },
  retryBtn: { marginTop: 8 },
  seatSummary: {
    fontSize: 15,
    color: GRAY_600,
    marginBottom: 16,
  },
  card: { marginBottom: 24, backgroundColor: '#fff' },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#101928',
    marginBottom: 12,
  },
  segmentRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  segmentBtn: { flex: 1 },
  fieldLabel: { fontSize: 14, color: GRAY_600, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cta: { marginTop: 4 },
  memberCard: { marginBottom: 12, backgroundColor: '#fff' },
  memberHeader: { marginBottom: 8 },
  memberName: { fontSize: 16, fontWeight: '600', color: '#101928' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  badge: {
    fontSize: 12,
    color: GRAY_600,
    backgroundColor: GRAY_100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  quotaLabel: { fontSize: 14, color: GRAY_600, marginBottom: 4, marginTop: 4 },
  payerSessionsValue: {
    fontSize: 16,
    color: '#101928',
    marginBottom: 4,
  },
  payerSessionsHint: {
    fontSize: 13,
    color: GRAY_600,
    lineHeight: 18,
    marginBottom: 8,
  },
  memberAction: { marginTop: 8 },
  poolLine: { fontSize: 14, color: GRAY_600, marginTop: 8 },
  overCap: { fontSize: 14, color: '#b91c1c', marginTop: 4 },
  hint: { fontSize: 13, color: GRAY_400, marginTop: 4 },
  radioRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: GRAY_400,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: { borderColor: CHEF_ORANGE },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: CHEF_ORANGE,
  },
  radioTextWrap: { flex: 1 },
  radioLabel: { fontSize: 16, fontWeight: '600', color: '#101928' },
  radioHelper: { fontSize: 14, color: GRAY_600, marginTop: 2 },
  snackbar: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#101928',
  },
});
