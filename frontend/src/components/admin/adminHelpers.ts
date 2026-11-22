export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'] as const;
export const FULL_ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const;

export const ORDER_STATUS_OPTIONS = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUNDED',
] as const;

export function isAdminRole(role?: string): boolean {
  return Boolean(role && (ADMIN_ROLES as readonly string[]).includes(role));
}

export function isFullAdminRole(role?: string): boolean {
  return Boolean(role && (FULL_ADMIN_ROLES as readonly string[]).includes(role));
}

export function formatCurrency(amount?: number | null): string {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const ORDER_STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  CONFIRMED: { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' },
  PROCESSING: { bg: '#EDE9FE', color: '#5B21B6', border: '#DDD6FE' },
  SHIPPED: { bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' },
  OUT_FOR_DELIVERY: { bg: '#E0E7FF', color: '#3730A3', border: '#C7D2FE' },
  DELIVERED: { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
  CANCELLED: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
  RETURN_REQUESTED: { bg: '#FFEDD5', color: '#9A3412', border: '#FED7AA' },
  RETURNED: { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' },
  REFUNDED: { bg: '#CCFBF1', color: '#115E59', border: '#99F6E4' },
};

export function getOrderStatusStyle(status?: string) {
  const key = (status || 'PENDING').toUpperCase();
  return ORDER_STATUS_STYLES[key] || { bg: '#F1F5F9', color: '#334155', border: '#E2E8F0' };
}

const APPROVAL_STYLES: Record<string, { bg: string; color: string }> = {
  APPROVED: { bg: '#DCFCE7', color: '#166534' },
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
  REJECTED: { bg: '#FEE2E2', color: '#991B1B' },
  SUSPENDED: { bg: '#F1F5F9', color: '#475569' },
};

export function getApprovalStatusStyle(status?: string) {
  const key = (status || 'PENDING').toUpperCase();
  return APPROVAL_STYLES[key] || { bg: '#F1F5F9', color: '#334155' };
}
