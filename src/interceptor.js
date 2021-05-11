const batchUrl = "/file-batch-api";

function batchInterceptor(instance) {
    let requests = [], timeout;
    instance.interceptors.request.use(request => {
        if (request.url === batchUrl) {
            if (request.params.bulk) {
                delete request.params.bulk;
                return request;
            }
            request.adapter = () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    batchCall(instance, requests);
                });
                let prResolved, prRejected;
                let promise = new Promise((res, rej) => {
                    prResolved = res;
                    prRejected = rej;
                })
                requests.push({ request, prResolved, prRejected });
                return promise;
            }
        }
        return request;
    }, error => Promise.reject(error));
}

const batchCall = (instance, requests) => {
    let batchReq = [], ids = [];
    while (requests.length) {
        let req = requests.shift();
        ids = [...new Set([...ids, ...req.request.params.ids])]
        batchReq.push(req);
    }
    instance.get(batchUrl, { params: { ids, bulk: true } }).then((res) => {
        let cacheFile = {};
        batchReq.forEach((req) => {
            let data = [];
            for (let id of req.request.params.ids) {
                if (cacheFile[id])
                    data.push(cacheFile[id]);
                else {
                    let fileIndex = res.data.items.findIndex((obj) => obj.id === id);
                    if (fileIndex < 0) {
                        return req.prRejected(new Error("File not found"));
                    } else {
                        cacheFile[id] = res.data.items[fileIndex];
                        data.push(cacheFile[id]);
                    }
                }
            }
            req.prResolved({ data });
        })
    }).catch((err) => {
        batchReq.forEach((req) => req.prRejected(err));
    })
}

export default batchInterceptor;