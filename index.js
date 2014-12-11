/**
* Create a jQuery ajaxTransport handler function that will use the provided
*  easyXDM.RPC instance to invoke the 'request' method, which is assumed to 
* behave like the 'request' described at
* https://github.com/oyvindkinsey/easyXDM#the-shipped-cors-interface
*/
exports.rpcRequest = function (rpcRequest) {
  return function (options, originalOptions, jqXHR) {
    var transportCanHandleRequest = true;
    if ( ! transportCanHandleRequest) {
      return;
    }
    // The CORS interface shipped with easyXDM.request does not actually
    // support a way of aborting requests.
    var aborted = false;
    return {
      send: function( headers, completeCallback ) {
        rpcRequest({
          url: options.url,
          method: options.type,
          headers: headers,
          data: options.data,
          timeout: options.timeout
        },
        function onRequestSuccess(res) {
          completeCallback(
            res.status,
            'success',
            { text: res.data },
            getAllResponseHeaders(res)
          );
        },
        function onRequestError(err) {
          var isTimeout = isErrorTimeout(err);
          if (isErrorTimeout(err)) {
            return completeCallback(500, 'timeout');
          }
          var data = err.data;
          if (data && data.status) {
            // @TODO: Should be able to pass headers, but rpc.request
            // doesn't respond with that in this error case.
            return completeCallback(data.status, 'success', { text: data.data });
          }
          // Send code
          completeCallback(0, 'error')
        });
      },
      abort: function() {
        aborted = true;
      }
    };
  };
};

/**
 * Is the error a timeout error from easyXDM?
 */
function isErrorTimeout(err) {
  // unwrap rpc error into underlying error
  var err = err && err.message;
  if ( ! err) {
    return;
  }
  return /timeout/.test(err.message);
}

/**
 * Provided an easyXDM.request response,
 * return like the standard XHR#getAllResponseHeaders
 * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#getAllResponseHeaders()
 */
function getAllResponseHeaders(res) {
  var headerDelim = '\r\n';
  var headers = res.headers;
  var allResponseHeaders = Object.keys(headers)
  // Map each header to "Header: Header Value"
  .map(function (headerName) {
    var headerVal = headers[headerName];
    return [headerName, headerVal].join(': ');
  })
  .join(headerDelim);
  // Should always have trailing \r\n
  allResponseHeaders += headerDelim;
  return allResponseHeaders;
}
