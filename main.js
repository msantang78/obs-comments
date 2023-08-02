import { h, render } from "https://unpkg.com/preact@latest?module";
// In case you need hooks uncomment this line
import {
  useState,
  useEffect,
  useRef,
  useMemo,
} from "https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module";

import htm from "https://unpkg.com/htm?module";

import autoAnimate from "https://www.unpkg.com/@formkit/auto-animate@0.7.0/index.mjs?module";

const socket = io("wss://ha-socket-alb-io-us-east-1.minds.com", {
  autoConnect: true,
  timeout: 30000,
  transports: ["websocket"], // important with RN
});

/**
 * Generates a random position for the like icons in the bottom of the screen
 * @returns {bottom: string, right: string}
 */
const getRandomPosition = () => {
  // Generate random positions within a range
  const minBottom = 50; // Minimum distance from the bottom of the screen
  const maxBottom = window.innerHeight / 3; // Maximum distance from the bottom of the screen
  const minRight = 50; // Minimum distance from the right of the screen
  const maxRight = window.innerWidth - 50; // Maximum distance from the right of the screen

  const randomBottom =
    Math.floor(Math.random() * (maxBottom - minBottom + 1)) + minBottom;
  const randomRight =
    Math.floor(Math.random() * (maxRight - minRight + 1)) + minRight;

  return { bottom: `${randomBottom}px`, right: `${randomRight}px` };
};

/**
 * Preact auto-animate implementation
 * I just copied from the repo in order to avoid building
 */
function useAutoAnimate(options) {
  const element = useRef(null);
  const [controller, setController] = useState();
  const setEnabled = (enabled) => {
    if (controller) {
      enabled ? controller.enable() : controller.disable();
    }
  };
  useEffect(() => {
    if (element.current instanceof HTMLElement)
      setController(autoAnimate(element.current, options || {}));
  }, []);
  return [element, setEnabled];
}

/**
 * Fetch a comment from the API
 *
 * I'm using a proxy to avoid the CORS errors here, we should provide this
 * as an static page inside minds.com avoiding the need of it.
 */
async function getComment(entity_guid, guid, parent_path) {
  const url =
    "https://corsproxy.io/?" +
    encodeURIComponent(
      `https://mobile.minds.com/api/v2/comments/${entity_guid}/${guid}/${parent_path}?limit=1;reversed=false;descending=true`
    );
  let response = await fetch(url);

  const data = await response.json();

  if (!data.comments || data.comments.length === 0) {
    return null;
  }

  if (data.comments[0]._guid != guid) {
    return null;
  }

  return data.comments[0];
}

// Initialize htm with Preact
const html = htm.bind(h);

const params = new URLSearchParams(window.location.search);
const postURL = params.get("link");

let postGuid = null;

if (postURL.startsWith("https://www.minds.com/newsfeed/")) {
  const parts = postURL.split("/");
  postGuid = parts[parts.length - 1].split("?")[0];
  console.log("POST GUID", postGuid);
} else {
  postGuid = -1;
}

render(html`<${MindComments} />`, document.querySelector("#root"));

let voteCount = 0;

/**
 * Main component
 */
function MindComments() {
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);

  const addLike = (name) => {
    if (likes.length < 30) {
      setLikes((old) => [...old, name]);
      setTimeout(() => {
        setLikes((old) => old.filter((item) => item !== name));
      }, 3000);
    }
  };

  const onComment = async (parent_guid, owner_guid, guid) => {
    console.log("EVENT", parent_guid, owner_guid, guid);
    const comment = await getComment(postGuid, guid, "0:0:0");
    if (comment) {
      setComments((c) => [comment, ...c].slice(0, 20));
    }
  };

  useEffect(() => {
    if (postGuid && postGuid !== -1) {
      socket.emit("join", `entity:metrics:${postGuid}`);
      socket.emit("join", `comments:${postGuid}:0:0:0`);
      socket.on("comment", onComment);
      socket.on(`entity:metrics:${postGuid}`, (event) => {
        if (!event) return;
        event = JSON.parse(event);
        const count = event["thumbs:up:count"] || 0;
        console.log(count, voteCount, event);
        if (count > voteCount) {
          voteCount = count;
          addLike(`${voteCount}`);
        }
      });
      console.log("Listening", postGuid);
    }
    return () => {
      socket.off("comment");
      socket.off("vote");
    };
  }, [postGuid]);

  // Animated the list of comments
  const [parent] = useAutoAnimate();

  if (postGuid === -1) {
    return html`<h1>Wrong link format!</h2><br/><span>Please check</span>`;
  }

  return html`
    <div>
      <div id="commentContainer" ref=${parent}>
        ${comments.map((comment) => Comment({ comment }))}
      </div>
      ${likes.map((name) => html`<${Like} key=${name} name=${name} />`)}
    </div>
  `;
}

/**
 * Animated Like Icon
 */
function Like({ name }) {
  const position = useMemo(getRandomPosition, [name]);
  return html`<div className="like-icon" style=${position}>
    <span className="heart-icon">❤️</span>
  </div>`;
}

/**
 * Comment component
 */
function Comment({ comment }) {
  const avatar = `https://cdn.minds.com/icon/${comment.ownerObj.guid}/medium/${comment.ownerObj.icontime}`;
  const channel = comment.ownerObj;
  const name =
    channel.name && channel.name !== channel.username ? channel.name : "";
  return html`
    <div id="comment" key=${comment.guid}>
      <img src=${avatar} id="avatar" />
      <div>
        <div id="name">${name || channel.username}</div>
        <div id="text">${comment.description}</div>
      </div>
    </div>
  `;
}
