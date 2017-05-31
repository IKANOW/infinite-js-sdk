(function (module) {

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
   * @typedef {String} ObjectId
   */

  /**
   * @typedef {String} JsonString
   */

  /**
   * @typedef {Object} ApiResponse
   * @property {Object|Array<Object>} data
   * @property {Response} response
   */

  /**
   * @typedef {Object} Response
   * @property {Boolean} successful
   * @property {Number} time
   * @property {String} message
   * @property {String} action
   */

  /**
   * @typedef {Object} ObjectWithId
   * @property {String} _id
   */

  /**
   * @typedef {Object} Owner
   * @property {ObjectId} _id
   * @property {String} displayName
   * @property {String} email
   */

  /**
   * @typedef {ObjectWithId} Group
   * @property {Array<GroupMember>} members
   */

  /**
   * @typedef {Object} GroupMember
   * @property {ObjectId} _id
   * @property {String} displayName
   */

  /**
   * @typedef {Object<?>} Promise
   */

  // RequireJS include
  var angular = require('angular'),
      hashes = require('hashes'),
      sprintf = require('sprintf'),
      _ = require('lodash'),
      moment = require('moment');

  //noinspection JSUnresolvedFunction
  /**
   *
   * @ngdoc service
   * @name infinite.service:InfiniteApi
   * @description Base API HTTP Wrapper.
   *
   * ###Additional information
   * InfiniteApi handles the infinite platform API response format to parse successful data and error messages.
   */
  module.factory('InfiniteApi', [ '$q', '$http', '$log',

    function($q, $http, $log) {
      'use strict';

      var InfiniteApi = {};
      // ********************************************************************* //
      // API URI Generators
      // ********************************************************************* //

      /**
       * @name _getApiBase
       * @methodOf infinite.service:ApiBase
       * @description
       * Build the base URI for document query
       *
       * @returns {String} Knowledge query URI
       * @private
       */
      function _getApiBase(){
        return appConfig.apiBaseDomain;
      }

      // ********************************************************************* //
      //
      // Main public API methods
      //
      // ********************************************************************* //

      /**
       * @name _normalize_method
       * @methodOf infinite.service:InfiniteApi
       * @description
       * Check the user value is a valid HTTP method, default to GET
       *
       * @param {String} method HTTP Method
       * @private
       */
      function _normalize_method(method){
        return _.indexOf(["GET", "POST", "PUT", "DELETE"], (method + "").toUpperCase() ) > -1 ? method : "GET";
      }

      /**
       * @name _cleanIdArray
       * @methodOf InfiniteSDK.service:InfiniteApi
       * @description
       * Ensure an array of ids is in the ['id','id2','id3'] format
       * Check for an array of objects with _id property
       *
       * @param {Array<String,Object>} IDs An array of Ids or objects with the _id property
       * @returns {Array<String>} An array of Ids as a string
       * @private
       */
      function _cleanIdArray(IDs){
        return _.map(IDs, function(id){
          if(id.hasOwnProperty && id.hasOwnProperty("_id")){
            return id._id;
          }
          return id;
        });
      }

      function getInfiniteMomentFormat(){
        return "MMM d, yyyy hh:mm:ss a";
      }

      InfiniteApi.dateToMoment = function(toMoment){
        return _.isString(toMoment) ? moment(toMoment, getInfiniteMomentFormat()) : moment(toMoment);
      };

      /**
       * @ngdoc method
       * @name hashPassword
       * @methodOf infinite.service:InfiniteApi
       * @description
       * Hash passwords for API use using SHA256 and formatted in base 64
       * @param {String} plainPassword Plain text password to hash
       * @returns {String} SHA256 base64 hashed password.
       */
      InfiniteApi.hashPassword = function(plainPassword){
        var SHA256 =  new hashes.SHA256();
        return SHA256.b64(plainPassword);
      };

      /**
       * @ngdoc method
       * @name idListAsObjects
       * @methodOf infinite.service:InfiniteApi
       * @description
       * Convert a comma delimited list or an array of strings to the
       * APIs required format of an array of objects with _id properties.
       *
       * "1234,ABCD,A1B2"
       * or
       * ['1234","ABCD","A1B2"]
       * or
       * [{_id:"1234"},{_id:"ABCD"},{_id:"A1B2"}]
       *
       * becomes
       *
       * [{_id:"1234"},{_id:"ABCD"},{_id:"A1B2"}]
       *
       * @param {String,Array<String,ObjectWithId>} IDs  An array of id strings, a comma delimited list of ids,
       *                                                 or an array of objects with _id properties
       * @returns {Array<ObjectWithId>} An array of objects with an _id property
       */
      InfiniteApi.idListAsObjects = function(IDs){
        //Split a comma delimited list
        if (angular.isString(IDs)) {
          IDs = IDs.split(",");
        }
        return _.map( IDs, function(idAsStringOrObject){
          if( angular.isObject(idAsStringOrObject) ){
            return {_id:idAsStringOrObject._id};
          }
          return {_id:idAsStringOrObject};
        });
      };

      /**
       * @ngdoc method
       * @name idListAsString
       * @methodOf infinite.service:InfiniteApi
       * @description
       * Convert an array of ids to a comma delimited list
       *
       * "1234,ABCD,A1B2"
       * or
       * ['1234","ABCD","A1B2"]
       * or
       * [{_id:"1234"},{_id:"ABCD"},{_id:"A1B2"}]
       *
       * becomes
       *
       * "1234,ABCD,A1B2"
       *
       * @param {String,Array<String,ObjectWithId>} IDs  An array of id strings, a comma delimited list of ids,
       *                                                 or an array of objects with _id properties
       * @returns {String} A comma delimited list of ids
       */
      InfiniteApi.idListAsString = function(IDs){
        //Strings can just pass through
        if (angular.isString(IDs)){
          return IDs;
        }
        //Clean up an array
        if (angular.isArray(IDs)) {
          return _cleanIdArray(IDs).join(",");
        }
        //Not a valid input
        return "";
      };

      /**
       * @ngdoc method
       * @name idListAsArray
       * @methodOf infinite.service:InfiniteApi
       * @description
       * Convert a list of ids to a comma delimited list
       *
       * "1234,ABCD,A1B2"
       * or
       * ['1234","ABCD","A1B2"]
       * or
       * [{_id:"1234"},{_id:"ABCD"},{_id:"A1B2"}]
       *
       * becomes
       *
       * ['1234","ABCD","A1B2"]
       *
       * @param {String,Array<String,ObjectWithId>} IDs  An array of id strings, a comma delimited list of ids,
       *                                                 or an array of objects with _id properties
       * @returns {Array<String>} An array of ids as strings
       */
      InfiniteApi.idListAsArray = function(IDs){
        if(_.isString(IDs)){
          return IDs.split(",");
        }
        if (angular.isArray(IDs)) {
          return _cleanIdArray(IDs);
        }
        return [];
      };

      /**
       * @ngdoc method
       * @name tagListAsString
       * @methodOf infinite.service:InfiniteApi
       * @description
       * Format an array of tags ['tag1', 'tag2'] as a comma delimited string "tag1,tag2"
       *
       * @param {Array<String>,String} tags An array of tags or a comma delimited list of tags
       * @returns {String} A list of tags as a comma delimited list
       */
      InfiniteApi.tagListAsString = function(tags){
        //Strings can just pass through
        if (angular.isString(tags)){
          return tags;
        }
        return tags.join(",");
      };

      /**
       * Error check and return the data portion of an api response. Useful for promise chains.
       *
       * eg.
       *
       * return SourceApiService.getAll().then( InfiniteApi.resolveWithData );
       *
       * IF data does not exist a rejection with be issued.
       *
       * @param apiResponse
       * @returns {Promise<Array>}
       */
      InfiniteApi.resolveWithData = function(apiResponse){
        if(_.isEmpty(apiResponse)) return $q.reject("Api Response is empty, cannot read data.");
        if(!apiResponse.hasOwnProperty('data')) return $q.reject("Api Response does not contain a data object.");
        return apiResponse.data;
      };

      InfiniteApi.resolveWithDataId = function(apiResponse){
        if(_.isEmpty(apiResponse)) return $q.reject("Api Response is empty, cannot read data.");
        if(!apiResponse.hasOwnProperty('data')) return $q.reject("Api Response does not contain a data object.");
        if(!apiResponse.data.hasOwnProperty('_id')) return $q.reject("Data object does not contain an ID.");
        return apiResponse.data._id;
      };

      InfiniteApi.resolveWithDataOrArray = function(apiResponse){
        if(_.isEmpty(apiResponse)) return $q.reject("Api Response is empty, cannot parse.");
        if(!apiResponse.hasOwnProperty('data')) return [];
        return apiResponse.data;
      };

      InfiniteApi.resolveWithDataOrObject = function(apiResponse){
        if(_.isEmpty(apiResponse)) return $q.reject("Api Response is empty, cannot parse.");
        if(!apiResponse.hasOwnProperty('data')) return {};
        return apiResponse.data;
      };

      /**
       *
       * @param apiResponse
       * @returns {Promise<Response>} Response portion of ApiResponse
       */
      InfiniteApi.resolveWithResponse = function(apiResponse){
        if(_.isEmpty(apiResponse)) return $q.reject("Api Response is empty, cannot read 'response'.");
        return apiResponse.response;
      };

      /**
       * Base query function, returns promise.
       * Promise resolves to data object if successful
       * on failure, Promise rejects with an error message
       * @param {String} method                 HTTP Method
       * @param {String} apiEndpoint            Api endpoint URI
       * @param {Object} [queryParams=null]     Query String data
       * @param {Object} [postData=null]        HTTP Post data
       * @param {Boolean} [alwaysResolve=false] Set to true to skip the {httpResponse.data.response.success} check.
       * @param {String} [forceContentType=browser default]  Force the HTTP Content type header
       * @returns {Promise<ApiResponse>} HTTP Promise
       */
      InfiniteApi.rawQuery = function( method, apiEndpoint, queryParams, postData, alwaysResolve, forceContentType ) {

        //Deferred
        var def = $q.defer();

        //Build a request using defaults and applying httpRequestConfig
        var httpReq = {
          method:_normalize_method(method),
          url: _getApiBase() + apiEndpoint
        };

        //Apply postData AND query string params
        //some POST/PUT/DELETE calls may need both.
        if (angular.isDefined(queryParams)) httpReq.params = queryParams;
        if (angular.isDefined(postData)) httpReq.data = postData;

        //Apply contentType if provided
        if (forceContentType && httpReq.method != "GET") {
          httpReq.headers = {
            //undefined lets the browser automatically decide how to set content-type
            'Content-Type': forceContentType == 'undefined' ? undefined : forceContentType
          };
        }

        //Debugging
        $log.debug("[InfiniteApi->rawQuery] HTTP Request:", httpReq );

        //Start HTTP process
        $http(httpReq).then(
          function apiSuccess(httpResponse){
            if( (_.has(httpResponse,'data.response') && httpResponse.data.response.success) || alwaysResolve === true ){
              def.resolve(httpResponse.data);
            } else {
              //HTTP may be successful but we the return object may indicate a failure
              def.reject(httpResponse.data.response.message || "No message from API.");
            }
          },
          function apiError(error){
            //Reject with the error provided from $http
            def.reject(error);
          }
        );

        //Return promise
        return def.promise;
      };


      /* *****
       * Convenience HTTP methods
       * Note the order swap on queryParans and postData for the POST,PUT,DELETE methods.
       * These are re-arranged to fit most common use. the rawQuery method prioritizes the queryParams.
       * ****/


      /**
       * @ngdoc method
       * @name get
       * @methodOf infinite.service:InfiniteApi
       * @description
       * Perform an HTTP GET request on the Infinite Platform API
       *
       * @param {String} apiEndpoint Infinite API endpoint URL
       * @param {Object} [queryParams=null] Data to submit via http query string parameters
       * @param {Boolean} [alwaysResolve=false] Set to true to skip ApiResponse.response.success check
       * @returns {Promise<ApiResponse>} Api response promise after ( optional ) success check.
       */
      InfiniteApi.get = function( apiEndpoint, queryParams, alwaysResolve ){
        return InfiniteApi.rawQuery("GET", apiEndpoint, queryParams, null, alwaysResolve);
      };

      /**
       * @ngdoc method
       * @name post
       * @methodOf infinite.service:InfiniteApi
       * @description
       * Perform an HTTP POST request on the Infinite Platform API
       *
       * @param {String} apiEndpoint Infinite API endpoint URL
       * @param {Object} [postData=null] Data to submit via POST body. Objects will be JSON encoded automatically.
       * @param {Object} [queryParams=null] Data to submit via http query string parameters
       * @param {Boolean} [alwaysResolve=false] Set to true to skip ApiResponse.response.success check
       * @param {String} [forceContentType=browser default]  Force the HTTP Content type header
       * @returns {Promise<ApiResponse>} Api response promise after ( optional ) success check.
       */
      InfiniteApi.post = function( apiEndpoint, postData, queryParams, alwaysResolve, forceContentType){
        return InfiniteApi.rawQuery("POST", apiEndpoint, queryParams, postData, alwaysResolve, forceContentType);
      };

      /**
       * @ngdoc method
       * @name put
       * @methodOf infinite.service:InfiniteApi
       * @description
       * Perform an HTTP PUT request on the Infinite Platform API
       *
       * @param {String} apiEndpoint Infinite API endpoint URL
       * @param {Object} [postData=null] Data to submit via PUT body. Objects will be JSON encoded automatically.
       * @param {Object} [queryParams=null] Data to submit via http query string parameters
       * @param {Boolean} [alwaysResolve=false] Set to true to skip ApiResponse.response.success check
       * @param {String} [forceContentType=browser default]  Force the HTTP Content type header
       * @returns {Promise<ApiResponse>} Api response promise after ( optional ) success check.
       *
       * @example
       */
      InfiniteApi.put = function( apiEndpoint, postData, queryParams, alwaysResolve, forceContentType){
        return InfiniteApi.rawQuery("PUT", apiEndpoint, queryParams, postData, alwaysResolve, forceContentType);
      };

      /**
       * @ngdoc method
       * @name delete
       * @methodOf infinite.service:InfiniteApi
       * @description
       * Perform an HTTP DELETE request on the Infinite Platform API
       * @param {String} apiEndpoint Infinite API endpoint URL
       * @param {Object} [postData=null] Data to submit via DELETE body. Objects will be JSON encoded automatically.
       * @param {Object} [queryParams=null] Data to submit via http query string parameters
       * @param {Boolean} [alwaysResolve=false] Set to true to skip ApiResponse.response.success check
       * @param {String} [forceContentType=browser default]  Force the HTTP Content type header
       * @returns {Promise<ApiResponse>} Api response promise after ( optional ) success check.
       */
      InfiniteApi.delete = function( apiEndpoint, postData, queryParams, alwaysResolve, forceContentType){
        return InfiniteApi.rawQuery("DELETE", apiEndpoint, queryParams, postData, alwaysResolve, forceContentType);
      };

      return InfiniteApi;

    }
  ]);
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
    module.factory('AuthApiService', [ '$q', 'InfiniteApi',

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
   * @typedef {ObjectWithId} SourceDef
   * @property {Array<ObjectId>} communityIds
   * @property {Number} searchCycle_secs
   */

  /**
   * @ngdoc service
   * @name infinite.config.service:SourceApiService
   * @description Data Source API End points
   *
   * For more information on requests and responses please see the Infinite Sources API:
   * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
   */
  module.factory('SourceApiService', ['$q', 'InfiniteApi',

    function($q, InfiniteApi) {
      'use strict';

      var SourceApiService = {};

      // ********************************************************************* //
      // API URI Generators
      // ********************************************************************* //

      /**
       * @name _uri_configSource
       * @methodOf infinite.config.service:SourceApiService
       * @description
       * Build the base URI for feature queries
       *
       * @returns {String} Feature base URI
       * @private
       */
      function _uri_configSource() {
        return appConfig.apiConfigSourceURI;
      }

      /**
       * @name _uri_getBadSources
       * @methodOf infinite.config.service:SourceApiService
       * @description
       * Build a URI to query bad sources
       *
       * @param {Array<ObjectId>} dataGroupIds A List of data group ids
       * @returns {String} Bad sources URI
       * @private
       */
      function _uri_getBadSources(dataGroupIds){
        return sprintf.sprintf( "%s/bad/%s",
          _uri_configSource(),
          encodeURIComponent(InfiniteApi.idListAsString(dataGroupIds))
        );
      }

      /**
       *
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @returns {String}
       * @private
       */
      function _uri_getGoodSources(dataGroupIds){
        return sprintf.sprintf("%s/good/%s",
          _uri_configSource(),
          encodeURIComponent(InfiniteApi.idListAsString(dataGroupIds))
        );
      }

      /**
       *
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @returns {String}
       * @private
       */
      function _uri_getPendingSources(dataGroupIds){
        return sprintf.sprintf("%s/pending/%s",
          _uri_configSource(),
          encodeURIComponent(InfiniteApi.idListAsString(dataGroupIds))
        );
      }

      /**
       *
       * @param {ObjectId|String} sourceIdOrKey
       * @returns {String}
       * @private
       */
      function _uri_getSource(sourceIdOrKey){
        return sprintf.sprintf("%s/get/%s",
          _uri_configSource(),
          encodeURIComponent(sourceIdOrKey)
        );
      }

      /**
       *
       * @param {ObjectId|String} sourceIdOrKey
       * @param dataGroupId
       * @returns {String}
       * @private
       */
      function _uri_removeSource(sourceIdOrKey, dataGroupId){
        return sprintf.sprintf("%s/delete/%s/%s",
          _uri_configSource(),
          encodeURIComponent(sourceIdOrKey),
          encodeURIComponent(dataGroupId)
        );
      }

      /**
       *
       * @param {ObjectId|String} sourceIdOrKey
       * @param dataGroupId
       * @returns {String}
       * @private
       */
      function _uri_removeDocuments(sourceIdOrKey, dataGroupId){
        return sprintf.sprintf("%s/delete/docs/%s/%s",
          _uri_configSource(),
          encodeURIComponent(sourceIdOrKey),
          encodeURIComponent(dataGroupId)
        );
      }

      /**
       *
       * @param dataGroupId
       * @returns {String}
       * @private
       */
      function _uri_saveSource(dataGroupId){
        return sprintf.sprintf("%s/save/%s",
          _uri_configSource(),
          encodeURIComponent(dataGroupId)
        );
      }

      /**
       *
       * @param {ObjectId|String} sourceIdOrKey
       * @param dataGroupIdOrKey
       * @param shouldSuspend
       * @returns {String}
       * @private
       */
      function _uri_suspendSource(sourceIdOrKey, dataGroupIdOrKey, shouldSuspend){

        //Format shouldSuspend param for url
        if (shouldSuspend === true) {
          shouldSuspend = "true";
        }
        if (shouldSuspend === false) {
          shouldSuspend = "false";
        }

        return sprintf.sprintf("%s/suspend/%s/%s/%s",
          _uri_configSource(),
          encodeURIComponent(sourceIdOrKey),
          encodeURIComponent(dataGroupIdOrKey),
          shouldSuspend
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_testSource(){
        return sprintf.sprintf( "%s/test", _uri_configSource());
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_getUserSources() {
        return sprintf.sprintf("%s/user", _uri_configSource());
      }

      // ********************************************************************* //
      // Main public API methods
      // ********************************************************************* //

      /**
       * @ngdoc method
       * @name rawQuery
       * @methodOf infinite.config.service:SourceApiService
       * @description
       * Raw access to the query mechanism for this API base path
       *
       * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
       * @param {String}  sourceEndpoint End point relative to this base
       * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
       * @param {map}     [postData=null] Optional object to post as json
       * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
       * @param {String}  [forceContentType=null] Data mime-type if provided
       * @returns {Promise<ApiResponse>} ApiResponse if successful
       */
      SourceApiService.rawQuery = function(method, sourceEndpoint, queryParams, postData, alwaysResolve, forceContentType) {
        return InfiniteApi.rawQuery(method, _uri_configSource() + sourceEndpoint, queryParams, postData, alwaysResolve, forceContentType);
      };

      /**
       * @ngdoc method
       * @name get
       * @methodOf infinite.config.service:SourceApiService
       * @description
       * Get a source by ID or key
       *
       * @param {ObjectId|String} sourceIdOrKey Source ID or Key to look up
       * @returns {Promise<ApiResponse>} ApiResponse if successful.
       */
      SourceApiService.get = function(sourceIdOrKey){
        return InfiniteApi.get(_uri_getSource(sourceIdOrKey));
      };

      /**
       * @ngdoc method
       * @name getBad
       * @methodOf infinite.config.service:SourceApiService
       * @description
       * Get bad sources from a given set of data group ids and optionally a project id
       *
       * @param {String|Array<ObjectId>} dataGroupIds List of data groups to query
       * @param {ObjectId} [projectId=null] Project ID to query
       * @param {Boolean} [stripped=true] Set to false to get non-stripped results
       * @returns {Promise<ApiResponse>} ApiResponse if successful.
       */
      SourceApiService.getBad = function(dataGroupIds, projectId, stripped){
        if( _.isEmpty(dataGroupIds) ) dataGroupIds = "*";
        var options = { stripped: stripped !== false };
        if (angular.isDefined(projectId)){ options.project_id = projectId; }
        return InfiniteApi.get(_uri_getBadSources(dataGroupIds), {project_id: projectId});
      };

      /**
       * @ngdoc method
       * @name getGood
       * @methodOf infinite.config.service:SourceApiService
       * @description
       * Get good sources from a given set of data group ids and optionally a project id
       *
       * @param {String|Array<ObjectId>} dataGroupIds List of data groups to query
       * @param {ObjectId} [projectId=null] Project ID to query
       * @param {Boolean} [stripped=true] Set to false to get non-stripped results
       * @returns {Promise<ApiResponse>} ApiResponse if successful.
       */
      SourceApiService.getGood = function(dataGroupIds, projectId, stripped){
        if( _.isEmpty(dataGroupIds) ) dataGroupIds = "*";
        var options = { stripped: stripped !== false };
        if (angular.isDefined(projectId)) {
          options.project_id = projectId;
        }
        return InfiniteApi.get(_uri_getGoodSources(dataGroupIds), options);
      };

      /**
       * @ngdoc method
       * @name getGood
       * @methodOf infinite.config.service:SourceApiService
       * @description
       * Get good sources from a given set of data group ids and optionally a project id
       *
       * @param {String|Array<ObjectId>} dataGroupIds List of data groups to query
       * @param {ObjectId} [projectId=null] Project ID to query
       * @param {Boolean} [stripped=true] Set to false to get non-stripped results
       * @returns {Promise<ApiResponse>} ApiResponse if successful.
       */
      SourceApiService.getPending = function(dataGroupIds, projectId, stripped){
        if( _.isEmpty(dataGroupIds) ) dataGroupIds = "*";
        var options = { stripped: stripped !== false };
        if (angular.isDefined(projectId)) {
          options.project_id = projectId;
        }
        return InfiniteApi.get(_uri_getPendingSources(dataGroupIds), options);
      };



      /**
       * @ngdoc method
       * @name getUserSources
       * @methodOf infinite.config.service:SourceApiService
       * @description
       * Get a list of sources fir the current user with a few configurable flags.
       *
       * @param {Boolean} [communityFilter=false] Filter by available communities ( admin-only )
       * @param {Boolean} [userFilter=false] Filter to only the current user's data groups ( admin-only )
       * @param {Boolean} [stripped=false] Strip results
       * @returns {Promise<ApiResponse>} ApiResponse if successful.
       */
      SourceApiService.getUserSources = function(communityFilter, userFilter, stripped){
        var options = {};
        options.communityFilter = communityFilter ? 'true' : 'false';
        options.userFilter = userFilter ? 'true' : 'false';
        options.stripped = stripped ? 'true' : 'false';
        return InfiniteApi.get(_uri_getUserSources(), options);
      };

      /**
       * @ngdoc method
       * @name remove
       * @methodOf infinite.config.service:SourceApiService
       * @description
       * Remove a source by id or key from a data group
       *
       * @param {ObjectId|String} sourceIdOrKey Source ID or Key
       * @param {ObjectId} dataGroupId Data group ID of source
       * @returns {Promise<ApiResponse>} ApiResponse if successful.
       */
      SourceApiService.remove = function(sourceIdOrKey, dataGroupId){
        return InfiniteApi.get(_uri_removeSource(sourceIdOrKey, dataGroupId));
      };

      /**
       * @ngdoc method
       * @name removeDocuments
       * @methodOf infinite.config.service:SourceApiService
       * @description
       * Remove documents from a source by sourceId or sourceKey and data group
       *
       * @param {ObjectId|String} sourceIdOrKey Source ID or Key
       * @param {ObjectId} dataGroupId Data group ID of source
       * @returns {Promise<ApiResponse>} ApiResponse if successful.
       */
      SourceApiService.removeDocuments = function(sourceIdOrKey, dataGroupId){
        return InfiniteApi.get(_uri_removeDocuments(sourceIdOrKey, dataGroupId));
      };

      /**
       * @ngdoc method
       * @name save
       * @methodOf infinite.config.service:SourceApiService
       * @description
       * Save a new source to a data group
       *
       * @param {ObjectId} dataGroupId Data group ID of source
       * @param {SourceDef} sourceDefinition Source Defintion object
       * @returns {Promise<ApiResponse>} ApiResponse if successful.
       */
      SourceApiService.save = function(dataGroupId, sourceDefinition){
        return InfiniteApi.post(_uri_saveSource(dataGroupId), sourceDefinition);
      };

      /**
       * @ngdoc method
       * @name suspend
       * @methodOf infinite.config.service:SourceApiService
       * @description
       * Suspend a source
       *
       * @param {String} sourceIdOrKey SourceID or SourceKey to suspend
       * @param {String} dataGroupIdOrKey Data group ID
       * @param {Boolean} shouldSuspend Set to true to suspend, false to resume
       * @returns {Promise<ApiResponse>} ApiResponse if successful.
       */
      SourceApiService.suspend = function(sourceIdOrKey, dataGroupIdOrKey, shouldSuspend){
        return InfiniteApi.get(_uri_suspendSource(sourceIdOrKey, dataGroupIdOrKey, shouldSuspend));
      };

      /**
       * @ngdoc method
       * @name test
       * @methodOf infinite.config.service:SourceApiService
       * @description
       * Test a source
       *
       * @param {Number} returnItemCount Number of test results to return
       * @param {String} returnFullText Set to true to get full result text
       * @param {Boolean} testUpdates Test the updated options
       * @param {SourceDef} sourceDef Source Definition object to test
       * @returns {Promise<ApiResponse>} ApiResponse if successful.
       */
      SourceApiService.test = function(returnItemCount, returnFullText, testUpdates, sourceDef){
        var queryParams = {
          numReturn: isFinite(returnItemCount) ? returnItemCount : 10,
          returnFullText: returnFullText === true
        };

        // Apply testUpdates if available
        if(testUpdates === true) queryParams.testUpdates = true;

        return InfiniteApi.post(_uri_testSource(), sourceDef, queryParams);
      };

      return SourceApiService;

    }
  ]);
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
   * @name infinite.custom.service:MapReduceApiService
   * @description Map Reduce Custom Job API End points
   *
   * These methods will control the map reduce functionality of the infinite platform.
   *
   * For more information on requests and responses please see the Infinite Sources API:
   * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
   */
  module.factory('MapReduceApiService', [ '$q', 'InfiniteApi',

    function($q, InfiniteApi) {
      'use strict';

      // ********************************************************************* //
      // API URI Generators
      // ********************************************************************* //

      /**
       * Build the base URI for map reduce
       * @returns {String} Map Reduce query URI
       * @private
       */
      function _uri_mapReduceBase(){
        return appConfig.apiCustomMapReduceURI;
      }

      /**
       *
       * @param inputCollection
       * @param map
       * @param reduce
       * @param query
       * @returns {String}
       * @private
       */
      function _uri_runJob(inputCollection, map, reduce, query){
        return sprintf.sprintf("%s/%s/%s/%s/%s",
          _uri_mapReduceBase,
          inputCollection,
          map,
          reduce,
          query
        );
      }

      /**
       *
       * @param (idsOrTitles)
       * @returns {String}
       * @private
       */
      function _uri_listJobs(idsOrTitles){
        return sprintf.sprintf("%s/getjobs/%s",
          _uri_mapReduceBase(),
          encodeURIComponent(InfiniteApi.idListAsString(idsOrTitles))
        ).replace(/\/$/, "");
      }

      /**
       *
       * @param jobIdOrJobTitle
       * @returns {String}
       * @private
       */
      function _uri_getResults(jobIdOrJobTitle){
        return sprintf.sprintf("%s/getresults/%s",
          _uri_mapReduceBase,
          encodeURIComponent(jobIdOrJobTitle)
        );
      }

      /**
       *
       * @param jobIdOrJobTitle
       * @returns {String}
       * @private
       */
      function _uri_removeJob(jobIdOrJobTitle){
        return sprintf.sprintf(
          "%s/removejob/%s",
          _uri_mapReduceBase(),
          encodeURIComponent(jobIdOrJobTitle)
        );
      }

      /**
       *
       * @param title
       * @param description
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @param jarUrl
       * @param timeToRun
       * @param runFrequency
       * @param mapperClass
       * @param reducerClass
       * @param combinerClass
       * @param query
       * @param inputCollection
       * @param outputKey
       * @param outputValue
       * @returns {String}
       * @private
       */
      function _uri_scheduleJob( title, description, dataGroupIds, jarUrl, timeToRun,
                                 runFrequency, mapperClass, reducerClass, combinerClass,
                                 query, inputCollection, outputKey, outputValue){

        return sprintf.sprintf(
          "%s/schedulejob/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s",
          _uri_mapReduceBase(),
          title,
          description,
          encodeURIComponent(InfiniteApi.idListAsString(dataGroupIds)),
          jarUrl,
          timeToRun,
          runFrequency,
          mapperClass,
          reducerClass,
          combinerClass,
          query,
          inputCollection,
          outputKey,
          outputValue
        );
      }

      /**
       *
       * @param jobIdOrJobTitle
       * @param title
       * @param description
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @param jarUrl
       * @param timeToRun
       * @param runFrequency
       * @param mapperClass
       * @param reducerClass
       * @param combinerClass
       * @param query
       * @param inputCollection
       * @param outputKey
       * @param outputValue
       * @returns {String}
       * @private
       */
      function _uri_updateJob( jobIdOrJobTitle,
                               title, description, dataGroupIds, jarUrl, timeToRun,
                               runFrequency, mapperClass, reducerClass, combinerClass,
                               query, inputCollection, outputKey, outputValue){

        return sprintf.sprintf(
          "%s/updatejob/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s",
          _uri_mapReduceBase(),
          jobIdOrJobTitle,
          title,
          description,
          encodeURIComponent(InfiniteApi.idListAsString(dataGroupIds)),
          jarUrl,
          timeToRun,
          runFrequency,
          mapperClass,
          reducerClass,
          combinerClass,
          query,
          inputCollection,
          outputKey,
          outputValue
        );
      }

      // ********************************************************************* //
      // Main public API methods
      // ********************************************************************* //

      /**
       * @ngdoc method
       * @name rawQuery
       * @methodOf infinite.custom.service:MapReduceApiService
       * @description
       * Raw access to the query mechanism for this API base path
       *
       * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
       * @param {String}  mapReduceEndpoint End point relative to this base
       * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
       * @param {map}     [postData=null] Optional object to post as json
       * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
       * @param {String}  [forceContentType=null] Data mime-type if provided
       * @returns {Promise<ApiResponse>} ApiResponse if successful
       */
      function rawQuery(method, mapReduceEndpoint, queryParams, postData, alwaysResolve, forceContentType){
        return InfiniteApi.rawQuery( method, _uri_mapReduceBase() + mapReduceEndpoint, queryParams, postData, alwaysResolve, forceContentType);
      }

      /**
       * @ngdoc method
       * @name run
       * @methodOf infinite.custom.service:MapReduceApiService
       * @description
       * Runs a mongodb map reduce job immediately and only once
       *
       * @param {Object} inputCollection The input collection you want to run the map reduce job on.
       *         Can be DOC_METADATA for the documents collection or another custom map reduce results collection.
       * @param {String} map The mongodb map to run.
       * @param {string} reduce The mongodb reduce to run.
       * @param {String} query The query to run on the input collection, the data group ids will be added to whatever query gets submitted.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      function run(inputCollection, map, reduce, query){
        return InfiniteApi.get(_uri_runJob(inputCollection, map, reduce, query));
      }

      /**
       * @ngdoc method
       * @name listJobs
       * @methodOf infinite.custom.service:MapReduceApiService
       * @description
       *
       * @param {Array<ObjectId|String>} idsOrTitles IDs or Titles of jobs to query
       * @param {ObjectId} [projectId=null] Optionally limit result set within project definition.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      function listJobs(idsOrTitles, projectId){
        var options = {};
        if( angular.isDefined(projectId)){
          options.project_id = projectId;
        }
        return InfiniteApi.get(_uri_listJobs(idsOrTitles), options);
      }

      /**
       * @ngdoc method
       * @name getResults
       * @methodOf infinite.custom.service:MapReduceApiService
       * @description
       *
       * @param {ObjectId|String} jobIdOrJobTitle The id or title of a job you want the results of.
       * @param {String} [find=null] A string representing a MongoDB query (in JSON format) that is applied to the results of the custom table.
       * @param {String} [sort=null] A string representing a MongoDB sort operator (in JSON format)
       * @param {Number} [limit=null] An integer of how many results you want retrieved from the database, results will be grabbed in whatever order they have been stored in the db.
       * */
      function getResults(jobIdOrJobTitle, find, sort, limit){
        var queryParams = {};
        if(angular.isString(find)){
          queryParams.find = find;
        }
        if(angular.isString(sort)){
          queryParams.sort = sort;
        }
        if(angular.isNumber(limit)){
          queryParams.limit = limit;
        }
        return InfiniteApi.get( _uri_getResults(jobIdOrJobTitle), queryParams );
      }

      /**
       * @ngdoc method
       * @name removeJob
       * @methodOf infinite.custom.service:MapReduceApiService
       * @description
       *
       * @param {ObjectId|String} jobIdOrJobTitle The id or title of a job you want the results of.
       * @param {Boolean} [removeJar=false] Set to true to attempt to remove the jar after removing the job.
       *                    NOTE: This will fail if the jar is used elsewhere or you aren't the owner.
       */
      function removeJob(jobIdOrJobTitle, removeJar){
        var queryParams = {};
        if(removeJar === true){
          queryParams.removeJar = true;
        }
        return InfiniteApi.get( _uri_removeJob(jobIdOrJobTitle), queryParams);
      }

      /**
       * @ngdoc method
       * @name scheduleJob
       * @methodOf infinite.custom.service:MapReduceApiService
       * @description
       *
       * @param {String} title A descriptive name of the job being submitted.
       * @param {String} description A description of what the job being submitted is attempting to do.
       * @param {Array<ObjectId>} dataGroupIds GroupIDs that the map reduce job wants to run on. These will be appended to the mongo query.
       * @param {String} jarUrl A URL to the location of the jar file to run for the job
       * @param {Number} timeToRun The time you want a job to be run after in long form
       * @param {"NONE"|"HOURLY"|"DAILY"|"WEEKLY"|"MONTHLY"} runFrequency How often the job should be ran.
       *                     This will cause the job to get resubmitted after running, use NONE if you only
       *                     want the job to run once.
       * @param {String} mapperClass The java classpath to the jobs mapper, it should be in the form of package.file$class
       * @param {String} reducerClass The java classpath to the jobs reducer, it should be in the form of package.file$class
       * @param {String} combinerClass The java classpath to the jobs combiner, it should be in the form of package.file$class
       * @param {string} [query=null] Optional. The mongo query to use to get the jobs data.
       * @param {String} inputCollection The mongo collection you want to use as input.
       * @param {String} outputKey The classpath for the map reduce output format key usually org.apache.hadoop.io.Text
       * @param {String} outputValue The classpath for the map reduce output format value usually org.apache.hadoop.io.IntWritable
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      function scheduleJob(title, description, dataGroupIds, jarUrl, timeToRun, runFrequency, mapperClass,
                           reducerClass, combinerClass, query, inputCollection, outputKey, outputValue) {

        return InfiniteApi.get(
          _uri_scheduleJob( title, description, dataGroupIds, jarUrl, timeToRun, runFrequency, mapperClass,
            reducerClass, combinerClass, query, inputCollection, outputKey, outputValue)
        );
      }

      /**
       * @ngdoc method
       * @name updateJob
       * @methodOf infinite.custom.service:MapReduceApiService
       * @description
       *
       * @param {ObjectId|String} jobIdOrJobTitle Job ID or title.
       * @param {String} title A descriptive name of the job being submitted.
       * @param {String} description A description of what the job being submitted is attempting to do.
       * @param {Array<ObjectId>} dataGroupIds GroupIDs that the map reduce job wants to run on. These will be appended to the mongo query.
       * @param {String} jarUrl A URL to the location of the jar file to run for the job
       * @param {Number} timeToRun The time you want a job to be run after in long form
       * @param {"NONE"|"HOURLY"|"DAILY"|"WEEKLY"|"MONTHLY"} runFrequency How often the job should be ran.
       *                     This will cause the job to get resubmitted after running, use NONE if you only
       *                     want the job to run once.
       * @param {String} mapperClass The java classpath to the jobs mapper, it should be in the form of package.file$class
       * @param {String} reducerClass The java classpath to the jobs reducer, it should be in the form of package.file$class
       * @param {String} combinerClass The java classpath to the jobs combiner, it should be in the form of package.file$class
       * @param {string} [query=null] Optional. The mongo query to use to get the jobs data.
       * @param {String} inputCollection The mongo collection you want to use as input.
       * @param {String} outputKey The classpath for the map reduce output format key usually org.apache.hadoop.io.Text
       * @param {String} outputValue The classpath for the map reduce output format value usually org.apache.hadoop.io.IntWritable
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      function updateJob(jobIdOrJobTitle,
                         title, description, dataGroupIds, jarUrl, timeToRun, runFrequency, mapperClass,
                         reducerClass, combinerClass, query, inputCollection, outputKey, outputValue){

        return InfiniteApi.get(
          _uri_updateJob(jobIdOrJobTitle,
            title, description, dataGroupIds, jarUrl, timeToRun, runFrequency, mapperClass,
            reducerClass, combinerClass, query, inputCollection, outputKey, outputValue)
        );
      }

      /**
       * Public Auth methods
       */
      return {

        //Expose full base query
        rawQuery: rawQuery,

        //API Methods
        run: run,
        listJobs: listJobs,
        getResults: getResults,
        removeJob: removeJob,
        scheduleJob: scheduleJob,
        updateJob: updateJob
      };

    }
  ]);
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
   * @name infinite.custom.service:SavedQueryApiService
   * @description Saved Query Custom Job API End points
   *
   * For more information on requests and responses please see the Infinite Sources API:
   * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
   */
  module.factory('SavedQueryApiService', [ '$q', 'InfiniteApi',

    function($q, InfiniteApi) {
      'use strict';

      // ********************************************************************* //
      // API URI Generators
      // ********************************************************************* //

      /**
       * Build the base URI for map reduce
       * @returns {String} Map Reduce query URI
       * @private
       */
      function _uri_savedQueryBase(){
        return appConfig.apiCustomSavedQueryURI;
      }

      // ********************************************************************* //
      // Main public API methods
      // ********************************************************************* //

      /**
       * @ngdoc method
       * @name rawQuery
       * @methodOf infinite.custom.service:SavedQueryApiService
       * @description
       * Raw access to the query mechanism for this API base path
       *
       * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
       * @param {String}  savedQueryEndpoint End point relative to this base
       * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
       * @param {map}     [postData=null] Optional object to post as json
       * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
       * @param {String}  [forceContentType=null] Data mime-type if provided
       * @returns {Promise<ApiResponse>} ApiResponse if successful
       */
      function rawQuery(method, savedQueryEndpoint, queryParams, postData, alwaysResolve, forceContentType){
        return InfiniteApi.rawQuery( method, _uri_savedQueryBase() + savedQueryEndpoint, queryParams, postData, alwaysResolve, forceContentType);
      }

      /**
       * Public Auth methods
       */
      return {

        //Expose full base query
        rawQuery: rawQuery

        //API Methods

        //Convenience methods

      };

    }
  ]);
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
   * @typedef {Object} InfiniteQueryDef
   */

  /**
   * @ngdoc service
   * @name infinite.knowledge.service:DocumentApiService
   * @description Document Knowledge API End points
   *
   * For more information on requests and responses please see the Infinite Sources API:
   * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
   */
  module.factory('DocumentApiService', [ '$q', 'InfiniteApi',

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
      function _uri_knowledgeDocumentBase(){
        return appConfig.apiKnowledgeDocumentURI;
      }

      /**
       *
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @returns {String}
       * @private
       */
      function _uri_knowledgeDocumentQuery(dataGroupIds){
        return sprintf.sprintf("%s/query/%s",
          _uri_knowledgeDocumentBase(),
          encodeURIComponent(InfiniteApi.idListAsString(dataGroupIds))
        );
      }

      /**
       * Get a knowledge file
       * @param {String} sourceKey The source's key
       * @param {String} path The path (not URL encoded, ie "/"s are used directly) relative to the root path of the SMB (Samba/NetBIOS) fileshare of the source identified with "sourceKey"
       * @returns {String}
       * @private
       */
      function _uri_knowledgeDocumentGetFile(sourceKey, path){
        return sprintf.sprintf("%s/file/get/%s/%s",
          _uri_knowledgeDocumentBase(),
          sourceKey,
          path
        );
      }

      /**
       * @param documentId
       * @returns {String}
       * @private
       */
      function _uri_knowledgeDocumentGetById(documentId){
        return sprintf.sprintf("%s/get/%s",
          _uri_knowledgeDocumentBase(),
          encodeURIComponent(documentId)
        );
      }

      /**
       *
       * @param sourceKey
       * @param url
       * @returns {String}
       * @private
       */
      function _uri_knowledgeDocumentGetBySourceKey(sourceKey, url){
        return sprintf.sprintf("%s/get/%s/%s",
          _uri_knowledgeDocumentBase(),
          sourceKey,
          url
        );
      }

      // ********************************************************************* //
      // Main public API methods
      // ********************************************************************* //

      /**
       * @ngdoc method
       * @name rawQuery
       * @methodOf infinite.knowledge.service:DocumentApiService
       * @description
       * Raw access to the query mechanism for this API base path
       *
       * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
       * @param {String}  documentEndpoint End point relative to this base
       * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
       * @param {map}     [postData=null] Optional object to post as json
       * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
       * @param {String}  [forceContentType=null] Data mime-type if provided
       * @returns {Promise<ApiResponse>} ApiResponse if successful
       */
      function rawQuery(method, documentEndpoint, queryParams, postData, alwaysResolve, forceContentType){
        return InfiniteApi.rawQuery( method, _uri_knowledgeDocumentBase() + documentEndpoint, queryParams, postData, alwaysResolve, forceContentType );
      }

      /**
       * @ngdoc method
       * @name query
       * @methodOf infinite.knowledge.service:DocumentApiService
       * @description
       * Query the document knowledge engine
       *
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @param {ObjectId} projectId Limit query within project by id
       * @param {InfiniteQueryDef} infiniteQuery Infinite query object
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      function query(dataGroupIds, projectId, infiniteQuery){
        if(_.isEmpty(dataGroupIds))
          return $q.reject("Data group IDs are missing. To search all use '*'.");

        //Ensure data group list is a comma delimited list
        dataGroupIds = InfiniteApi.idListAsString(dataGroupIds);

        //add the optional project id
        if(projectId){
          infiniteQuery.project_id = projectId;
        }

        //create the request
        return InfiniteApi.post(_uri_knowledgeDocumentQuery(dataGroupIds), infiniteQuery);
      }

      /**
       * @ngdoc method
       * @name getFile
       * @methodOf infinite.knowledge.service:DocumentApiService
       * @description
       *
       * @param {String} sourceKey Source's Key
       * @param {String} path The path relative to the root path of the SMB (Samba/NetBIOS) fileshare of the source identified with "sourceKey"
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      function getFile( sourceKey, path ){
        return InfiniteApi.get(_uri_knowledgeDocumentGetFile(sourceKey, path));
      }

      /**
       * @ngdoc method
       * @name getDocumentById
       * @methodOf infinite.knowledge.service:DocumentApiService
       * @description
       *
       * @param {ObjectId} documentId Document ID
       * @param {Boolean} fullText Set to true to get Full text output
       * @param {Boolean} rawData Set to true to get raw output
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      function getDocumentById( documentId, fullText, rawData){
        var options = {};
        if(angular.isDefined(fullText)){
          options.returnFullText = (fullText || false);
        }
        if(angular.isDefined(rawData)){
          options.returnRawData = (rawData || false);
        }
        return InfiniteApi.get(_uri_knowledgeDocumentGetById(documentId), options);
      }

      /**
       * @ngdoc method
       * @name getDocumentBySourceKey
       * @methodOf infinite.knowledge.service:DocumentApiService
       * @description
       *
       * @param {ObjectId|String} sourceKeyOrId Source key or ID
       * @param {String} [url=null] (required - unless docid specified) the sourceKey together with a URL-encoded URL can be specified
       * @param {Boolean} fullText Set to true to get Full text output
       * @param {Boolean} rawData Set to true to get raw output
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      function getDocumentBySourceKey( sourceKeyOrId, url, fullText, rawData ){
        var options = {};
        if(angular.isDefined(fullText)){
          options.returnFullText = (fullText || false);
        }
        if(angular.isDefined(rawData)){
          options.returnRawData = (rawData || false);
        }
        return InfiniteApi.get(_uri_knowledgeDocumentGetBySourceKey(sourceKeyOrId, url), options);
      }

      //Expose public search history functions
      return {

        //Expose full base query
        rawQuery: rawQuery,

        /**
         * Convenience HTTP methods
         */
        query: query,
        getFile: getFile,
        getDocumentById: getDocumentById,
        getDocumentBySourceKey: getDocumentBySourceKey
      };

    }
  ]);
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
   * @name infinite.knowledge.service:FeatureApiService
   * @description Document-specific feature API End points
   *
   * For more information on requests and responses please see the Infinite Sources API:
   * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
   */
  module.factory('FeatureApiService', ['$q', 'InfiniteApi',

    function($q, InfiniteApi) {
      'use strict';

      var FeatureApiService = {};

      // ********************************************************************* //
      // API URI Generators
      // ********************************************************************* //

      /**
       * Build the base URI for feature queries
       * @returns {String} Feature base URI
       * @private
       */
      function _uri_featureBase() {
        return appConfig.apiKnowledgeFeatureURI;
      }

      /**
       *
       * @param field
       * @param term
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @returns {String}
       * @private
       */
      function _uri_aliasSuggest(field, term, dataGroupIds) {
        return sprintf.sprintf("%s/aliasSuggest/%s/%s/%s",
          _uri_featureBase(),
          encodeURIComponent(field),
          encodeURIComponent(term),
          InfiniteApi.idListAsString(dataGroupIds)
        );
      }

      /**
       *
       * @param searchField
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @param (entity1)
       * @param (verb)
       * @param (entity2)
       * @returns {String}
       * @private
       */
      function _uri_associationSuggest(searchField, dataGroupIds, entity1, verb, entity2) {
        if (!angular.isString(entity1)) entity1 = "null";
        if (!angular.isString(verb))    verb = "null";
        if (!angular.isString(entity2)) entity2 = "null";

        //Build a formatted URL
        return sprintf.sprintf("%s/assocSuggest/%s/%s/%s/%s/%s",
          _uri_featureBase(),
          encodeURIComponent(entity1),
          encodeURIComponent(verb),
          encodeURIComponent(entity2),
          encodeURIComponent(searchField),
          encodeURIComponent(InfiniteApi.idListAsString(dataGroupIds))
        );
      }

      /**
       *
       * @param fragment
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @returns {String}
       * @private
       */
      function _uri_entitySuggest(fragment, dataGroupIds) {
        return sprintf.sprintf("%s/entitySuggest/%s/%s",
          _uri_featureBase(),
          encodeURIComponent(fragment),
          encodeURIComponent(InfiniteApi.idListAsString(dataGroupIds))
        );
      }

      /**
       *
       * @param fragment
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @returns {String}
       * @private
       */
      function _uri_geoSuggest(fragment, dataGroupIds) {
        return sprintf.sprintf("%s/geoSuggest/%s/%s",
          _uri_featureBase(),
          encodeURIComponent(fragment),
          encodeURIComponent(InfiniteApi.idListAsString(dataGroupIds))
        );
      }

      // ********************************************************************* //
      // Main public API methods
      // ********************************************************************* //


      /**
       * @ngdoc method
       * @name rawQuery
       * @methodOf infinite.knowledge.service:FeatureApiService
       * @description
       * Raw access to the query mechanism for this API base path
       *
       * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
       * @param {String}  featureEndpoint End point relative to this base
       * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
       * @param {map}     [postData=null] Optional object to post as json
       * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
       * @param {String}  [forceContentType=null] Data mime-type if provided
       * @returns {Promise<ApiResponse>} ApiResponse if successful
       */
      FeatureApiService.rawQuery = function (method, featureEndpoint, queryParams, postData, alwaysResolve, forceContentType) {
        return InfiniteApi.rawQuery(method, _uri_featureBase() + featureEndpoint, queryParams, postData, alwaysResolve, forceContentType);
      };

      /**
       * @ngdoc method
       * @name aliasSuggest
       * @methodOf infinite.knowledge.service:FeatureApiService
       * @description
       *
       * @param {String} field The entity field on which to search, ie "index", "disambiguated_name", or "actual_name"
       * @param {String} terms The value of the entity field on which to search for aliases
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      FeatureApiService.aliasSuggest = function (field, terms, dataGroupIds) {
        if (_.isEmpty(dataGroupIds)) return $q.reject("Data group IDs are missing. To query all all use '*'.");
        return InfiniteApi.get(_uri_aliasSuggest(field, terms, dataGroupIds));
      };

      /**
       * @ngdoc method
       * @name associationSuggest
       * @methodOf infinite.knowledge.service:FeatureApiService
       * @description
       *
       * @param {"entity1"|"verb"|"entity2"} searchField The field that you want to get suggestions for.
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @param {String} [entity1=null] The first term (subject) of the event you are searching for, send "null" to match on all subject entities
       * @param {String} [verb=null] The 2nd term (verb) of the event you are searching for, send "null" to match on all possible verbs
       * @param {String} [entity2=null] The 3rd term (object) of the event you are searching for, send "null" to match on all object entities
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      FeatureApiService.associationSuggest = function (searchField, dataGroupIds, entity1, verb, entity2) {
        if (_.isEmpty(dataGroupIds)) return $q.reject("Data group IDs are missing. To query all use '*'.");
        return InfiniteApi.get(_uri_associationSuggest(searchField, dataGroupIds, entity1, verb, entity2));
      };

      /**
       * @ngdoc method
       * @name entitySuggest
       * @methodOf infinite.knowledge.service:FeatureApiService
       * @description
       *
       * @param {String} fragment One or more words (the last word can also be a fragment), which are "fuzzily" compared against known entities stored in Community Edition.
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids.
       * @param {Boolean} [includeGeo=false] Set to true to include Geo data
       * @param {Boolean} [includeLinkData=false] Set to true to include link data
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      FeatureApiService.entitySuggest = function (fragment, dataGroupIds, includeGeo, includeLinkData) {
        if (_.isEmpty(dataGroupIds)) return $q.reject("Data group IDs are missing. To query all use '*'.");
        var options = {};
        if (includeGeo === true || includeGeo === false) {
          options.geo = includeGeo;
        }
        if (includeLinkData === true || includeLinkData === false) {
          options.linkdata = includeLinkData;
        }
        return InfiniteApi.get(_uri_entitySuggest(fragment, dataGroupIds), options);
      };

      /**
       * @ngdoc method
       * @name geoSuggest
       * @methodOf infinite.knowledge.service:FeatureApiService
       * @description
       *
       * @param {String} fragment One or more words (the last word can also be a fragment), which are "fuzzily" compared against known entities stored in Community Edition.
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      FeatureApiService.geoSuggest = function (fragment, dataGroupIds) {
        return InfiniteApi.get(_uri_geoSuggest(fragment, dataGroupIds));
      };

      /**
       * @ngdoc method
       * @name verbAssociationSuggest
       * @methodOf infinite.knowledge.service:FeatureApiService
       * @description
       * Suggest verbs for all entities in a given set of data groups
       *
       * @param {Array<ObjectId>} dataGroupIds An array of group IDs
       * @param {String} entity1 First entity to query, null for all
       * @param {String} verb Verb to search for, null for all
       * @param {String} entity2 Second entity to query, null for all
       * @returns {Promise.<ApiResponse>} Promise resolves with an apiResponse
       */
      FeatureApiService.verbAssociationSuggest = function (dataGroupIds, entity1, verb, entity2) {
        return FeatureApiService.associationSuggest("verb", dataGroupIds, entity1, verb, entity2);
      };

      /**
       * Public feature methods
       */
      return FeatureApiService;

    }
  ]);
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
   * @typedef {ObjectWithId} CommunityDef
   */


  /**
   * @ngdoc service
   * @name infinite.social.service:CommunityApiService
   * @deprecated This is available for legacy reasons, use UserGroupApiService and DataGroupApiService.
   * @description
   * Community API End points - DEPRECATED
   * For more information on requests and responses please see the Infinite Sources API:
   * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
   */
  module.factory('CommunityApiService', [ '$q', 'InfiniteApi',

    function($q, InfiniteApi) {
      'use strict';

      var CommunityApiService = {};

      // ********************************************************************* //
      // API URI Generators
      // ********************************************************************* //

      /**
       * Build the base URI for document query
       *
       * @returns {String} Knowledge query URI
       * @private
       */
      function _uri_communityBase(){
        return appConfig.apiSocialCommunityURI;
      }

      /**
       *
       * @param name
       * @param description
       * @param tags
       * @param (parentId)
       * @returns {String}
       * @private
       */
      function _uri_communityAdd(name, description, tags, parentId){

        //If there's a no parent there will be a trailing slash which breaks this API call
        // the regex at the end will trim a trailing /
        return sprintf.sprintf("%s/add/%s/%s/%s/%s",
          _uri_communityBase(),
          encodeURIComponent(name),
          encodeURIComponent(description),
          encodeURIComponent(InfiniteApi.tagListAsString(tags)),
          encodeURIComponent(parentId || "")
        ).replace(/\/$/, "");
      }

      /**
       *
       * @param id
       * @returns {String}
       * @private
       */
      function _uri_communityGetById(id){
        return sprintf.sprintf("%s/get/%s",
          _uri_communityBase(),
          encodeURIComponent(id)
        );
      }

      /**
       * Construct a URI to Get all available communities
       * @returns {String}
       * @private
       */
      function _uri_communityGetAll(){
        return sprintf.sprintf("%s/getall",
          _uri_communityBase()
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_communityGetPublic(){
        return sprintf.sprintf("%s/getpublic",
          _uri_communityBase()
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_communityGetPrivate(){
        return sprintf.sprintf("%s/getprivate",
          _uri_communityBase()
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_communityGetSystem(){
        return sprintf.sprintf("%s/getsystem",
          _uri_communityBase()
        );
      }

      /**
       *
       * @param groupId
       * @param memberId
       * @returns {String}
       * @private
       */
      function _uri_communityMemberInvite(groupId, memberId){
        return sprintf.sprintf("%s/member/invite/%s/%s",
          _uri_communityBase(),
          encodeURIComponent(groupId),
          encodeURIComponent(InfiniteApi.idListAsString(memberId))
        );
      }

      /**
       *
       * @param groupId
       * @returns {String}
       * @private
       */
      function _uri_communityMemberJoin(groupId){
        return sprintf.sprintf("%s/member/join/%s",
          _uri_communityBase(),
          encodeURIComponent(groupId)
        );
      }

      /**
       *
       * @param groupId
       * @returns {String}
       * @private
       */
      function _uri_communityMemberLeave(groupId){
        return sprintf.sprintf("%s/member/leave/%s",
          _uri_communityBase(),
          encodeURIComponent(groupId)
        );
      }

      /**
       *
       * @param groupId
       * @param memberStatus
       * @returns {String}
       * @private
       */
      function _uri_communityMemberUpdateStatus(groupId, memberStatus){
        return sprintf.sprintf("%s/member/update/status/%s/$status/%s",
          _uri_communityBase(),
          encodeURIComponent(groupId),
          encodeURIComponent(memberStatus)
        );
      }

      /**
       *
       * @param groupId
       * @param personIdOrUserGroupId
       * @param userType
       * @returns {String}
       * @private
       */
      function _uri_communityMemberUpdateType(groupId, personIdOrUserGroupId, userType){
        return sprintf.sprintf("%s/member/update/type/%s/%s/%s",
          _uri_communityBase(),
          encodeURIComponent(groupId),
          encodeURIComponent(personIdOrUserGroupId),
          encodeURIComponent(userType)
        );
      }

      /**
       *
       * @param groupId
       * @returns {String}
       */
      function _uri_communityRemove(groupId){
        return sprintf.sprintf("%s/remove/%s",
          _uri_communityBase(),
          encodeURIComponent(groupId)
        );
      }

      /**
       *
       * @param requestID
       * @param response
       * @returns {String}
       */
      function _uri_communityRequestResponse(requestID, response) {
        return sprintf.sprintf("%s/requestresponse/%s/%s",
          _uri_communityBase(),
          encodeURIComponent(requestID),
          encodeURIComponent(response)
        );
      }

      /**
       *
       * @param groupId
       * @returns {String}
       * @private
       */
      function _uri_communityUpdate(groupId){
        return sprintf.sprintf("%s/update/%s",
          _uri_communityBase(),
          encodeURIComponent(groupId)
        );
      }

      // ********************************************************************* //
      // Main public API methods
      // ********************************************************************* //

      /**
       * @ngdoc method
       * @name rawQuery
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       * Raw access to the query mechanism for this API base path
       *
       * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
       * @param {String}  communityEndpoint End point relative to this base
       * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
       * @param {map}     [postData=null] Optional object to post as json
       * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
       * @param {String}  [forceContentType=null] Data mime-type if provided
       * @returns {Promise<ApiResponse>} ApiResponse if successful
       */
      CommunityApiService.rawQuery = function(method, communityEndpoint, queryParams, postData, alwaysResolve, forceContentType){
        return InfiniteApi.rawQuery( method, _uri_communityBase() + communityEndpoint, queryParams, postData, alwaysResolve, forceContentType );
      };

      /**
       * @ngdoc method
       * @name add
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       * Add a new community with optional parent community
       *
       * @param {String} name Name of new community
       * @param {String} description Description of this community's purpose
       * @param {Array<String>} tags A list of tags for this community
       * @param {ObjectId} [parentId=null] The parent connunity ID
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.add = function(name, description, tags, parentId){
        if(_.isEmpty(tags)) return $q.reject("Cannot create community. Tags are required but empty.");
        return InfiniteApi.get(_uri_communityAdd(name, description, tags, parentId));
      };

      /**
       * @ngdoc method
       * @name getAll
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       * Get all communities optionally by project id
       *
       * @param {ObjectId} [projectId=null] Optional project to limit results
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.getAll = function(projectId){
        var options = {};
        if (angular.isDefined(projectId)){
          options.project_id = projectId;
        }
        return InfiniteApi.get(_uri_communityGetAll(), options);
      };

      /**
       * @ngdoc method
       * @name get
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       * Get a community record by ID
       *
       * @param {ObjectId} groupId ID Of community to query
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.get = function(groupId){
        return InfiniteApi.get(_uri_communityGetById(groupId));
      };

      /**
       * @ngdoc method
       * @name getPrivate
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       * Get all private communities for the current user
       *
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.getPrivate = function(){
        return InfiniteApi.get(_uri_communityGetPrivate());
      };

      /**
       * @ngdoc method
       * @name getPublic
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       * Get all public communities the current user has access to
       *
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.getPublic = function(){
        return InfiniteApi.get(_uri_communityGetPublic());
      };

      /**
       * @ngdoc method
       * @name getSystem
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       * Get all system communities
       *
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.getSystem = function(){
        return InfiniteApi.get(_uri_communityGetSystem());
      };

      /**
       * @ngdoc method
       * @name memberInvite
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       * Invite ( or add for admins ) users or user groups to a community. This api method can return success:false
       * even during a partial success so there's some extra handling here.
       *
       * @param {ObjectId} groupId ID Of community to add user to
       * @param {ObjectId} personIdsOrUserGroupIds Person to add to community
       * @param {Boolean} skipInvitation Admin Only: Skip the invitation process.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.memberInvite = function(groupId, personIdsOrUserGroupIds, skipInvitation){
        var options = {};
        if( skipInvitation === true ){
          options.skipinvitation = true;
        }
        return InfiniteApi.get(_uri_communityMemberInvite(groupId, personIdsOrUserGroupIds), options)
          .then(function(apiResponse){ return CommunityApiService.get(groupId); });
      };

      /**
       * @ngdoc method
       * @name memberJoin
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       * Request access to a given community as the current user.
       *
       * @param {ObjectId} groupId ID of community to request access.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.memberJoin = function(groupId){
        return InfiniteApi.get(_uri_communityMemberJoin(groupId));
      };

      /**
       * @ngdoc method
       * @name memberLeave
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       *
       * @param {ObjectId} communityId The community to leave
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.memberLeave = function(communityId){
        return InfiniteApi.get(_uri_communityMemberLeave(communityId));
      };

      /**
       * @ngdoc method
       * @name updateMemberStatus
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       * Update a member's status in a community.
       *
       * @param {ObjectId} groupId The group to update membership status
       * @param {ObjectId|Array<ObjectId>} memberId The user to update status for.
       * @param {"active"|"disabled"|"pending"|"remove"} memberStatus New status of member
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.updateMemberStatus = function(groupId, memberId, memberStatus){
        if( !!_.find( ["active", "disabled", "pending", "remove"], memberStatus)){
          return $q.reject("Invalid user status, must be ('active'|'disabled'|'pending'|'remove')");
        }
        return InfiniteApi.get(_uri_communityMemberUpdateStatus(groupId, memberStatus), {
          status: InfiniteApi.idListAsString(memberId)
        }).then(function(apiResponse){
          return DataGroupApiService.get(groupId);
        });
      };

      /**
       * @ngdoc method
       * @name updateMemberType
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       * NOTE: content_publisher's are members who can also publish sources)
       *
       * @param {ObjectId} groupId The group to update membership type
       * @param {ObjectId} memberId Person to change member type.
       * @param {"owner"|"content_publisher"|"moderator"|"member"} memberType The new user type.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.updateMemberType = function(groupId, memberId, memberType){
        if( !!_.find( ["owner", "content_publisher", "moderator", "member"], memberType)){
          return $q.reject("Invalid member type, must be ('owner'|'content_publisher'|'moderator'|'member')");
        }
        return InfiniteApi.get(_uri_communityMemberUpdateType( groupId, memberId, memberType));
      };

      /**
       * @ngdoc method
       * @name remove
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       * Remove a community by id. First attempt will disable the community, second will permanently
       * delete the community.
       *
       * @param {ObjectId} groupId The group to remove.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.remove = function(groupId){
        return InfiniteApi.get(_uri_communityRemove(groupId));
      };

      /**
       * Remove members from a group
       * @param {ObjectId} groupId
       * @param {Array<ObjectId>} memberIds
       * @return {Promise<ApiResponse>}
       */
      CommunityApiService.removeMembers = function(groupId, memberIds){
        return CommunityApiService.updateMemberStatus(groupId, memberIds, 'remove');
      };

      /**
       * @ngdoc method
       * @name requestResponse
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       *
       * @param {ObjectId} requestId Set a response to a request.
       * @param {Boolean} response The response to the request, either true or false
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.requestResponse = function(requestId, response){
        return InfiniteApi.get(_uri_communityRequestResponse(requestId, response));
      };

      /**
       * @ngdoc method
       * @name update
       * @methodOf infinite.social.service:CommunityApiService
       * @description
       * Update a group by ID. The group used here will need an _id attribute
       *
       * @param {CommunityDef} communityObject The community to update.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      CommunityApiService.update = function(communityObject){
        if(!communityObject){
          return $q.reject("Community object is empty.");
        }
        if(!communityObject._id){
          return $q.reject("Cannot update a data group without an ID.");
        }
        return InfiniteApi.post(_uri_communityUpdate(communityObject._id), communityObject)
          .then(function(){ return communityObject._id; })
          .then(CommunityApiService.get);
      };

      /**
       * Convenience methods
       */
      CommunityApiService.getAllByProjectId = function(projectId){
        return CommunityApiService.getAll(projectId);
      };

      CommunityApiService.updateMemberStatusActive = function(groupId, personOrGroupId){
        return CommunityApiService.updateMemberStatus(groupId, personOrGroupId, "active");
      };
      CommunityApiService.updateMemberStatusDisabled = function(groupId, personOrGroupId){
        return CommunityApiService.updateMemberStatus(groupId, personOrGroupId, "disabled");
      };
      CommunityApiService.updateMemberStatusPending = function(groupId, personOrGroupId){
        return CommunityApiService.updateMemberStatus(groupId, personOrGroupId, "pending");
      };
      CommunityApiService.updateMemberStatusRemove = function(groupId, personOrGroupId){
        return CommunityApiService.updateMemberStatus(groupId, personOrGroupId, "remove");
      };

      CommunityApiService.updateMemberTypeOwner = function(groupId, personOrGroupId){
        return CommunityApiService.updateMemberStatus(groupId, personOrGroupId, "owner");
      };
      CommunityApiService.updateMemberTypeContentPublisher = function(groupId, personOrGroupId){
        return CommunityApiService.updateMemberStatus(groupId, personOrGroupId, "content_publisher");
      };
      CommunityApiService.updateMemberTypeModerator = function(groupId, personOrGroupId){
        return CommunityApiService.updateMemberStatus(groupId, personOrGroupId, "moderator");
      };
      CommunityApiService.updateMemberTypeMember = function(groupId, personOrGroupId){
        return CommunityApiService.updateMemberStatus(groupId, personOrGroupId, "member");
      };

      return CommunityApiService;
    }
  ]);
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
   * @typedef {Object} ProfileDef
   */

  /**
   * @ngdoc service
   * @name infinite.social.service:PersonApiService
   * @description Infinite Person API End points
   *
   * For more information on requests and responses please see the Infinite Sources API:
   * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
   */
  module.factory('PersonApiService', ['$q', 'InfiniteApi',

    function($q, InfiniteApi) {
      'use strict';

      var PersonApiService = {};

      // ********************************************************************* //
      // API URI Generators
      // ********************************************************************* //

      /**
       * Build the base URI for person queries
       * @returns {String} Person base URI
       * @private
       */
      function _uri_personBase() {
        return appConfig.apiSocialPersonURI;
      }

      /**
       *
       * @param (personId)
       * @returns {String}
       * @private
       */
      function _uri_getPerson(personId){
        if(personId=='me') personId = null;
        return sprintf.sprintf("%s/get/%s",
          _uri_personBase(),
          encodeURIComponent(personId || "")
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_list(){
        return sprintf.sprintf("%s/list",
          _uri_personBase()
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_register(){
        return sprintf.sprintf("%s/register",
          _uri_personBase()
        );
      }
      /**
       *
       * @param personId
       * @returns {String}
       * @private
       */
      function _uri_removePerson(personId){
        return sprintf.sprintf("%s/delete/%s",
          _uri_personBase(),
          encodeURIComponent(personId)
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_update(){
        return sprintf.sprintf("%s/update",
          _uri_personBase()
        );
      }

      /**
       * TODO: format email addresses using InfiniteApi.ArrayToUrlList
       * @param personId
       * @param emailAddresses
       * @returns {String}
       * @private
       */
      function _uri_updateEmails(personId, emailAddresses) {
        if(angular.isArray(emailAddresses)){
          emailAddresses = emailAddresses.join(",");
        }
        return sprintf.sprintf("%s/update/email/%s/%s",
          _uri_personBase(),
          encodeURIComponent(personId),
          emailAddresses
        );
      }

      /**
       *
       * @param personId
       * @param password
       * @returns {String}
       * @private
       */
      function _uri_updatePassword(personId, password) {
        return sprintf.sprintf("%s/update/password/%s/%s",
          _uri_personBase(),
          encodeURIComponent(personId),
          InfiniteApi.hashPassword(password)
        );
      }

      // ********************************************************************* //
      // Main public API methods
      // ********************************************************************* //

      /**
       * @ngdoc method
       * @name rawQuery
       * @methodOf infinite.social.service:PersonApiService
       * @description
       * Raw access to the query mechanism for this API base path
       *
       * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
       * @param {String}  personEndpoint End point relative to this base
       * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
       * @param {map}     [postData=null] Optional object to post as json
       * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
       * @param {String}  [forceContentType=null] Data mime-type if provided
       * @returns {Promise<ApiResponse>} ApiResponse if successful
       */
      PersonApiService.rawQuery = function(method, personEndpoint, queryParams, postData, alwaysResolve, forceContentType) {
        return InfiniteApi.rawQuery(method, _uri_personBase() + personEndpoint, queryParams, postData, alwaysResolve, forceContentType);
      };

      /**
       * @ngdoc method
       * @name get
       * @methodOf infinite.social.service:PersonApiService
       * @description
       *
       * @param {ObjectId} [personId=null] Get a user by ID or use null to get current user.
       * @param {Booolean} [alwaysResolve=false] If true, this promise will always resolve.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      PersonApiService.get = function(personId, alwaysResolve){
        return InfiniteApi.get(_uri_getPerson(personId), null, alwaysResolve);
      };

      /**
       * @ngdoc method
       * @name list
       * @methodOf infinite.social.service:PersonApiService
       * @description
       *
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      PersonApiService.list = function(){
        return InfiniteApi.get(_uri_list());
      };

      /**
       * @ngdoc method
       * @name register
       * @methodOf infinite.social.service:PersonApiService
       * @description
       *
       * @param {ProfileDef} personDefinition Definition of new user.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      PersonApiService.register = function(personDefinition){

        //If there's a password, replace it with a hashed version
        if(_.has(personDefinition, "auth.password")){
          _.set(
            personDefinition,
            "auth.password",
            InfiniteApi.hashPassword(_.get(personDefinition, "auth.password"))
          );
        }

        //Return API Request Promise
        // A get request is made after completion to get a full profile record.
        return InfiniteApi.post(_uri_register(), personDefinition).then(function(apiResponse){
          var incompleteResponse = apiResponse.data;
          return PersonApiService.get( incompleteResponse._id );
        });
      };

      /**
       * @ngdoc method
       * @name remove
       * @methodOf infinite.social.service:PersonApiService
       * @description
       *
       * @param {ObjectId} personId ID Of person to remove
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      PersonApiService.remove = function(personId){
        return InfiniteApi.get(_uri_removePerson(personId));
      };

      /**
       * @ngdoc method
       * @name update
       * @methodOf infinite.social.service:PersonApiService
       * @description
       *
       * @param {ProfileDef} personDefinition Updated profile definition
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      PersonApiService.update = function(personDefinition){

        //If there's a password, replace it with a hashed version
        if(_.has(personDefinition, "auth.password")){
          _.set(
            personDefinition,
            "auth.password",
            InfiniteApi.hashPassword( _.get(personDefinition, "auth.password"))
          );
        }

        //Return API Request Promise
        return InfiniteApi.post( _uri_update(), personDefinition);
      };

      /**
       * @ngdoc method
       * @name updateEmails
       * @methodOf infinite.social.service:PersonApiService
       * @description
       *
       * @param {ObjectId} personId Person to update
       * @param {String} newEmailAddresses New email address of user
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      PersonApiService.updateEmails = function(personId, newEmailAddresses){
        return InfiniteApi.get(_uri_updateEmails(personId, newEmailAddresses));
      };

      /**
       * @ngdoc method
       * @name updatePassword
       * @methodOf infinite.social.service:PersonApiService
       * @description
       *
       * @param {ObjectId} personId Person to update password for.
       * @param {String} newPassword New password in plain text. Password will be hashed.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      PersonApiService.updatePassword = function(personId, newPassword){
        return InfiniteApi.get(_uri_updatePassword(personId, newPassword));
      };

      /**
       * Public feature methods
       */
      return PersonApiService;


    }
  ]);
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
   * @typedef {ObjectWithId} ShareDef
   * @property {Date} created
   * @property {Date} modified
   * @property {Array<ObjectId>} communities
   * @property {String} type Share 'type'
   * @property {String} title
   * @property {String} description
   * @property {JsonString} share JSON String of share's data
   * @property {Array<String>} tags Array of string tags
   */

  /**
   * @ngdoc service
   * @name infinite.social.service:ShareApiService
   * @description Infinite Share object API Services
   *
   * For more information on requests and responses please see the Infinite Sources API:
   * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
   */
  module.factory('ShareApiService', [ '$q', 'InfiniteApi',

    function($q, InfiniteApi) {
      'use strict';

      var ShareApiService = {};

      // ********************************************************************* //
      // API URI Generators
      // ********************************************************************* //

      /**
       * Build the base URI for document query
       * @returns {String} Knowledge query URI
       * @private
       */
      function _uri_shareBase(){
        return appConfig.apiSocialShareURI;
      }

      /**
       *
       * @param shareId
       * @param dataGroupId
       * @param comment
       * @returns {String}
       * @private
       */
      function _uri_addDataGroupToShare(shareId, dataGroupId, comment){
        return sprintf.sprintf("%s/add/community/%s/%s/%s",
          _uri_shareBase(),
          encodeURIComponent(shareId),
          encodeURIComponent(comment),
          encodeURIComponent(dataGroupId)
        );
      }

      /**
       *
       * @param shareId
       * @returns {String}
       * @private
       */
      function _uri_getById(shareId){
        return sprintf.sprintf("%s/get/%s",
          _uri_shareBase(),
          encodeURIComponent(shareId)
        );
      }

      /**
       *
       * @param shareId
       * @returns {String}
       * @private
       */
      function _uri_removeById(shareId){
        return sprintf.sprintf("%s/remove/%s",
          _uri_shareBase(),
          encodeURIComponent(shareId)
        );
      }

      /**
       *
       * @param shareId
       * @param dataGroupId
       * @returns {String}
       * @private
       */
      function _uri_removeDataGroupFromShare( shareId, dataGroupId ) {
        return sprintf.sprintf("%s/remove/community/%s/%s",
          _uri_shareBase(),
          encodeURIComponent(shareId),
          encodeURIComponent(dataGroupId)
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_search(){
        return sprintf.sprintf("%s/search",
          _uri_shareBase()
        );
      }

      // ********************************************************************* //
      // Main public API methods
      // ********************************************************************* //

      /**
       * @ngdoc method
       * @name rawQuery
       * @methodOf infinite.social.service:ShareApiService
       * @description
       * Raw access to the query mechanism for this API base path
       *
       * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
       * @param {String}  shareEndpoint End point relative to this base
       * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
       * @param {map}     [postData=null] Optional object to post as json
       * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
       * @param {String}  [forceContentType=null] Data mime-type if provided
       * @returns {Promise<ApiResponse>} ApiResponse if successful
       */
      ShareApiService.rawQuery = function(method, shareEndpoint, queryParams, postData, alwaysResolve, forceContentType){
        return InfiniteApi.rawQuery( method, _uri_shareBase() + shareEndpoint, queryParams, postData, alwaysResolve, forceContentType );
      };

      /**
       * @ngdoc method
       * @name addDataGroupToShare
       * @methodOf infinite.social.service:ShareApiService
       * @description
       *
       * @param {ObjectId} shareId ID of share to manage.
       * @param {ObjectId} dataGroupId Data group to be added to
       * @param {String} comment Comment of membership
       * @param {Boolean} allowWrite Set to true to allow writes.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.addDataGroupToShare = function(shareId, dataGroupId, comment, allowWrite){
        var options = {};
        if(allowWrite === true || allowWrite === false){
          options.readWrite = allowWrite;
        }
        return InfiniteApi.get(_uri_addDataGroupToShare(shareId, dataGroupId, comment), options);
      };

      /**
       * @ngdoc method
       * @name create
       * @methodOf infinite.social.service:ShareApiService
       * @description
       *
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @param {String} type Share type
       * @param {String} title Share title
       * @param {String} description Share description
       * @param {Object} data Object to store as JSON
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.create = function( dataGroupIds, type, title, description, data ){
        //console.log("[ShareApiService.create]");
        return InfiniteApi.post(
          _uri_shareBase(),
          {
            communities : InfiniteApi.idListAsObjects(dataGroupIds),
            type: type,
            title: title,
            description: description,
            share: angular.isString(data) ? data : angular.toJson(data)
          }
        );
      };

      /**
       * @ngdoc method
       * @name uploadFile
       * @methodOf infinite.social.service:ShareApiService
       * @description
       *
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @param {String} type Share type
       * @param {String} title Share title
       * @param {String} description Share description
       * @param {Object} data Filedata to upload
       * @param {String} [forceContentType=null] Mime type to use
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.uploadFile = function( dataGroupIds, type, title, description, data, forceContentType ){
        return InfiniteApi.post(
          _uri_shareBase(),
          data,       //file data
          {           //queryParams
            communityIds : dataGroupIds,
            type: type,
            title: title,
            description: description
          },
          false,             //alwaysResolve, defaults to false
          forceContentType   //force a specific content-type, use 'undefined' to let browser decide automatically
        );
      };

      /**
       * @ngdoc method
       * @name get
       * @methodOf infinite.social.service:ShareApiService
       * @description
       *
       * @param {ObjectId} id ID Of share to query
       * @param {Boolean} noContent Set to true to exclude raw content in the response
       * @param {Boolean} [noMeta=false] Set to true to exclude meta data in the response
       * @param {Boolean} [alwaysResolve=false] Set to true to resolve successfully even if this request fails
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.get = function( id, noContent, noMeta, alwaysResolve ){
        var options = {};
        if(noContent === true){ options.nocontent = true; }
        if(noMeta === true){ options.nometa = true; }
        return InfiniteApi.get( _uri_getById(id), options, alwaysResolve )
      };

      /**
       * @ngdoc method
       * @name getFile
       * @methodOf infinite.social.service:ShareApiService
       * @description
       * View/Download a file from a share in a new window/tab
       *
       * @param {ObjectId} id ID Of file to get
       */
      ShareApiService.getFile = function(id){
        //window.open('http://api001.dev.isa.ik' + appConfig.apiBaseDomain + _uri_getById(id) + '?infinite_api_key=tmp:' + SessionService.getAuthToken() + '&nometa=true'); //FOR TESTING ONLY
        //to bypass proxy and test in local environment, comment line below, uncomment above line. the JS proxy we use in our local environments causes issues with downloads, wrongly converting files to UTF-8
        window.open(appConfig.apiBaseDomain + _uri_getById(id) + '?nometa=true');
      };

      /**
       * @ngdoc method
       * @name getFileBase64
       * @methodOf infinite.social.service:ShareApiService
       * @description
       * View/Download a file from a share in a new window/tab
       *
       * @param {ObjectId} id ID Of File to get
       */
      ShareApiService.getFileBase64 = function(id) {
        return InfiniteApi.rawQuery("GET", _uri_getById(id), null, null, true).then(function(response) {
          return response;
        });
      };

      /**
       * @ngdoc method
       * @name remove
       * @methodOf infinite.social.service:ShareApiService
       * @description
       *
       * @param {ObjectId} id Share to remove
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.remove = function(id){
        return InfiniteApi.get( _uri_removeById(id));
      };

      /**
       * @ngdoc method
       * @name removeDataGroupFromShare
       * @methodOf infinite.social.service:ShareApiService
       * @description
       *
       * @param {ObjectId} shareId Share to manage
       * @param {ObjectId} dataGroupId Data group to be removed.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.removeDataGroupFromShare = function( shareId, dataGroupId){
        return InfiniteApi.get(_uri_removeDataGroupFromShare(shareId, dataGroupId));
      };

      /**
       * @ngdoc method
       * @name search
       * @methodOf infinite.social.service:ShareApiService
       * @description
       * Expose full search function
       * This function will ensure a data object exists with an empty array if a search is successful and no resultS
       * are returned. The API will return no data object so we'll inject one here.
       *
       * @param {Object} options Map of options to pass to search query
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.search = function(options){
        return InfiniteApi.get(_uri_search(), options).then(function(apiResponse){
          if(!apiResponse.data) { apiResponse.data = []; }
          return apiResponse;
        });
      };

      /**
       * @ngdoc method
       * @name searchByTypes
       * @methodOf infinite.social.service:ShareApiService
       * @description
       * Simplified search by type
       *
       * @param {String|Array<String>} types Type to query
       * @param {String} [nometa=false] Set to true to return json shares in the data array
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.searchByTypes = function(types, nometa){
        return search({
          type:InfiniteApi.idListAsString(type),
          nometa: nometa === true
        });
      };

      // Backward compatibility -  <0.1.8
      ShareApiService.searchByType = ShareApiService.searchByTypes;

      /**
       * @ngdoc method
       * @name searchByGroups
       * @methodOf infinite.social.service:ShareApiService
       * @description
       * Get shares by data group and optionally type
       *
       * @param {Array<ObjectId>} groupIds Group IDs to query
       * @param {Array<String>} types Types to query
       * @param {String} [nometa=false] Set to true to return json shares in the data array
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.searchByGroups = function(groupIds, types, nometa){
        var options = {
          searchby:"community",
          id: InfiniteApi.idListAsString(groupIds),
          nometa: nometa === true
        };
        if(types){
          options.type = InfiniteApi.idListAsString(types)
        }
        return search(options);
      };

      /**
       * @ngdoc method
       * @name searchByUsers
       * @methodOf infinite.social.service:ShareApiService
       * @description
       * Admin only: get shares by userIds and optionally by type
       *
       * @param {Array<ObjectId>} userList List of user IDs to query
       * @param {Array<String>} types Types to query
       * @param {String} [nometa=false] Set to true to return json shares in the data array
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.searchByUsers = function(userList, types, nometa){
        var options = {
          searchby:"person",
          id: InfiniteApi.idListAsString(userList),
          nometa: nometa === true
        };
        if(types){
          options.type = InfiniteApi.idListAsString(types)
        }
        return search(options);
      };


      /**
       * @ngdoc method
       * @name update
       * @methodOf infinite.social.service:ShareApiService
       * @description
       * Update a share
       *
       * @param {ObjectId} id Share ID
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids New list of data groups
       * @param {String} type New share type
       * @param {String} title Share title
       * @param {String} description Share description
       * @param {Object} data Data string or object
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.update = function( id, dataGroupIds, type, title, description, data ){
        //console.log("[ShareApiService.update]");
        //Return the API's Promise
        return InfiniteApi.put(
          _uri_shareBase(),
          {
            //Update requires the ID
            _id: id,

            //Convert an array of strings to an array of {_id: "%ID%" } objects
            communities : InfiniteApi.idListAsObjects(dataGroupIds),
            type: type,
            title: title,
            description: description,
            share: angular.isString(data) ? data: angular.toJson(data)
          }
        );
      };

      /**
       * @ngdoc method
       * @name upsert
       * @methodOf infinite.social.service:ShareApiService
       * @description
       * Create or update a share record
       * If shareId is a string, it will be used to perform an update
       * Otherwise it will be ignored and a create operation will be performed.
       *
       * @param {ObjectId} [shareId=null] ID of share to update or null to create a new record
       * @param {Array<ObjectId>} dataGroupIds An array of data group ids
       * @param {String} type Share type
       * @param {String} title Share title
       * @param {String} description Share description
       * @param {Object} data Object to be saved as JSON
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.upsert = function( shareId, dataGroupIds, type, title, description, data ){
        return(angular.isString(shareId)) ?
          update( shareId, dataGroupIds, type, title, description, data )
          : create( dataGroupIds, type, title, description, data );
      };

      /**
       * @ngdoc method
       * @name createFromObject
       * @methodOf infinite.social.service:ShareApiService
       * @description
       * Create a new share from an object with required options
       *
       * @param {ShareDef} shareObject Share Definition
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.createFromObject = function(shareObject){
        return create(shareObject.communities, shareObject.type, shareObject.title, shareObject.description, shareObject.share );
      };


      /**
       * @ngdoc method
       * @name updateFromObject
       * @methodOf infinite.social.service:ShareApiService
       * @description
       * Create a new share from an object with required options
       *
       * @param {ShareDef} shareObject Share Definition
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      ShareApiService.updateFromObject = function(shareObject){
        return update(
          shareObject.id || shareObject._id,
          shareObject.communities,
          shareObject.type,
          shareObject.title,
          shareObject.description,
          shareObject.share
        );
      };

      return ShareApiService;
    }
  ]);
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
   * @name infinite.social.service:WorkspaceApiService
   * @description Infinite Project / Workspace Endpoints
   *
   * ###Additional information
   */

  /**
   * @typedef {Owner} WorkspaceOwner
   * @property {_id} _id
   * @property {String} displayName
   * @property {String} email
   */

  /**
   * @typedef {GroupMember} WorkspaceMember
   */

  /**
   * @typedef {Object} Workspace
   * @property {ObjectId} _id
   * @property {String} created
   * @property {String} modified
   * @property {String} title
   * @property {String} description
   * @property {WorkspaceOwner} owner
   * @property {ObjectId} workspaceGroupId
   * @property {Array<DataGroup>} dataGroups
   * @property {Array<WorkspaceMember>} members
   * @property {Boolean} isManaged
   * @property {ObjectId} workspaceUserId
   */

  /**
   * @typedef {Object} WorkspaceJsonStorage
   * @property {String} projectOwnerId
   * @property {String} projectDataGroupId
   * @property {Object} dataGroups
   * @property {String} dataGroups.ids Comma delimited list of community ids
   */

  /**
   * @ngdoc service
   * @name infinite.social:WorkspaceApiService
   * @description Infinite workspace abstract wrapper
   *
   * For more information on requests and responses please see the Infinite Sources API:
   * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
   */
  module.factory('WorkspaceApiService', [ '$q', '$log', 'InfiniteApi', 'ShareApiService', 'CommunityApiService', 'DataGroupApiService', 'PersonApiService',

    function($q, $log, InfiniteApi, ShareApiService, CommunityApiService, DataGroupApiService, PersonApiService) {
      'use strict';

      /**
       * Utility function to get default workspace group tags
       * @param {Workspace} workspaceDef Workspace Defintion
       * @return {Array<String>} Set of tags
       * @private
       */
      function getDefaultTags(workspaceDef){
        var t = ["workspaceMaster"];
        if(workspaceDef.isManaged) t.push("managed");
        return t;
      }

      /**
       * Private method to convert infinite json shares to workspace object definitions
       * @param {WorkspaceJsonStorage} shareJson Workspace/Project JSON Object from infinite Share
       * @returns {Array<GroupMember>} An array of group members
       */
      function shareToDGList(shareJson){

        if(_.isEmpty(shareJson.dataGroups)){ return []; }

        var members = [];
        var workspaceDGs = shareJson.dataGroups;

        // Check for new format first
        if(_.isArray(workspaceDGs.groups)) {
          members = workspaceDGs.groups;
        } else if(workspaceDGs.ids) {
          members = _.map(workspaceDGs.ids.split(","), function(d){ return {_id: d} });
        }

        return members;
      }

      /**
       * Private method to convert infinite json shares to workspace object definitions
       * @param {ShareDef} shareDef Workspace/Project JSON Object from infinite Share
       * @param {Array<ProfileDef>} [peopleList=null]  List of people to use for lookups. If not provided a lookup will be made
       * @returns {Workspace}
       */
      function shareToWorkspace(shareDef, peopleList){

        var shareJson = JSON.parse(shareDef.share);

        var newWorkspace = {
          _id: shareDef._id,
          created: shareDef.created,
          dataGroups: shareToDGList(shareJson),
          description: shareDef.description,
          modified: shareDef.modified,
          //this.setOwner(new WorkspaceOwnerPojo(s.getOwner()));
          title: shareDef.title,
          workspaceGroupId: shareJson.projectDataGroupId,
          workspaceUserId: shareJson.workspaceUserId
        };

        // Inherit members from a community pojo
        return $q.all({
          dataGroup: DataGroupApiService.get(newWorkspace.workspaceGroupId),
          owner: peopleList ?
            $q.when( _.find(peopleList, {_id : shareJson.projectOwnerId }))
            : PersonApiService.get(shareJson.projectOwnerId, true /* always resolve */).then(function(apiResp){ return apiResp.data; })
        }).then(function(results){

          // IF no data group or owner info came back, resolve with null. Rejection would cause problems with $q.all
          if( !results.dataGroup.data || !results.owner ) {
            console.log("Cannot create workspace from share. Data is missing, access may have changed.", results);
            return null;
          }

          newWorkspace.members = results.dataGroup.data.members;
          newWorkspace.owner = {
            _id: results.owner._id,
            displayName: results.owner.displayName
          };
          return newWorkspace;
        }).catch(function(err){
          console.error(err);
          return err;
        });
      }

      /**
       * Compile a project json share object from a workspace instance
       * @return JSON Share for infinite platform
       * @throws JSONException
       */
      function workspaceToShareJson(workspaceDef) {

        // Build nested dataGroups object { "ids": "commaDelimitedList" }
        var dgs = {
          ids: InfiniteApi.idListAsString(workspaceDef.dataGroups)
        };

        // Build json share
        return {
          projectOwnerId: workspaceDef.owner._id,
          projectDataGroupId: workspaceDef.workspaceGroupId,
          dataGroups: dgs
        };
      }

      /**
       *
       * @param workspaceDef
       */
      function workspaceToShare(workspaceDef){
        return {
          _id: workspaceDef._id,
          communities: [workspaceDef.workspaceGroupId],
          created: workspaceDef.created,
          description: workspaceDef.description,
          modified: workspaceDef.modified,
          owner: workspaceDef.owner,
          share: workspaceToShareJson(workspaceDef),
          title: workspaceDef.title,
          type: "infinite_project_config"
        };
      }

      /**
       * Create a workspace master group using a given driver
       * @param {Workspace} workspaceDef Workspace definition
       * @return {Promise<ApiResponse>} Api response from group lookup after creation
       */
      function createWorkspaceGroup( workspaceDef ) {
        console.log("createWorkspaceGroup", workspaceDef);

        // Create workspace data group
        return DataGroupApiService.add(
            "Workspace master group - " + workspaceDef.title,
            "ISA workspace master group",
            getDefaultTags(workspaceDef)
          )
          .then(function(apiResponse){
            apiResponse.data.owner = {
              _id: apiResponse.data.ownerId,
              displayName: apiResponse.data.ownerDisplayName
            };
            return apiResponse.data;
          })
          //Add any members that aren't the owner
          .then(function(newDataGroup){
            return workspaceDef.members ?
              // Add users and user groups to workSpaceDataGroup - sans the owner's id
              DataGroupApiService.memberInvite(
                newDataGroup._id,
                _.filter(workspaceDef.members, function(m){
                  return m._id != newDataGroup.owner._id;
                }),
                true /* skip invite - admin only */
              ).then(function(ignored){return newDataGroup._id;})
              : newDataGroup._id;
          })
          .then(DataGroupApiService.get);
      }

      /**
       *
       * @param workspaceDef
       * @returns {Promise<ShareDef>} Promise will resolve with the new share data if successful.
       */
      function createWorkspaceShare( workspaceDef ) {
        if(!workspaceDef.workspaceGroupId) return $q.reject("Workspace share requires a workspaceDefGroupId");
        return ShareApiService.create(
          workspaceDef.workspaceGroupId,
          "infinite_project_config",
          workspaceDef.title,
          workspaceDef.description,
          workspaceToShare(workspaceDef)
        ).then(function(apiResponse){
          return apiResponse.data;
        });
      }

      // ********************************************************************* //
      // Main public API methods
      // ********************************************************************* //
      var WorkspaceApiService = {};

      /**
       * @ngdoc method
       * @name rawQuery
       * @methodOf infinite.social.service:WorkspaceApiService
       * @description
       * Raw access to the query mechanism for this API base path
       *
       * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
       * @param {String}  workspaceEndpoint End point relative to this base
       * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
       * @param {map}     [postData=null] Optional object to post as json
       * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
       * @param {String}  [forceContentType=null] Data mime-type if provided
       * @returns {Promise<ApiResponse>} ApiResponse if successful
       */
      WorkspaceApiService.rawQuery = function(method, workspaceEndpoint, queryParams, postData, alwaysResolve, forceContentType) {
        return InfiniteApi.rawQuery(method, _uri_workspaceBase() + workspaceEndpoint, queryParams, postData, alwaysResolve, forceContentType);
      };

      /**
       * @ngdoc method
       * @name createWorkspace
       * @methodOf infinite.social.service:WorkspaceApiService
       * @description
       * Create a workspace
       *
       * @param {String} title Name of workspace
       * @param {String} description Description of workspace
       * @param {Array<DataGroup>} dataGroups Data groups associated with this workspace
       * @param {Array<GroupMember>} members Members of this workspace.
       * @return {Promise<ApiResponse>} Promise will resolve with a Workspace definition if successful.
       */
      WorkspaceApiService.createWorkspace = function( title, description, dataGroups, members ){

        // This will eventually be the completed workspace
        /** @type {Workspace} */
        var newWorkspace = {
          title: title,
          description: description,
          dataGroups: dataGroups,
          members: members
        };

        // Create the master group
        return createWorkspaceGroup(newWorkspace)
          .then(function(apiResponse){
            newWorkspace.workspaceGroupId = apiResponse.data._id;
            newWorkspace.owner = apiResponse.data.owner;
            return newWorkspace;
          })
          .then(function(a){ console.log("Post group-pre share", a); return a;})
          .then(createWorkspaceShare)
          .then(function(workspaceShare){
            newWorkspace._id = workspaceShare._id;
            newWorkspace.created = workspaceShare.created;
            newWorkspace.modified = workspaceShare.modified;
            return newWorkspace;
          });
      };

      /**
       * @ngdoc method
       * @name getAll
       * @methodOf infinite.social.service:WorkspaceApiService
       * @description
       * Get all workspace for current user
       *
       * @returns {Promise<ApiResponse>} Promise will resolve with a set of workspace definitions.
       */
      WorkspaceApiService.getAll = function(){

        $log.debug("[WorkspaceApiService.getAll] Fetching all workspaces.");
        return $q.all({
            shares: ShareApiService.searchByType('infinite_project_config'),
            people: PersonApiService.list()
          })
          .then( function(results) {
            return $q.all(_.map(results.shares.data, function (n) {
              return shareToWorkspace(n, results.people.data);
            }));
          })
          .then(function(workspaces){
            return {
              response: {
                action: "Get all workspaces",
                message: "Workspaces listed successfully",
                success: true,
                time: 0
              },
              data: _.reject( workspaces, function(e){ return e === null; }) || []
            };
          });
      };

      /**
       * Creates an ApiResponse by workspace ID. This is a wrapper on getAll and intentionally provate.
       * GetAll is encouraged for external use to be used with caching.
       *
       * @param {ObjectId} workspaceId ID of workspace
       * @private
       */
      function get(workspaceId){
        return WorkspaceApiService.getAll()
          .then(function(apiResponse){
            apiResponse.data = _.find(apiResponse.data, {_id: workspaceId});
            return apiResponse;
          });
      }

      /**
       * @ngdoc method
       * @name update
       * @methodOf infinite.social.service:WorkspaceApiService
       * @description
       * Update a workspace
       *
       * @param {Workspace} workspaceDef Workspace definition with updates
       * @return {Promise<ApiResponse>} Api response if successful.
       */
      WorkspaceApiService.update = function(workspaceDef){

        //Get the current space definition
        return get(workspaceDef._id)
          .then(InfiniteApi.resolveWithData)
          .then(function(currentWorkspace) {

            var updatedWorkspace = _.merge({}, currentWorkspace, workspaceDef);
            //console.log("current workspace:", currentWorkspace);
            //console.log("updates:", workspaceDef);
            //console.log("updated workspace:", updatedWorkspace);

            // Add / remove members from workspaceMaster
            var currentMemberList = _.reject(currentWorkspace.members, {_id: currentWorkspace.owner._id});
            var updatedMemberList = _.reject(updatedWorkspace.members, {_id: currentWorkspace.owner._id});

            //console.log("Current list without owner", currentMemberList);
            //console.log("new List", updatedMemberList);

            var addMembers = _.differenceBy(updatedMemberList, currentMemberList, '_id');
            var removeMembers = _.differenceBy(currentMemberList, updatedMemberList, '_id');

            //console.log("add", addMembers);
            //console.log("remove", removeMembers);

            //Just run the add / remove actions, constructing a new WorkspacePojo will query data groups to build a members list
            return $q.all({
              updatedWorkspace: updatedWorkspace,
              add: addMembers.length > 0 ? CommunityApiService.memberInvite(currentWorkspace.workspaceGroupId, addMembers, true) : null,
              remove: removeMembers.length > 0 ? CommunityApiService.updateMemberStatusRemove(currentWorkspace.workspaceGroupId, removeMembers) : null
            });
          })
          .then(function(results) {
            return ShareApiService.updateFromObject(workspaceToShare(results.updatedWorkspace));
          })
          .then(InfiniteApi.resolveWithData)
          .then(function(updatedShare){
            //console.log("Updated share: ", updatedShare);
            return shareToWorkspace(updatedShare);
          })

          //Use the final result to build a normal apiResponse format
          .then(function(completedWorkspace){
            return {
              response: {
                success: true,
                action: "Workspace",
                message:  "Workspace updated successfully."
              },
              data: completedWorkspace
            };
          });
      };

      /**
       * Remove a workspace
       * @param workspaceId
       * @return {Promise<ApiResponse>} Api response if successful.
       * TODO fix remove
       */
      WorkspaceApiService.remove = function(workspaceId){
        return null;
      };

      /**
       * Test a list of names to see which ones are valid
       * @param names
       * @return {Promise<ApiResponse>} Api response if successful.
       *
       * TODO: Use dataGroupService to verify
       */
      WorkspaceApiService.isNamesValid = function(names){
        var data = {};
        _.each(names, function(name){
          data[name] = true;
        });
        return $q.when({
          data: data
        });
      };

      // Return compiled service
      return WorkspaceApiService;
    }
  ]);

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
   * @typedef {Group} DataGroup
   */


  /**
   * @ngdoc service
   * @name infinite.social.service:DataGroupApiService
   * @description
   * Data group API End points
   *
   * For more information on requests and responses please see the Infinite Sources API:
   * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
   */
  module.factory('DataGroupApiService', [ '$q', 'InfiniteApi',

    function($q, InfiniteApi) {
      'use strict';

      var DataGroupApiService = {};

      // ********************************************************************* //
      // API URI Generators
      // ********************************************************************* //

      /**
       * Build the base URI for document query
       *
       * @returns {String} Knowledge query URI
       * @private
       */
      function _uri_dataGroupBase(){
        return appConfig.apiSocialDataGroupURI;
      }

      /**
       *
       * @param name
       * @param description
       * @param tags
       * @param (parentId)
       * @returns {String}
       * @private
       */
      function _uri_dataGroupAdd(name, description, tags, parentId){

        //If there's a no parent there will be a trailing slash which breaks this API call
        // the regex at the end will trim a trailing /
        return sprintf.sprintf("%s/add/%s/%s/%s/%s",
          _uri_dataGroupBase(),
          encodeURIComponent(name),
          encodeURIComponent(description),
          encodeURIComponent(InfiniteApi.tagListAsString(tags)),
          encodeURIComponent(parentId || "")
        ).replace(/\/$/, "");
      }

      /**
       *
       * @param id
       * @returns {String}
       * @private
       */
      function _uri_dataGroupGetById(id){
        return sprintf.sprintf("%s/get/%s",
          _uri_dataGroupBase(),
          encodeURIComponent(id)
        );
      }

      /**
       * Construct a URI to Get all available data groups
       * @returns {String}
       * @private
       */
      function _uri_dataGroupGetAll(){
        return sprintf.sprintf("%s/getall",
          _uri_dataGroupBase()
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_dataGroupGetPublic(){
        return sprintf.sprintf("%s/getpublic",
          _uri_dataGroupBase()
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_dataGroupGetPrivate(){
        return sprintf.sprintf("%s/getprivate",
          _uri_dataGroupBase()
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_dataGroupGetSystem(){
        return sprintf.sprintf("%s/getsystem",
          _uri_dataGroupBase()
        );
      }

      /**
       *
       * @param groupId
       * @param memberId
       * @returns {String}
       * @private
       */
      function _uri_dataGroupMemberInvite(groupId, memberId){
        return sprintf.sprintf("%s/member/invite/%s/%s",
          _uri_dataGroupBase(),
          encodeURIComponent(groupId),
          encodeURIComponent(InfiniteApi.idListAsString(memberId))
        );
      }

      /**
       *
       * @param groupId
       * @returns {String}
       * @private
       */
      function _uri_dataGroupMemberJoin(groupId){
        return sprintf.sprintf("%s/member/join/%s",
          _uri_dataGroupBase(),
          encodeURIComponent(groupId)
        );
      }

      /**
       *
       * @param groupId
       * @returns {String}
       * @private
       */
      function _uri_dataGroupMemberLeave(groupId){
        return sprintf.sprintf("%s/member/leave/%s",
          _uri_dataGroupBase(),
          encodeURIComponent(groupId)
        );
      }

      /**
       *
       * @param groupId
       * @param memberStatus
       * @returns {String}
       * @private
       */
      function _uri_dataGroupMemberUpdateStatus(groupId, memberStatus){
        return sprintf.sprintf("%s/member/update/status/%s/$status/%s",
          _uri_dataGroupBase(),
          encodeURIComponent(groupId),
          encodeURIComponent(memberStatus)
        );
      }

      /**
       *
       * @param groupId
       * @param personIdOrUserGroupId
       * @param userType
       * @returns {String}
       * @private
       */
      function _uri_dataGroupMemberUpdateType(groupId, personIdOrUserGroupId, userType){
        return sprintf.sprintf("%s/member/update/type/%s/%s/%s",
          _uri_dataGroupBase(),
          encodeURIComponent(groupId),
          encodeURIComponent(personIdOrUserGroupId),
          encodeURIComponent(userType)
        );
      }

      /**
       *
       * @param groupId
       * @returns {String}
       */
      function _uri_dataGroupRemove(groupId){
        return sprintf.sprintf("%s/remove/%s",
          _uri_dataGroupBase(),
          encodeURIComponent(groupId)
        );
      }

      /**
       *
       * @param requestID
       * @param response
       * @returns {String}
       */
      function _uri_dataGroupRequestResponse(requestID, response) {
        return sprintf.sprintf("%s/requestresponse/%s/%s",
          _uri_dataGroupBase(),
          encodeURIComponent(requestID),
          encodeURIComponent(response)
        );
      }

      /**
       *
       * @param groupId
       * @returns {String}
       * @private
       */
      function _uri_dataGroupUpdate(groupId){
        return sprintf.sprintf("%s/update/%s",
          _uri_dataGroupBase(),
          encodeURIComponent(groupId)
        );
      }

      // ********************************************************************* //
      // Main public API methods
      // ********************************************************************* //

      /**
       * @ngdoc method
       * @name rawQuery
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       * Raw access to the query mechanism for this API base path
       *
       * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
       * @param {String}  dataGroupEndpoint End point relative to this base
       * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
       * @param {map}     [postData=null] Optional object to post as json
       * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
       * @param {String}  [forceContentType=null] Data mime-type if provided
       * @returns {Promise<ApiResponse>} ApiResponse if successful
       */
      DataGroupApiService.rawQuery = function(method, dataGroupEndpoint, queryParams, postData, alwaysResolve, forceContentType){
          return InfiniteApi.rawQuery( method, _uri_dataGroupBase() + dataGroupEndpoint, queryParams, postData, alwaysResolve, forceContentType );
      };

      /**
       * @ngdoc method
       * @name add
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       * Add a new data group
       *
       * @param {String} name Name of new group
       * @param {String} description Description of this group's purpose
       * @param {Array<String>} tags A list of tags for this group
       * @param {ObjectId} [parentId=null] The parent group ID
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.add = function(name, description, tags, parentId){
        if(_.isEmpty(tags)) return $q.reject("Cannot create data group. Tags are required but empty.");
        return InfiniteApi.get(_uri_dataGroupAdd(name, description, tags, parentId));
      };

      /**
       * @ngdoc method
       * @name getAll
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       * Get all data groups optionally by project id
       *
       * @param {ObjectId} [projectId=null] Optional project to limit results
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.getAll = function(projectId){
        var options = {};
        if (angular.isDefined(projectId)){
          options.project_id = projectId;
        }
        return InfiniteApi.get(_uri_dataGroupGetAll(), options)
          .then(function(apiResponse){
            if(!_.has(apiResponse, 'data')) apiResponse.data = [];
            return apiResponse;
          });
      };

      /**
       * @ngdoc method
       * @name get
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       * Get a data group record by ID
       *
       * @param {ObjectId} groupId ID Of group to query
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.get = function(groupId){
        return InfiniteApi.get(_uri_dataGroupGetById(groupId));
      };

      /**
       * @ngdoc method
       * @name getPrivate
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       * Get all private data groups for the current user
       *
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.getPrivate = function(){
        return InfiniteApi.get(_uri_dataGroupGetPrivate());
      };

      /**
       * @ngdoc method
       * @name getPublic
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       * Get all public data groups the current user has access to
       *
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.getPublic = function(){
        return InfiniteApi.get(_uri_dataGroupGetPublic());
      };

      /**
       * @ngdoc method
       * @name getSystem
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       * Get all system data groups
       *
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.getSystem = function(){
        return InfiniteApi.get(_uri_dataGroupGetSystem());
      };

      /**
       * @ngdoc method
       * @name memberInvite
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       * Invite ( or add for admins ) users or user groups to a data group. This api method can return success:false
       * even during a partial success so there's some extra handling here.
       *
       * @param {ObjectId} groupId ID Of community to add user to
       * @param {ObjectId} personIdsOrUserGroupIds Person to add to community
       * @param {Boolean} skipInvitation Admin Only: Skip the invitation process.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.memberInvite = function(groupId, personIdsOrUserGroupIds, skipInvitation){
        var options = {};
        if( skipInvitation === true ){
          options.skipinvitation = true;
        }
        return InfiniteApi.get(_uri_dataGroupMemberInvite(groupId, personIdsOrUserGroupIds), options)
          .then(function(apiResponse){ return DataGroupApiService.get(groupId); });
      };

      /**
       * @ngdoc method
       * @name memberJoin
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       * Request access to a given group as the current user.
       *
       * @param {ObjectId} groupId ID of group to request access.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.memberJoin = function(groupId){
        return InfiniteApi.get(_uri_dataGroupMemberJoin(groupId));
      };

      /**
       * @ngdoc method
       * @name memberLeave
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       *
       * @param {ObjectId} groupId The group to leave
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.memberLeave = function(groupId){
        return InfiniteApi.get(_uri_dataGroupMemberLeave(groupId));
      };

      /**
       * @ngdoc method
       * @name updateMemberStatus
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       * Update a member's status in a group.
       *
       * @param {ObjectId} groupId The group to update membership status
       * @param {ObjectId|Array<ObjectId>} memberId The user to update status for.
       * @param {"active"|"disabled"|"pending"|"remove"} memberStatus New status of member
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.updateMemberStatus = function(groupId, memberId, memberStatus){
        if( !!_.find( ["active", "disabled", "pending", "remove"], memberStatus)){
          return $q.reject("Invalid user status, must be ('active'|'disabled'|'pending'|'remove')");
        }
        return InfiniteApi.get(_uri_dataGroupMemberUpdateStatus(groupId, memberStatus), {
          status: InfiniteApi.idListAsString(memberId)
        }).then(function(apiResponse){
          return DataGroupApiService.get(groupId);
        });
      };

      /**
       * @ngdoc method
       * @name updateMemberType
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       * NOTE: content_publisher's are members who can also publish sources)
       *
       * @param {ObjectId} groupId The group to update membership type
       * @param {ObjectId} memberId Person to change member type.
       * @param {"owner"|"content_publisher"|"moderator"|"member"} memberType The new user type.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.updateMemberType = function(groupId, memberId, memberType){
        if( !!_.find( ["owner", "content_publisher", "moderator", "member"], memberType)){
          return $q.reject("Invalid member type, must be ('owner'|'content_publisher'|'moderator'|'member')");
        }
        return InfiniteApi.get(_uri_dataGroupMemberUpdateType( groupId, memberId, memberType));
      };

      /**
       * @ngdoc method
       * @name remove
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       * Remove a group by id. First attempt will disable the group, second will permanently
       * delete the group. Use force = true to attempt the second call automatically.
       *
       * @param {ObjectId} groupId The group to remove.
       * @param {Boolean} [force=false] Run delete up to two times to disable and delete.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.remove = function(groupId, force){
        return InfiniteApi.get(_uri_dataGroupRemove(groupId))
          .then(function(apiResponse){

            // If deleted just resolve
            if( _.get(apiResponse, 'response.message', '').indexOf('deleted') > -1) return apiResponse;

            // Default to apiResponse but call again if forced. Uses second response to resolve
            return force !== true ? apiResponse : DataGroupApiService.remove(groupId);
          });
      };

      /**
       * Remove members from a group
       * @param {ObjectId} groupId
       * @param {Array<ObjectId>} memberIds
       * @return {Promise<ApiResponse>}
       */
      DataGroupApiService.removeMembers = function(groupId, memberIds){
        return DataGroupApiService.updateMemberStatus(groupId, memberIds, 'remove');
      };

      /**
       * @ngdoc method
       * @name requestResponse
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       *
       * @param {ObjectId} requestId Set a response to a request.
       * @param {Boolean} response The response to the request, either true or false
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.requestResponse = function(requestId, response){
        return InfiniteApi.get(_uri_dataGroupRequestResponse(requestId, response));
      };

      /**
       * @ngdoc method
       * @name update
       * @methodOf infinite.social.service:DataGroupApiService
       * @description
       * Update a data group by ID. The data group used here will need an _id attribute
       *
       * @param {Group} dataGroupObject The community to update.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      DataGroupApiService.update = function(dataGroupObject){
        if(!dataGroupObject){
          return $q.reject("Data group object is empty.");
        }
        if(!dataGroupObject._id){
          return $q.reject("Cannot update a data group without an ID.");
        }
        return InfiniteApi.post(_uri_dataGroupUpdate(dataGroupObject._id), dataGroupObject)
          .then(function(){ return dataGroupObject._id; })
          .then(DataGroupApiService.get);
      };

      /**
       * Convenience methods
       */
      DataGroupApiService.getAllByProjectId = function(projectId){
        return DataGroupApiService.getAll(projectId);
      };

      DataGroupApiService.updateMemberStatusActive = function(groupId, personOrGroupId){
        return DataGroupApiService.updateMemberStatus(groupId, personOrGroupId, "active");
      };
      DataGroupApiService.updateMemberStatusDisabled = function(groupId, personOrGroupId){
        return DataGroupApiService.updateMemberStatus(groupId, personOrGroupId, "disabled");
      };
      DataGroupApiService.updateMemberStatusPending = function(groupId, personOrGroupId){
        return DataGroupApiService.updateMemberStatus(groupId, personOrGroupId, "pending");
      };
      DataGroupApiService.updateMemberStatusRemove = function(groupId, personOrGroupId){
        return DataGroupApiService.updateMemberStatus(groupId, personOrGroupId, "remove");
      };

      DataGroupApiService.updateMemberTypeOwner = function(groupId, personOrGroupId){
        return DataGroupApiService.updateMemberStatus(groupId, personOrGroupId, "owner");
      };
      DataGroupApiService.updateMemberTypeContentPublisher = function(groupId, personOrGroupId){
        return DataGroupApiService.updateMemberStatus(groupId, personOrGroupId, "content_publisher");
      };
      DataGroupApiService.updateMemberTypeModerator = function(groupId, personOrGroupId){
        return DataGroupApiService.updateMemberStatus(groupId, personOrGroupId, "moderator");
      };
      DataGroupApiService.updateMemberTypeMember = function(groupId, personOrGroupId){
        return DataGroupApiService.updateMemberStatus(groupId, personOrGroupId, "member");
      };

      return DataGroupApiService;
    }
  ]);
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
   * @typedef {Group} UserGroup
   */


  /**
   * @ngdoc service
   * @name infinite.social.service:UserGroupApiService
   * @description
   * User group API End points
   *
   * For more information on requests and responses please see the Infinite Sources API:
   * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
   */
  module.factory('UserGroupApiService', [ '$q', 'InfiniteApi',

    function($q, InfiniteApi) {
      'use strict';

      var UserGroupApiService = {};

      // ********************************************************************* //
      // API URI Generators
      // ********************************************************************* //

      /**
       * Build the base URI for document query
       *
       * @returns {String} Knowledge query URI
       * @private
       */
      function _uri_userGroupBase(){
        return appConfig.apiSocialUserGroupURI;
      }

      /**
       *
       * @param name
       * @param description
       * @param tags
       * @param (parentId)
       * @returns {String}
       * @private
       */
      function _uri_userGroupAdd(name, description, tags, parentId){

        //If there's a no parent there will be a trailing slash which breaks this API call
        // the regex at the end will trim a trailing /
        return sprintf.sprintf("%s/add/%s/%s/%s/%s",
          _uri_userGroupBase(),
          encodeURIComponent(name),
          encodeURIComponent(description),
          encodeURIComponent(InfiniteApi.tagListAsString(tags)),
          encodeURIComponent(parentId || "")
        ).replace(/\/$/, "");
      }

      /**
       *
       * @param id
       * @returns {String}
       * @private
       */
      function _uri_userGroupGetById(id){
        return sprintf.sprintf("%s/get/%s",
          _uri_userGroupBase(),
          encodeURIComponent(id)
        );
      }

      /**
       * Construct a URI to Get all available user groups
       * @returns {String}
       * @private
       */
      function _uri_userGroupGetAll(){
        return sprintf.sprintf("%s/getall",
          _uri_userGroupBase()
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_userGroupGetPublic(){
        return sprintf.sprintf("%s/getpublic",
          _uri_userGroupBase()
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_userGroupGetPrivate(){
        return sprintf.sprintf("%s/getprivate",
          _uri_userGroupBase()
        );
      }

      /**
       *
       * @returns {String}
       * @private
       */
      function _uri_userGroupGetSystem(){
        return sprintf.sprintf("%s/getsystem",
          _uri_userGroupBase()
        );
      }

      /**
       *
       * @param groupId
       * @param memberId
       * @returns {String}
       * @private
       */
      function _uri_userGroupMemberInvite(groupId, memberId){
        return sprintf.sprintf("%s/member/invite/%s/%s",
          _uri_userGroupBase(),
          encodeURIComponent(groupId),
          encodeURIComponent(InfiniteApi.idListAsString(memberId))
        );
      }

      /**
       *
       * @param groupId
       * @returns {String}
       * @private
       */
      function _uri_userGroupMemberJoin(groupId){
        return sprintf.sprintf("%s/member/join/%s",
          _uri_userGroupBase(),
          encodeURIComponent(groupId)
        );
      }

      /**
       *
       * @param groupId
       * @returns {String}
       * @private
       */
      function _uri_userGroupMemberLeave(groupId){
        return sprintf.sprintf("%s/member/leave/%s",
          _uri_userGroupBase(),
          encodeURIComponent(groupId)
        );
      }

      /**
       *
       * @param groupId
       * @param memberStatus
       * @returns {String}
       * @private
       */
      function _uri_userGroupMemberUpdateStatus(groupId, memberStatus){
        return sprintf.sprintf("%s/member/update/status/%s/$status/%s",
          _uri_userGroupBase(),
          encodeURIComponent(groupId),
          encodeURIComponent(memberStatus)
        );
      }

      /**
       *
       * @param groupId
       * @param personIdOrUserGroupId
       * @param userType
       * @returns {String}
       * @private
       */
      function _uri_userGroupMemberUpdateType(groupId, personIdOrUserGroupId, userType){
        return sprintf.sprintf("%s/member/update/type/%s/%s/%s",
          _uri_userGroupBase(),
          encodeURIComponent(groupId),
          encodeURIComponent(personIdOrUserGroupId),
          encodeURIComponent(userType)
        );
      }

      /**
       *
       * @param groupId
       * @returns {String}
       */
      function _uri_userGroupRemove(groupId){
        return sprintf.sprintf("%s/remove/%s",
          _uri_userGroupBase(),
          encodeURIComponent(groupId)
        );
      }

      /**
       *
       * @param requestID
       * @param response
       * @returns {String}
       */
      function _uri_userGroupRequestResponse(requestID, response) {
        return sprintf.sprintf("%s/requestresponse/%s/%s",
          _uri_userGroupBase(),
          encodeURIComponent(requestID),
          encodeURIComponent(response)
        );
      }

      /**
       *
       * @param groupId
       * @returns {String}
       * @private
       */
      function _uri_userGroupUpdate(groupId){
        return sprintf.sprintf("%s/update/%s",
          _uri_userGroupBase(),
          encodeURIComponent(groupId)
        );
      }

      // ********************************************************************* //
      // Main public API methods
      // ********************************************************************* //

      /**
       * @ngdoc method
       * @name rawQuery
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       * Raw access to the query mechanism for this API base path
       *
       * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
       * @param {String}  userGroupEndpoint End point relative to this base
       * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
       * @param {map}     [postData=null] Optional object to post as json
       * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
       * @param {String}  [forceContentType=null] Data mime-type if provided
       * @returns {Promise<ApiResponse>} ApiResponse if successful
       */
      UserGroupApiService.rawQuery = function(method, userGroupEndpoint, queryParams, postData, alwaysResolve, forceContentType){
        return InfiniteApi.rawQuery( method, _uri_userGroupBase() + userGroupEndpoint, queryParams, postData, alwaysResolve, forceContentType );
      };

      /**
       * @ngdoc method
       * @name add
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       * Add a new user group
       *
       * @param {String} name Name of new group
       * @param {String} description Description of this group's purpose
       * @param {Array<String>} tags A list of tags for this group
       * @param {ObjectId} [parentId=null] The parent group ID
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.add = function(name, description, tags, parentId){
        if(_.isEmpty(tags)) return $q.reject("Cannot create data group. Tags are required but empty.");
        return InfiniteApi.get(_uri_userGroupAdd(name, description, tags, parentId));
      };

      /**
       * @ngdoc method
       * @name getAll
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       * Get all user groups optionally by project id
       *
       * @param {ObjectId} [projectId=null] Optional project to limit results
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.getAll = function(projectId){
        var options = {};
        if (angular.isDefined(projectId)){
          options.project_id = projectId;
        }
        return InfiniteApi.get(_uri_userGroupGetAll(), options)
          .then(function(apiResponse){
            if(!_.has(apiResponse, 'data')) apiResponse.data = [];
            return apiResponse;
          });
      };

      /**
       * @ngdoc method
       * @name get
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       * Get a user group record by ID
       *
       * @param {ObjectId} groupId ID Of group to query
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.get = function(groupId){
        return InfiniteApi.get(_uri_userGroupGetById(groupId));
      };

      /**
       * @ngdoc method
       * @name getPrivate
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       * Get all private user groups for the current user
       *
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.getPrivate = function(){
        return InfiniteApi.get(_uri_userGroupGetPrivate());
      };

      /**
       * @ngdoc method
       * @name getPublic
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       * Get all public user groups the current user has access to
       *
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.getPublic = function(){
        return InfiniteApi.get(_uri_userGroupGetPublic());
      };

      /**
       * @ngdoc method
       * @name getSystem
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       * Get all system user groups
       *
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.getSystem = function(){
        return InfiniteApi.get(_uri_userGroupGetSystem());
      };

      /**
       * @ngdoc method
       * @name memberInvite
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       * Invite ( or add for admins ) users or user groups to a user group. This api method can return success:false
       * even during a partial success so there's some extra handling here.
       *
       * @param {ObjectId} groupId ID Of community to add user to
       * @param {ObjectId} personIdsOrUserGroupIds Person to add to community
       * @param {Boolean} skipInvitation Admin Only: Skip the invitation process.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.memberInvite = function(groupId, personIdsOrUserGroupIds, skipInvitation){
        var options = {};
        if( skipInvitation === true ){
          options.skipinvitation = true;
        }
        return InfiniteApi.get(_uri_userGroupMemberInvite(groupId, personIdsOrUserGroupIds), options)
          .then(function(apiResponse){ return UserGroupApiService.get(groupId); });
      };

      /**
       * @ngdoc method
       * @name memberJoin
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       * Request access to a given group as the current user.
       *
       * @param {ObjectId} groupId ID of group to request access.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.memberJoin = function(groupId){
        return InfiniteApi.get(_uri_userGroupMemberJoin(groupId));
      };

      /**
       * @ngdoc method
       * @name memberLeave
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       *
       * @param {ObjectId} groupId The group to leave
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.memberLeave = function(groupId){
        return InfiniteApi.get(_uri_userGroupMemberLeave(groupId));
      };

      /**
       * @ngdoc method
       * @name updateMemberStatus
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       * Update a member's status in a group.
       *
       * @param {ObjectId} groupId The group to update membership status
       * @param {ObjectId|Array<ObjectId>} memberId The user to update status for.
       * @param {"active"|"disabled"|"pending"|"remove"} memberStatus New status of member
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.updateMemberStatus = function(groupId, memberId, memberStatus){
        if( !!_.find( ["active", "disabled", "pending", "remove"], memberStatus)){
          return $q.reject("Invalid user status, must be ('active'|'disabled'|'pending'|'remove')");
        }
        return InfiniteApi.get(_uri_userGroupMemberUpdateStatus(groupId, memberStatus), {
          status: InfiniteApi.idListAsString(memberId)
        }).then(function(apiResponse){
          return UserGroupApiService.get(groupId);
        });
      };

      /**
       * @ngdoc method
       * @name updateMemberType
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       * NOTE: "content_publisher"s are members who can also publish sources)
       *
       * @param {ObjectId} groupId The group to update membership type
       * @param {ObjectId} memberId Person to change member type.
       * @param {"owner"|"content_publisher"|"moderator"|"member"} memberType The new user type.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.updateMemberType = function(groupId, memberId, memberType){
        if( !!_.find( ["owner", "content_publisher", "moderator", "member"], memberType)){
          return $q.reject("Invalid member type, must be ('owner'|'content_publisher'|'moderator'|'member')");
        }
        return InfiniteApi.get(_uri_userGroupMemberUpdateType( groupId, memberId, memberType));
      };

      /**
       * @ngdoc method
       * @name remove
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       * Remove a group by id. First attempt will disable the group, second will permanently
       * delete the group.
       *
       * @param {ObjectId} groupId The group to remove.
       * @param {Boolean} [force=false] Run delete up to two times to disable and delete.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.remove = function(groupId, force){
        return InfiniteApi.get(_uri_userGroupRemove(groupId))
          .then(function(apiResponse){

            // If deleted just resolve
            if( _.get(apiResponse, 'response.message', '').indexOf('deleted') > -1) return apiResponse;

            // Default to apiResponse but call again if forced. Uses second response to resolve
            return force !== true ? apiResponse : DataGroupApiService.remove(groupId);
          });
      };

      /**
       * Remove members from a group
       * @param {ObjectId} groupId
       * @param {Array<ObjectId>} memberIds
       * @return {Promise<ApiResponse>}
       */
      UserGroupApiService.removeMembers = function(groupId, memberIds){
        return UserGroupApiService.updateMemberStatus(groupId, memberIds, 'remove');
      };

      /**
       * @ngdoc method
       * @name requestResponse
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       *
       * @param {ObjectId} requestId Set a response to a request.
       * @param {Boolean} response The response to the request, either true or false
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.requestResponse = function(requestId, response){
        return InfiniteApi.get(_uri_userGroupRequestResponse(requestId, response));
      };

      /**
       * @ngdoc method
       * @name update
       * @methodOf infinite.social.service:UserGroupApiService
       * @description
       * Update a user group by ID. The user group used here will need an _id attribute
       *
       * @param {Group} userGroupObject The community to update.
       * @returns {Promise<ApiResponse>} ApiResponse on success.
       */
      UserGroupApiService.update = function(userGroupObject){
        if(!userGroupObject){
          return $q.reject("User group object is empty.");
        }
        if(!userGroupObject._id){
          return $q.reject("Cannot update a user group without an ID.");
        }
        return InfiniteApi.post(_uri_userGroupUpdate(userGroupObject._id), userGroupObject)
          .then(function(){ return userGroupObject._id; })
          .then(UserGroupApiService.get);
      };

      /**
       * Convenience methods
       */
      UserGroupApiService.getAllByProjectId = function(projectId){
        return UserGroupApiService.getAll(projectId);
      };

      UserGroupApiService.updateMemberStatusActive = function(groupId, personId){
        return UserGroupApiService.updateMemberStatus(groupId, personId, "active");
      };
      UserGroupApiService.updateMemberStatusDisabled = function(groupId, personId){
        return UserGroupApiService.updateMemberStatus(groupId, personId, "disabled");
      };
      UserGroupApiService.updateMemberStatusPending = function(groupId, personId){
        return UserGroupApiService.updateMemberStatus(groupId, personId, "pending");
      };
      UserGroupApiService.updateMemberStatusRemove = function(groupId, personId){
        return UserGroupApiService.updateMemberStatus(groupId, personId, "remove");
      };

      UserGroupApiService.updateMemberTypeOwner = function(groupId, personId){
        return UserGroupApiService.updateMemberStatus(groupId, personId, "owner");
      };
      UserGroupApiService.updateMemberTypeContentPublisher = function(groupId, personId){
        return UserGroupApiService.updateMemberStatus(groupId, personId, "content_publisher");
      };
      UserGroupApiService.updateMemberTypeModerator = function(groupId, personId){
        return UserGroupApiService.updateMemberStatus(groupId, personId, "moderator");
      };
      UserGroupApiService.updateMemberTypeMember = function(groupId, personId){
        return UserGroupApiService.updateMemberStatus(groupId, personId, "member");
      };

      return UserGroupApiService;
    }
  ]);

}) (angular.module ('infinite-api', []));


