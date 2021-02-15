# js-logger

This library provides a javascript logger which runs similar to the python logger. Messages are sent to STDERR by defaul

## Heirachichal Loggers

Generate sub-loggers for different domains of a project

```sh
import Logger from '@matrixai/js-logger'

const logger = new Logger();

const subLogger = logger.getLogger('scope');
```

Parents and childs of loggers can be gotten

```sh
const subLogger = logger.getChild('scope');

const newLogger = subLogger.getParent();
```

## Message types

Can log 4 different types of messages

```sh
logger.debug('output');

logger.info('output');

logger.warn('output');

logger.error('output');
```

Can set the level of loggers to control the verbosity

```sh
logger.setLevel(3);

# These will not be logged
logger.debug('output');
logger.info('output');

# These will be logged
logger.warn('output');
logger.error('output');
```