# jquery-easyxdm-transport

Create a jQuery ajaxTransport that will use an easyXDM.Rpc object to request cross-origin resources.

## Why?

Because IE9 doesn't support all of CORS, and so sometimes the only way to make the request is via an easyXDM-powered iframe proxy that can make a same-origin request on your behalf and postMessage the results back to you.

## How?

1. Get an easyXDM.Rpc instance (outside the scope of this lib)
2. Create an ajaxTransport
    
    ```javascript
    var transport = require('jquery-easyxdm-transport').rpcRequest(rpc.request);
    ```
3. Register the ajaxTransport with jQuery
    * The simplest way to do this is `$.ajaxTransport('*', transport);`. This will use the transport for all requests that `$.ajax` would not be able to complete (i.e. it would not be used in browsers that support CORS, and it would be used for cross-origin requests in IE9)
    * You may want more control. You can do this by registering the transport with a custom dataType string, then using a prefilter to say when to use that dataType.
        ```javascript
        $.ajaxPrefilter(function(options, origOptions, jqXHR) {
            var hasLfProxy = require('livefyre-easyxdm').getProxyUrl(options.url);
            var canCors = 'withCredentials' in new XMLHttpRequest()
            if (!canCors && hasLfProxy) {
                return 'livefyre-easyxdm';    
            }
        });
        
        // register the transport
        $.ajaxTransport('livefyre-easyxdm *', function (options) {
            // Remove custom dataType used to select this transport
            options.dataTypes.shift();
            return easyXdmAjaxTransport.rpcRequest(rpc.request).apply(this, arguments);
        });
        ```

