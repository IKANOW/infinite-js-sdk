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
angular.module("infinite-api", []).factory('InfiniteApi', [ '$q', '$http', '$log',

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