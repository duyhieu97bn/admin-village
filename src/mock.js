// src/mock.js
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import pair from './zfakedata/pair.json'
import component from './zfakedata/component.json'
import auth from './zfakedata/auth.json'
// Tạo một instance mock


var mock;

if (process.env.NODE_ENV == 'development') {
    mock = new MockAdapter(axios);
    // Thiết lập mock response cho một API
    
    mock.onPost('/api/login').reply(200, auth.login);
    mock.onGet('/api/profile').reply(200, auth.profile);
    mock.onPost('/api/validateAccessToken').reply(200, auth.validateAccessToken);
    mock.onPost('/api/pair/getValue').reply(200, pair.getValue);
    mock.onPost('/api/component/list').reply(200, component.list);
    mock.onPost('/api/role/list').reply(200, component.list);

    // Bạn có thể thêm nhiều mock khác ở đây

}
export default mock;