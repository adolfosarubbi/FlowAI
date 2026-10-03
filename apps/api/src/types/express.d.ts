import type { WorkspaceContext } from '../auth/workspace/workspace-context';

export {};

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isActive: boolean;
    }

    interface Request {
      user?: User;
      workspace?: WorkspaceContext;
    }
  }
}
