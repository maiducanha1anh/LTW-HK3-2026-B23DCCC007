export interface IUserPayload {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  gender?: string;
  birthDate?: Date | string | null;
  address?: string;
  occupation?: string;
  bio?: string;
  avatar?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}
