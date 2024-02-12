import { User } from './user.model.js';

export interface UserResponse {
  user: User;
  exp: number;
  iat: number;
}
