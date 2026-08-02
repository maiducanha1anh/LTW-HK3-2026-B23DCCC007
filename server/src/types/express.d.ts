export interface IUserPayload {
  id: string;
  username: string;
  email: string;
  fullName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}
