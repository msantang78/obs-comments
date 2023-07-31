# Preact OBS Plugin for live Minds comments

![Live comments](/demo/demo.jpg "Live comments & votes")

# How to use it

A demo is live on https://obs-comments.vercel.app

To add the live comments to OBS:
  - Add a Browser source in OBS 
  - Set the URL to https://obs-comments.vercel.app/?link=POST_LINK

For instance `https://obs-comments.vercel.app/?link=https://www.minds.com/newsfeed/1531655497172652050`

![OBS](/demo/obs.png "OBS Settings")

# Development

I recommend you to use `npx live-server` to develop, it will reload your website whenever you change one of the files.

Created using the template https://github.com/HorusGoul/preact-obs-plugin