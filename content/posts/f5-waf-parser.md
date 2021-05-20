---
title: "F5 WAF Syslog Parser"
date: 2017-07-28T00:00:00-00:00
summary: Regex for parsing F5 WAF syslogs
---

![.](/img/f5waf/f5_parser.png)

###### Regex parser

Here is a LogRhythm regex parser that I use for F5 WAF syslog violations.
```regex
type\s=\swaf,attack_type\s=\s(?<process>[\D]+),date_time\s=\s[
\d]{4}\-[\d]{2}\-[\d]{2}\s[\d]{2}:[\d]{2}:[\d]{2},dest_ip\s=\s
<dip>,dest_port\s=\s<dport>,geo_location\s=\s\D+,http_class_na
me\s=\s.*,ip_client\s=\s<sip>,method\s=\s<command>,policy_appl
y_date\s=\s[\d]{4}\-[\d]{2}\-[\d]{2}\s[\d]{2}:[\d]{2}:[\d]{2},
policy_name\s=\s(?<policy>\w+),protocol\s=\s<protname>,query_s
tring\s=\s(?<tag2>.*),request_status\s=\s(?<result>\w+),respon
se_code\s=\s<vmid>,severity\s=\s<severity>,src_port\s=\s<sport
>,support_id\s=\s(?<serialnumber>[\w]+),uri\s=\s(?<url>.+),use
rname\s=\s[\D]+,violations\s=\s(?<subject>[\D]+),web_applicati
on_name\s=\s(?<tag4>\w+),x_forwarded_for_header_value\s=\s<sna
tip>,\srequest\s=\s(?<tag5>.+)
```

###### Field mappings

This is for the actual WAF violations, not the L7 DDoS logs. Some of the tags are LogRhythm specific, but this can be easily modified for whatever SIEM you’d like.

The LogRhythm field tags that I use are mapped like this:
```
attack_type = <process>
dest_ip = <dip>
dest_port = <dport>
ip_client = <sip>
method = <command>
policy_name = <policy>
protocol = <protname>
query_string = <tag2>
request_status = <result>
response_code = <vmid>
severity = <severity>
src_port = <sport>
support_id = <serialnumber>
uri = <url>
violations = <subject>
web_application_name = <tag4>
x_forwarded_for_header_value = <snatip>
request = <tag5>
```

###### Event mapping

I created events with similar naming schemes to the different F5 violation types (Illegal Method, Illegal File Type, etc). Using the `<subject>` tag, I map each log to a relevant event. However, some logs have multiple violation types, separated by a comma. I group all of these into a common event named “Multiple Violations.”

Here is an example of creating events:
```
Multiple Violations:
 <subject> "Matches Pattern" \w+[,]
Single Violation (Illegal method):
 <subject> "Equal to" Illegal method
```  

Lastly, the `<vmid>` tag holds the response code for the request, if the request was allowed it will be a typical HTTP response code (200, 404, etc) and if it was blocked it will be 0. I use the `<vmid>` to set the classification of the common event (in my case; security attack and failed security attack). I simply identify blocked and permitted requests using the following:
```
Blocked Request (Failed Attack): 
 <vmid> = 0
Permitted Request (Security Attack):
 <vmid> != 0
```

Keep in mind that the actual source IP for the logs is being tracked as `<snatip>`, not `<sip>`. Build your dashboards accordingly.

Here is the violation log format and example log, provided in the F5 support article:
```
Sample Message:
 Jan 17 20:41:43 type = waf,attack_type = Abuse of Functionality,Information Leakage,HTTP Parser Attack,date_time = 2015-12-17 20:41:42,dest_ip = 192.168.133.186,dest_port = 80,geo_location = US,http_class_name = /dosproof/dosproof-dvwa,ip_client = 172.16.122.112,method = CONNECT,policy_apply_date = 2015-08-24 22:57:44,policy_name = dvwa,protocol = HTTP,query_string = ,request_status = blocked,response_code = 0,severity = Critical,src_port = 42178,support_id = 15969618387221591422,uri = proxytest.zmap.io:80,username = N/A,violations = HTTP protocol compliance failed,Illegal meta character in URL,Illegal method,web_application_name = dvwa-dsyme,x_forwarded_for_header_value = 172.16.122.112, request = CONNECT proxytest.zmap.io:80 HTTP/1.1\r\nHost: 192.168.133.186\r\nUser-Agent: Mozilla/5.0 zgrab/0.x\r\nX-Forwarded-For: 10.100.122.112\r\nVia: 1.1 dca1-10\r\n\r\n"

WAF Violation Format:
 Jan 17 20:41:43 <Timestamp of alert sent>
 type = waf <Type of alert message>
 attack_type = Abuse of Functionality,Information Leakage,HTTP Parser Attack, <Detected Attack types>
 date_time = 2015-12-17 20:41:42, <Timestamp of violation>
 dest_ip = 192.168.133.186 < Destination IP of request>
 dest_port = 80, <Destination Port of request>
 geo_location = US <Geo location of the Source IP>
 http_class_name = /dosproof/dosproof-dvwa <Associated HTTP profile settings for proxy>
 ip_client = 172.16.122.112, <IP address of client>
 method = CONNECT <HTTP method used in request>
 policy_apply_date = 2015-08-24 22:57:44 <Last update to security policy>
 policy_name = dvwa < Name of Security Policy>
 protocol = HTTP <Protocol of request>
 query_string = <Any HTTP query strings detected>
 request_status = blocked < Was requested blocked or allowed>
 response_code = 0 <Response code from Server>
 severity = Critical < Security severity of violation>
 src_port = 42178 < Source port of request>
 support_id = 15969618387221591422 <Security Support id for violation>
 uri = proxytest.zmap.io:80 <Targeted URI for the request>
 username = N/A <Any detected usernames>
 violations = HTTP protocol compliance failed,Illegal meta character in URL,Illegal method < Detected specific violation types>
 web_application_name = dvwa-dsyme <Name of targeted deployed Web application proxy>
 x_forwarded_for_header_value = 172.16.122.112 < Value of x-forwarded-for header>
 request = CONNECT proxytest.zmap.io:80 HTTP/1.1\r\nHost: 192.168.133.186\r\nUser-Agent: Mozilla/5.0 zgrab/0.x\r\nX-Forwarded-For: 10.100.122.112\r\nVia: 1.1 dca1-10\r\n\r\n" < Full request string>
```