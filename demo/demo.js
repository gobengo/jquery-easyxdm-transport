var easyXdmAjaxTransport = require('..')
var $ = require('jquery');

var easyXDM = window.easyXDM = require('easyxdm/debug');

var apiHost = 'http://localhost:8000';
var apiUrl = apiHost + '/api';

var iframeRpc = new easyXDM.Rpc({
  remote: apiHost + "/easyxdm.html"
},
{
  remote: {
    request: {}
  }
});

window.iframeRpc = iframeRpc;

/**
 * Raw easyXDM
 */
iframeRpc.request({
  url: apiUrl,
  method: 'get'
},
function onRequestSuccess(res) {
  console.log('success req!', arguments);
  renderJSON(JSON.parse(res.data))
},
function (err) {
  renderJSON({
    kind: 'raw easyXDM GET',
    error: err
  })
});

/**
 * with jquery
 */

// always use the custom transport
$.ajaxPrefilter(function(options, origOptions, jqXHR) {
  var hasLfProxy = require('livefyre-easyxdm').getProxyUrl(options.url);
  var hasLfProxy = true;
  if (hasLfProxy) {
    return 'livefyre-easyxdm';    
  }
});

// register the transport
$.ajaxTransport('livefyre-easyxdm *', function (options) {
  // Remove custom dataType used to select this transport
  options.dataTypes.shift();
  // do it!
  return easyXdmAjaxTransport.rpcRequest(iframeRpc.request).apply(this, arguments);
});

$.get(apiUrl)
.done(function (res) {
  renderJSON(res);
})
.fail(function (err) {
  renderJSON({
    kind: 'jQuery#get',
    error: err
  })
});

$.ajax({
  url: apiUrl,
  type: 'post',
  data: JSON.stringify({ requestBody: 'YAAAAAY' }),
  headers: {
    'Content-Type': 'application/json'
  }
})
.done(function (res) {
  renderJSON(res);
})
.fail(function (err) {
  renderJSON({
    kind: 'jQuery#post',
    error: err
  })
});

$.ajax({
  url: apiUrl,
  type: 'patch',
  data: JSON.stringify([{ 
    op: "test",
    path: "/",
    value: null
  }]),
  headers: {
    'Content-Type': 'application/json'
  }
})
.done(function (res) {
  renderJSON(res);
})
.fail(function (err) {
  renderJSON({
    kind: 'jQuery#post',
    error: err
  })
});

function renderJSON(json) {
  var pre = document.createElement('pre');
  pre.appendChild(
    document.createTextNode(
      JSON.stringify(json, null, 2)
    )
  );

  document.body.appendChild(pre);  
}

console.log("Loaded demo.js");
