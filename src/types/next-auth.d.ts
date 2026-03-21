import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      name: string;
      email: string;
      image?: string | null;
    };
  }
}
