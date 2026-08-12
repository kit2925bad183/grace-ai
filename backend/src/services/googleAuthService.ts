import { OAuth2Client } from 'google-auth-library';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { env, isGoogleOAuthConfigured } from '../config/env';
import { User, IUser } from '../models/User';
import { AuthProvider, UserRole } from '../models/enums';
import { AppError } from '../middleware/errorHandler';
import { establishSession, AuthSessionResult } from './authService';
import { toAuthUser } from '../middleware/authMiddleware';

let oauthClient: OAuth2Client | null = null;

export function configureGoogleAuth(): void {
  if (!isGoogleOAuthConfigured()) {
    console.warn('[auth] Google OAuth not configured — skipping Google Sign-In setup.');
    return;
  }

  oauthClient = new OAuth2Client(env.googleClientId);

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await findOrCreateGoogleUser(profile);
          done(null, toAuthUser(user));
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
}

export async function verifyGoogleIdToken(idToken: string): Promise<IUser> {
  if (!oauthClient && env.googleClientId) {
    oauthClient = new OAuth2Client(env.googleClientId);
  }

  if (!oauthClient || !env.googleClientId) {
    throw new AppError('Google Sign-In is not configured', 503);
  }

  const ticket = await oauthClient.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new AppError('Invalid Google credentials', 401);
  }

  if (!payload.email_verified) {
    throw new AppError('Google email is not verified', 401);
  }

  const profile: Pick<Profile, 'id' | 'displayName' | 'emails' | 'photos'> = {
    id: payload.sub,
    displayName: payload.name || payload.email.split('@')[0],
    emails: [{ value: payload.email, verified: true }],
    photos: payload.picture ? [{ value: payload.picture }] : [],
  };

  return findOrCreateGoogleUser(profile as Profile);
}

async function findOrCreateGoogleUser(profile: Profile): Promise<IUser> {
  const googleId = profile.id;
  const email = profile.emails?.[0]?.value?.toLowerCase().trim();
  const emailVerified = profile.emails?.[0]?.verified ?? false;
  const name = profile.displayName?.trim() || email?.split('@')[0] || 'Google User';
  const avatar = profile.photos?.[0]?.value;

  if (!email) {
    throw new AppError('Google account email is required', 400);
  }

  if (!emailVerified) {
    throw new AppError('Google email must be verified', 401);
  }

  let user = await User.findOne({ googleId });

  if (!user) {
    user = await User.findOne({ email });
  }

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider =
        user.passwordHash && user.authProvider === AuthProvider.LOCAL
          ? AuthProvider.BOTH
          : AuthProvider.GOOGLE;
    }

    if (!user.emailVerified) {
      user.emailVerified = true;
    }

    if (avatar && !user.avatar) {
      user.avatar = avatar;
    }

    await user.save();
    return user;
  }

  user = await User.create({
    name,
    email,
    googleId,
    avatar,
    role: UserRole.CITIZEN,
    authProvider: AuthProvider.GOOGLE,
    emailVerified: true,
    isActive: true,
  });

  return user;
}

export async function completeGoogleLogin(user: IUser): Promise<AuthSessionResult> {
  return establishSession(user);
}
