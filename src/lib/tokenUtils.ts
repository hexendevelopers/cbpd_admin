import crypto from 'crypto';

export class TokenUtils {
  /**
   * Generate a secure random token for password reset
   * @param length - Length of the token in bytes (default: 32)
   * @returns Hex string token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a token with expiry time
   * @param expiryHours - Hours until token expires (default: 1)
   * @returns Object with token and expiry date
   */
  static generateTokenWithExpiry(expiryHours: number = 1): { token: string; expiry: Date } {
    const token = this.generateSecureToken();
    const expiry = new Date(Date.now() + (expiryHours * 60 * 60 * 1000));
    
    return { token, expiry };
  }

  /**
   * Check if a token has expired
   * @param expiryDate - The expiry date to check
   * @returns True if expired, false if still valid
   */
  static isTokenExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }

  /**
   * Generate a verification code (numeric)
   * @param length - Length of the code (default: 6)
   * @returns Numeric verification code
   */
  static generateVerificationCode(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }
}