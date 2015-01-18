(function() {
  var slice = Array.prototype.slice;
  var trailingSlash = /\/$/;
  var beginningDot = /^\/./;
  var exposedSocketStatuses = [
    'connect',
    'connecting',
    'disconnect',
    'reconnect',
    'reconnecting'
  ];
  var exposedSocketErrors = [
    'connect_failed',
    'error'
  ];

  function Ref(uri, opts, path) {
    var self = this;
    var notation = path.split('.');

    this.nsp = notation.shift();
    this.uri = uri;
    this.opts = opts;
    this.path = notation.join('.');

    this.events = {};

    this.socket = io(uri + '/' + this.nsp, {
      'force new connection': true,
      query: opts
    });

    var i;

    // exposing some socket.io events
    for (i = 0; i < exposedSocketStatuses.length; i++) {
      (function(statusName) {
        self.socket.on(statusName, function() {
          notify(statusName);
        });
      }(exposedSocketStatuses[i]));
    }

    // exposing some socket.io error events
    for (i = 0; i < exposedSocketStatuses.length; i++) {
      (function(errorName) {
        self.socket.on(errorName, function(err) {
          notify(errorName, err);
        });
      }(exposedSocketErrors[i]));
    }

    if (this.path) {
      this.socket.emit('child', path);
    }

    function notify() {
      var args = slice.call(arguments);
      var name = args.shift();

      if (!self.events[name]) {
        return;
      }

      for (var i = 0; i < self.events[name]; i++) {
        self.events[name][i].apply(self, args);
      }
    }
  }

  /**
   * listener method
   * @param  {String}   name     Event name to listen to
   * @param  {Function} callback Callback func
   * @return {Object}            Connection instance
   */
  Ref.prototype.on = function(name, callback) {
    this.events[name] = this.events[name] || [];
    this.events[name].push(callback);
    return this;
  };

  /**
   * de-listener method
   * @param  {String}   name     Event name to stop  listening to
   * @param  {Function} callback Callback func used on initial listen
   * @return {Object}            Connection instance
   */
  Ref.prototype.off = function(name, callback) {
    if (!this.events[name]) {
      return this;
    }

    var idx;

    while (~(idx = this.events[name].indexOf(callback))) {
      this.events[name].splice(idx, 1);
    }

    if (this.events[name].length === 0) {
      delete this.events[name];
    }

    return this;
  };

  /**
   * listen to an event one time
   * @param  {String}   name     Event name to listen to
   * @param  {Function} callback Callback to use, once
   * @return {Object}            Connection instance
   */
  Ref.prototype.once = function(name, callback) {
    var self = this;

    this.on(name, function() {
      callback.apply(this, slice.call(arguments));
      self.off(name, callback);
    });
  };

  /**
   * utility to listen to only certain attributes
   * @param  {String} subpath Dot-notated attribute path
   * @return {Object}         New reference instance
   */
  Ref.prototype.child = function(subpath) {
    subpath = subpath.trim().replace(beginningDot, '');
    return new Ref(this.uri, this.opts, this.path ? this.path + '.' + subpath : subpath);
  };

  /**
   * utility to listen to root
   * @return {Object}         New reference instance
   */
  Ref.prototype.root = function() {
    return new Ref(this.uri, this.opts);
  };

  function Socketsaurus(uri, opts) {
    uri = uri.trim().replace(trailingSlash, '');

    return function(path) {
      path = path.trim().replace(beginningDot, '');
      return new Ref(uri, opts, path);
    };
  }

  window.Socketsaurus = Socketsaurus;
}());
