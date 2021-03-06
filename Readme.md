
# router

  A nice client-side router.

## Installation

    $ component install ianstormtaylor/router

## Example

```js
var Router = require('router');

var router = new Router()
  .on('/about/:user', user)
  .on('/about/:user/:section', user, load)
  .listen('/about');

function user (context, next) {
  console.log(context.params.user);  // 'ian'
  context.thing = 1;
  next();
}

function load (context, next) {
  var p = context.params;
  console.log(p.user);               // 'ian'
  console.log(p.section);            // 'bio'
  console.log(context.thing);        // 1
  next();
}

router.go('/about/ian/bio');
```

## API

### #on(path, middleware...)
  Bind `middleware` functions to a `path`. Middleware take `next` callbacks to move to the next middleware on the queue.

### #dispatch(path)
  Trigger middleware for a `path`.

### #push(path)
  Push a `path` onto the history.

### #replace(path)
  Replace the current URL in the history with a new `path`.

### #go(path)
  Dispatch to a `path` or the current URL. If a `path` is passed, it will be pushed onto the history.

### #listen(path)
  Start listening for link clicks that the router should handle, optionally namespaced by a `path`.

### .use(plugin)
  Use the given `plugin`.

## License

  MIT
