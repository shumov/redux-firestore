import { pick, get } from 'lodash';
import { setWith, assign } from 'lodash/fp';
import { actionTypes } from '../constants';
import { pathFromMeta } from '../utils/reducers';

const { CLEAR_DATA, GET_SUCCESS, LISTENER_RESPONSE } = actionTypes;


/**
 * @name dataReducer
 * Reducer for data state.
 * @param  {Object} [state={}] - Current data redux state
 * @param  {Object} action - Object containing the action that was dispatched
 * @param  {String} action.type - Type of action that was dispatched
 * @param  {Object} action.meta - Meta data of action
 * @param  {String} action.meta.collection - Name of the collection for the
 * data being passed to the reducer.
 * @param  {Array} action.meta.where - Where query parameters array
 * @param  {Array} action.meta.storeAs - Another parameter in redux under
 * which to store values.
 * @return {Object} Data state after reduction
 */
export default function dataReducer(state = {}, action) {
  switch (action.type) {
    case GET_SUCCESS:
    case LISTENER_RESPONSE:
      const { meta, payload, preserve } = action;
      if (!payload || payload.data === undefined) {
        return state;
      }
      const data = meta.doc ? get(payload.data, meta.doc) : payload.data;
      const previousData = get(state, pathFromMeta(meta));
      // Do not merge if no existing data or if meta contains subcollections
      if (!previousData || meta.subcollections) {
        return setWith(Object, pathFromMeta(meta), data, state);
      }
      // Merge with existing data
      const mergedData = assign(previousData, data);
      return setWith(Object, pathFromMeta(meta), mergedData, state);
    case CLEAR_DATA:
      // support keeping data when logging out - #125
      if (preserve) {
        return pick(state, preserve); // pick returns a new object
      }
      return {};
    default:
      return state;
  }
}
