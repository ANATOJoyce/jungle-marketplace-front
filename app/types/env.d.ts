// env.d.ts ou types/env.d.ts
export {};

declare global {
  interface Window {
    ENV: {
      PUBLIC_NEST_API_URL: string;
    };
  }
}
