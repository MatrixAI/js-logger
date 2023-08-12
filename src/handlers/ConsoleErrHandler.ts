import Handler from '../Handler.js';

class ConsoleErrHandler extends Handler {
  public emit(output: string): void {
    // eslint-disable-next-line no-console
    console.error(output);
  }
}

export default ConsoleErrHandler;
