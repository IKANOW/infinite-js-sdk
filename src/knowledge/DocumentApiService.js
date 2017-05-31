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
angular.module("infinite-api").factory('DocumentApiService', [ '$q', 'InfiniteApi',

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