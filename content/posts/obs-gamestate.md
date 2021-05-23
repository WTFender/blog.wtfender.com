---
title: "Gamestate Integration with OBS"
date: 2019-08-20T00:00:00-00:00
summary: Integrate in-game events with OBS stream overlays
tags: ['gamestate', 'streaming', 'csgo', 'obs']
---

## Overview

[Open Broadcast Software](https://obsproject.com/) is a popular tool for streaming games, your desktop, or other content. Streamers can leverage OBS plugins to add interactive content and integrations to their streams, such as a notification for Twitch followers.

In 2015, Valve released an in-game API for Counter-Strike: Global Offensive; referred to as [Gamestate Integration](https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration). GSI is basically an API server that publishes realtime game data, such as player locations, inventory items, round wins, and other events.

Below is a walkthrough of [my attempt](https://github.com/WTFender/csgobs) to leverage CSGO's GSI to trigger stream content in OBS. The example I created is an in-game double kill that triggers an animation and icon.

https://github.com/WTFender/csgobs

{{< gyfcat id=aggressivesafechrysomelid height=500 >}}

### Enable CSGO GSI, Publish Events
Place a .cfg file at `\Steam\steamapps\common\Counter-Strike Global Offensive\csgo\cfg`. This enables the in-game API and selects certain events to be published/POST'd to localhost; there are many other configuration options for these configs.
```text
"csgobs"
{
    "uri" "http://127.0.0.1:3000"
    "timeout" "5.0"
    "buffer"  "0.1"
    "throttle" "0.1"
    "heartbeat" "60.0"
    "data"
    {
        "map_round_wins" "1"
        "map" "1"
        "player_id" "1"
        "player_match_stats" "1"
        "player_state" "1"
        "player_weapons" "1"
        "provider" "1"
        "round" "1"
    }
}
```

### Listen for In-Game Events
I hosted a golang HTTP server that listens for the POST'd JSON events and relays them over a websocket.
```golang
// server.go
// receive and handle gamestate events
func catchEvent(c echo.Context) error {
	// TODO: validate json before broadcast
	buf := new(bytes.Buffer)
	buf.ReadFrom(c.Request().Body)
	broadcastEvent(c, buf.String())
	return c.String(http.StatusOK, "ok")
}

// broadcast event to all websockets
func broadcastEvent(c echo.Context, event string) {
	// TODO: consider implementing event detection here
	// TODO: clean up dead websockets
	for _, sock := range socks {
		err := sock.WriteMessage(websocket.TextMessage, []byte(event))
		if err != nil {
			c.Logger().Error(err)
		}
	}
}
```

The HTTP server also hosts a simple HTML page with JavaScript that listens on the websocket to parse the events and display images or play audio.
```javascript
ws.onmessage = function(evt) {
    event = JSON.parse(evt.data)
    if(event.hasOwnProperty("previously")){
        console.log(event["previously"]["player"]["state"])
        // evaluate state changes
        if (event["round"]["phase"] == "live"){
            if (doubleKill(event)){
                $("#cheer")[0].play()
                $("#badge").slideDown("fast").delay(2000).fadeOut("fast")
            }
        }
    }
    last_event = event
}
```

### Displaying in OBS
Add a "Browser Source" in OBS that points to the hosted HTML page.
