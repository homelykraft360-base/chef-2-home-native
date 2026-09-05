export type InviteErrorKind =
  | 'missing_token'
  | 'invalid'
  | 'invite_identity_mismatch'
  | 'already_subscribed'
  | 'pending_invoice'
  | 'already_in_household'
  | 'household_area_mismatch'
  | 'invite_expired'
  | 'generic';

export type InviteErrorCopy = {
  title: string;
  body: string;
};

const ERROR_COPY: Record<InviteErrorKind, InviteErrorCopy> = {
  missing_token: {
    title: 'This invite link is incomplete.',
    body: 'Open the link from your email or text message, or ask the household payer for a new invite.',
  },
  invalid: {
    title: 'This invite is no longer valid.',
    body: 'It may have expired or already been used. Ask the payer to resend or send a new invite.',
  },
  invite_expired: {
    title: 'This invite is no longer valid.',
    body: 'It may have expired or already been used. Ask the payer to resend or send a new invite.',
  },
  invite_identity_mismatch: {
    title: 'This invite was sent to a different email or phone.',
    body: 'Sign in with the invited contact, or ask the payer to invite the account you use.',
  },
  already_subscribed: {
    title: 'You already have your own Chef2Home subscription.',
    body: "Cancel or let that plan expire before joining this household. We won't merge two paid plans.",
  },
  pending_invoice: {
    title: 'You have an open subscription payment.',
    body: 'Finish or wait for it to expire, then try this invite again.',
  },
  already_in_household: {
    title: "You're already on a household plan.",
    body: 'Leave that household before accepting another invite.',
  },
  household_area_mismatch: {
    title: 'Your area must match the household payer',
    body: 'When the payer is on Lagos Island or Lagos Mainland, members with their own address must use the same area. Choose Same as owner, or pick the matching area.',
  },
  generic: {
    title: "We couldn't accept this invite.",
    body: 'Check your connection and try again. If it keeps failing, ask the payer to resend.',
  },
};

export function mapInviteError(
  error: string | null | undefined,
): InviteErrorCopy {
  if (!error) {
    return ERROR_COPY.generic;
  }

  const normalized = error.trim().toLowerCase();

  if (normalized.includes('invite_identity_mismatch')) {
    return ERROR_COPY.invite_identity_mismatch;
  }
  if (normalized.includes('already_subscribed')) {
    return ERROR_COPY.already_subscribed;
  }
  if (normalized.includes('pending_invoice')) {
    return ERROR_COPY.pending_invoice;
  }
  if (normalized.includes('already_in_household')) {
    return ERROR_COPY.already_in_household;
  }
  if (normalized.includes('household_area_mismatch')) {
    return ERROR_COPY.household_area_mismatch;
  }
  if (
    normalized.includes('invite_expired') ||
    normalized.includes('invite not found') ||
    normalized.includes('not found')
  ) {
    return ERROR_COPY.invite_expired;
  }

  return ERROR_COPY.generic;
}

export function getInviteErrorCopy(kind: InviteErrorKind): InviteErrorCopy {
  return ERROR_COPY[kind];
}
