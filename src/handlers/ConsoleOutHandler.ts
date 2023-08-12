import Handler from '../Handler.js';

class ConsoleOutHandler extends Handler {
  public emit(output: string): void {
    // eslint-disable-next-line no-console
    console.log(output);
  }
}

export default ConsoleOutHandler;
