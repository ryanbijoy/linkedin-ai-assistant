from apify_client import ApifyClient
import os
import dotenv
from typing import Optional

dotenv.load_dotenv()
# Fallback to env variable if not provided (for backward compatibility)
DEFAULT_APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")


def scrape_linkedin_profile(profile_url: str, apify_api_token: Optional[str] = None):
    """
    Scrape LinkedIn profile using Apify
    
    Args:
        profile_url: LinkedIn profile URL to scrape
        apify_api_token: Apify API token. If not provided, falls back to environment variable.
    
    Returns:
        List of scraped profile data
    """
    # Use provided token or fall back to environment variable
    token = apify_api_token or DEFAULT_APIFY_API_TOKEN
    
    if not token:
        raise ValueError("Apify API token is required. Please provide apify_api_token parameter or set APIFY_API_TOKEN environment variable.")
    
    client = ApifyClient(token)
    run_input = {
  "cookie": [
    {
      "domain": ".linkedin.com",
      "expirationDate": 1765730232.854567,
      "hostOnly": False,
      "httpOnly": False,
      "name": "lms_ads",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "AQHeiRIK9oaWUAAAAZqDOmHcU63c9XFgSGOtsjn7SNB1awcIkfvEuNoH-yxgISGe3teiF7aS_PeixYdLsBCn26IVXAm3DAzf"
    },
    {
      "domain": ".linkedin.com",
      "expirationDate": 1766780741.19304,
      "hostOnly": False,
      "httpOnly": False,
      "name": "_guid",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "a76d87a6-e2e7-426f-b1fe-d55141eef660"
    },
    {
      "domain": ".linkedin.com",
      "expirationDate": 1794774990.411344,
      "hostOnly": False,
      "httpOnly": False,
      "name": "bcookie",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "\"v=2&f9f5f101-6e58-40d4-8b73-9533875b6a8b\""
    },
    {
      "domain": ".linkedin.com",
      "expirationDate": 1763240799.524623,
      "hostOnly": False,
      "httpOnly": True,
      "name": "__cf_bm",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "MJZrm1DAQJcK8C..zonyC3_h5PIynvhPAHKSsIYI1fA-1763238999-1.0.1.1-lQHQkqnkFyD9IRSR0wwWp98ZWNcnOXRpjfqRU2OxpzEgX2O6UpbfTmvEmMvqWBZEmE5bJUjvrwiaeYr7mRstVr3TxXXXP38LZ7Y8r5L06Og"
    },
    {
      "domain": "www.linkedin.com",
      "hostOnly": True,
      "httpOnly": False,
      "name": "lil-lang",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": True,
      "storeId": None,
      "value": "en_US"
    },
    {
      "domain": ".linkedin.com",
      "expirationDate": 1765730232.854627,
      "hostOnly": False,
      "httpOnly": False,
      "name": "lms_analytics",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "AQHeiRIK9oaWUAAAAZqDOmHcU63c9XFgSGOtsjn7SNB1awcIkfvEuNoH-yxgISGe3teiF7aS_PeixYdLsBCn26IVXAm3DAzf"
    },
    {
      "domain": ".linkedin.com",
      "hostOnly": False,
      "httpOnly": True,
      "name": "fptctx2",
      "path": "/",
      "sameSite": None,
      "secure": True,
      "session": True,
      "storeId": None,
      "value": "taBcrIH61PuCVH7eNCyH0CYjjbqLuI8XF8pleSQW5Na2L8YmCa5yGaPr7bIwqsrePp2lsdoCsb36rvn50aMgPhme5QZeOj3Aq2zVztvLzomf1bPqlU7WgSfaFi9CFG%252f5i08CYfQzDM%252bfqUNz4sHYcSzcpbJSb568Ingn%252fF%252f7i2sN6Fg25KisheBgNM4ZE95gweBpUSuap78HEPlDyQYbg7RP2e8JRBMp6rpBxpoHEL53RufSYCNo8hOVjM4On5x2eG4Jc1NFlklaHebHLM7Mhvfsb0qljhB1GaPHBTJeiij%252fjGgQdmqw2RKYBWGjR188q%252bCjogqx4RjNdUBq4VKNM4xbt%252f%252b1EVBKlgBJFMhDOwQ%253d"
    },
    {
      "domain": ".www.linkedin.com",
      "expirationDate": 1794317141.629909,
      "hostOnly": False,
      "httpOnly": True,
      "name": "li_at",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "AQEDAUTQ-goFIgEEAAABkBaIwuwAAAGakf4d6E4ACHvI_CqsFOEgsmq4DMKPizhtGPfoY-v7vgxB2ZWWFGOm0Eh2hpIKwC5WyuTbwLklKb5Q6xg8QXwusNZTh0Dm0bgIXH7EOfVvAuioVN5_vJGS2Fat"
    },
    {
      "domain": ".linkedin.com",
      "hostOnly": False,
      "httpOnly": False,
      "name": "lang",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": True,
      "storeId": None,
      "value": "v=2&lang=en-us"
    },
    {
      "domain": ".linkedin.com",
      "expirationDate": 1763324400.733793,
      "hostOnly": False,
      "httpOnly": False,
      "name": "lidc",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "\"b=VB86:s=V:r=V:a=V:p=V:g=5101:u=368:x=1:i=1763238989:t=1763324399:v=2:sig=AQHvCH_1At2Z50CZpdWdDHwY5d9uGa8x\""
    },
    {
      "domain": ".linkedin.com",
      "expirationDate": 1765730232.484995,
      "hostOnly": False,
      "httpOnly": False,
      "name": "AnalyticsSyncHistory",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "AQJ-p-bK2rQaMQAAAZqDOmBf8q1kifPRnULcClPyJYCDtwFvFI5d0FSRWk61dOs2M3F8ESzc7YXg44oAKzBPdw"
    },
    {
      "domain": ".www.linkedin.com",
      "expirationDate": 1794774988.286458,
      "hostOnly": False,
      "httpOnly": True,
      "name": "bscookie",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "\"v=1&2024061016402750dd6e15-b432-4458-8b6b-14a22088621cAQFR5c5FhxOWNjwmDzC1WJo92xr_bdjy\""
    },
    {
      "domain": ".linkedin.com",
      "expirationDate": 1781127825.67715,
      "hostOnly": False,
      "httpOnly": True,
      "name": "dfpfpt",
      "path": "/",
      "sameSite": None,
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "8ba026c05600477d8e05ab861b905dd5"
    },
    {
      "domain": ".www.linkedin.com",
      "expirationDate": 1794317141.629994,
      "hostOnly": False,
      "httpOnly": False,
      "name": "JSESSIONID",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "\"ajax:1109954222376215113\""
    },
    {
      "domain": ".linkedin.com",
      "expirationDate": 1778790985.682154,
      "hostOnly": False,
      "httpOnly": False,
      "name": "li_mc",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "MTswOzE3NjMyMzg5ODQ7MTswMjHfTz4Nd2s/OlkfvIQgj38fwcUP8vu4h/lmIMN5LPCOug=="
    },
    {
      "domain": ".linkedin.com",
      "expirationDate": 1771014989.411286,
      "hostOnly": False,
      "httpOnly": False,
      "name": "li_sugr",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "924bf8b1-352d-41a8-8be1-dbbbd6c906df"
    },
    {
      "domain": ".www.linkedin.com",
      "expirationDate": 1778790988,
      "hostOnly": False,
      "httpOnly": False,
      "name": "li_theme",
      "path": "/",
      "sameSite": None,
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "dark"
    },
    {
      "domain": ".www.linkedin.com",
      "expirationDate": 1778790988,
      "hostOnly": False,
      "httpOnly": False,
      "name": "li_theme_set",
      "path": "/",
      "sameSite": None,
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "user"
    },
    {
      "domain": ".linkedin.com",
      "expirationDate": 1794317141.629968,
      "hostOnly": False,
      "httpOnly": False,
      "name": "liap",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "True"
    },
    {
      "domain": ".www.linkedin.com",
      "expirationDate": 1764448588,
      "hostOnly": False,
      "httpOnly": False,
      "name": "timezone",
      "path": "/",
      "sameSite": None,
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "Asia/Calcutta"
    },
    {
      "domain": ".linkedin.com",
      "expirationDate": 1765830987.286216,
      "hostOnly": False,
      "httpOnly": True,
      "name": "UserMatchHistory",
      "path": "/",
      "sameSite": "no_restriction",
      "secure": True,
      "session": False,
      "storeId": None,
      "value": "AQJNyI4QXria5QAAAZqJO8WjwX5eJxrNc6KJPvOhkbHUtCu-83hkcEvmsyE3uBgx3Oiwm6b8w-V85kOL0MoqkkbFadAYer_SX581us4dtoxqkP2MjqgnwQrl_GaGv4l5jkSgiPxaF07b4gGxWAzqiUI8paF353hQuvb11w2-OOT4yUZDr4YeUT8RAzZ4-2X_32GFkAKuYdmKbYQLoQwAsaQVHiB5NDWyKz4v8MimlH59oY4l6qfMAFJOobmvjM0SSfssGjcSHykmd3W7rXWgzAUXriKQmOWDYq1T2pgfgCgeonHypjBEM2q2x7WvGeVZ_PQkucwNJ6CqGhhUvfpfieLvRhVdFfmiJYq1hL4fKpGjCfq4oA"
    }
  ],
  "findContacts": True,
  "maxDelay": 60,
  "minDelay": 15,
  "proxy": {
    "useApifyProxy": True,
    "apifyProxyCountry": "US"
  },
  "scrapeCompany": False,
  "urls": [
    profile_url
  ],
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
}
    
    run = client.actor("PEgClm7RgRD7YO94b").call(run_input=run_input)
    output = []

    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        output.append(item)

    return output
