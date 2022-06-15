import Handler from '../Handler';

class ConsoleHandler extends Handler {
  public emit(output: string): void {
    console.error(output);
  }
}

export default ConsoleHandler;
