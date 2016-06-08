package com.ebricks.tests;

import io.appium.java_client.ios.IOSDriver;
import io.appium.java_client.remote.MobileCapabilityType;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Enumeration;
import java.util.concurrent.TimeUnit;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;

import com.ebricks.testcase.iOSSampleTestCase;
import com.ebricks.geo.GeoTestingClient;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;

public class iOSTestCaseRunner {
    
    static final String APP_PATH = "resources/JambaJuice.ipa";
    
    IOSDriver<WebElement> driver;
    GeoTestingClient geoTestingClient;
    String currentSID;
    
    static String findPublicIP() {
        try {
            URL connection = new URL("http://checkip.amazonaws.com/");
            HttpURLConnection con = (HttpURLConnection)connection.openConnection();
            BufferedReader reader = new BufferedReader(new InputStreamReader(con.getInputStream()));
            return reader.readLine();
        } catch(IOException ex) {
            ex.printStackTrace();
        }
        return null;
    }
    
    @Before
    public void setUp() {
        try {
            geoTestingClient = new GeoTestingClient();
            String udid = System.getenv("DEVICE_UDID");
            String appBundle = System.getenv("APP_BUNDLE");
            String sid = System.getenv("SID");
            System.out.println("udid:"+udid+", appBundle:"+appBundle+", sid:"+sid);
            currentSID = sid;//geoTestingClient.createSession("Appium iOS Testcases", "com.ebricks.JambaJuice - Jamba Juice 1283-bugs/JMBAIO-1620", findPublicIP());
            geoTestingClient.activateSession(currentSID);

            geoTestingClient.setCurrentAction("Starting Up..");

            DesiredCapabilities capabilities = new DesiredCapabilities();
            capabilities.setCapability("appium-version", "1.0");
            capabilities.setCapability("platformName", "iOS");
            capabilities.setCapability("platformVersion", "9.3.1");
            capabilities.setCapability("deviceName", "iOS device");
            if(udid != null && !udid.isEmpty())
            	capabilities.setCapability("udid", udid);
            File app = null;
            if(appBundle != null && !appBundle.isEmpty())
            	app = new File(appBundle);
            else
            	app = new File(APP_PATH);

            capabilities.setCapability("app", app.getAbsolutePath());
            //capabilities.setCapability("app", "com.ebricks.JambaJuice");// analysedApp.getAbsolutePath());
            
            capabilities.setJavascriptEnabled(true);
            capabilities.setCapability(MobileCapabilityType.HAS_TOUCHSCREEN, true);
            capabilities.setCapability(MobileCapabilityType.HAS_NATIVE_EVENTS, true);
            
            driver = new IOSDriver<WebElement>(new URL("http://127.0.0.1:4723/wd/hub"), capabilities);
            //driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
        } catch (MalformedURLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    @Test
    public void run() {
        if(driver != null) {
            iOSSampleTestCase testCase = new iOSSampleTestCase(geoTestingClient);
            try {
                testCase.runIt(driver);
            } catch (InterruptedException e) {
                e.printStackTrace();
                System.out.println("Failed to run testcase.");
            }
        } else {
            System.out.println("Failed to initialize webdriver.");
        }
    }
    
    @After
    public void tearDown() {
        if(driver != null) {
            driver.quit();
        }

        geoTestingClient.deactivateSession(currentSID);
    }
    
    @SuppressWarnings("unused")
	private File analyseFile(File app) throws IOException {
        String file = app.getName();
        String name = file.substring(0, file.lastIndexOf("."));
        String ext = file.substring(file.lastIndexOf('.'));
        if (ext.equals(".ipa")) {
            File newFile = new File(app.getParentFile().getAbsolutePath() + File.separatorChar + name + ".zip");
            FileUtils.copyFile(app, newFile);
            unzipIPA(newFile);
            app = new File(app.getParentFile().getAbsolutePath() + File.separatorChar + "Payload" + File.separatorChar
                           + name + ".app");
        }
        
        return app;
    }
    
    private void unzipIPA(File appFile) throws IOException {
        ZipFile zipFile = new ZipFile(appFile.getAbsolutePath());
        // String path = "";
        Enumeration<?> files = zipFile.entries();
        
        while (files.hasMoreElements()) {
            ZipEntry entry = (ZipEntry) files.nextElement();
            if (entry.isDirectory()) {
                File file = new File(appFile.getParentFile().getAbsolutePath() + File.separatorChar + entry.getName());
                file.mkdirs();
                System.out.println("Create dir " + entry.getName());
            } else {
                File f = new File(appFile.getParentFile().getAbsolutePath() + File.separatorChar + entry.getName());
                f.getParentFile().mkdirs();
                FileOutputStream fos = new FileOutputStream(f); // EXception
																// occurs here
                InputStream is = zipFile.getInputStream(entry);
                byte[] buffer = new byte[1024];
                int bytesRead = 0;
                while ((bytesRead = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, bytesRead);
                }
                fos.close();
                System.out.println("Create File " + entry.getName());
            }
        }
        zipFile.close();
    }
}
