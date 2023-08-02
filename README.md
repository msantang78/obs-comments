# Web OBS Plugin for live comments (minds.com)

This plugins supports live comments & up votes.

![Live comments](/demo/demo.jpg "Live comments & votes")

Simple web plugin to include live comments and up votes from a Minds post.

# Usage

There are two ways to use this plugin.

## Using the demo web site:
There is a live demo on https://obs-comments.vercel.app

To add the live comments to OBS:
  - Add a Browser source in OBS 
  - Set the URL to https://obs-comments.vercel.app/?link=POST_LINK

For instance `https://obs-comments.vercel.app/?link=https://www.minds.com/newsfeed/1531655497172652050`

![OBS](/demo/obs.png "OBS Settings")

## Running it locally 

For simplicity, we are using Node & [serve](https://www.npmjs.com/package/serve) on this example, but any web server will work.

Clone the repository
  ```bash
  git clone git@github.com:msantang78/obs-comments.git
  ```
Move to the folder and start the server
  ```bash
  cd obs-comments
  npx serve
  ```

# Development

This project is using all the dependencies via CDN so it doesn't need any building process.
You can use `npx live-server` to develop, it will reload your website whenever you change any file.

Inspired by https://github.com/HorusGoul/preact-obs-plugin
