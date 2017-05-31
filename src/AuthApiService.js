/*******************************************************************************
 * Copyright 2015, The IKANOW Open Source Project.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

  /**
   * @ngdoc service
   * @name infinite.service:AuthApiService
   * @description Authentication API Services
   *
   * For more information on requests and responses please see the Infinite Sources API:
   * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
   */
  angular.module("infinite-api").factory('AuthApiService', [ '$q', 'InfiniteApi',

  function($q, InfiniteApi) {
    'use strict';

    // ********************************************************************* //
    // API URI Generators
    // ********************************************************************* //

    /**
     * Build the base URI for document query
     * @returns {String} Knowledge query URI
     * @private
     */
    function _uri_authBase(){
      return appConfig.apiAuthURI;
    }

    /**
     *
     * @returns {String}
     * @private
     */
    function _uri_authDeactivate(){
      return sprintf.sprintf("%s/deactivate",
        _uri_authBase()
      );
    }

    /**
     *
     * @returns {String}
     * @private
     */
    function _uri_authForgotPassword(){
      return sprintf.sprintf("%s/forgotpassword",
        _uri_authBase()
      );
    }

    /**
     *
     * @returns {String}
     * @private
     */
    function _uri_authKeepAlive(){
      return sprintf.sprintf("%s/keepalive",
        _uri_authBase()
      );
    }

    /**
     *
     * @returns {String}
     * @private
     */
    function _uri_authLogin() {
      return sprintf.sprintf("%s/login",
        _uri_authBase()
      );
    }

    /**
     *
     * @param username
     * @param password
     * @returns {String}
     * @private
     */
    function _uri_authLoginAdmin(username, password){
      return sprintf.sprintf("%s/admin/%s/%s",
        _uri_authBase(),
        encodeURIComponent(username),
        InfiniteApi.hashPassword(password)
      );
    }

    /**
     *
     * @returns {String}
     * @private
     */
    function _uri_authLogout() {
      return sprintf.sprintf("%s/logout",
        _uri_authBase()
      );
    }

    // ********************************************************************* //
    // Main public API methods
    // ********************************************************************* //

    /**
     * @ngdoc method
     * @name rawQuery
     * @methodOf infinite.service:AuthApiService
     * @description
     * Raw access to the query mechanism for this API base path
     *
     * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
     * @param {String}  authEndpoint End point relative to this base
     * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
     * @param {map}     [postData=null] Optional object to post as json
     * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
     * @param {String}  [forceContentType=null] Data mime-type if provided
     * @returns {Promise<ApiResponse>} ApiResponse if successful
     */
    function rawQuery(method, authEndpoint, queryParams, postData, alwaysResolve, forceContentType){
      return InfiniteApi.rawQuery( method, _uri_authBase() + authEndpoint, queryParams, postData, alwaysResolve, forceContentType);
    }

    /**
     * @ngdoc method
     * @name deactivate
     * @methodOf infinite.service:AuthApiService
     * @description
     *
     * @param {String} username of account you want to deactivate
     * @param {String} adminUser Admin username required to login
     * @param {String} adminPassword Admin password required to login. Password will be hashed for you.
     * @returns {Promise<ApiResponse>} ApiResponse on success.
     */
    function deactivate(username, adminUser, adminPassword){
      var options = {};
      if(username){      options.user =   username;}
      if(adminUser){     options.aduser = adminUser;}
      if(adminPassword){ options.adpass = InfiniteApi.hashPassword(adminPassword);}
      return InfiniteApi.get(_uri_authDeactivate(), options);
    }

    /**
     * @ngdoc method
     * @name forgotPassword
     * @methodOf infinite.service:AuthApiService
     * @description
     *
     * @param {Object} object containing parameters (username, and/or password, and/or new_password)
     * @returns {Promise<ApiResponse>} ApiResponse on success.
     */
    function forgotPassword( options ){
      if(options.new_password){options.new_password = InfiniteApi.hashPassword(options.new_password);}
      return InfiniteApi.get(_uri_authForgotPassword(), options);
    }

    /**
     * @ngdoc method
     * @name keepAlive
     * @methodOf infinite.service:AuthApiService
     * @description
     *
     * @returns {Promise<ApiResponse>} ApiResponse on success.
     */
    function keepAlive(){
      return InfiniteApi.get(_uri_authKeepAlive());
    }

    /**
     * @ngdoc method
     * @name login
     * @methodOf infinite.service:AuthApiService
     * @description
     *
     * @param {String} username Email or username
     * @param {String} password User's password in cleartext. Password will be hashed.
     * @param {Boolean} [returnTempKey=false] Set to true to get a temporary api token
     * @param {Boolean} [override=false] Set to true to log out all other sessions
     * @param {String} [returnUrl=null] Optionally set the url to return to if using post / redirect flow.
     * @param {Boolean} [multiLogin=false] Set to true then multiple logins are allowed ( admin only )
     * @returns {Promise<ApiResponse>} ApiResponse on success.
     */
    function login(username, password, returnTempKey, override, returnUrl, multiLogin ){
      var options = {
        username: username,
        password: InfiniteApi.hashPassword(password)
      };
      if (returnTempKey === true) {
        options.return_tmp_key = true;
      }
      if (override === false) {
        options.override = false;
      }
      if (returnUrl) {
        options.returnurl = returnUrl;
      }
      if (multiLogin === true) {
        options.multi = true;
      }

      return InfiniteApi.get(_uri_authLogin(), options);
    }

    /**
     * @ngdoc method
     * @name loginAdmin
     * @methodOf infinite.service:AuthApiService
     * @description
     *
     * @param {String} username Email or username
     * @param {String} password User's password in cleartext. Password will be hashed.
     * @returns {Promise<ApiResponse>} ApiResponse on success.
     */
    function loginAdmin(username, password){
      return InfiniteApi.get(_uri_authLoginAdmin(username, password));
    }

    /**
     * @ngdoc method
     * @name logout
     * @methodOf infinite.service:AuthApiService
     * @description
     *
     * @returns {Promise<ApiResponse>} ApiResponse on success.
     */
    function logout(){
      return InfiniteApi.get(_uri_authLogout());
    }

    /**
     * Public Auth methods
     */
    return {

      //Expose full base query
      rawQuery: rawQuery,

      //API Methods
      deactivate: deactivate,
      forgotPassword: forgotPassword,
      keepAlive: keepAlive,
      login: login,
      loginAdmin: loginAdmin,
      logout: logout
    };

  }
]);