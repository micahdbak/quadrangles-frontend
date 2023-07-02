import { HOST, header } from "./quadrangles.js";

function err(e, message) {
	e.innerHTML = `
		<div class="col">
			<h1>${message}</h1>
		</div>
	`;
}

window.onload = async () => {
	const params = new URLSearchParams(window.location.search);
	let root = document.getElementById("root");

	if (!params.has("pid")) {
		err(root, "Improper URL.");
		return;
	}

	let pid = params.get("pid");
	let res;

	try {
		res = await fetch(`/api/p/${pid}`);
	} catch {
		err(root, "API error.");
		return;
	}

	if (!res.ok) {
		err(root, "Post does not exist.");
		return;
	}

	let post = await res.json();

	header(post);

	let postDesc = document.getElementById("post-desc");
	postDesc.innerHTML = `
		<img src="/api/f/${post.file}" />
		<p>${post.pid} (:${post.topic}) ${post.text}</p>
		<h3>Posted: ${post.time}</h3>
	`;

	let messages = document.getElementById("messages");
	let message = document.getElementById("message");

	const ws = new WebSocket(`ws://${HOST}/api/ws/${pid}`);

	ws.addEventListener("message", (e) => {
		let m = JSON.parse(e.data);
		messages.innerHTML += `
			<p>(${m.cid}) Posted ${m.time}: ${m.text}</p>
		`;
	});

	message.addEventListener("keypress", (e) => {
		// on enter key pressed
		if (e.key == "Enter") {
			// send message to server
			ws.send(message.value);

			// reset value
			message.value = "";
		}
	});
}
