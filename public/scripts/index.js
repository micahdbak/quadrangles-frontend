// index.js
// script for index.html

import {
	populate,
	spawn,
	spawnCreate,
	getCookie,
	setCookie,
	getTime
} from "./quadrangles.js";

window.onload = () => {
	document.getElementById("create").onclick = () =>
		spawnCreate(document.getElementById("create"));

	// handle cookie for selected topic
	let topic = getCookie("topic");
	if (topic === undefined) {
		topic = "root";
		setCookie("topic", topic);
	}

	// browser parameters; e.g., for post
	const params = new URLSearchParams(window.location.search);

	let topicInput = document.getElementById("topic");
	topicInput.value = `:${topic}`;
	topicInput.oninput = () => {
		if (topicInput.value[0] != ':')
			topicInput.value = ":" + topicInput.value;

		if (topicInput.value.length > 5)
			topicInput.value = topicInput.value.substring(0, 5);
	};
	topicInput.oninput(); // ensure that topic from cookies is valid
	topicInput.onchange = async () => {
		let message = document.getElementById("message");
		message.innerHTML = "Loading...";

		// get current topic from topic input (crop to exclude the ':')
		topic = topicInput.value.substring(1, topicInput.value.length);
		setCookie("topic", topic);

		let response, posts;

		// communicate with api to receive posts on this topic
		try {
			response = await fetch("/api/t/" + topic);

			if (!response.ok) {
				message.innerHTML = `Received ${response.status}.`;
				return;
			}

			posts = await response.json();
		} catch {
			message.innerHTML = "Error retrieving posts.";
			return;
		}

		// provide information on number of posts received
		message.innerHTML = `Loaded ${posts.length} post${posts.length == 1 ? '' : 's'}.`;
		populate(posts, params.get("post")); // populate #posts with posts
	};
	topicInput.onchange(); // load topic specified by cookie
};
