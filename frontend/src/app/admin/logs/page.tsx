'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { formatDateTime, isFullAdminRole } from '@/components/admin/adminHelpers';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { VibeLoader } from '@/components/VibeLoader';

export default function AdminAuditLogsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const canViewLogs = isFullAdminRole(user?.role);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAuditLogs(page, 30);
      setLogs(res?.logs || []);
      if (res?.pagination) setPagination(res.pagination);
    } catch (err: any) {
      showToast('error', 'Failed to load audit logs', err.message);
    } finally {
      setLoading(false);
    }
  }, [page, showToast]);

  useEffect(() => {
    if (canViewLogs) {
      loadLogs();
    } else {
      setLoading(false);
    }
  }, [canViewLogs, loadLogs]);

  return (
    <AdminShell
      title="Audit Logs"
      subtitle="Chronological trail of administrative mutations across orders, catalog, sellers & RBAC"
      actions={
        canViewLogs ? (
          <button type="button" onClick={loadLogs} className="admin-btn-outline-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        ) : undefined
      }
    >
      {!canViewLogs ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Shield size={32} color="#64748B" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
            Administrator Clearance Required
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '6px' }}>
            System audit logs require Admin or Super Admin privileges.
          </p>
        </div>
      ) : (
        <div className="admin-card">
          {loading ? (
            <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
              <VibeLoader label="Loading Audit Trail..." size="md" />
            </div>
          ) : (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>Actor</th>
                      <th>Target</th>
                      <th>Metadata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="admin-empty-cell">
                          No audit events recorded yet.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log._id}>
                          <td style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                            {formatDateTime(log.createdAt)}
                          </td>
                          <td>
                            <span className="admin-role-tag">{log.action}</span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>
                              {log.actorEmail || 'System'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              {log.actorRole || '—'}
                            </div>
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            <strong>{log.targetType}</strong>
                            {log.targetId ? ` #${String(log.targetId).slice(-6)}` : ''}
                          </td>
                          <td style={{ fontSize: '12px', color: '#475569', maxWidth: '320px', wordBreak: 'break-word' }}>
                            {log.details ? JSON.stringify(log.details) : '—'}
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
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} events)
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
      )}
    </AdminShell>
  );
}
