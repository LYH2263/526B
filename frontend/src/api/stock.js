import request from './request';

export const getStockByBook = (bookId) => {
  return request.get(`/book-stock/book/${bookId}`);
};

export const getStockByBookAndBranch = (bookId, branchId) => {
  return request.get(`/book-stock/book/${bookId}/branch/${branchId}`);
};

export const getStockByBranch = (branchId) => {
  return request.get(`/book-stock/branch/${branchId}`);
};

export const findNearbyBranches = (bookId, latitude, longitude, quantity) => {
  return request.post('/book-stock/nearby', { bookId, latitude, longitude, quantity });
};
