import json,httplib;

def rest_request(path, jsonData):
    connection = httplib.HTTPConnection('52.9.101.199', 3000);
    connection.connect()
    connection.request('POST', path, jsonData, {'Content-type': 'application/json', 'Accept': 'text/plain'})

    resp = connection.getresponse().read()
    print(resp)
    #result = json.loads(resp)

def response(context, flow):
    rest_request("/geo", json.dumps({
        "request": {
            "method": flow.request.method,
            "scheme": flow.request.scheme,
            "host": flow.request.host,
            "path": flow.request.path,
            "timestamp_start": flow.request.timestamp_start,
            "timestamp_end": flow.request.timestamp_end
        },
        "response": {
            "status_code": flow.response.status_code,
            "reason": flow.response.reason,
            "timestamp_start": flow.response.timestamp_start,
            "timestamp_end": flow.response.timestamp_end,
            "contentLength": len(flow.response.content)
        }
    }))
