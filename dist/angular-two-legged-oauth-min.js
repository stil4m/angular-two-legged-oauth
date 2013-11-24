angular.module("angular-two-legged-oauth",[]).factory("twoLeggedOAuthInterceptor",["$q",function(a){var b=function(a){if(0==a.indexOf("http://")||0==a.indexOf("https://"))return a;if(0==a.indexOf("/"))return window.location.origin+a;throw"Unknown request scheme"},c=function(a){return encodeURIComponent(a)},d=function(a,b){var d=angular.copy(a);if(b)for(var e=Object.keys(b),f=0;f<e.length;f++)d[e[f]]=b[e[f]];for(var g="",h=Object.keys(d).sort(),i=0;i<h.length;i++)""!=g&&(g+="&"),g+=c(h[i])+"="+c(d[h[i]]);return g},e=function(a,e,f,g){var h=c(a.method)+"&"+c(b(a.url))+"&"+c(d(f,a.params)),i="function"==typeof e.oauth_consumer_secret?e.oauth_consumer_secret(a):e.oauth_consumer_secret,j=c(i)+"&"+(e.oauth_token_secret?c(e.oauth_token_secret):"");return g(j,h)},f=function(a,b){for(var c={},d=Object.keys(a),e=0;e<d.length;e++){var f=a[d[e]];"function"==typeof f&&(f=f(b)),c[d[e]]=f}return c},g=function(a,b,d){for(var e='OAuth realm="'+c(a)+'"',f=Object.keys(d),g=0;g<f.length;g++)e+=", "+c(f[g])+'="'+c(d[f[g]])+'"';return e+=', oauth_signature="'+c(b)+'"'},h={request:function(b){if(null==h.filter||h.filter(b)){var c=f(h.configuration.options,b),d=e(b,h.configuration,c,h.configuration.signature_algorithm);null==b.headers&&(b.headers={}),b.headers.Authorization=g(h.configuration.realm,d,c)}return b||a.when(b)},configuration:{options:{oauth_timestamp:function(){return Math.round((new Date).getTime()/1e3)},oauth_nonce:function(){for(var a="",b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",c=0;7>c;c++)a+=b.charAt(Math.floor(Math.random()*b.length));return a}},signature_algorithm:function(a){return c(a)}}};return h}]);