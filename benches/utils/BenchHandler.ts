import { Handler } from '@';

/**
 * Custom bench handler where emission is free
 * This avoids benchmarking stdout/stderr
 * which is dependent on the operating system
 * and whether it is TTY or a pipe or a file
 */
class BenchHandler extends Handler {
  public emit(): void {
    // This is a noop
  }
}

export default BenchHandler;
