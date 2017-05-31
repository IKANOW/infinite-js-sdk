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
angular.module("infinite-api").factory('PersonApiService', ['$q', 'InfiniteApi',

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