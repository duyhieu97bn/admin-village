// src/mock.js
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import pair from './zfakedata/pair.json'
import member from './zfakedata/member.json'
import villa from './zfakedata/villa.json'
import room from './zfakedata/room.json'
import auth from './zfakedata/auth.json'
// Tạo một instance mock


var mock;
if (process.env.NODE_ENV == 'development') {
    mock = new MockAdapter(axios);
    // Thiết lập mock response cho một API
    
    mock.onPost('/login').reply(200, auth.login);
    mock.onGet('/profile').reply(200, auth.profile);
    mock.onPost('/validateAccessToken').reply(200, auth.validateAccessToken);
    mock.onPost('/pair/getValue').reply(200, pair.getValue);
    // room
    mock.onPost('/component/listRoom').reply(200, room.listRoom);
    mock.onPost('/component/listAmenity').reply(200, room.listAmenity);
    // villa
    mock.onGet('/component/villa').reply(200, villa.listVilla);
    mock.onPost('/component/listAmenity').reply(200, villa.listAmenity);
    mock.onPost('/component/detail').reply(200, villa.detail);
    //
    mock.onPost('/member/list').reply(200, member.list);
    mock.onPost('/role/list').reply(200, member.list);

    // Bạn có thể thêm nhiều mock khác ở đây

}
export default mock;