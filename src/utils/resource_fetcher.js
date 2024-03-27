const axios = require('axios');
import utils from './utils';

var token = localStorage.getItem('token');
axios.interceptors.request.use(function (config) {
    config.headers['Authorization'] = token;
    return config;
}, function (error) {
    return Promise.reject(error);
});
// axios.interceptors.response.use(function (response) {
//     return response;
// }, function (error) {
//     return Promise.reject(error);
// });

const fetcher = async (options) => {
    let response = await axios(options);
    return response.data;
}

const fetchPlainResource = async (pathRelativeToPackageRoot) => {
    var url = utils.resolveURI(pathRelativeToPackageRoot);
    let options = {
        method: 'get',
        url: url,
        dataType: 'text',
        async: true,
        timeout: $.ajaxSettings.timeout,
    }
    return fetcher(options);
}

const fetchEncryptedResourceAsUint8Array = async (pathRelativeToPackageRoot) => {
    var url = utils.resolveURI(pathRelativeToPackageRoot);
    let options = {
        method: 'get',
        url: url,
        async: true,
        responseType: 'arraybuffer',
        timeout: $.ajaxSettings.timeout,
        transformResponse: [function (data) {
            return new Uint8Array(data);
          }],
    }
    return fetcher(options);
}

export {fetchPlainResource, fetchEncryptedResourceAsUint8Array, fetcher};