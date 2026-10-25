export interface LoginRequest {
  username: string
  password: string
}

export interface UserProfile {
  id: string
  username: string
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER'
  displayName?: string
}

export interface LoginResponse {
  token: string
  expiresAt: string
  user: UserProfile
}
