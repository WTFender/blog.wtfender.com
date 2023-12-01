---
title: "Fixing Triumph ECU Code P1080"
date: 2023-11-30T00:00:00-00:00
cover: /img/daytona-p1080/daytona.jpg
description: Lessons learned while removing an EXUP valve motor
tags: ["exup", "triumph", "daytona", "p1080"]
draft: true
---

## tl;dr

- Code P1080 is an EXUP valve problem
- The EXUP valve cable & motor requires maintenance or you can remove it
- Pre-2013 Triumph codes can be read with standard OBD2 readers
- Post-2013 requires expensive software or a trip to the dealer

## problems

Sitting at a traffic light, I feel my engine bog down for a moment and a check engine light appears. Although barely noticeable, there is now a sporadic delivery of acceleration throughout the RPM band, inconsistent and annoying.

"No worries", I know this bike has an OBD2 port and I have a OBD2 reader; I'll read the code & solve the problem.

Wrong - right to repair is making progress for consumer electronics, but DRM still exists to prevent you from repairing expensive things like tractors & motorcycles.

I tried a metric shit ton of ways to connect to the ODB2 interface - bluetooth readers, usb readers, AutoZone's janky reader, "ELM327" supported readers (whatever that is). It then occurred to me that maybe _my_ ODB2 port isn't working. That seems simple enough to check, just "do something with a multimeter."

2 quick stops to Home Depot & YouTube and I confirmed my ODB2 port does in fact power on, proper voltage, send signals, receive sig...

> ...momentarily, I slip into the matrix  
> couldn't I just read the codes directly?  
> the ECU sends [11-bit CAN bus frames](https://www.kvaser.com/can-protocol-tutorial/#)  
> that you could read through a few of the OBD2 pins  
> wow, an oscilloscope is $300, nevermind

Defeated, I go to the Triumph dealer and they read the code for me - P1080 EXUP valve. They couldn't actually tell me what that meant, but there was a lot of old forum posts about it.

## What is an EXUP Valve

Basically...

1. inside your exhaust
   ![.](/img/daytona-p1080/1.png)

2. is a rotating butterfly valve - if you look inside your muffler, you may be able to see the valve opening/closing
   ![.](/img/daytona-p1080/2.png)

3. the valve is connected to 2 cables
   ![.](/img/daytona-p1080/3.png)

4. that lead to a servo motor which pulls the cables to open/close the valve
   ![.](/img/daytona-p1080/4.png)

Your ECU will usually close the EXUP valve partially at low RPMs which leads to noise reduction & generates more exhaust back pressure. It's debated on whether this system is primarily for performance or compliance, but the affects are the same nonetheless.

The EXUP cables do require some TLC which seems to lead to most P1080 codes. The cables can become too slack overtime and need adjusting to ensure the valve is opening/closing fully. The EXUP valve should be open by default (held by a spring) and the motor is what closes the valve (partially).

For my Daytona 675, you can see this whole system running a test when you start the bike - an easy way to see if it's not working correctly.

In my case, one of my cables was broken or frayed somewhere in the middle and was causing the valve to open in partial and inconsistent ways, which was the cause of the sporadic acceleration and the P1080 code.

I think that in most cases, you'd simply want to repair your EXUP system as best you could. However, idk where to get EXUP cables at 2am and the general consensus from 10 years ago on a distant forum was that removing the whole thing wasn't a big deal performance-wise.

## Removing the EXUP valve system from a Daytona 675

So taking a step back...

1. undo these hex screws
   ![.](/img/daytona-p1080/11.png)

2. loosen these cables
   ![.](/img/daytona-p1080/12.png)

3. slip the cables out of the wheel
   ![.](/img/daytona-p1080/13.png)

4. unplug the servo motor
   ![.](/img/daytona-p1080/14.png)

5. undo these 2 bolts holding the motor
   ![.](/img/daytona-p1080/15.png)

6. and you can remove the whole thing
   ![.](/img/daytona-p1080/16.png)

A side effect of unplugging the servo motor will be a P1080 code - ironic. You can fix this with something called an "[exhaust valve eliminator](https://www.amazon.com/dp/B087N55W2R?psc=1&ref=ppx_yo2ov_dt_b_product_details)", "servo buddy", or similar looking thing that emulates the motor and turns off the light. Make sure you zip tie it somewhere safe.

![exhaust valve eliminator](/img/daytona-p1080/eliminator.png)
