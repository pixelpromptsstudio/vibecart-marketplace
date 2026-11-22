'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  formatShortDate,
  isFullAdminRole,
} from '@/components/admin/adminHelpers';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { VibeLoader } from '@/components/VibeLoader';

const ROLE_FILTERS = ['ALL', 'CUSTOMER', 'SELLER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] as const;
const ASSIGNABLE_ROLES = ['CUSTOMER', 'SELLER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] as const;

export default function AdminUsersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page, setPage] = useState(1);

  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [roleChangeTarget, setRoleChangeTarget] = useState<{
    targetUser: any;
    nextRole: string;
  } | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  const canViewUsers = isFullAdminRole(user?.role);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers(
        roleFilter === 'ALL' ? undefined : roleFilter,
        activeSearch || undefined,
        page,
        20
      );
      setUsers(res?.users || []);
      if (res?.pagination) setPagination(res.pagination);
    } catch (err: any) {
      showToast('error', 'Failed to load users', err.message);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, activeSearch, page, showToast]);

  useEffect(() => {
    if (canViewUsers) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [canViewUsers, loadUsers]);

  const commitRoleChange = async () => {
    if (!roleChangeTarget) return;
    try {
      setUpdatingRole(true);
      await adminApi.updateUserRole(roleChangeTarget.targetUser._id, roleChangeTarget.nextRole);
      showToast(
        'success',
        'Role Updated',
        `${roleChangeTarget.targetUser.email} is now ${roleChangeTarget.nextRole}.`
      );
      setRoleChangeTarget(null);
      await loadUsers();
    } catch (err: any) {
      showToast('error', 'Role Update Failed', err.message);
    } finally {
      setUpdatingRole(false);
    }
  };

  return (
    <AdminShell
      title="Users & RBAC Roles"
      subtitle="Search registered customers, sellers & operators; assign access roles (Super Admin)"
    >
      {!canViewUsers ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Shield size={32} color="#64748B" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
            Administrator Clearance Required
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '6px' }}>
            User directory and RBAC management require Admin or Super Admin privileges.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="admin-chip-strip" role="tablist" aria-label="Filter users by role">
            {ROLE_FILTERS.map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={roleFilter === r}
                onClick={() => {
                  setRoleFilter(r);
                  setPage(1);
                }}
                className={`admin-filter-chip ${roleFilter === r ? 'active' : ''}`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="admin-toolbar-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                setActiveSearch(searchInput.trim());
              }}
              className="admin-search-form"
            >
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search user name or email..."
                  aria-label="Search users"
                  className="admin-form-input with-icon"
                />
                <Search size={16} color="#94A3B8" className="admin-input-icon" />
              </div>
              <button type="submit" className="admin-primary-btn">
                Search
              </button>
            </form>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
              {isSuperAdmin
                ? 'Super Admin active: role changes apply immediately.'
                : 'Read-only view (Super Admin required to modify roles).'}
            </div>
          </div>

          <div className="admin-card">
            {loading ? (
              <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
                <VibeLoader label="Loading User Directory..." size="md" />
              </div>
            ) : (
              <>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email &amp; Phone</th>
                        <th>Joined</th>
                        <th>Role</th>
                        <th style={{ textAlign: 'right' }}>RBAC Control</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="admin-empty-cell">
                            No accounts match your query.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u._id}>
                            <td style={{ fontWeight: 700, color: '#0F172A' }}>{u.name}</td>
                            <td>
                              <div style={{ fontSize: '13px', fontWeight: 600 }}>{u.email}</div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                {u.phone || 'No phone'}
                              </div>
                            </td>
                            <td style={{ color: '#64748B', fontSize: '13px' }}>
                              {formatShortDate(u.createdAt)}
                            </td>
                            <td>
                              <span className="admin-role-tag">{u.role}</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {isSuperAdmin ? (
                                <select
                                  aria-label={`Change role for ${u.email}`}
                                  value={u.role}
                                  onChange={(e) => {
                                    const next = e.target.value;
                                    if (next !== u.role) {
                                      setRoleChangeTarget({ targetUser: u, nextRole: next });
                                    }
                                  }}
                                  className="admin-select-compact"
                                >
                                  {ASSIGNABLE_ROLES.map((r) => (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                                  Super Admin only
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="admin-pagination">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="admin-btn-outline-sm"
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                      Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
                    </span>
                    <button
                      type="button"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="admin-btn-outline-sm"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(roleChangeTarget)}
        title="Confirm Role Assignment"
        description={
          roleChangeTarget
            ? `Change role of ${roleChangeTarget.targetUser.email} from ${roleChangeTarget.targetUser.role} to ${roleChangeTarget.nextRole}?`
            : ''
        }
        confirmLabel="Update Role"
        danger={roleChangeTarget?.nextRole === 'SUPER_ADMIN' || roleChangeTarget?.targetUser._id === user?.id}
        loading={updatingRole}
        onConfirm={commitRoleChange}
        onCancel={() => setRoleChangeTarget(null)}
      />
    </AdminShell>
  );
}
