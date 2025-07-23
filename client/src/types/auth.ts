export interface User {
  id: number;
  username: string;
  email: string | null;
  role: string;
  createdAt: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}