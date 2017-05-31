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
angular.module("infinite-api").factory('UserGroupApiService', [ '$q', 'InfiniteApi',

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