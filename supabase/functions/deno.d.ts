declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  }
  export const env: Env;
  
  export interface Conn {
    localAddr: any;
    remoteAddr: any;
    rid: number;
    close(): void;
  }

  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}
