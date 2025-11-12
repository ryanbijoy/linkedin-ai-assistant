from apify_client import ApifyClient
import os
import dotenv

dotenv.load_dotenv()
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")
client = ApifyClient(APIFY_API_TOKEN)


def scrape_linkedin_profile(profile_url):
    run_input = {
        "cookie": [
        {
            "domain": ".linkedin.com",
            "expirationDate": 1765469330.587572,
            "hostOnly": False,
            "httpOnly": False,
            "name": "lms_ads",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": True,
            "session": False,
            "storeId": None,
            "value": "AQE_gxLMrFAyswAAAZpzrVRpxzAATU0CzrVW0qrIEt8MpTzXYJej4xHhs4rvGr1i-4LpkBEmsq4NSkq-SGjEZ9Biq-s9yE2M"
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
            "expirationDate": 1794446472.382714,
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
            "expirationDate": 1765469330.587607,
            "hostOnly": False,
            "httpOnly": False,
            "name": "lms_analytics",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": True,
            "session": False,
            "storeId": None,
            "value": "AQE_gxLMrFAyswAAAZpzrVRpxzAATU0CzrVW0qrIEt8MpTzXYJej4xHhs4rvGr1i-4LpkBEmsq4NSkq-SGjEZ9Biq-s9yE2M"
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
            "value": "taBcrIH61PuCVH7eNCyH0CYjjbqLuI8XF8pleSQW5Na2L8YmCa5yGaPr7bIwqsrePp2lsdoCsb36rvn50aMgPhme5QZeOj3Aq2zVztvLzomf1bPqlU7WgSfaFi9CFG%252f5i08CYfQzDM%252bfqUNz4sHYcTI%252bfN9SomYvUlDvW0S3imxTzPag9y%252f1obKu0bMM3%252fezBJYNfBh2eDosDBqEAeuYUxh%252f0FSP6Ixvy5BY2k3LBzJtzcPxXAqrfcG2T95wIcJ0Nli1Kxl0dNsrjQBQyAfexB9wOfrTwNZPzvYXiUP9nCGO0tuSPB8nqEBNz98A3w15IJzI4%252bH6Rb0hCjuSMNUleVzBgVQCv7L%252f2%252bmWMq%252fcFzqdn0bym6LHLGpEMh9ro%252bb5Go8BBArZwWtutJRtI0xsRg%253d%253d"
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
            "expirationDate": 1762970918.057662,
            "hostOnly": False,
            "httpOnly": False,
            "name": "lidc",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": True,
            "session": False,
            "storeId": None,
            "value": "\"b=VB86:s=V:r=V:a=V:p=V:g=5101:u=368:x=1:i=1762910472:t=1762970917:v=2:sig=AQEO13Eb2iVGMXtQBZ1PXR5Nlv_pCfdk\""
        },
        {
            "domain": ".linkedin.com",
            "expirationDate": 1765469330.213773,
            "hostOnly": False,
            "httpOnly": False,
            "name": "AnalyticsSyncHistory",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": True,
            "session": False,
            "storeId": None,
            "value": "AQLhOukUnuKC8gAAAZpzrVMIiLeqvFW-dqGaEKTwJA12TyIM9KHrSghE5G02pc06kwfzwNmOjai8iTrgobmspw"
        },
        {
            "domain": ".www.linkedin.com",
            "expirationDate": 1794446469.821776,
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
            "sameSite": "no_restriction",
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
            "expirationDate": 1778461897.05702,
            "hostOnly": False,
            "httpOnly": False,
            "name": "li_mc",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": True,
            "session": False,
            "storeId": None,
            "value": "MTswOzE3NjI5MDk4OTY7MTswMjEdBB8d2TwA0jRTWSLCuI8sE30ye/WyGmD7zs2/FxvCBQ=="
        },
        {
            "domain": ".linkedin.com",
            "expirationDate": 1770686472.382626,
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
            "expirationDate": 1778462470,
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
            "expirationDate": 1778462470,
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
            "expirationDate": 1764120070,
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
            "expirationDate": 1765502469.821594,
            "hostOnly": False,
            "httpOnly": True,
            "name": "UserMatchHistory",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": True,
            "session": False,
            "storeId": None,
            "value": "AQL7kTyavw6pKwAAAZp1pv5Z9hIrR6VUCwrpbOrEQ1j25V0CrNmtkOJS939aGDYK6im_eBCJ5HrwsLs3qcBxN6X2K5wA0EkNGIsDbPzohoXrZHEW5NfaJr9qjAqwvG36lJScC2202EBEk6VCSnnyKvmXBAubQbXCUEwXZYXKF3NohF_25VNfWnNS9H4pXGBLeWvjWc44VD94ULwJdAtvlYBRmQNdOhckdWRvyPKk9uxYTftWtktTzpFWmFbBxNYppTj8SSCDakjQ77Psyw2SwfPUz4tUjzBOcwU_XwQRybW5Q5yJvq4cwA-GHxQawQAMpxUXyAc4_o-sYvZhOYmPosZR43Px-fk4ARx3l4vX76m7l0vV2A"
        }
    ],
        "findContacts": False,
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
