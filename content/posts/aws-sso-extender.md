---
title: "AWS SSO Extender"
date: 2023-03-08T00:00:00-00:00
cover: /img/aws-sso-extender/extension.png
description: Organize and quickly access your AWS SSO applications across all browsers
tags: ['aws', 'sso', 'chrome', 'extension', 'saml', 'firefox', 'safari', 'edge']
---

## Quick Access & Organization
🚀 [Install Chrome Extension](https://chrome.google.com/webstore/detail/aws-sso-extender/pojoaiboolahdaedebpjgnllehpofkep)  
🦊 [Install Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/aws-sso-extender/)  
🧭 [Install Safari App](https://apps.apple.com/us/app/aws-sso-extender/id6450935274)  
⚡ [Install Edge Extension](https://microsoftedge.microsoft.com/addons/detail/aws-sso-extender/dbdbfcdnfbghdommmcichaiakhaoapkg)  
💻 [View on GitHub](https://github.com/WTFender/aws-sso-extender)  

AWS SSO Extender is a browser extension that transforms how you access AWS through Identity Center (formerly AWS SSO). Similar to Okta or OneLogin's browser extensions, it provides quick access to your SSO applications, but with powerful customization and organization features.

## Key Features

**⭐ Favorite Profiles** — Quickly access your most-used AWS accounts and roles with favorited profiles  
**🎨 Customize Everything** — Label accounts, rename roles, set custom colors, and override console branding  
**🔑 Assume IAM Roles** — Use SSO profiles to assume IAM roles directly from the extension  
**🦊 Firefox Containers** — Automatically organize AWS console sessions into separate Firefox containers  
**📤 Export & Share** — Export your profiles as bookmarks that can be shared with team members (even without the extension installed)  
**🔍 Smart Search & Filtering** — Search and filter by account name, account ID, profile name, or IAM role labels  
**⌨️ Keyboard Hotkeys** — Set up to 3 keyboard shortcuts to instantly open your favorite profiles  
**📝 JSON Config Editor** — Advanced users can edit configuration directly as JSON for complex customizations

## Background

[AWS Identity Center](https://aws.amazon.com/iam/identity-center/) (formerly AWS SSO) is becoming the umbrella tool for handling access to AWS, but the user experience doesn't match the complexity of large organizations.

Most organizations should be using Identity Center by now to manage their AWS console and CLI access; I've [posted before](/posts/aws-temp-tokens/) about why it's important (tl;dr prevents static credentials on user machines).

However, as I've moved AWS users off of their static IAM credentials and onto temporary SSO credentials, I've heard complaints of one thing in particular — the AWS SSO portal doesn't provide a quick way to hop between AWS console accounts and roles.

### The UX Problem

While AWS Identity Center does have a search feature, when you're managing hundreds of accounts with similarly named roles, finding the right one can be tedious. Additionally, you have to visit the portal every time you want to switch accounts. When you compare that to what developers are already using to switch accounts (e.g., [AWS Extend Switch Roles](https://chrome.google.com/webstore/detail/aws-extend-switch-roles/jpmkfafbacpgapdghgdpembnojdlgkdl?hl=en)), the built-in experience falls short.

### Evolution

AWS SSO Extender has evolved significantly since initial release. Early versions focused on quick access and searching. Over time, it's grown to support:

- **Multi-browser support** — Initially Chrome-only, now available on Firefox, Safari, and Edge
- **Advanced customization** — Account labels, role renaming, console color customization, and JSON config editing
- **Container management** — Firefox Containers integration for isolating SSO sessions
- **IAM role assumption** — Direct role assumption without requiring a separate switch-role step
- **Bookmarks export** — Share AWS access with team members even if they don't use the extension
- **Scale support** — Optimizations to support organizations with 100+ accounts and 500+ profiles

## How It Works: Tech Bits

There isn't much sensitive going on here. The extension runs as a content script within the AWS Identity Center portal and leverages the existing AWS APIs to fetch user and profile data. Here's what happens under the hood:

### Data Retrieval

Once an AWS SSO login occurs, the extension queries the AWS SSO API endpoints:

```json
/user
{
  "managedActiveDirectoryId": "d-926707cb89",
  "preferredUsername": "wtfender",
  "accountId": "391785637824",
  "...": "..."
}

/instance/appinstances
{
  "result": [
    {
      "id": "ins-76a853180f2bd90e",
      "name": "719687247567 (wtfender-test)",
      "description": "AWS administrative console",
      "...": "..."
    }
  ]
}

/instance/appinstance/<appInstanceId>/profiles
{
  "result": [
    {
      "id": "p-182a002886854454",
      "name": "AdministratorAccess",
      "...": "..."
    }
  ]
}
```

### Deep Linking (IdP-Initiated Sign-In)

From this data, the extension generates login deep links using Identity Provider-initiated SAML sign-in. The URL format allows AWS to identify which user, account, and role to activate:

```typescript
function encodeParens(s) {
  // URI encode parentheses, RFC3986, credit: Mozilla
  const tmp = encodeURIComponent(s)
  return tmp.replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16)}`);
};

function createLoginUrl(user, appInstance, appInstanceProfile) {
  const ssoUrl = `https://${user.managedActiveDirectoryId}.awsapps.com/start/#/saml/custom`;
  const profileB64 = btoa(`${user.accountId}_${appInstance.id}_${appInstanceProfile.id}`);
  const profileEnc = encodeParens(profileB64);
  const profileNameEnc = encodeParens(appInstanceProfile.name);
  return `${ssoUrl}/${profileNameEnc}/${profileEnc}`;
};
```

### Storage & Sync

User customizations (favorites, labels, colors, etc.) are stored using the browser's extension storage API. For organizations with many profiles (100+), the extension uses local storage as a fallback to avoid hitting sync storage quota limits.

Feel free to reference this approach in your own SSO tooling — it's a useful pattern for generating deep links without requiring additional backend infrastructure.
