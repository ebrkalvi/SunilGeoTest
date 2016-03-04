geo_testing_server -> Contains Express.js based REST server to help store requests and response details that are captured at the MITM end point behind mobile network. The data is stored in doc format in MongoDB.
mitmproxy pythong script -> Helps capture the req. and resp. raw info and send them to the above server.
