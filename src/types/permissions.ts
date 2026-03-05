export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
}

export interface User {
  id: number;
  username: string;
  role: Role;
}
