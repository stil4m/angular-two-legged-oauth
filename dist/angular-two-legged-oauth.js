angular.module('angular-two-legged-oauth', [])
    .factory('twoLeggedOAuthInterceptor', ['$q', function ($q) {

        var absoluteUrl = function (url) {
            if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0) {
                return url;
            }
            if (url.indexOf("/") == 0) {
                return window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '') + url.substr(0, url.indexOf('?'));
            }
            throw "Unknown request scheme";
        };

        var encodeData = function (data) {
            return encodeURIComponent(data);
        };

        var composeParameters = function (oauthParams, httpParams, httpUrl) {
            var parameters = angular.copy(oauthParams);

            if (httpUrl) {
              if (httpUrl.indexOf('?')) {
                var suffix = httpUrl.substr(httpUrl.indexOf('?') + 1);
                var params = suffix.split("&");
                params.forEach(function(param) {
                  if (param.indexOf('=')) {
                    var paramComponents = param.split('=');
                    parameters[paramComponents[0]] = paramComponents[1];
                  }
                });
              }
            }
            if (httpParams) {
                var httpParamKeys = Object.keys(httpParams);
                for (var k = 0; k < httpParamKeys.length; k++) {
                    parameters[httpParamKeys[k]] = httpParams[httpParamKeys[k]];
                }
            }

            var answer = '';
            var sortedKeys = Object.keys(parameters).sort();
            for (var i = 0; i < sortedKeys.length; i++) {
                if (answer != '') {
                    answer += '&';
                }
                answer += encodeData(sortedKeys[i]) + '=' + encodeData(parameters[sortedKeys[i]]);
            }
            return answer;
        };

        var composeSignature = function (httpConfig, oAuthConfig, oAuthRequestParams, signature_algorithm) {
            var baseSignature = encodeData(httpConfig.method) + '&' + encodeData(absoluteUrl(httpConfig.url)) + '&' + encodeData(composeParameters(oAuthRequestParams, httpConfig.params, httpConfig.url));
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
            var authorization = 'OAuth realm="' + encodeData(realm) + '"';

            var optionKeys = Object.keys(requestParams);
            for (var i = 0; i < optionKeys.length; i++) {
                authorization += (', ' + encodeData(optionKeys[i]) + '="' + encodeData(requestParams[optionKeys[i]]) + '"' );
            }
            authorization += ', oauth_signature="' + encodeData(signature) + '"';
            return authorization;
        };

        var interceptor = {
            'request': function (config) {
                if (interceptor.filter == null || interceptor.filter(config)) {
                    var requestParams = composeRequestParams(interceptor.configuration.options, config);
                    var signature = composeSignature(config, interceptor.configuration, requestParams, interceptor.configuration.signature_algorithm);
                    if (config  .headers == null) {
                        config.headers = {};
                    }
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
                signature_algorithm: function (key) {
                    return encodeData(key);
                }
            }
        };
        return interceptor;
    }]);

