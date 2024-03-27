import Promise from 'bluebird';
import URI from 'urijs';
const config = require('../../config');
window.Promise = Promise;

var Utils = function() {
  let ebookURL;

  $.ajaxSetup({
    timeout: 60000,
  });

  this.deferredToPromise = function(jqXhr) {
    return new Promise(function(resolve, reject) {
      jqXhr.done(resolve).fail(function(jqXhr) {
        var error = new Error(jqXhr);
        reject(error);
      });
    });
  };

  this.setBookURL = function (isbn, dcc) {
    var dcc = dcc || 'prod';
    ebookURL = `/${dcc}/content/stream/${isbn}`;
  }

  this.resolveURI = function(pathRelativeToPackageRoot) {
    var pathRelativeToPackageRootUri;
    try {
      pathRelativeToPackageRootUri = new URI(pathRelativeToPackageRoot);
    } catch (err) {
      console.log(err);
    }
    if (pathRelativeToPackageRootUri && pathRelativeToPackageRootUri.is('absolute'))
      return pathRelativeToPackageRoot;
    var url = ebookURL;
    try {
      url = new URI(url)
        .search('')
        .hash('')
        .toString();
    } catch (err) {
      console.log(err);
    }
    pathRelativeToPackageRoot = pathRelativeToPackageRoot.charAt(0) == '/' ? pathRelativeToPackageRoot.substr(1) : pathRelativeToPackageRoot;
    return url + (url.charAt(url.length - 1) == '/' ? '' : '/') + pathRelativeToPackageRoot;
  };

  this.getBookURL = () => {
    return ebookURL;
  }

  this.getURL = () => {
    return `http://${config.server.host}:${config.server.port}`;
  }

};

export default new Utils();
