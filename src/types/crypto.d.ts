declare module 'crypto' {
  export function randomBytes(size: number): Buffer;
  export function createHash(algorithm: string): Hash;
  
  interface Hash {
    update(data: string | Buffer, input_encoding?: string): Hash;
    digest(encoding: 'hex'): string;
  }
}
