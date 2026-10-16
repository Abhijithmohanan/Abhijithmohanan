export const MEMBERSHIP_TYPES = ['Individual', 'Student', 'Creator', 'Partner'] as const;
export type MembershipType = (typeof MEMBERSHIP_TYPES)[number];

export const MEMBERSHIP_STATUSES = [
  'Pending',
  'Under Review',
  'Approved',
  'Rejected',
  'More Information Required',
] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export type MembershipRequest = {
  id: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  phoneNumber: string;
  membershipType: MembershipType;
  reason: string;
  additionalInformation: string;
  status: MembershipStatus;
  adminRemarks: string;
  memberVisibleMessage: string;
  createdAt: import('firebase/firestore').Timestamp;
  updatedAt: import('firebase/firestore').Timestamp;
};

export function formatDate(value: MembershipRequest['createdAt'] | null | undefined) {
  if (!value) return 'Just now';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    value.toDate(),
  );
}

export function statusTone(status: string) {
  switch (status) {
    case 'Approved':
      return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    case 'Rejected':
      return 'border-brand-red/30 bg-brand-red/10 text-red-300';
    case 'More Information Required':
      return 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold';
    case 'Under Review':
      return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
    default:
      return 'border-white/15 bg-white/[0.04] text-neutral-300';
  }
}
