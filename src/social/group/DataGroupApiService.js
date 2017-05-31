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
angular.module("infinite-api").factory('DataGroupApiService', [ '$q', 'InfiniteApi',

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