/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Observable } from 'rxjs';
import { groupBy } from 'lodash';
import uuid from 'uuid';

import { addResource, editResource } from '../../actions/geostory';
import { resourcesSelector } from '../../selectors/geostory';
import { selectedIdSelector } from '../../selectors/mediaEditor';
import { SourceTypes } from '../../utils/MediaEditorUtils';
/**
 * API to save in local resources. All the methods must implement the same interface.
 * TODO: bring the interface documentation into mediaAPI
 */

/**
 * Saves a media with passed data and returns the object shaped as {id, mediaType, data, source}
 * @param {string} mediaType type of the media (image, video...)
 * @param {object} source source object
 * @param {object} data the effective media data
 * @param {object} store redux store middleware object (with dispatch and getStore method)
 * @returns {Observable} a stream that emit an object like this
 * ```
 * {
 *   id, // generated by the service
 *   mediaType, // original media type
 *   data, // effective media object data
 *   source // source object
 * }
 * ```
 */
export const save = (mediaType, source, data, store) =>
    Observable.of(uuid()).do(
        (id) => store.dispatch(addResource(id, mediaType, data)
        )).map(id => ({id, mediaType, data, source}));
/**
     * Updates a media with passed data and returns the object shaped as {id, mediaType, data, source}
     * @param {string} mediaType type of the media (image, video...)
     * @param {object} source source object
     * @param {object} data the effective media data
     * @param {object} store redux store middleware object (with dispatch and getStore method)
     * @returns {Observable} a stream that emit an object like this
     * ```
     * {
     *   id, // generated by the service
     *   mediaType, // original media type
     *   data, // effective media object data
     *   source // source object
     * }
     * ```
     */
export const edit = (mediaType, source, data, store) => {
    const state = store.getState();
    const id = selectedIdSelector(state);
    return Observable.of(id).do(
        () => {
            return store.dispatch(editResource(id, mediaType, data));
        }
    ).map(() => ({id, mediaType, data, source}));
};
    /**
     * load data for every media type
     * @returns {Observable} a stream that emits an array of object with the following shape:
     * ```json
     * [{
     *     "resources": [{id, type, data}],
     *     "sourceId": geostory,
     *     "mediaType": image | map,
     *     "totalCount": 1
     * }]
     * ```
     */
export const load = (store) => {
    const resources = resourcesSelector(store.getState());
    const separatedResourcesPerType = resources.length ? groupBy(resourcesSelector(store.getState()), "type") : {};
    return Object.keys(separatedResourcesPerType).length && Observable.of(
        Object.keys(separatedResourcesPerType).map(mediaType => ({
            resources: separatedResourcesPerType[mediaType],
            sourceId: SourceTypes.GEOSTORY,
            mediaType,
            totalCount: separatedResourcesPerType[mediaType].length
        }))
    ) || Observable.of(null);
};