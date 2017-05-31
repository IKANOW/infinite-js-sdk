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
angular.module("infinite-api").factory('SourceApiService', ['$q', 'InfiniteApi',

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