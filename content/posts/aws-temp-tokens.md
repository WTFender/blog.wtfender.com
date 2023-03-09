---
title: "AWS Temporary Access Tokens"
date: 2019-11-03T00:00:00-00:00
cover: /img/aws-tokens/aws-sts-saml.png
description: Generate temporary AWS access tokens from a SAML login to the AWS console
tags: ['aws', 'authentication', 'chrome', 'extension', 'saml']
---

This project is old. [AWS SSO now works with AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html) to provide temporary access tokens.

Originally posted over at [Medium.com](https://medium.com/@WTFender/aws-temporary-access-tokens-951b3f67e958).

---

Key management is a nightmare. It started with keys everywhere — then we all started sticking our keys, tokens, and break-glass passwords into a vault or password manager and rotating them accordingly.

Storing secrets has become a business — but how do you manage AWS access tokens for your users?

Developers and engineers regularly need access tokens to use the AWS CLI. These tokens are usually permanent, carry escalated privileges, and are stored on the users’ machines. In some cases, bastion hosts are used to store these tokens, but present the same issue when the private key is stored on the user’s local machine.

Enter temporary access tokens.

Providing users temporary tokens eliminates key rotation and reduces the risk of tokens on compromised systems. The biggest drawback to temporary tokens is figuring out how to provision them to your organization and users.

I recently published AWS STS SAML, a chrome extension, which serves as an example for token provisioning. This extension listens for SSO-based logins to the AWS console and generates access tokens based on the user’s assumed role.

Although you might be hard pressed to have your sensitive developers install a chrome extension for the petty sake of improving security, I hope you find a way to iterate on this example and establish temporary tokens as a standard.

## Try it out

1. Install [AWS STS SAML extension](https://chrome.google.com/webstore/detail/aws-saml-keys/gpnbopdmcfpijadjcnfblkpigjngobgl) from the Chrome store.
2. Install [AWS STS SAML host app](https://github.com/WTFender/awsstssaml) from GitHub

![.](/img/aws-tokens/aws-sts-saml-extension.jpg)