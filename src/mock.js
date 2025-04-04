// src/mock.js
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import pair from './zfakedata/pair.json'
import member from './zfakedata/member.json'
import component from './zfakedata/component.json'
import villa from './zfakedata/villa.json'
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
    // room
    mock.onPost('/api/component/listRoom').reply(200, component.listRoom);
    mock.onPost('/api/component/listAmenity').reply(200, component.listAmenity);
    // villa
    mock.onPost('/api/villa/listVilla').reply(200, villa.listVilla);
    mock.onPost('/api/villa/listAmenity').reply(200, villa.listAmenity);
    mock.onPost('/api/villa/detail').reply(200, villa.detail);
    //
    mock.onPost('/api/member/list').reply(200, member.list);
    mock.onPost('/api/role/list').reply(200, member.list);

    // Bạn có thể thêm nhiều mock khác ở đây

}
export default mock;