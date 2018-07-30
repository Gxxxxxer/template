import { GET_POST_DATA } from '../constants';

export const getPostData = (data) => ({ type: GET_POST_DATA, data: data })