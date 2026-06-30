export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: 'admin' | 'user' | 'guest';
}
