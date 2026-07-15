/** 用户角色 */
export type UserRole = 'admin' | 'user'

/** 用户信息 */
export interface UserProfile {
  id: string
  username: string
  role: UserRole
}

/** 认证状态 */
export interface AuthState {
  user: UserProfile | null
  session: any | null
  isAdmin: boolean
}
