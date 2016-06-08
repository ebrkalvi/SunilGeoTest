package com.ebricks.geo;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import javax.json.Json;
import javax.json.JsonObject;

public class GeoTestingClient {
    static final String SERVER_ADDRESS = "http://127.0.0.1:3030";
    //static final String SERVER_ADDRESS = "http://localhost:3000";
    
    public GeoTestingClient() {
        
    }
    /*
    public String createSession(String name, String appName, String deviceIp) {
        JsonObject sessionObject = Json.createObjectBuilder()
        .add("name", name)
        .add("appName", appName)
        .add("deviceIp", deviceIp)
        .build();
        return doPOSTApiCall("/geo/session", sessionObject.toString());
    }*/
    
    public void activateSession(String sid) {
        JsonObject sessionObject = Json.createObjectBuilder()
        .add("sid", sid)
        .build();
        doPOSTApiCall("/farm/geo/activateSession", sessionObject.toString());
    }
    
    public void deactivateSession(String sid) {
        JsonObject sessionObject = Json.createObjectBuilder()
        .add("sid", sid)
        .build();
        doPOSTApiCall("/farm/geo/deactivateSession", sessionObject.toString());
    }

    public void setCurrentAction(String action) {
        JsonObject sessionObject = Json.createObjectBuilder()
        .add("action", action)
        .build();
        doPOSTApiCall("/farm/geo/currentAction", sessionObject.toString());
    }
    
    String doPOSTApiCall(String path, String jsonInput) {
        try {
            URL url = new URL(SERVER_ADDRESS + path);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            
            OutputStream os = conn.getOutputStream();
            os.write(jsonInput.getBytes());
            os.flush();

            if (conn.getResponseCode() != HttpURLConnection.HTTP_OK) {
                throw new RuntimeException("Failed : HTTP error code : "
                                           + conn.getResponseCode());
            }

            BufferedReader br = new BufferedReader(new InputStreamReader((conn.getInputStream())));
            
            StringBuffer sb = new StringBuffer();
            String s;
            while ((s = br.readLine()) != null)
                sb.append(s);
            conn.disconnect();

            return sb.toString();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return new String();
    }

}
