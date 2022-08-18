export {}

declare global{
  interface ClassType<T> extends Function {
    new(...args: any[]): T;
  }
}
