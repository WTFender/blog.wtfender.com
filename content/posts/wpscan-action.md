---
title: "WPScan with GitHub Actions"
date: 2021-06-28T00:00:00-00:00
summary: A free and simple way to scan WordPress sites with GitHub Actions
tags: ['wpscan', 'wordpress', 'github', 'vulnerabilities']
---

[WTFender/wpscan-action](https://github.com/marketplace/actions/wpscan-action) uses [wpscan](https://wpscan.com/), a well-known CLI for scanning WordPress sites and plugins. The primary advantage of running this utility in GitHub Actions is not needing to setup a ruby environment or maintain a server - ideal for small tech teams.

Additionally, [WPScan offers free API tokens](https://wpscan.com/api) for enriching scan results with the latest WordPress vulnerability data. This API token should have enough credits for a weekly scan against one WordPress site, but usage varies based on the number of site plugins.

## GitHub Actions Workflow Example
Run a weekly WordPress scan and send the results to a Slack webhook.
```yaml
on:
  schedule:
    - cron:  0 10 * * 1 # Monday at 10 UTC
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: WTFender/wpscan-action@v1.0
        with:
          id: wpscan
          url: 'https://WORDPRESS_SITE/'
          token: ${{ secrets.WPSCAN_TOKEN }}
          webhook: ${{ secrets.SLACK_WEBHOOK }}
```

![.](/img/wpscan-action/slack.png)

Optionally, scan results can be referenced in a follow on GitHub Actions step with the step ID and output variable names.

```yaml
run: |
    echo ${{ steps.wpscan.outputs.result }}    # JSON scan results
    echo ${{ steps.wpscan.outputs.resultb64 }} # JSON scan results, base64 encoded
```

Try it for free on the [GitHub Actions Marketplace](https://github.com/marketplace/actions/wpscan-action).

