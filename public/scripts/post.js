import { HOST, header, getTime } from "./quadrangles.js";

function err(message) {
	// ignore message; temporary
	window.location = "index.html";
}

window.onload = async () => {
	const params = new URLSearchParams(window.location.search);

	if (!params.has("pid")) {
		err("Improper URL.");
		return;
	}

	let pid = params.get("pid");
	let res;

	try {
		res = await fetch(`/api/p/${pid}`);
	} catch {
		err("API error.");
		return;
	}

	if (!res.ok) {
		err("Post does not exist.");
		return;
	}

	let post = await res.json();

	header(post);

	let postDesc = document.getElementById("post-desc");
	postDesc.innerHTML = `
		<img src="/api/f/${post.file}" alt="Image for ${post.pid}" />
		<p>(${post.pid}) :${post.topic}<br>${post.text}</p>
		<h3>Posted: ${getTime(post.time)}</h3>
	`;

	let messages = document.getElementById("messages");
	let message = document.getElementById("message");

	messages.style.visibility = "hidden";

	setTimeout(() => {
		messages.scroll({
			top: messages.scrollHeight - messages.offsetHeight,
			left: 0,
			behavior: "auto"
		});
		messages.style.visibility = "visible";
	}, 100);

	const ws = new WebSocket(`ws://${HOST}/api/ws/${pid}`);

	ws.addEventListener("message", (e) => {
		let m = JSON.parse(e.data);
		messages.innerHTML += `
			<p><span class="info">(${m.cid}) Posted ${getTime(m.time)}:</span> ${m.text}</p>
		`;
		messages.scroll({
			top: messages.scrollHeight - messages.offsetHeight,
			left: 0,
			behavior: "smooth"
		});
	});

	message.addEventListener("keypress", (e) => {
		// on enter key pressed
		if (e.key == "Enter") {
			// send message to server
			try {
				ws.send(message.value);
			} catch {
				messages.innerHTML += `<p>Could not send message.</p>`;
			}

			// reset value
			message.value = "";
		}
	});
}
