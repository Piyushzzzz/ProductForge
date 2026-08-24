import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { generateToken } from '../utils/token.js';
import { UserRole } from '../types/index.js';

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    avatarUrl?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() }
    });

    if (existing) {
      throw { statusCode: 400, message: 'Email is already registered.', code: 'EMAIL_EXISTS' };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const role: UserRole = data.role || 'CUSTOMER';

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        name: data.name.trim(),
        role,
        avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`
      }
    });

    if (role === 'CREATOR') {
      await prisma.creatorProfile.create({
        data: {
          userId: user.id,
          bio: 'Independent Software & Digital Tool Creator',
          website: '',
          githubUrl: ''
        }
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      },
      token
    };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
      include: { creatorProfile: true }
    });

    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' };
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' };
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        creatorProfile: user.creatorProfile,
        createdAt: user.createdAt
      },
      token
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true }
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found.', code: 'USER_NOT_FOUND' };
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      creatorProfile: user.creatorProfile,
      createdAt: user.createdAt
    };
  }

  static async updateProfile(userId: string, data: { name?: string; bio?: string; website?: string; githubUrl?: string; avatarUrl?: string }) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        avatarUrl: data.avatarUrl
      }
    });

    if (data.bio !== undefined || data.website !== undefined || data.githubUrl !== undefined) {
      await prisma.creatorProfile.upsert({
        where: { userId },
        create: {
          userId,
          bio: data.bio,
          website: data.website,
          githubUrl: data.githubUrl
        },
        update: {
          bio: data.bio,
          website: data.website,
          githubUrl: data.githubUrl
        }
      });
    }

    return this.getCurrentUser(userId);
  }
}
