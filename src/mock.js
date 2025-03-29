// src/mock.js
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import pair from './zfakedata/pair.json'
import member from './zfakedata/member.json'
// Tạo một instance mock


var mock;

if (process.env.NODE_ENV == 'development') {
    mock = new MockAdapter(axios);
    // Thiết lập mock response cho một API
    
    mock.onPost('/api/member/login').reply(200, member.login);
    mock.onGet('/api/member/profile').reply(200, member.profile);
    mock.onPost('/api/member/validateAccessToken').reply(200, member.validateAccessToken);
    mock.onPost('/api/pair/getValue').reply(200, pair.getValue);
    mock.onPost('/api/member/list').reply(200, member.list);

    // Bạn có thể thêm nhiều mock khác ở đây

}
export default mock;