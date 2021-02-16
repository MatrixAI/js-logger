import process from 'process';
import Handler from '../Handler';

class StreamHandler extends Handler {
  public emit(output: string): void {
    process.stderr.write(output + '\n');
  }
}

export default StreamHandler;
