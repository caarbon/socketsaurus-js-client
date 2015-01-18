(function() {
  var slice = Array.prototype.slice;
  var trailingSlash = /\/$/;
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
    var nsp = notation.shift();

    path = notation.join('.');

    this.events = {};

    this.io = io(uri + '/' + nsp, {
      'force new connection': true,
      query: opts
    });

    var i;

    // exposing some socket.io events
    for (i = 0; i < exposedSocketStatuses.length; i++) {
      (function(statusName) {
        this.io.on(statusName, function() {
          notify(statusName);
        });
      }(exposedSocketStatuses[i]));
    }

    // exposing some socket.io error events
    for (i = 0; i < exposedSocketStatuses.length; i++) {
      (function(errorName) {
        this.io.on(errorName, function(err) {
          notify(errorName, err);
        });
      }(exposedSocketErrors[i]));
    }

    function notify() {
      var args = slice.call(arguments);
      var name = args.shift();

      if (!this.events[name]) {
        return;
      }

      for (var i = 0; i < this.events[name]; i++) {
        this.events[name][i].apply(self, args);
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

  function Socketsaurus(uri, opts) {
    uri = uri.replace(trailingSlash, '');

    return function(path) {
      return new Ref(uri, opts, path);
    };
  }

  window.Socketsaurus = Socketsaurus;
}());
