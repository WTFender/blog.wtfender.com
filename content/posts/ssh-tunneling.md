---
title: "SSH Tunneling & Network Pivoting"
date: 2017-10-14T00:00:00-00:00
description: Examples of tunneling across networks with SSH
tags: ['ssh']
---

![.](/img/ssh/ssh_tunnel.png)

## Overview
Here are some examples for how to tunnel via SSH and pivot within a network. Hopefully this clears up any questions you might have.

If you just want the syntax for SSH tunneling; here you go:
```bash
ssh -L [Local Port]:[Destination Host]:[Destination Port] [Username]@[SSH Proxy Host]
```

The goal of SSH tunneling is to send your traffic through a proxy that lives between you and your intended destination. Typically you would do this to bypass a network firewall or if you do not otherwise have direct network connectivity to your destination.

## Scenario / Example
Client - PC-A 192.168.1.10
Proxy - PC-B 192.168.2.10
Server - PC-C 192.168.3.10

You are on PC-A. The goal is to reach a webpage on PC-C. However, a firewall prevents any network connectivity between PC-A and PC-C. PC-B has connectivity to both PC-A and PC-C. An immediate question you might think of; why not just view the webpage on PC-C from PC-B? You could absolutely do this, however, let’s imagine that PC-B doesn’t have a GUI. This would be one use-case forcing you to view the traffic from a machine with a web browser installed (PC-A).

```bash
# PC-C iptables/firewall dropping all traffic to/from PC-A ###
$ iptables --list|grep 192.168.1.10
DROP all -- 192.168.1.10 anywhere 
DROP all -- anywhere 192.168.1.10
```

```bash
# Unable to connect to PC-C from PC-A
$ curl http://192.168.3.10 --connect-timeout 5
curl: (28) Connection timed out after 5001 milliseconds
From PC-A, let’s run the following command to setup the proxy:
```

```bash
# Setup an SSH Proxy
$ ssh -L 80:192.168.3.10:80 wtfender@192.168.2.10
```

What just happened?

1. We SSH’d to PC-B [ssh … wtfender@192.168.2.10].
2. We setup a local listening port on PC-A [-L 80:]. This means that anything that we direct at our local port of 80, will be forwarded to the PC-B proxy.
3. We told PC-B where to send our forwarded port. In this case, our local port of 80 is being sent to the destination of PC-C on port 80 [192.168.3.10:80 ].

You should notice that after running this command, you are in an interactive SSH session with PC-B. In order to test connectivity with curl (shown above), you’ll need to open a new terminal session on PC-A, otherwise you will be running the commands from PC-B.

```bash
# Test our SSH Proxy
$ curl http://127.0.0.1 --connect-timeout 5
<html>PC-C Webpage</html>
```

So now we can see that from PC-A, connecting to localhost (127.0.0.1) on port 80 (implied by http), we have successfully connected to PC-C. Make sure you connect to your local listening port and not the proxy or destination server.

Here is another example of setting up an SSH proxy on a different local port and testing:
```bash
# Setup an SSH Proxy
$ ssh -L 2345:192.168.3.10:80 wtfender@192.168.2.10

# Test our SSH Proxy
$ curl http://127.0.0.1:2345 --connect-timeout 5
<html>PC-C Webpage</html>
```

Let’s go one step deeper and specify our local binding address/interface (see all examples at the bottom). This allows you to set your local listening port on any of your machines addresses, not just localhost.
```bash
# Setup an SSH Proxy
$ ssh -L 192.168.1.10:2345:192.168.3.10:80 wtfender@192.168.2.10

# Test our SSH Proxy
$ curl http://192.168.1.10:2345 --connect-timeout 5
<html>PC-C Webpage</html
```

With our local listening port now set on a route-able interface/address (PC-A), we can introduce PC-D (192.168.4.10). PC-D has no connectivity to PC-B or PC-C. However, PC-D can reach PC-A‘s private interface. Subsequently, PC-D can also reach the webpage on PC-C.
```
# Setup an SSH Proxy
$ ssh -L 192.168.1.10:2345:192.168.3.10:80 wtfender@192.168.2.10

# Test our SSH Proxy from PC-D
$ curl http://192.168.1.10:2345 --connect-timeout 5
<html>PC-C Webpage</html
```

This same example applies to public interfaces.

Lastly, in case it hasn’t been clear. You can interact with these listening ports from any program. We have been doing all our testing from the command line, but as an addition to the last example, you could open a web browser on PC-D and connect to PC-A‘s listening port.

![.](/img/ssh/ssh_tunnel2.png)

Additional examples of address/interface binding:
```bash
# Localhost / 127.0.0.1
$ ssh -L 80:192.168.3.10:80 wtfender@192.168.2.10

# Private IP Address / 192.168.1.10
$ ssh -L 192.168.1.10:80:192.168.3.10:80 wtfender@192.168.2.10

# All Interfaces
$ ssh -L \*:80:192.168.3.10:80 wtfender@192.168.2.10
# or
$ ssh -L 0.0.0.0:80:192.168.3.10:80 wtfender@192.168.2.10
```