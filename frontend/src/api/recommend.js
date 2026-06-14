import request from './request';

export const searchRecommend = (query, limit = 10, mode = 'keyword') => {
  return request.post('/recommend/search', { query, limit, mode });
};

export const parseQuery = (query) => {
  return request.post('/recommend/parse', { query });
};

export const rebuildBookIndex = (bookId) => {
  return request.post(`/recommend/index/rebuild/${bookId}`);
};

export const rebuildAllIndices = () => {
  return request.post('/recommend/index/rebuild/all');
};
