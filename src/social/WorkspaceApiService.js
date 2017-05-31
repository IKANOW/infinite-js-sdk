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
 * @name infinite.social.service:WorkspaceApiService
 * @description Infinite Project / Workspace Endpoints
 *
 * ###Additional information
 */

/**
 * @typedef {Owner} WorkspaceOwner
 * @property {_id} _id
 * @property {String} displayName
 * @property {String} email
 */

/**
 * @typedef {GroupMember} WorkspaceMember
 */

/**
 * @typedef {Object} Workspace
 * @property {ObjectId} _id
 * @property {String} created
 * @property {String} modified
 * @property {String} title
 * @property {String} description
 * @property {WorkspaceOwner} owner
 * @property {ObjectId} workspaceGroupId
 * @property {Array<DataGroup>} dataGroups
 * @property {Array<WorkspaceMember>} members
 * @property {Boolean} isManaged
 * @property {ObjectId} workspaceUserId
 */

/**
 * @typedef {Object} WorkspaceJsonStorage
 * @property {String} projectOwnerId
 * @property {String} projectDataGroupId
 * @property {Object} dataGroups
 * @property {String} dataGroups.ids Comma delimited list of community ids
 */

/**
 * @ngdoc service
 * @name infinite.social:WorkspaceApiService
 * @description Infinite workspace abstract wrapper
 *
 * For more information on requests and responses please see the Infinite Sources API:
 * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
 */
angular.module("infinite-api").factory('WorkspaceApiService', [ '$q', '$log', 'InfiniteApi', 'ShareApiService', 'CommunityApiService', 'DataGroupApiService', 'PersonApiService',

  function($q, $log, InfiniteApi, ShareApiService, CommunityApiService, DataGroupApiService, PersonApiService) {
    'use strict';

    /**
     * Utility function to get default workspace group tags
     * @param {Workspace} workspaceDef Workspace Defintion
     * @return {Array<String>} Set of tags
     * @private
     */
    function getDefaultTags(workspaceDef){
      var t = ["workspaceMaster"];
      if(workspaceDef.isManaged) t.push("managed");
      return t;
    }

    /**
     * Private method to convert infinite json shares to workspace object definitions
     * @param {WorkspaceJsonStorage} shareJson Workspace/Project JSON Object from infinite Share
     * @returns {Array<GroupMember>} An array of group members
     */
    function shareToDGList(shareJson){

      if(_.isEmpty(shareJson.dataGroups)){ return []; }

      var members = [];
      var workspaceDGs = shareJson.dataGroups;

      // Check for new format first
      if(_.isArray(workspaceDGs.groups)) {
        members = workspaceDGs.groups;
      } else if(workspaceDGs.ids) {
        members = _.map(workspaceDGs.ids.split(","), function(d){ return {_id: d} });
      }

      return members;
    }

    /**
     * Private method to convert infinite json shares to workspace object definitions
     * @param {ShareDef} shareDef Workspace/Project JSON Object from infinite Share
     * @param {Array<ProfileDef>} [peopleList=null]  List of people to use for lookups. If not provided a lookup will be made
     * @returns {Workspace}
     */
    function shareToWorkspace(shareDef, peopleList){

      var shareJson = JSON.parse(shareDef.share);

      var newWorkspace = {
        _id: shareDef._id,
        created: shareDef.created,
        dataGroups: shareToDGList(shareJson),
        description: shareDef.description,
        modified: shareDef.modified,
        //this.setOwner(new WorkspaceOwnerPojo(s.getOwner()));
        title: shareDef.title,
        workspaceGroupId: shareJson.projectDataGroupId,
        workspaceUserId: shareJson.workspaceUserId
      };

      // Inherit members from a community pojo
      return $q.all({
        dataGroup: DataGroupApiService.get(newWorkspace.workspaceGroupId),
        owner: peopleList ?
          $q.when( _.find(peopleList, {_id : shareJson.projectOwnerId }))
          : PersonApiService.get(shareJson.projectOwnerId, true /* always resolve */).then(function(apiResp){ return apiResp.data; })
      }).then(function(results){

        // IF no data group or owner info came back, resolve with null. Rejection would cause problems with $q.all
        if( !results.dataGroup.data || !results.owner ) {
          console.log("Cannot create workspace from share. Data is missing, access may have changed.", results);
          return null;
        }

        newWorkspace.members = results.dataGroup.data.members;
        newWorkspace.owner = {
          _id: results.owner._id,
          displayName: results.owner.displayName
        };
        return newWorkspace;
      }).catch(function(err){
        console.error(err);
        return err;
      });
    }

    /**
     * Compile a project json share object from a workspace instance
     * @return JSON Share for infinite platform
     * @throws JSONException
     */
    function workspaceToShareJson(workspaceDef) {

      // Build nested dataGroups object { "ids": "commaDelimitedList" }
      var dgs = {
        ids: InfiniteApi.idListAsString(workspaceDef.dataGroups)
      };

      // Build json share
      return {
        projectOwnerId: workspaceDef.owner._id,
        projectDataGroupId: workspaceDef.workspaceGroupId,
        dataGroups: dgs
      };
    }

    /**
     *
     * @param workspaceDef
     */
    function workspaceToShare(workspaceDef){
      return {
        _id: workspaceDef._id,
        communities: [workspaceDef.workspaceGroupId],
        created: workspaceDef.created,
        description: workspaceDef.description,
        modified: workspaceDef.modified,
        owner: workspaceDef.owner,
        share: workspaceToShareJson(workspaceDef),
        title: workspaceDef.title,
        type: "infinite_project_config"
      };
    }

    /**
     * Create a workspace master group using a given driver
     * @param {Workspace} workspaceDef Workspace definition
     * @return {Promise<ApiResponse>} Api response from group lookup after creation
     */
    function createWorkspaceGroup( workspaceDef ) {
      console.log("createWorkspaceGroup", workspaceDef);

      // Create workspace data group
      return DataGroupApiService.add(
          "Workspace master group - " + workspaceDef.title,
          "ISA workspace master group",
          getDefaultTags(workspaceDef)
        )
        .then(function(apiResponse){
          apiResponse.data.owner = {
            _id: apiResponse.data.ownerId,
            displayName: apiResponse.data.ownerDisplayName
          };
          return apiResponse.data;
        })
        //Add any members that aren't the owner
        .then(function(newDataGroup){
          return workspaceDef.members ?
            // Add users and user groups to workSpaceDataGroup - sans the owner's id
            DataGroupApiService.memberInvite(
              newDataGroup._id,
              _.filter(workspaceDef.members, function(m){
                return m._id != newDataGroup.owner._id;
              }),
              true /* skip invite - admin only */
            ).then(function(ignored){return newDataGroup._id;})
            : newDataGroup._id;
        })
        .then(DataGroupApiService.get);
    }

    /**
     *
     * @param workspaceDef
     * @returns {Promise<ShareDef>} Promise will resolve with the new share data if successful.
     */
    function createWorkspaceShare( workspaceDef ) {
      if(!workspaceDef.workspaceGroupId) return $q.reject("Workspace share requires a workspaceDefGroupId");
      return ShareApiService.create(
        workspaceDef.workspaceGroupId,
        "infinite_project_config",
        workspaceDef.title,
        workspaceDef.description,
        workspaceToShare(workspaceDef)
      ).then(function(apiResponse){
        return apiResponse.data;
      });
    }

    // ********************************************************************* //
    // Main public API methods
    // ********************************************************************* //
    var WorkspaceApiService = {};

    /**
     * @ngdoc method
     * @name rawQuery
     * @methodOf infinite.social.service:WorkspaceApiService
     * @description
     * Raw access to the query mechanism for this API base path
     *
     * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
     * @param {String}  workspaceEndpoint End point relative to this base
     * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
     * @param {map}     [postData=null] Optional object to post as json
     * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
     * @param {String}  [forceContentType=null] Data mime-type if provided
     * @returns {Promise<ApiResponse>} ApiResponse if successful
     */
    WorkspaceApiService.rawQuery = function(method, workspaceEndpoint, queryParams, postData, alwaysResolve, forceContentType) {
      return InfiniteApi.rawQuery(method, _uri_workspaceBase() + workspaceEndpoint, queryParams, postData, alwaysResolve, forceContentType);
    };

    /**
     * @ngdoc method
     * @name createWorkspace
     * @methodOf infinite.social.service:WorkspaceApiService
     * @description
     * Create a workspace
     *
     * @param {String} title Name of workspace
     * @param {String} description Description of workspace
     * @param {Array<DataGroup>} dataGroups Data groups associated with this workspace
     * @param {Array<GroupMember>} members Members of this workspace.
     * @return {Promise<ApiResponse>} Promise will resolve with a Workspace definition if successful.
     */
    WorkspaceApiService.createWorkspace = function( title, description, dataGroups, members ){

      // This will eventually be the completed workspace
      /** @type {Workspace} */
      var newWorkspace = {
        title: title,
        description: description,
        dataGroups: dataGroups,
        members: members
      };

      // Create the master group
      return createWorkspaceGroup(newWorkspace)
        .then(function(apiResponse){
          newWorkspace.workspaceGroupId = apiResponse.data._id;
          newWorkspace.owner = apiResponse.data.owner;
          return newWorkspace;
        })
        .then(function(a){ console.log("Post group-pre share", a); return a;})
        .then(createWorkspaceShare)
        .then(function(workspaceShare){
          newWorkspace._id = workspaceShare._id;
          newWorkspace.created = workspaceShare.created;
          newWorkspace.modified = workspaceShare.modified;
          return newWorkspace;
        });
    };

    /**
     * @ngdoc method
     * @name getAll
     * @methodOf infinite.social.service:WorkspaceApiService
     * @description
     * Get all workspace for current user
     *
     * @returns {Promise<ApiResponse>} Promise will resolve with a set of workspace definitions.
     */
    WorkspaceApiService.getAll = function(){

      $log.debug("[WorkspaceApiService.getAll] Fetching all workspaces.");
      return $q.all({
          shares: ShareApiService.searchByType('infinite_project_config'),
          people: PersonApiService.list()
        })
        .then( function(results) {
          return $q.all(_.map(results.shares.data, function (n) {
            return shareToWorkspace(n, results.people.data);
          }));
        })
        .then(function(workspaces){
          return {
            response: {
              action: "Get all workspaces",
              message: "Workspaces listed successfully",
              success: true,
              time: 0
            },
            data: _.reject( workspaces, function(e){ return e === null; }) || []
          };
        });
    };

    /**
     * Creates an ApiResponse by workspace ID. This is a wrapper on getAll and intentionally provate.
     * GetAll is encouraged for external use to be used with caching.
     *
     * @param {ObjectId} workspaceId ID of workspace
     * @private
     */
    function get(workspaceId){
      return WorkspaceApiService.getAll()
        .then(function(apiResponse){
          apiResponse.data = _.find(apiResponse.data, {_id: workspaceId});
          return apiResponse;
        });
    }

    /**
     * @ngdoc method
     * @name update
     * @methodOf infinite.social.service:WorkspaceApiService
     * @description
     * Update a workspace
     *
     * @param {Workspace} workspaceDef Workspace definition with updates
     * @return {Promise<ApiResponse>} Api response if successful.
     */
    WorkspaceApiService.update = function(workspaceDef){

      //Get the current space definition
      return get(workspaceDef._id)
        .then(InfiniteApi.resolveWithData)
        .then(function(currentWorkspace) {

          var updatedWorkspace = _.merge({}, currentWorkspace, workspaceDef);
          //console.log("current workspace:", currentWorkspace);
          //console.log("updates:", workspaceDef);
          //console.log("updated workspace:", updatedWorkspace);

          // Add / remove members from workspaceMaster
          var currentMemberList = _.reject(currentWorkspace.members, {_id: currentWorkspace.owner._id});
          var updatedMemberList = _.reject(updatedWorkspace.members, {_id: currentWorkspace.owner._id});

          //console.log("Current list without owner", currentMemberList);
          //console.log("new List", updatedMemberList);

          var addMembers = _.differenceBy(updatedMemberList, currentMemberList, '_id');
          var removeMembers = _.differenceBy(currentMemberList, updatedMemberList, '_id');

          //console.log("add", addMembers);
          //console.log("remove", removeMembers);

          //Just run the add / remove actions, constructing a new WorkspacePojo will query data groups to build a members list
          return $q.all({
            updatedWorkspace: updatedWorkspace,
            add: addMembers.length > 0 ? CommunityApiService.memberInvite(currentWorkspace.workspaceGroupId, addMembers, true) : null,
            remove: removeMembers.length > 0 ? CommunityApiService.updateMemberStatusRemove(currentWorkspace.workspaceGroupId, removeMembers) : null
          });
        })
        .then(function(results) {
          return ShareApiService.updateFromObject(workspaceToShare(results.updatedWorkspace));
        })
        .then(InfiniteApi.resolveWithData)
        .then(function(updatedShare){
          //console.log("Updated share: ", updatedShare);
          return shareToWorkspace(updatedShare);
        })

        //Use the final result to build a normal apiResponse format
        .then(function(completedWorkspace){
          return {
            response: {
              success: true,
              action: "Workspace",
              message:  "Workspace updated successfully."
            },
            data: completedWorkspace
          };
        });
    };

    /**
     * Remove a workspace
     * @param workspaceId
     * @return {Promise<ApiResponse>} Api response if successful.
     * TODO fix remove
     */
    WorkspaceApiService.remove = function(workspaceId){
      return null;
    };

    /**
     * Test a list of names to see which ones are valid
     * @param names
     * @return {Promise<ApiResponse>} Api response if successful.
     *
     * TODO: Use dataGroupService to verify
     */
    WorkspaceApiService.isNamesValid = function(names){
      var data = {};
      _.each(names, function(name){
        data[name] = true;
      });
      return $q.when({
        data: data
      });
    };

    // Return compiled service
    return WorkspaceApiService;
  }
]);
