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
angular.module("infinite-api").factory('SavedQueryApiService', [ '$q', 'InfiniteApi',

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