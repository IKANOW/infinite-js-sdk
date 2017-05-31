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
angular.module("infinite-api").factory('FeatureApiService', ['$q', 'InfiniteApi',

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