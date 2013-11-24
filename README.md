angular-two-legged-oauth
========================

Module for Angular to add 2-legged OAuth

```
angular.module('myApp').run(['$rootScope', 'twoLeggedOAuthInterceptor', function ($rootScope, twoLeggedOAuthInterceptor) {

	// Method to configure the interceptor when it has to filter OAuth request. In this example the authenticate congig parameter is used as switch to enable the OAuth interceptor. When the filter function is not present the OAuth interceptor is automatically enabled.
	
    twoLeggedOAuthInterceptor.filter = function (config) {
        return config.authenticate == true;
    };

    twoLeggedOAuthInterceptor.configuration.realm = 'more';
    twoLeggedOAuthInterceptor.configuration.options.oauth_version = '1.0';
    twoLeggedOAuthInterceptor.configuration.options.oauth_signature_method = 'HMAC-SHA1';

    //Dynamic credential loading
    twoLeggedOAuthInterceptor.configuration.options.oauth_consumer_key = function (httpConfig) {
        var authenticationObject = httpConfig.authenticationObject;
        if (authenticationObject == null) {
            authenticationObject = $authenticationService.getAuthentication()
        }
        return authenticationObject.consumerKey;
    };
    twoLeggedOAuthInterceptor.configuration.oauth_consumer_secret = function (httpConfig) {
        var authenticationObject = httpConfig.authenticationObject;
        if (authenticationObject == null) {
            authenticationObject = $authenticationService.getAuthentication()
        }
        return authenticationObject.consumerSecret;
    };

    //HMAC-SHA1 configuration
    twoLeggedOAuthInterceptor.configuration.signature_algorithm = b64_hmac_sha1;
    b64pad = '=';
}]);

angular.module('myApp').config(function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    !$httpProvider.interceptors && ($httpProvider.interceptors = []);
    $httpProvider.interceptors.push('twoLeggedOAuthInterceptor');
});

```
