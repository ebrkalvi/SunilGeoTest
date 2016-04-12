package com.ebricks.testcase;

import java.util.Date;

import io.appium.java_client.android.AndroidDriver;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;

public class AndroidSampleTestCase {
    
    private AndroidDriver<WebElement> driver;
    
    public void runIt(AndroidDriver<WebElement> driver) throws InterruptedException {
        
        this.driver = driver;
        boolean result = false;
        
        result = clickById("beginBtn", "Landing");
        
        if(result) {
            result = clickById("menuBtn", "Menu");
        }
        
        if(result) {
            result = clickById("continueBtn", "Full Menu");
        }
        
        Dimension dimensions = driver.manage().window().getSize();
        Double screenHeightStart = dimensions.getHeight() * 0.8;
        Double screenHeightEnd = dimensions.getHeight() * 0.2;
        int scrollStart = screenHeightStart.intValue();
        int scrollEnd = screenHeightEnd.intValue();
        driver.swipe(100, scrollStart, 100, scrollEnd, 1000);
        
        if(result) {
            result = clickByXPath("//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.ListView[1]/android.widget.LinearLayout[4]/android.widget.TextView[2]",
                                  "Whole Food Nutrition");
        }
        
        if(result) {
            result = clickByXPath("//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.support.v4.view.ViewPager[1]/android.support.v7.widget.RecyclerView[1]/android.widget.RelativeLayout[3]/android.widget.ImageView[1]",
                                  "Amazing Greens");
        }
    }
    
    private boolean clickById(String id, String screenName) throws InterruptedException {
        return click(By.id(id), screenName);
    }
    
    private boolean clickByXPath(String xpath, String screenName) throws InterruptedException {
        return click(By.xpath(xpath), screenName);
    }
    
    private boolean click(By element, String screenName) throws InterruptedException {
        
        int index = 0;
        preLogInfo(screenName);
        while(driver.findElements(element).size() < 1 && index < 50) {
            
            driver.wait(100);
            index++;
            System.out.println(" Try# " + index + " for screen :: " + screenName);
        }
        
        if(driver.findElements(element).size() > 0) {
            
            driver.findElement(element).click();
            postLogInfo(screenName);
            return true;
            
        } else {
            
            return false;
        }
        
    }
    
    private void preLogInfo(String screenName) {
        System.out.println("Opening Screen : " + screenName + " Logged Time :: " + new Date().toString());
    }
    
    private void postLogInfo(String screenName) {
        System.out.println("Screen Switched To : " + screenName + " Logged Time :: " + new Date().toString());
    }
}
