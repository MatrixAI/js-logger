import Handler from '../Handler';

class ConsoleHandler extends Handler {
  public emit(output: string): void {
    console.log(output);
  }
}

export default ConsoleHandler;
