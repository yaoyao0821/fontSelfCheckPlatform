const HttpServiceClient = require('../utils/HttpServiceClient');
const stream_headers = ["cache-control", "x-exception", "x-stream-length", "content-disposition", "content-type"];
require('dotenv').config();

let content_config_prod = {
    host: process.env.DCC_FALLBACK_HOST,
    fallback_host: process.env.DCC_FALLBACK_HOST,
    download_path: process.env.DCC_DOWNLOAD_PATH,
    stream_path: process.env.DCC_STREAM_PATH,
    auth_key: process.env.DCC_AUTH_KEY
};

let content_config_qa = {
    host: process.env.DCC_HOST,
    fallback_host: process.env.DCC_FALLBACK_HOST,
    download_path: process.env.DCC_DOWNLOAD_PATH,
    stream_path: process.env.DCC_STREAM_PATH,
    auth_key: process.env.DCC_AUTH_KEY
};
const transformResponseFunc = (headers, data, service_response, req, res) => {
    let desired_headers = headers
    let new_headers = {
        "content-type": "application/epub+zip"
    }
    desired_headers.forEach(header_key => {
        if(service_response.headers[header_key]){
            new_headers[header_key] = service_response.headers[header_key]
        }
        if(new_headers["x-stream-length"]){
            new_headers["content-length"] = new_headers["x-stream-length"]
        }
    })
    res.set(new_headers)
    res.status(200)
    data.pipe(res)
    return null
}
const streamTransformFunc = function (data){
    let result = Buffer.from(data).toString('base64')
    let base64Url = result.replace(/\+/g, '-').replace(/\//g, '_');
    let paddingSize = base64Url.split("=").length - 1;
    base64Url = base64Url.replace(/=/g, '');
    base64Url += paddingSize;
    return base64Url;
};

let getStreamClientConfig = function (content_config) {
    let stream_client_config = {
        method: 'get',
        responseType: 'stream',
        host: content_config.host,
        path: [content_config.stream_path, content_config.auth_key, { param: 'isbn' }, { param: 0 , transform: { func: streamTransformFunc } }],
        transformResponse: transformResponseFunc.bind(null, stream_headers),
        onFail: {
            fallback: {
                isTrue : !!content_config.fallback_host,
                method: 'get',
                responseType: 'stream',
                host: content_config.fallback_host,
                path: [content_config.stream_path, content_config.auth_key, { param: 'isbn' }, { param: 0 , transform: { func: streamTransformFunc } }],
                transformResponse: transformResponseFunc.bind(null, stream_headers)
            }
        },
        timeout: 30000
    }
    return stream_client_config;
}

const content_controller = {
    stream: async (isProdDcc, req, res, next) => {
        let stream_client_config = isProdDcc ? getStreamClientConfig(content_config_prod) : getStreamClientConfig(content_config_qa);
        return await HttpServiceClient(stream_client_config, req, res, next);
    }
}

module.exports = content_controller;