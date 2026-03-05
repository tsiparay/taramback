export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user'
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  networkId: number;
}
