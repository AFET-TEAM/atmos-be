import "elysia";

declare module "elysia" {
  interface Context {
    user?: import("./types/auth").AuthUser;
    issueToken: (user: import("./types/auth").AuthUser) => Promise<string>;
    setAuthCookie: (token: string) => void;
  }
}

export {};
