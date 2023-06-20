import { populate, spawn } from "./quadrangles.js";

let posts = [];

window.onload = () => {
	let topicInput = document.getElementById("topic");

	topicInput.oninput = () => {
		if (topicInput.value[0] != ':')
			topicInput.value = ":" + topicInput.value;

		if (topicInput.value.length > 5)
			topicInput.value = topicInput.value.substring(0, 5);
	};

	let message = document.getElementById("message");
	message.innerHTML = "All OK.";

	topicInput.onchange = async () => {
		message.innerHTML = "Loading...";

		let topic = topicInput.value.substring(1, topicInput.value.length);
		let response;

		try {
			response = await fetch("/api/t/" + topic);
		} catch {
			message.innerHTML = "Could not contact server.";
			return;
		}

		if (!response.ok) {
			message.innerHML = `Received ${response.status}.`;
			return;
		}

		posts = await response.json();
		message.innerHTML = `Loaded ${posts.length} post${posts.length == 1 ? '' : 's'}.`;

		populate(posts);
	};
	topicInput.onchange();

	let createButton = document.getElementById("create");

	createButton.onclick = () => {
		spawn(`
			<h1>Create a Post</h1>
			<p>This is where you will create a post.</p>
		`, createButton);
	};
};
