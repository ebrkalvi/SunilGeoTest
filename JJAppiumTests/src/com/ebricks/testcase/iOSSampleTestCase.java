package com.ebricks.testcase;

import java.util.Date;
import java.util.concurrent.TimeUnit;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.ios.IOSDriver;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.ebricks.geo.GeoTestingClient;

public class iOSSampleTestCase {

	private IOSDriver<WebElement> driver;
	GeoTestingClient mGeoTestingClient;
	public WebDriverWait wait;

	public iOSSampleTestCase(GeoTestingClient geoClient) {
		mGeoTestingClient = geoClient;
	}

	public void runIt(IOSDriver<WebElement> driver) throws InterruptedException {

		this.driver = driver;
		wait = new WebDriverWait(driver, 30);
		boolean result = true;

		//		 if(isElementPresentByXPath("//UIAApplication[1]/UIAWindow[1]/UIAButton[1]", null)) {
		//		 	result = clickByXPath("//UIAApplication[1]/UIAWindow[1]/UIAButton[1]", "Continue as a guest");
		//		 }

		if (result) {
			wait.until(ExpectedConditions.textToBePresentInElementLocated(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAButton[3]"), "JJLoginButton1"));
			mGeoTestingClient.setCurrentAction("LogIn Screen");
			result = clickByXPath(
					"//UIAApplication[1]/UIAWindow[1]/UIAButton[3]",
					"LogIn Screen");
		}

		if (result) {
			wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIATextField[1]")));
			mGeoTestingClient.setCurrentAction("Entering username");
			result = textByXPath(
					"//UIAApplication[1]/UIAWindow[1]/UIATextField[1]",
					"asim.iqbal@hotmail.com", null);
		}

		if (result) {
			wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIASecureTextField[1]")));
			mGeoTestingClient.setCurrentAction("Entering Password");
			result = textByXPath(
					"//UIAApplication[1]/UIAWindow[1]/UIASecureTextField[1]",
					"asim123", null);
		}

		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAButton[2]")));
			mGeoTestingClient.setCurrentAction("Clicked LogIn Button");
			result = clickByXPath(
					"//UIAApplication[1]/UIAWindow[1]/UIAButton[2]",
					"Clicked LogIn Button");
		}

		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAButton[1]")));
			mGeoTestingClient.setCurrentAction("Menu Button");
			result = clickByXPath(
					"//UIAApplication[1]/UIAWindow[1]/UIAButton[1]",
					"Menu Button");
		}

		Dimension dimensions = driver.manage().window().getSize();
		Double screenHeightStart = dimensions.getHeight() * 0.8;
		Double screenHeightEnd = dimensions.getHeight() * 0.2;
		if (result) {
			mGeoTestingClient.setCurrentAction("Swipe down");
			int scrollStart = screenHeightStart.intValue();
			int scrollEnd = screenHeightEnd.intValue();
			System.out.println("driver.swipe scrollStartY="+scrollStart+", scrollEndY="+scrollEnd);
			driver.swipe(100, scrollStart, 100, scrollEnd, 1000);
		}

		if (result) {
			wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIACollectionView[1]/UIACollectionCell[6]")));
			mGeoTestingClient.setCurrentAction("Strawberries Wild");
			result = clickByXPath(
					"//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIACollectionView[1]/UIACollectionCell[6]",
					"Strawberries Wild");
		}

		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAButton[10]")));
			mGeoTestingClient.setCurrentAction("Select Store");
			result = clickByXPath(
					"//UIAApplication[1]/UIAWindow[1]/UIAButton[10]",
					"Select Store");
		}

		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAButton[14]")));
			mGeoTestingClient.setCurrentAction("Preferred Store");
			result = clickByXPath(
					"//UIAApplication[1]/UIAWindow[1]/UIAButton[14]",
					"Preferred Store");
		}

		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAButton[9]")));
			mGeoTestingClient.setCurrentAction("Add to Basket");
			result = clickByXPath(
					"//UIAApplication[1]/UIAWindow[1]/UIAButton[9]",
					"Add to Basket");
		}

		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAButton[1]")));
			mGeoTestingClient.setCurrentAction("Close Button");
			result = clickByXPath(
					"//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAButton[1]",
					"Close Button");
		}

		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//UIAStaticText[contains(@name, 'Profile & Settings')]")));
			mGeoTestingClient.setCurrentAction("Profile & Settings");
			result = clickByXPath(
					"//UIAStaticText[contains(@name, 'Profile & Settings')]",
					"Profile & Settings");
		}

		if (result) {
			wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//UIAButton[contains(@name, 'UserProfileLogoutButton')]")));
			mGeoTestingClient.setCurrentAction("Logout");
			result = clickByXPath(
					"//UIAButton[contains(@name, 'UserProfileLogoutButton')]",
					"Logout");
		}
		
		if (result) {
			// "UIAButton":{"@":{"name":"Log out"
			wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//UIAButton[contains(@name, 'Log out')]")));
			mGeoTestingClient.setCurrentAction("Log out");
			result = clickByXPath(
					"//UIAButton[contains(@name, 'Log out')]",
					"Log out");
		}
		
	}

	private boolean clickByName(String name, String screenName)
			throws InterruptedException {
		return click(By.name(name), screenName);
	}

	private boolean clickByXPath(String xpath, String screenName)
			throws InterruptedException {
		return click(By.xpath(xpath), screenName);
	}

	private boolean textByXPath(String xpath, String text, String screenName)
			throws InterruptedException {
		return text(By.xpath(xpath), text, screenName);
	}

	private boolean isElementPresentByXPath(String xpath, String screenName)
			throws InterruptedException {
		return getElement(By.xpath(xpath), screenName) == null ? false : true;
	}

	private WebElement getElement(By element, String screenName) {

		int index = 0;

		while (driver.findElements(element).size() < 1 && index < 20) {
			//try {
			//driver.wait(100);
			driver.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS);
			//} catch (InterruptedException e) {
			//e.printStackTrace();
			//}

			index++;
			System.out.println(" Try# " + index + " for screen :: "
					+ screenName);
		}

		if (driver.findElements(element).size() > 0) {

			WebElement webElement = driver.findElement(element);

			return webElement;

		} else {

			return null;
		}
	}

	private boolean click(By element, String screenName) {

		preLogInfo(screenName);

		WebElement webElement = getElement(element, screenName);

		if (webElement != null) {

			webElement.click();

			postLogInfo(screenName);
			return true;
		}

		return false;
	}

	private boolean text(By element, String text, String screenName) {

		preLogInfo(screenName);

		WebElement webElement = getElement(element, screenName);

		if (webElement != null) {
			webElement.sendKeys(text);

			postLogInfo(screenName);
			return true;
		}

		return false;
	}

	private void preLogInfo(String screenName) {
		if (screenName != null) {
			System.out.println("Opening Screen : " + screenName
					+ " Logged Time :: " + new Date().toString());
		}
	}

	private void postLogInfo(String screenName) {
		if (screenName != null) {
			System.out.println("Screen Switched To : " + screenName
					+ " Logged Time :: " + new Date().toString());
		}
	}
}
