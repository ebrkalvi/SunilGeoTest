package com.ebricks.tests;

import io.appium.java_client.android.AndroidDriver;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.TimeUnit;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import com.ebricks.testcase.AndroidSampleTestCase;

public class AndroidTestCaseRunner {
    
    static final String APP_PATH = "/resources/JambaJuice.apk";
    
    AndroidDriver<WebElement> driver;
    
    @Before
    public void setUp() {
        System.out.println("Working Directory = " +
                      System.getProperty("user.dir"));
        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setCapability("device", "Android");
        capabilities.setCapability(CapabilityType.BROWSER_NAME, ""); // Should be an empty string if testing an app.
        capabilities.setCapability(CapabilityType.VERSION, "4.4");
        
        capabilities.setCapability(CapabilityType.PLATFORM, "Android");
        capabilities.setCapability("platformName", "Android");
        
        capabilities.setCapability("deviceName", "92e8e4657ce3");
        capabilities.setCapability("appPackage", "com.olo.jambajuice");
        capabilities.setCapability("appActivity", "com.olo.jambajuice.Activites.NonGeneric.Splash.SplashActivity");//System.getProperty("user.dir")+APP_PATH);
        //capabilities.setCapability("appActivity", "com.olo.jambajuice.Activites.NonGeneric.Splash.SplashActivity");

        capabilities.setJavascriptEnabled(true);
        
        try {
            
            //driver = new RemoteWebDriver(new URL("http://127.0.0.1:4723/wd/hub"), capabilities);
            
            driver = new AndroidDriver<WebElement>(new URL("http://127.0.0.1:4723/wd/hub"), capabilities);
            driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
            
        } catch (MalformedURLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    @Test
    public void run() {
        if(driver != null) {
            AndroidSampleTestCase testCase = new AndroidSampleTestCase();
            try {
                testCase.runIt(driver);
            } catch (InterruptedException e) {
                // TODO Auto-generated catch block
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
    }
}
