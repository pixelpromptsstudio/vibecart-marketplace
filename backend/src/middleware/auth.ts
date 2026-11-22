import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'vibecart_super_secret_jwt_key_2026_secure';
    const decoded = jwt.verify(token, secret) as any;
    
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      res.status(401).json({ success: false, message: 'User no longer exists.' });
      return;
    }

    req.user = {
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (err: any) {
    res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'vibecart_super_secret_jwt_key_2026_secure';
    const decoded = jwt.verify(token, secret) as any;
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (user) {
      req.user = {
        _id: user._id.toString(),
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      };
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
};

export const authorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden. You do not have permission (${req.user.role}) for this operation.`,
      });
      return;
    }

    next();
  };
};
