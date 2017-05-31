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
angular.module("infinite-api").factory('CommunityApiService', [ '$q', 'InfiniteApi',

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