angular.module('twoLeggedOAuth', [])
    .factory('twoLeggedOAuthInterceptor', ['$q', function ($q) {

    var absoluteUrl = function (url) {
        if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0) {
            return url;
        }
        if (url.indexOf("/") == 0) {
            return window.location.origin + url;
        }
        //TODO Handle unknown format of URL. This may be a relative path.
        return url;
    };

    var encodeData = function (data) {
        return encodeURIComponent(data);
    };

    var composeParameters = function (parameters) {
        //TODO Add other get parameters
        var answer = '';
        var sortedKeys = Object.keys(parameters).sort();
        for (var i = 0; i < sortedKeys.length; i++) {
            if (answer != '') {
                answer += '&';
            }
            answer += sortedKeys[i] + '=' + parameters[sortedKeys[i]];
        }
        return answer;
    };

    var composeSignature = function (httpConfig, oAuthConfig, oAuthRequestParams, signature_algorithm) {
        var baseSignature = encodeData(httpConfig.method) + '&' + encodeData(absoluteUrl(httpConfig.url)) + '&' + encodeData(composeParameters(oAuthRequestParams));
        var secret = typeof(oAuthConfig.oauth_consumer_secret) == 'function' ? oAuthConfig.oauth_consumer_secret(httpConfig) : oAuthConfig.oauth_consumer_secret;
        var key = encodeData(secret) + '&' + (oAuthConfig.oauth_token_secret ? encodeData(oAuthConfig.oauth_token_secret) : '');
        return signature_algorithm(key, baseSignature);
    };

    var composeRequestParams = function (options, httpConfig) {
        var answer = {};
        var optionKeys = Object.keys(options);
        for (var i = 0; i < optionKeys.length; i++) {
            var value = options[optionKeys[i]];
            if (typeof(value) == 'function') {
                value = value(httpConfig);
            }
            answer[optionKeys[i]] = value;
        }
        return answer;
    };

    var buildAuthorizationHeader = function (realm, signature, requestParams) {
        var authorization = 'OAuth realm="' + realm + '"';

        var optionKeys = Object.keys(requestParams);
        for (var i = 0; i < optionKeys.length; i++) {
            authorization += (', ' + optionKeys[i] + '="' + requestParams[optionKeys[i]] + '"' );
        }
        authorization += ', oauth_signature="' + signature + '"';
        return authorization;
    };

    var interceptor = {
        'request': function (config) {
            if (interceptor.filter == null || interceptor.filter(config)) {
                var requestParams = composeRequestParams(interceptor.configuration.options, config);
                var signature = composeSignature(config, interceptor.configuration, requestParams, interceptor.configuration.signature_algorithm);
                config.headers.Authorization = buildAuthorizationHeader(interceptor.configuration.realm, signature, requestParams);
            }
            return config || $q.when(config);
        },
        configuration: {
            options: {
                'oauth_timestamp': function () {
                    return Math.round(new Date().getTime() / 1000)
                },
                'oauth_nonce': function () {
                    var text = "";
                    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                    for (var i = 0; i < 7; i++) {
                        text += possible.charAt(Math.floor(Math.random() * possible.length));
                    }
                    return text;
                }
            },
            signature_algorithm: function(key, signatureBaseString) {
                return encodeData(key);
            }
        }
    };
    return interceptor;
}]);
