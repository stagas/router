
var Context = require('./context')
  , history = require('history')
  , event = require('event')
  , link = require('link-delegate')
  , prevent = require('prevent')
  , Route = require('./route')
  , stop = require('stop')
  , url = require('url');


/**
 * Expose `Router`.
 */

module.exports = exports = Router;


/**
 * Expose `Route`.
 */

exports.Route = Route;


/**
 * Expose `Context`.
 */

exports.Context = Context;


/**
 * Initialize a new `Router`.
 */

function Router () {
  this.callbacks = [];
  this.ignored = [];
  this.running = false;
}

/**
 * Use the given `plugin`.
 *
 * @param {Function} plugin
 * @return {Router}
 */

Router.use = function (plugin) {
  plugin(this);
  return this;
};


/**
 * Attach a route handler.
 *
 * @param {String} path
 * @param {Functions...} fns
 * @return {Router}
 */

Router.prototype.on = function (path) {
  var route = new Route(path);
  var fns = Array.prototype.slice.call(arguments, 1);
  for (var i = 1; i < arguments.length; i++) {
    this.callbacks.push(route.middleware(arguments[i]));
  }
  return this;
};


/**
 * Trigger a route at `path`.
 *
 * @param {String} path
 * @return {Router}
 */

Router.prototype.dispatch = function (path) {
  var context = this._context = new Context(path, this._context);
  var callbacks = this.callbacks;
  var i = 0;

  function next () {
    var fn = callbacks[i++];
    if (fn) fn(context, next);
  }

  next();
  return this;
};


/**
 * Dispatch a new `path` and push it to the history, or use the current path.
 *
 * @param {String} path (optional)
 * @return {Router}
 */

Router.prototype.go = function (path) {
  if (!path) {
    var l = window.location;
    path = l.pathname;
    if (l.search) path += l.search;
    if (this.isIgnored(l.toString())) return false;
  } else {
    this.push(path);
  }

  this.dispatch(path);
  return this;
};


/**
 * Start the router and listen for link clicks relative to an optional `path`.
 * You can optionally set `go` to false to manage the first dispatch yourself.
 *
 * @param {String} path
 * @return {Router}
 */

Router.prototype.listen = function (path, go) {
  var self = this;

  if ('boolean' === typeof path) {
    go = path;
    path = null;
  }

  if (go || go === undefined) this.go();

  var self = this;
  link(function (e, a) {
    var href = a.href;
    if (isHash(a) || !a.hasAttribute('href') || !routable(href, path) || self.isIgnored(href)) return;
    var parsed = url.parse(href);
    self.go(parsed.pathname + parsed.search);
    prevent(e);
    stop(e);
  });

  return this;
};


/**
 * Listen to popstate.
 *
 * @return {Router}
 */

Router.prototype.listenPopState = function () {
  var self = this;
  event.bind(window, 'popstate', function (e) {
    self.go();
  });
  return this;
};

/**
 * Ignore given `path`.
 *
 * @param {String} path
 * @return {Boolean}
 */

Router.prototype.ignore = function (path) {
  this.ignored.push(path);
};


/**
 * Examine whether `href` is ignored.
 *
 * @param {String} href
 * @return {Boolean}
 */

Router.prototype.isIgnored = function (href) {
  for (var i = 0; i < this.ignored.length; i++) {
    var path = this.ignored[i];
    if (routable(href, path)) return true;
  }
  return false;
};



/**
 * Push a new `path` to the browsers history.
 *
 * @param {String} path
 * @return {Router}
 */

Router.prototype.push = function (path) {
  history.push(path);
  return this;
};


/**
 * Replace the current path in the browsers history.
 *
 * @param {String} path
 * @return {Router}
 */

Router.prototype.replace = function (path) {
  history.replace(path);
  return this;
};


/**
 * Examine whether `a` is a hash link.
 *
 * @param {Element} a
 * @return {Boolean}
 */

function isHash (a) {
  return '#' == a.href.substr(a.baseURI.length).charAt(0);
}


/**
 * Check if a given `href` is routable under `path`.
 *
 * @param {String} href
 * @return {Boolean}
 */

function routable (href, path) {
  if (!path) return true;
  var parsed = url.parse(href);
  if (parsed.pathname.indexOf(path) === 0) return true;
  return false;
}