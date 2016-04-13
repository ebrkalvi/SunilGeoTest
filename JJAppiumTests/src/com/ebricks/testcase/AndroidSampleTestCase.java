package com.ebricks.testcase;

import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

import io.appium.java_client.android.AndroidDriver;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class AndroidSampleTestCase {

	private AndroidDriver<WebElement> driver;
	public WebDriverWait wait;

	public void runIt(AndroidDriver<WebElement> driver) throws InterruptedException {
		this.driver = driver;
		wait = new WebDriverWait(driver, 30);
		boolean result = true;// clickById("beginBtn", "Landing Screen");
		


		if (result) {
			wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id("signIn"), "Log In"));
			//mGeoTestingClient.setCurrentAction("LogIn Screen");
			result = clickById("signIn", "LogIn Screen");
		}

		if (result) {
			wait.until(ExpectedConditions.presenceOfElementLocated(By.id("email")));
			//mGeoTestingClient.setCurrentAction("Entering username");
			result = textById("email", "sunil.reddy@ebricks-inc.com", null);
		}

		if (result) {
			wait.until(ExpectedConditions.presenceOfElementLocated(By.id("password")));
			//mGeoTestingClient.setCurrentAction("Entering Password");
			result = textById("password", "ebricks", null);
		}

		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.id("signIn")));
			//mGeoTestingClient.setCurrentAction("Clicked LogIn Button");
			result = clickById("signIn", "Clicked LogIn Button");
		}

		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.id("menuBtn")));
			//mGeoTestingClient.setCurrentAction("Menu Button");
			result = clickById("menuBtn", "Menu Button");
		}

		Dimension dimensions = driver.manage().window().getSize();
		Double screenHeightStart = dimensions.getHeight() * 0.8;
		Double screenHeightEnd = dimensions.getHeight() * 0.2;
		if (result) {
			//mGeoTestingClient.setCurrentAction("Swipe down");
			int scrollStart = screenHeightStart.intValue();
			int scrollEnd = screenHeightEnd.intValue();
			System.out.println("driver.swipe scrollStartY="+scrollStart+", scrollEndY="+scrollEnd);
			driver.swipe(100, scrollStart, 100, scrollEnd, 1000);
		}

		if (result) {
			wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//android.support.v7.widget.RecyclerView[1]/android.widget.RelativeLayout[6]")));
			//mGeoTestingClient.setCurrentAction("Strawberries Wild");
			result = clickByXPath(
					"//android.support.v7.widget.RecyclerView[1]/android.widget.RelativeLayout[6]",
					"Strawberries Wild");
		}
		
		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.id("tv_add_to_basket")));
			//mGeoTestingClient.setCurrentAction("Select Store");
			result = clickById("tv_add_to_basket", "Select Store");
		}

		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//android.widget.Button[2]")));
			//mGeoTestingClient.setCurrentAction("Preferred Store");
			result = clickByXPath("//android.widget.Button[2]", "Preferred Store");
		}

		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.id("tv_add_to_basket")));
			//mGeoTestingClient.setCurrentAction("Add to Basket");
			result = clickById("tv_add_to_basket", "Add to Basket");
		}

		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.id("continueBtn")));
			//mGeoTestingClient.setCurrentAction("Close Button");
			driver.pressKeyCode(4); // Back key
			//result = clickByXPath("menuBtn", "Close Button");
		}

		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.id("settingsBtn")));
			//mGeoTestingClient.setCurrentAction("Profile & Settings");
			result = clickById("settingsBtn", "Profile & Settings");
		}

		if (result) {
			int scrollStart = screenHeightStart.intValue();
			int scrollEnd = screenHeightEnd.intValue();
			System.out.println("driver.swipe scrollStartY="+scrollStart+", scrollEndY="+scrollEnd);
			driver.swipe(100, scrollStart, 100, scrollEnd, 1000);
			
			//dumpElement(By.className("android.widget.Button"));
			wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//android.widget.Button[contains(@text, 'Log Out')]")));
			//mGeoTestingClient.setCurrentAction("Logout");
			result = clickByXPath("//android.widget.Button[contains(@text, 'Log Out')]", "Logout");
		}
		
		if (result) {
			wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//android.widget.Button[contains(@text, 'Log Out')]")));
			//mGeoTestingClient.setCurrentAction("Log out");
			result = clickByXPath("//android.widget.Button[contains(@text, 'Log Out')]", "Log out");
		}
	}

	private void dumpElement(By element) {
		int index = 0;
		while (driver.findElements(element).size() < 1 && index < 20) {
			driver.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS);
			++index;
			System.out.println(" Try# " + index + " for element :: " + element);
		}
		List<WebElement> webElements = driver.findElements(element);
		index = 0;
		for(WebElement webElement:webElements) {
			System.out.println((++index) + " - " + webElement.getTagName()
					+ " " + ((RemoteWebElement)webElement).getId()
					+ " " + webElement.getText());
		}
	}

	private boolean clickById(String id, String screenName) throws InterruptedException {
		return click(By.id(id), screenName);
	}

	private boolean clickByName(String name, String screenName) {
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

	private boolean textById(String id, String text, String screenName) {
		return text(By.id(id), text, screenName);
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

	private void preLogInfo(String screenName) {
		System.out.println("Opening Screen : " + screenName + " Logged Time :: " + new Date().toString());
	}

	private void postLogInfo(String screenName) {
		System.out.println("Screen Switched To : " + screenName + " Logged Time :: " + new Date().toString());
	}

	private WebElement getElement(By element, String screenName) {
		int index = 0;
		while (driver.findElements(element).size() < 1 && index < 20) {
			driver.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS);
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
}
