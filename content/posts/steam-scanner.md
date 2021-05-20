---
title: "Steam Scanner Project"
date: 2019-05-01T00:00:00-00:00
summary: Scraping steam profiles for malicious links
---

![.](/img/steam/steam-scanner.png)

## The problem
For context, Steam is a gaming marketplace serving 90M users. Users tie DRM games, in-game items, and digital currency to their accounts.

Automated phishing of accounts via other steam profiles hasn't so much been a rising, but persistent issue for Steam. Compromised steam accounts have their valuables sold off and join the botnet, if not recovered. The goal of this project is to identify accounts that are bot/malicious.

## Try it out
Check out [Steam Scanner](https://github.com/WTFender/steam_scanner) on GitHub.

Run some scans:
```bash
# set environment variables
export MYSQL_USER="user"
export MYSQL_PASS="password"
export MYSQL_HOST="host"
export MYSQL_DB="database_name"
export MYSQL_CERT="ssl_cert"
export MYSQL_KEY="ssl_key"
export MYSQL_CA="ssl_ca"
export STEAM_API_KEY="api_key"
export GOOGLE_API_KEY="api_key"

# clone project
git clone https://github.com/WTFender/steam_scanner.git && cd steam_scanner

# install requirements
pip install -r requirements.txt

# setup database
python database_setup.py
> Database tables created.

# run one scan
python steam_scanner.py
> 2019-04-06 14:31:42.309805: Scanned 1 profiles with 2 links containing 2 threats.

{
    "...snip...": 1,
    "links": [
        {
            "is_threat": 1,
            "threatType": "MALWARE",
            "url": "https://testsafebrowsing.appspot.com/s/malware.html"
        },
        {
            "is_threat": 1,
            "threatType": "SOCIAL_ENGINEERING",
            "url": "https://testsafebrowsing.appspot.com/s/phishing.html"
        }
    ],
    "personaname": "Mr. Cringer Pants",
    "...snip...": 1
}

# run more scans
while true; do python steam_scanner.py && sleep 120s; done
> 2019-04-06 15:12:54.184112: Scanned 51 profiles with 5 links containing 0 threats.
> 2019-04-06 15:13:19.837920: Scanned 58 profiles with 1 links containing 0 threats.
> 2019-04-06 15:13:41.044895: Scanned 65 profiles with 3 links containing 0 threats.

# be mindful of steam's api limitations
# 1 scan = 1 api call  
# 1 api call = 100 profile scans max
# 100,000 api call limit per day
```