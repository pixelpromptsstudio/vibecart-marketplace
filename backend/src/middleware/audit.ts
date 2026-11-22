import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AuditLog } from '../models/AuditLog';

export const recordAuditLog = async (
  req: AuthRequest,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>
) => {
  try {
    const userName = req.user ? req.user.name : 'Anonymous';
    const userRole = req.user ? req.user.role : 'GUEST';
    const userId = req.user ? req.user.id : undefined;
    const ipAddress = req.ip || req.socket?.remoteAddress || '127.0.0.1';

    await AuditLog.create({
      userId,
      userName,
      userRole,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};
