// Types only — the actual signup-security evaluation logic now lives in
// nevadesign-backend (src/lib/signup-security.ts). This file just keeps the
// shared shape for the admin UI (security alerts table).

export const FREE_SIGNUP_CREDITS = 0

export type SignupSecurityStatus =
  | 'allowed'
  | 'blocked'
  | 'pending_review'
  | 'approved_by_admin'
  | 'rejected_by_admin'

export type SignupSecurityEvent = {
  id: string
  user_id: string
  email: string
  ip_address: string
  matching_user_ids: string[]
  risk_score: number
  reason: string
  status: SignupSecurityStatus
  created_at: string
}
