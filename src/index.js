import apiClientProvider from "./apiClient";
let apiClient = apiClientProvider();

// All requests should run at the same time and produce only one request to the backend.All requests should return or reject.
function runTest() {
    const batchUrl = "/file-batch-api";

    // Should return [{id:"fileid1"},{id:"fileid2"}]
    apiClient.get(batchUrl, { params: { ids: ["fileid1", "fileid2"] } }).then((res) => {
        document.getElementById('firstCall').innerText = JSON.stringify(res, null, 2);
    }).catch((e) => {
        document.getElementById('firstCall').innerText = e;
    })

    // Should return [{id:"fileid2"}]
    apiClient.get(batchUrl, { params: { ids: ["fileid2"] } }).then((res) => {
        document.getElementById('secondCall').innerText = JSON.stringify(res, null, 2);
    }).catch((e) => {
        document.getElementById('secondCall').innerText = e;
    })

    // Should reject as the fileid3 is missing from the response
    apiClient.get(batchUrl, { params: { ids: ["fileid3"] } }).then((res) => {
        document.getElementById('thirdCall').innerText = JSON.stringify(res, null, 2);
    }).catch((e) => {
        document.getElementById('thirdCall').innerText = e;
    })
}

runTest();