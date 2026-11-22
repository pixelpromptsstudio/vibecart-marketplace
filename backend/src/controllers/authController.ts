import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { recordAuditLog } from '../middleware/audit';
import { isValidEmail } from '../utils/helpers';

const getJwtSecret = () =>
  process.env.JWT_SECRET || 'vibecart_super_secret_jwt_key_2026_secure';

const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || 'vibecart_refresh_super_secret_key_2026_secure';

const generateTokens = (user: any) => {
  const secret = getJwtSecret();
  const refreshSecret = getRefreshSecret();

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    secret,
    { expiresIn: '7d' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    refreshSecret,
    { expiresIn: '30d' }
  );

  return { token, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }
    if (String(password).length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      return;
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    // Role escalation protection: only allow CUSTOMER or SELLER directly on registration
    const userRole = role === 'SELLER' ? 'SELLER' : 'CUSTOMER';
    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone,
      passwordHash,
      role: userRole,
    });

    const tokens = generateTokens(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const tokens = generateTokens(user);

    await recordAuditLog(
      { user: { id: user._id.toString(), email: user.email, role: user.role, name: user.name } } as any,
      'LOGIN',
      'User',
      user._id.toString(),
      { ip: req.ip }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
      },
      ...tokens,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      user,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;
    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      res.status(400).json({ success: false, message: 'All address fields are required.' });
      return;
    }

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: isDefault ?? user.addresses.length === 0,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      addresses: user.addresses,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.addresses = user.addresses.filter(
      (addr) => addr._id && addr._id.toString() !== req.params.addressId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Address removed successfully.',
      addresses: user.addresses,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
  const user = normalizedEmail ? await User.findOne({ email: normalizedEmail }) : null;

  let demoResetToken: string | undefined;
  if (user && process.env.NODE_ENV !== 'production') {
    demoResetToken = jwt.sign(
      { id: user._id.toString(), email: user.email, purpose: 'password-reset' },
      getJwtSecret(),
      { expiresIn: '15m' }
    );
  }

  res.json({
    success: true,
    message:
      'If that email exists in our system, password reset instructions have been dispatched.',
    ...(demoResetToken ? { resetToken: demoResetToken } : {}),
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'A valid reset token and new password are required.',
      });
      return;
    }

    if (String(newPassword).length < 6) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
      return;
    }

    let decoded: { id: string; purpose?: string };
    try {
      decoded = jwt.verify(String(token), getJwtSecret()) as { id: string; purpose?: string };
    } catch {
      res.status(401).json({ success: false, message: 'Invalid or expired reset token.' });
      return;
    }

    if (decoded.purpose !== 'password-reset') {
      res.status(401).json({ success: false, message: 'Invalid reset token purpose.' });
      return;
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.passwordHash = await bcrypt.hash(String(newPassword), 10);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully. Please login.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
