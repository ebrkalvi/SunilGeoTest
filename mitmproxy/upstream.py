import json,httplib;

def request(context, flow):
    flow.request.headers["__address__"] = flow.client_conn.address.host
    flow.request.headers["__port__"] = str(flow.client_conn.address.port)
