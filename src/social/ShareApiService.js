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
angular.module("infinite-api").factory('ShareApiService', [ '$q', 'InfiniteApi',

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