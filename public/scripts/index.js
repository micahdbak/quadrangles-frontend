import {
	header,
	populate,
	spawn,
	getCookie,
	setCookie,
	getTime
} from "./quadrangles.js";

window.onload = () => {
	const params = new URLSearchParams(window.location.search);

	if (params.has("post")) {
		window.location = `/post?pid=${params.get("post")}`;
	}

	header(null);

	let topic = getCookie("topic");

	if (topic === undefined) {
		topic = "root";
		setCookie("topic", topic);
	}

	let topicInput = document.getElementById("topic");
	topicInput.value = `:${topic}`;

	topicInput.oninput = () => {
		if (topicInput.value[0] != ':')
			topicInput.value = ":" + topicInput.value;

		if (topicInput.value.length > 5)
			topicInput.value = topicInput.value.substring(0, 5);
	};
	topicInput.oninput();

	let message = document.getElementById("message");
	message.innerHTML = "All OK.";

	topicInput.onchange = async () => {
		message.innerHTML = "Loading...";
		topic = topicInput.value.substring(1, topicInput.value.length);
		setCookie("topic", topic);

		let response, posts;

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

		message.innerHTML = `Loaded ${posts.length} post${posts.length == 1 ? '' : 's'}.`;
		populate(posts);
	};
	topicInput.onchange();
};
