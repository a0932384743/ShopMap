import axios from 'axios';
axios.defaults.timeout = 18000;
axios.interceptors.request.use(config => {
    config.data = JSON.stringify(config.data);
    config.headers = {
        'Access-Control-Allow-Origin': 'gis.taiwan.net.tw',
        'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Content-Type':'application/json'
    };

    return config;
}, error => {
    return Promise.reject(error);
});

axios.interceptors.response.use(response => {
    return response;
}, error => {
    if (error && error.response) {
        switch (error.response.status) {
        case 404:
            console.log('找不到該頁面');
            break;
        case 500:
            console.log('伺服器出錯');
            break;
        case 503:
            console.log('服務失效');
            break;
        default:
            console.log(`連接錯誤${error.response.status}`);
        }
    } else {
        console.log('連接到服務器失敗');
    }
    return Promise.resolve(error.response);
});

export function get (url, params = {}) {
    return new Promise((resolve, reject) => {
        axios
            .get(url, {
                params: params
            })
            .then(response => {
                resolve(response.data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

export function post (url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.post(url, data).then(
            response => {
                resolve(response.data);
            },
            err => {
                reject(err);
            }
        );
    });
}

export function remove (url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.delete(url, data).then(
            response => {
                resolve(response.data);
            },
            err => {
                reject(err);
            }
        );
    });
}

export function put (url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.put(url, data).then(
            response => {
                resolve(response.data);
            },
            err => {
                reject(err);
            }
        );
    });
}
