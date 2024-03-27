const axios = require('axios');
require('dotenv').config();

let server_config = {send_server_version_header: process.env.SEND_SERVER_VERSION_HEADER};

const HttpServiceClient = async (config, req, res, next) => {
    let service_response
    try {
        let { headers, method, host, path, query, body, transformResponse, responseType, timeout } = config
        let service_req_headers = {}
        let service_req_query = {}
        let service_req_body = {}
        let service_req_path = ''
        if(path){
            if(typeof path === 'string'){
                service_req_path = path
            }
            if(Array.isArray(path)){
                service_req_path = await PathBuilder(path, req, res, next)
            }
        }
        let options = {
            method,
            url: host + service_req_path,
            headers: service_req_headers,
            params: service_req_query,
            data: service_req_body,
            responseType: (responseType)? responseType : 'json',
            timeout: timeout ? timeout: 0
        }
        service_response = await axios(options).catch((error)=>{
            return next(error);
        })

        let data = service_response.data
        if(transformResponse) {
            if (typeof transformResponse !== 'function') {
                let err = new Error(`HttpServiceClient() received a configuration with a transformResponse that is not a function.`)
                throw err
            }
            try {
                res.set('x-request-id', req['request-id'])
                if(server_config.send_server_version_header){
                    res.set('x-server-version', req['server-version'] )
                }
                let transformedData = await transformResponse(data, service_response, req, res)
                data = transformedData
                if(data === null){
                    return null
                }
            } catch (e) {
                if(!!e.message){
                    e.message = `HttpServiceClient() provided transformResponse function failed: ${e.message}`
                } else {
                    e = new Error('HttpServiceClient() provided transformResponse function failed')
                }
                return next(e);
            }
        }
        res.set('x-request-id', req['request-id'])
        if(server_config.send_server_version_header){
            res.set('x-server-version', req['server-version'] )
        }
        return res.status(200).send(data)
    } catch (e){
        console.error(e);
        next(e);
    }
}

let PathBuilder = async (path, req, res, next) => {
    let result = ''
    let CB = async item => {
        if(typeof item === 'string'){
            result = result + item + "/"
        }
        if(typeof item === 'object'){
            result = result + await VariableExtractor(item, req, res, next) + "/"
        }
    }
    await asyncForEach(path, CB)
    result = result.slice(0,-1)
    return result
}

let asyncForEach = async function (array, callback) {
    let newArray = []
    for (let index = 0; index < array.length; index++) {
        let newItem = await callback(array[index], index, array);
        newArray.push(newItem)
    }
    return newArray
}

const VariableExtractor = async (config, req, res, next) => {
    try {
        let result = null
        let { param, transform } = config
        let { params: src_params } = req

        if( param && !src_params ) {
            let err = new Error(`VariableExtractor(): needs src_params or src_body`)
            throw err
        }
        if(param || !isNaN(param)){
            result = src_params[param]
        }
        if(transform){
            let { func } = transform
            if(func){
                if(typeof func === 'function'){
                    result = func(result)
                } else {
                    let err = new Error('VariableExtractor(): transform.func must be a function')
                    throw err
                }
            }
        }
        return result
    } catch (e) {
        if(!e.message.includes('VariableExtractor():')){
            e.message = `VariableExtractor(): ${e.message}`
        }
        next(e);
        console.error(e);
    }
}


module.exports = HttpServiceClient;