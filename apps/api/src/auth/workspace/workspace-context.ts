import { Role } from '@prisma/client';

export interface WorkspaceContext {
  id: string;
  name: string;
  slug: string;
  membership: {
    id: string;
    role: Role;
  };
}
