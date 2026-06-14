import request from './request';

export const getMyBooklists = (userId) => {
  return request.get(`/booklists?userId=${userId}`);
};

export const getBooklistDetail = (id, userId) => {
  return request.get(`/booklists/${id}?userId=${userId}`);
};

export const getBooklistByShareToken = (shareToken) => {
  return request.get(`/booklists/share/${shareToken}`);
};

export const createBooklist = (data) => {
  return request.post('/booklists', data);
};

export const updateBooklist = (data, userId) => {
  return request.put(`/booklists?userId=${userId}`, data);
};

export const deleteBooklist = (id, userId) => {
  return request.delete(`/booklists/${id}?userId=${userId}`);
};

export const generateShareLink = (id, userId) => {
  return request.post(`/booklists/${id}/share?userId=${userId}`);
};

export const addBookToBooklist = (booklistId, bookId, userId) => {
  return request.post(`/booklists/items?userId=${userId}`, { booklistId, bookId });
};

export const removeBookFromBooklist = (booklistId, bookId, userId) => {
  return request.delete(`/booklists/items?booklistId=${booklistId}&bookId=${bookId}&userId=${userId}`);
};

export const reorderBooksInBooklist = (booklistId, bookIds, userId) => {
  return request.post(`/booklists/items/reorder?userId=${userId}`, { booklistId, bookIds });
};

export const getAllBooks = () => {
  return request.get('/books');
};
