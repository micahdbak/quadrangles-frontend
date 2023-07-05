import {
	header,
	spawn,
	getCookie,
	setCookie,
	getTime
} from "./quadrangles.js";

var posts_e, posts_i;

function updatePosts(_posts_i) {
	posts_e[posts_i].classList.remove("select");
	posts_e[_posts_i].classList.add("select");
	posts_i = _posts_i;
}

function populate(posts) {
	let root = document.getElementById("root");
	root.innerHTML = `
		<div id="btn-prev" class="btn-icon">&lt;</div>
		<div id="btn-next" class="btn-icon">&gt;</div>
	`;
	posts_e = [];
	posts_i = 0;

	let i = 0;
	for (const p of posts) {
		let post = document.createElement("div");
		post.classList.add("post");
		post.innerHTML = `
			<img src="/api/f/${p.file}" alt="${p.pid}'s image" />
			<p>${p.text}</p>
			<h3>${getTime(p.time)}</h3>
		`;
		post.style.left = `calc(50% + ${i} * 256px)`;
		post = root.appendChild(post);
		posts_e.push(post);
		i++;
	}
	posts_e[0].classList.add("select");

	let padding_post = document.createElement("div");
	padding_post.classList.add("padding-post");
	padding_post.style.left = `calc(50% + ${i} * 256px)`;
	root.appendChild(padding_post);

	let btn_prev = document.getElementById("btn-prev");
	let btn_next = document.getElementById("btn-next");

	btn_prev.onclick = () => {
		if (posts_e === undefined || posts_e.length == 0)
			return;

		if (posts_i < 1) {
			posts_i = 0;
			return;
		}

		updatePosts(posts_i - 1);
		root.scrollLeft = 256 * posts_i;
	};
	btn_next.onclick = () => {
		if (posts_e === undefined || posts_e.length == 0)
			return;

		if (posts_i >= posts_e.length - 1) {
			posts_i = posts_e.length - 1;
			return;
		}

		updatePosts(posts_i + 1);
		root.scrollLeft = 256 * posts_i;
	};
}

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
