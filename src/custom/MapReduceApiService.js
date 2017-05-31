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
 * @name infinite.custom.service:MapReduceApiService
 * @description Map Reduce Custom Job API End points
 *
 * These methods will control the map reduce functionality of the infinite platform.
 *
 * For more information on requests and responses please see the Infinite Sources API:
 * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
 */
angular.module("infinite-api").factory('MapReduceApiService', [ '$q', 'InfiniteApi',

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
    function _uri_mapReduceBase(){
      return appConfig.apiCustomMapReduceURI;
    }

    /**
     *
     * @param inputCollection
     * @param map
     * @param reduce
     * @param query
     * @returns {String}
     * @private
     */
    function _uri_runJob(inputCollection, map, reduce, query){
      return sprintf.sprintf("%s/%s/%s/%s/%s",
        _uri_mapReduceBase,
        inputCollection,
        map,
        reduce,
        query
      );
    }

    /**
     *
     * @param (idsOrTitles)
     * @returns {String}
     * @private
     */
    function _uri_listJobs(idsOrTitles){
      return sprintf.sprintf("%s/getjobs/%s",
        _uri_mapReduceBase(),
        encodeURIComponent(InfiniteApi.idListAsString(idsOrTitles))
      ).replace(/\/$/, "");
    }

    /**
     *
     * @param jobIdOrJobTitle
     * @returns {String}
     * @private
     */
    function _uri_getResults(jobIdOrJobTitle){
      return sprintf.sprintf("%s/getresults/%s",
        _uri_mapReduceBase,
        encodeURIComponent(jobIdOrJobTitle)
      );
    }

    /**
     *
     * @param jobIdOrJobTitle
     * @returns {String}
     * @private
     */
    function _uri_removeJob(jobIdOrJobTitle){
      return sprintf.sprintf(
        "%s/removejob/%s",
        _uri_mapReduceBase(),
        encodeURIComponent(jobIdOrJobTitle)
      );
    }

    /**
     *
     * @param title
     * @param description
     * @param {Array<ObjectId>} dataGroupIds An array of data group ids
     * @param jarUrl
     * @param timeToRun
     * @param runFrequency
     * @param mapperClass
     * @param reducerClass
     * @param combinerClass
     * @param query
     * @param inputCollection
     * @param outputKey
     * @param outputValue
     * @returns {String}
     * @private
     */
    function _uri_scheduleJob( title, description, dataGroupIds, jarUrl, timeToRun,
                               runFrequency, mapperClass, reducerClass, combinerClass,
                               query, inputCollection, outputKey, outputValue){

      return sprintf.sprintf(
        "%s/schedulejob/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s",
        _uri_mapReduceBase(),
        title,
        description,
        encodeURIComponent(InfiniteApi.idListAsString(dataGroupIds)),
        jarUrl,
        timeToRun,
        runFrequency,
        mapperClass,
        reducerClass,
        combinerClass,
        query,
        inputCollection,
        outputKey,
        outputValue
      );
    }

    /**
     *
     * @param jobIdOrJobTitle
     * @param title
     * @param description
     * @param {Array<ObjectId>} dataGroupIds An array of data group ids
     * @param jarUrl
     * @param timeToRun
     * @param runFrequency
     * @param mapperClass
     * @param reducerClass
     * @param combinerClass
     * @param query
     * @param inputCollection
     * @param outputKey
     * @param outputValue
     * @returns {String}
     * @private
     */
    function _uri_updateJob( jobIdOrJobTitle,
                             title, description, dataGroupIds, jarUrl, timeToRun,
                             runFrequency, mapperClass, reducerClass, combinerClass,
                             query, inputCollection, outputKey, outputValue){

      return sprintf.sprintf(
        "%s/updatejob/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s/%s",
        _uri_mapReduceBase(),
        jobIdOrJobTitle,
        title,
        description,
        encodeURIComponent(InfiniteApi.idListAsString(dataGroupIds)),
        jarUrl,
        timeToRun,
        runFrequency,
        mapperClass,
        reducerClass,
        combinerClass,
        query,
        inputCollection,
        outputKey,
        outputValue
      );
    }

    // ********************************************************************* //
    // Main public API methods
    // ********************************************************************* //

    /**
     * @ngdoc method
     * @name rawQuery
     * @methodOf infinite.custom.service:MapReduceApiService
     * @description
     * Raw access to the query mechanism for this API base path
     *
     * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
     * @param {String}  mapReduceEndpoint End point relative to this base
     * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
     * @param {map}     [postData=null] Optional object to post as json
     * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
     * @param {String}  [forceContentType=null] Data mime-type if provided
     * @returns {Promise<ApiResponse>} ApiResponse if successful
     */
    function rawQuery(method, mapReduceEndpoint, queryParams, postData, alwaysResolve, forceContentType){
      return InfiniteApi.rawQuery( method, _uri_mapReduceBase() + mapReduceEndpoint, queryParams, postData, alwaysResolve, forceContentType);
    }

    /**
     * @ngdoc method
     * @name run
     * @methodOf infinite.custom.service:MapReduceApiService
     * @description
     * Runs a mongodb map reduce job immediately and only once
     *
     * @param {Object} inputCollection The input collection you want to run the map reduce job on.
     *         Can be DOC_METADATA for the documents collection or another custom map reduce results collection.
     * @param {String} map The mongodb map to run.
     * @param {string} reduce The mongodb reduce to run.
     * @param {String} query The query to run on the input collection, the data group ids will be added to whatever query gets submitted.
     * @returns {Promise<ApiResponse>} ApiResponse on success.
     */
    function run(inputCollection, map, reduce, query){
      return InfiniteApi.get(_uri_runJob(inputCollection, map, reduce, query));
    }

    /**
     * @ngdoc method
     * @name listJobs
     * @methodOf infinite.custom.service:MapReduceApiService
     * @description
     *
     * @param {Array<ObjectId|String>} idsOrTitles IDs or Titles of jobs to query
     * @param {ObjectId} [projectId=null] Optionally limit result set within project definition.
     * @returns {Promise<ApiResponse>} ApiResponse on success.
     */
    function listJobs(idsOrTitles, projectId){
      var options = {};
      if( angular.isDefined(projectId)){
        options.project_id = projectId;
      }
      return InfiniteApi.get(_uri_listJobs(idsOrTitles), options);
    }

    /**
     * @ngdoc method
     * @name getResults
     * @methodOf infinite.custom.service:MapReduceApiService
     * @description
     *
     * @param {ObjectId|String} jobIdOrJobTitle The id or title of a job you want the results of.
     * @param {String} [find=null] A string representing a MongoDB query (in JSON format) that is applied to the results of the custom table.
     * @param {String} [sort=null] A string representing a MongoDB sort operator (in JSON format)
     * @param {Number} [limit=null] An integer of how many results you want retrieved from the database, results will be grabbed in whatever order they have been stored in the db.
     * */
    function getResults(jobIdOrJobTitle, find, sort, limit){
      var queryParams = {};
      if(angular.isString(find)){
        queryParams.find = find;
      }
      if(angular.isString(sort)){
        queryParams.sort = sort;
      }
      if(angular.isNumber(limit)){
        queryParams.limit = limit;
      }
      return InfiniteApi.get( _uri_getResults(jobIdOrJobTitle), queryParams );
    }

    /**
     * @ngdoc method
     * @name removeJob
     * @methodOf infinite.custom.service:MapReduceApiService
     * @description
     *
     * @param {ObjectId|String} jobIdOrJobTitle The id or title of a job you want the results of.
     * @param {Boolean} [removeJar=false] Set to true to attempt to remove the jar after removing the job.
     *                    NOTE: This will fail if the jar is used elsewhere or you aren't the owner.
     */
    function removeJob(jobIdOrJobTitle, removeJar){
      var queryParams = {};
      if(removeJar === true){
        queryParams.removeJar = true;
      }
      return InfiniteApi.get( _uri_removeJob(jobIdOrJobTitle), queryParams);
    }

    /**
     * @ngdoc method
     * @name scheduleJob
     * @methodOf infinite.custom.service:MapReduceApiService
     * @description
     *
     * @param {String} title A descriptive name of the job being submitted.
     * @param {String} description A description of what the job being submitted is attempting to do.
     * @param {Array<ObjectId>} dataGroupIds GroupIDs that the map reduce job wants to run on. These will be appended to the mongo query.
     * @param {String} jarUrl A URL to the location of the jar file to run for the job
     * @param {Number} timeToRun The time you want a job to be run after in long form
     * @param {"NONE"|"HOURLY"|"DAILY"|"WEEKLY"|"MONTHLY"} runFrequency How often the job should be ran.
     *                     This will cause the job to get resubmitted after running, use NONE if you only
     *                     want the job to run once.
     * @param {String} mapperClass The java classpath to the jobs mapper, it should be in the form of package.file$class
     * @param {String} reducerClass The java classpath to the jobs reducer, it should be in the form of package.file$class
     * @param {String} combinerClass The java classpath to the jobs combiner, it should be in the form of package.file$class
     * @param {string} [query=null] Optional. The mongo query to use to get the jobs data.
     * @param {String} inputCollection The mongo collection you want to use as input.
     * @param {String} outputKey The classpath for the map reduce output format key usually org.apache.hadoop.io.Text
     * @param {String} outputValue The classpath for the map reduce output format value usually org.apache.hadoop.io.IntWritable
     * @returns {Promise<ApiResponse>} ApiResponse on success.
     */
    function scheduleJob(title, description, dataGroupIds, jarUrl, timeToRun, runFrequency, mapperClass,
                         reducerClass, combinerClass, query, inputCollection, outputKey, outputValue) {

      return InfiniteApi.get(
        _uri_scheduleJob( title, description, dataGroupIds, jarUrl, timeToRun, runFrequency, mapperClass,
          reducerClass, combinerClass, query, inputCollection, outputKey, outputValue)
      );
    }

    /**
     * @ngdoc method
     * @name updateJob
     * @methodOf infinite.custom.service:MapReduceApiService
     * @description
     *
     * @param {ObjectId|String} jobIdOrJobTitle Job ID or title.
     * @param {String} title A descriptive name of the job being submitted.
     * @param {String} description A description of what the job being submitted is attempting to do.
     * @param {Array<ObjectId>} dataGroupIds GroupIDs that the map reduce job wants to run on. These will be appended to the mongo query.
     * @param {String} jarUrl A URL to the location of the jar file to run for the job
     * @param {Number} timeToRun The time you want a job to be run after in long form
     * @param {"NONE"|"HOURLY"|"DAILY"|"WEEKLY"|"MONTHLY"} runFrequency How often the job should be ran.
     *                     This will cause the job to get resubmitted after running, use NONE if you only
     *                     want the job to run once.
     * @param {String} mapperClass The java classpath to the jobs mapper, it should be in the form of package.file$class
     * @param {String} reducerClass The java classpath to the jobs reducer, it should be in the form of package.file$class
     * @param {String} combinerClass The java classpath to the jobs combiner, it should be in the form of package.file$class
     * @param {string} [query=null] Optional. The mongo query to use to get the jobs data.
     * @param {String} inputCollection The mongo collection you want to use as input.
     * @param {String} outputKey The classpath for the map reduce output format key usually org.apache.hadoop.io.Text
     * @param {String} outputValue The classpath for the map reduce output format value usually org.apache.hadoop.io.IntWritable
     * @returns {Promise<ApiResponse>} ApiResponse on success.
     */
    function updateJob(jobIdOrJobTitle,
                       title, description, dataGroupIds, jarUrl, timeToRun, runFrequency, mapperClass,
                       reducerClass, combinerClass, query, inputCollection, outputKey, outputValue){

      return InfiniteApi.get(
        _uri_updateJob(jobIdOrJobTitle,
          title, description, dataGroupIds, jarUrl, timeToRun, runFrequency, mapperClass,
          reducerClass, combinerClass, query, inputCollection, outputKey, outputValue)
      );
    }

    /**
     * Public Auth methods
     */
    return {

      //Expose full base query
      rawQuery: rawQuery,

      //API Methods
      run: run,
      listJobs: listJobs,
      getResults: getResults,
      removeJob: removeJob,
      scheduleJob: scheduleJob,
      updateJob: updateJob
    };

  }
]);