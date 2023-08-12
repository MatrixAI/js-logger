import process from 'node:process';
import Handler from '../Handler.js';

class StreamHandler extends Handler {
  public emit(output: string): void {
    process.stderr.write(output + '\n');
  }
}

export default StreamHandler;
