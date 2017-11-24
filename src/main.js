if (typeof define == 'function' && define.amd) {
  define([], function () {
    return require('./LlamaClient.js');
  });
} else {
  window.LlamaClient = require('./LlamaClient.js');
}
