---
title: "AWS SSO Extension"
date: 2023-03-08T00:00:00-00:00
cover: /img/aws-sso-extender/extension.png
description: Quickly access your AWS SSO applications
tags: ['aws', 'sso', 'chrome', 'extension', 'saml']
---

## Improving things
:rocket: [Install Chrome Extension](https://chrome.google.com/webstore/detail/aws-sso-extender/pojoaiboolahdaedebpjgnllehpofkep)  
:computer: [View on GitHub](https://github.com/WTFender/aws-sso-extender)  

AWS SSO Extender is similar to Okta or OneLogin's browser extensions that allow you to quickly access your applications. Additionally, you can search, rename, and favorite applications to keep things organized.

## Background
[AWS Identity Center](https://aws.amazon.com/iam/identity-center/) (formerly AWS SSO) is becoming the umbrella tool for handling access to AWS, but the user experience isn't complete.

Most organizations should be using Identity Center by now to manage their AWS console and CLI access; I've [posted before](/posts/aws-temp-tokens/) about why it's important (tl;dr prevents static credentials on user machines).

However, as I've moved AWS users off of their static IAM credentials and onto temporary SSO credentials, I've heard complaints of one thing in particular - the AWS SSO portal doesn't provide a quick way to hop between AWS console accounts/roles (or other applications).

They do have a search feature, but if you have hundreds of accounts with similarly named roles, this can be a nightmare. Additionally, you have to visit this page everytime you want to switch accounts - when you compare that to the tools your devs are already using to switch accounts, e.g. [AWS Extend Switch Roles](https://chrome.google.com/webstore/detail/aws-extend-switch-roles/jpmkfafbacpgapdghgdpembnojdlgkdl?hl=en), it's not nearly as efficient.

### Tech bits
There isn't much clever or sensitive going on here. The extension waits for an AWS SSO login to occur, then lists data for your user, applications, and application profiles from the AWS SSO API.
 
```json
/user
{
  "managedActiveDirectoryId": "d-926707cb89",
  "preferredUsername": "wtfender",
  "accountId": "391785637824",
  "...snip...": "...snip..."
}

/instance/appinstances
{
  "result": [
    {
      "id": "ins-76a853180f2bd90e",
      "name": "719687247567 (wtfender-test)",
      "description": "AWS administrative console",
      "...snip...": "...snip..."
    }
  ]
}

/instance/appinstance/<appInstanceId>/profiles
{
  "result": [
    {
      "id": "p-182a002886854454",
      "name": "AdministratorAccess",
      "...snip...": "...snip..."
    }
  ]
}
```

From this data, you can generate a login deep link (AKA identity provider initiated sign-in). If not already, you'll be redirected to be authenticated.

```typescript
function encodeUriPlusParens(s) {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16)}`);
};

function createLoginUrl(user, appInstance, appInstanceProfile) {
  const ssoDirectoryUrl = `https://${user.managedActiveDirectoryId}.awsapps.com/start/#/saml/custom`;
  const appProfilePath = this.encodeUriPlusParens(btoa(`${user.accountId}_${appInstance.id}_${appInstanceProfile.id}`));
  const appProfileName = this.encodeUriPlusParens(appInstanceProfile.name);
  return `${ssoDirectoryUrl}/${appProfileName}/${appProfilePath}`;
};
```

Feel free to rip and re-use this, I'm not sure how common knowledge it is.
