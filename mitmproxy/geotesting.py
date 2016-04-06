import json,httplib;

def rest_request(path, jsonData):
    connection = httplib.HTTPConnection('52.9.101.199', 3000);
    connection.connect()
    connection.request('POST', path, jsonData, {'Content-type': 'application/json', 'Accept': 'text/plain'})

    resp = connection.getresponse().read()
    print(resp)
    #result = json.loads(resp)

def request(context, flow):
    flow.request.__address = flow.request.headers["__address__"]
    flow.request.__port = flow.request.headers["__port__"]
    del flow.request.headers["__address__"]
    del flow.request.headers["__port__"]

def response(context, flow):
    rest_request("/geo", json.dumps({
        "request": {
            "method": flow.request.method,
            "scheme": flow.request.scheme,
            "host": flow.request.host,
            "path": flow.request.path,
            "client_address": flow.request.__address,
            "client_port": flow.request.__port,
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


