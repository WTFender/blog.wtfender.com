---
title: "Simple libssh Detection"
date: 2018-10-18T00:00:00-00:00
summary: Quickly identify libssh and CVE-2018-10933
tags: ['bash', 'vulnerabilities', 'ssh']
---

For those of you without off-the-shelf vulnerability scanners, try this simple bash script to detect libssh and [CVE-2018-10933](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-10933) (Unauthenticated Bypass for libssh).
```bash
# Specify which ports to check for SSH servers
for port in 22 2022 2222
do
        # Substitute your target subnets and hosts
        for ip in 192.168.{0..10}.{0.255}
        do
                echo "$ip:$port" >> results.txt
                # Banner grab with netcat (adjust -w for timeout)
                echo "" | nc -q0 -w2 ${ip} ${port} >> results.txt
        done
done
 
# Display libssh findings
grep -i libssh -B1 results.txt
```

Output:
```text
192.168.0.101:22
SSH-2.0-libssh_0.7.0
--
192.168.1.5:2022
SSH-2.0-libssh_0.7.0
--
192.168.10.10:2222
SSH-2.0-libssh_0.7.0
```
