import type { LoginRequest, LoginResponse, UserProfile } from '@xregion/contracts'
import { UnauthorizedError } from '../../shared/errors/app-error.js'

export class AuthService {
  async login(request: LoginRequest): Promise<LoginResponse> {
    if (!request.username || !request.password) {
      throw new UnauthorizedError('Username and password are required')
    }

    // Default admin credentials for development / mock mode
    if (request.username === 'admin' && request.password === 'admin123') {
      const user: UserProfile = {
        id: 'usr-admin-01',
        username: 'admin',
        role: 'ADMIN',
        displayName: 'Platform Administrator'
      }
      return {
        token: `mock-jwt-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        user
      }
    }

    throw new UnauthorizedError('Invalid credentials')
  }

  async getCurrentUser(token?: string): Promise<UserProfile> {
    if (!token) {
      throw new UnauthorizedError('No authentication token provided')
    }
    return {
      id: 'usr-admin-01',
      username: 'admin',
      role: 'ADMIN',
      displayName: 'Platform Administrator'
    }
  }
}
