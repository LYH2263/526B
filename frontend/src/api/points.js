import request from './request';

export const getPointsAccount = (userId) => {
    return request.get('/points/account', { params: { userId } });
};

export const getPointsRecords = (userId, page = 1, size = 10) => {
    return request.get('/points/records', { params: { userId, page, size } });
};

export const addLoginPoints = (userId) => {
    return request.post('/points/login', null, { params: { userId } });
};

export const addReadPoints = (userId, bookId) => {
    return request.post('/points/read', null, { params: { userId, bookId } });
};

export default {
    getPointsAccount,
    getPointsRecords,
    addLoginPoints,
    addReadPoints
};
