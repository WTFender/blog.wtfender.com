---
title: "Webhooks for LogRhythm"
date: 2017-09-07T00:00:00-00:00
description: Steps to send slack webhooks from LogRhythm alarms
tags: ['webhooks', 'siem']
---
## Steps
**1. Add a webhook to your Slack team.**

**2. Create an AIE alarm with fields that you want to pass to your webhook.**

**3. Create a powershell script accepting the fields as parameters:**
```powershell
### Define this variables in actions.xml when creating the SmartResponse plugin
param(
[string]$AlarmId,
[string]$AlarmRuleName,
[string]$AlarmDate,
[string]$MessageClass
)

<### Update these ###>
#Location of Send-SlackMessage.ps1 - https://github.com/jgigler/Powershell.Slack
$ref = "PATH_TO_FILE/Send-SlackMessage.ps1"

#Your Slack Webhook URL
$WebhookURL = "https://hooks.slack.com/services/XXXXXXXXXXXXXXXXX"

#Your LR Web Console URL
$Url = "https://YOUR_SMARTCONSOLE_LINK/alarms/" + $AlarmId
<####################>

#Set webhook payload
$MyFields = @(
    @{
        title = $AlarmRuleName
        value = "<"+$Url+"|Alarm Link>"
        short = 'true'
    }
    @{
        title = "Classification"
        value = $MessageClass
        short = 'true'
    }
)

#Send Webhook
. $ref
$notification = New-SlackRichNotification -Fallback $AlarmRuleName -AuthorName $AlarmDate -Fields $MyFields
Send-SlackNotification -Url $WebhookURL -Notification $notification
```

**4. Create the actions.xml manifest with the same parameters/fields:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<remv1:Remediation-Plugin xmlns:remv1="RemediationVersion1.xsd" Name="Slack Webhook - Basic Info">
  <remv1:Action Name="Send Webhook" Command="powershell.exe">
    <remv1:ConstantParameter Name="Script" Switch="-file PATH_TO_FILE/basic.ps1" Order="1" />
    <remv1:StringParameter Name="AlarmId" Switch="" Order="2"> <remv1:DefaultInput> <remv1:AlarmId /> </remv1:DefaultInput> </remv1:StringParameter>
    <remv1:StringParameter Name="AlarmRuleName" Switch="" Order="3"> <remv1:DefaultInput> <remv1:AlarmRuleName /> </remv1:DefaultInput> </remv1:StringParameter>
    <remv1:StringParameter Name="MessageClass" Switch="" Order="Unsorted"> <remv1:DefaultInput> <remv1:MessageClass /> </remv1:DefaultInput> </remv1:StringParameter>
    <remv1:StringParameter Name="AlarmDate" Switch="" Order="4"> <remv1:DefaultInput> <remv1:AlarmDate> <remv1:TimeFormat TimeZone="Eastern Standard Time" FormattingString="MMMM dd, yyyy" /> </remv1:AlarmDate> </remv1:DefaultInput> </remv1:StringParameter>
  </remv1:Action>
</remv1:Remediation-Plugin>
```  

**5. Create your SmartResponse Plugin using the powershell script and manifest.**

**6. Set your SmartResponse as an action to your AIE alarm, mapping the correct parameters:**
![.](/img/logrhythm/lr_webhooks2.png)

**7. Trigger the alarm to test the webhook:**
![.](/img/logrhythm/lr_webhooks3.png)

**Examples**
![.](/img/logrhythm/lr_webhooks4.png)
![.](/img/logrhythm/lr_webhooks5.png)
![.](/img/logrhythm/lr_webhooks6.png)
![.](/img/logrhythm/lr_webhooks7.png)