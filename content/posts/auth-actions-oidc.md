---
title: "Authenticating with GitHub Actions"
date: 2021-11-16T00:00:00-00:00
cover: /img/auth-actions-oidc/actions.png
description: Exchange GitHub Actions OIDC tokens for temporary AWS keys
tags: ['github', 'actions', 'aws', 'oidc', 'cicd']
---

**Just-in-time access** is a dominating term in security guidance today. Almost everybody agrees it just makes sense - only give folks access to the resources they need for the minimally acceptable time.

With regards to AWS, JIT access for interactive (human) users is a reality via AWS SSO; I've described this in a [deprecated example](https://blog.wtfender.com/posts/aws-temp-tokens/) using AWS STS `AssumeRoleWithSAML`. However, these mechanisms do not work for non-interactive use cases, such as CICD jobs.

### The problem
Within CICD jobs today, it is still common practice to create static AWS access keys and store them in environment variables or a secrets store. These keys are a pain from a security perspective because they require maintenance, such as key rotation. Simply put, if a bad actor gets a hold of your static keys, they can do a lot of damage from outside of your CICD job that can be difficult to trace.

### The future
Recently, GitHub announced [OpenID Connect](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect) support for GitHub Actions (CICD jobs). Within AWS (or anywhere), this enables you to configure your GitHub repository as a trusted OIDC provider and exchange your CICD job's OIDC token for expiring AWS access keys. This eliminates the need to store static keys in your build job and limits the impact of potential compromise.

### The tech bits

Within each GitHub Actions job, there are two special environment variables:
- `ACTIONS_ID_TOKEN_REQUEST_TOKEN`
- `ACTIONS_ID_TOKEN_REQUEST_URL`

The request token is unique to each CICD job invocation and can be used to request an OIDC token from the [OIDC provider](https://token.actions.githubusercontent.com/.well-known/openid-configuration):
```bash
curl -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" $ACTIONS_ID_TOKEN_REQUEST_URL
```

The OIDC provider responds with an OIDC token; the payload looks like this:
```json
{
  "jti": "428ea790-3234-40e7-9b57-11845123e8f4",
  "sub": "repo:WTFender/oidc-action:ref:refs/heads/main",
  "aud": "https://github.com/WTFender",
  "ref": "refs/heads/main",
  "sha": "d4929f5fbb13606da27e4db7ed8b8f7e0cdcc7f0",
  "repository": "WTFender/oidc-action",
  "repository_owner": "WTFender",
  "run_id": "1421543329",
  "run_number": "4",
  "run_attempt": "1",
  "actor": "WTFender",
  "workflow": "Deploy",
  "head_ref": "",
  "base_ref": "",
  "event_name": "push",
  "ref_type": "branch",
  "job_workflow_ref": "WTFender/oidc-action/.github/workflows/deploy.yml@refs/heads/main",
  "iss": "https://token.actions.githubusercontent.com",
  "nbf": 1636033454,
  "exp": 1636034354,
  "iat": 1636034054
}
```

From here, we can use this OIDC token with any OIDC-compliant application to authenticate on behalf of our GitHub repository. The `sub` (subject) and `aud` (audience) fields are used to identify your repository and optionally a branch.

In the next section, we'll use this token to authenticate with AWS in exchange for temporary AWS access keys.

### Dogfood
> It's ***sooooooo*** simple, just do it.  
> — *Anonymous Security Engineer, while discussing any security topic with complete hubris*

Fortunately, this is one of those times where implementation is pretty simple and generally improves the quality of life for devops users. To embrace the dogfood culture, I updated the CICD job that deploys [this blog](https://github.com/WTFender/blog.wtfender.com) to use temporary AWS access keys in exchange for OIDC tokens - I deleted the static AWS keys that I was previously using.

##### 1. Create OIDC Provider in AWS
Using docs from [GitHub](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) and [AWS](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html), I configured GitHub as a trusted OIDC provider in my AWS account.
```json
$ aws iam get-open-id-connect-provider --open-id-connect-provider-arn <arn>
{
  "Url": "token.actions.githubusercontent.com",
  "ClientIDList": ["sts.amazonaws.com", "https://github.com/WTFender"],
  "ThumbprintList": ["a031c46782e6e6c662c2c87c76da9aa62ccabd8e"],
  "CreateDate": "2021-11-04T15:08:52.398000+00:00"
}
```
This could easily be done with CloudFormation, as shown on [Aidan Steele's blog](https://awsteele.com/blog/2021/09/15/aws-federation-comes-to-github-actions.html).

##### 2. Update GitHub Actions Job
Previously, I was setting my static AWS keys from GitHub Secrets, like so:
```yaml
deploy:
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

I had to make several changes:
1. Remove my static key variables
2. Set `AWS_ROLE_ARN`, which is the role to be assumed in my AWS account
3. Add the OIDC permissions
4. Retrieve the OIDC token in an additional step
5. Set the OIDC token in a file, pointed to by `AWS_WEB_IDENTITY_TOKEN_FILE`
```yaml
deploy:
  permissions:
    id-token: write
    contents: read
  env:
    AWS_WEB_IDENTITY_TOKEN_FILE: /tmp/awstoken
    AWS_ROLE_ARN: ${{ secrets.AWS_ROLE_ARN }}
  steps:
  - name: Setup Creds
    run: |
      curl -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
        "$ACTIONS_ID_TOKEN_REQUEST_URL" | jq -r '.value' > $AWS_WEB_IDENTITY_TOKEN_FILE
```
As you may have guessed, the AWS CLI will detect `AWS_WEB_IDENTITY_TOKEN_FILE` and uses it to perform `AssumeRoleWithWebIdentity` with AWS STS.

For reference, the full [.github/workflows/deploy.yml](https://github.com/WTFender/blog.wtfender.com/blob/main/.github/workflows/deploy.yml).

Lastly, I do want to mention that AWS does provide an official [configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials) action meant to do some of this OIDC work behind the scenes. Unfortunately, I did not have success with this preconfigured action, but replicating myself was simple enough. YMMV.
