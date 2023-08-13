// quadrangles.js
// generalized functions for Quadrangles

const HOST = "localhost:8080";

function close_ws() {
	// disable comment box
	document.getElementById("comment-box").classList.remove("active");

	// attempt to close websocket
	try {
		window.qr_ws.close();
	} catch {}
	window.qr_ws = null;
}

function init_ws(pid) {
	let comment_box = document.getElementById("comment-box");

	if (window.qr_ws != null) {
		try {
			window.qr_ws.close();
		} catch {}
		window.qr_ws = null;
	}

	// invalid post
	if (pid == -1)
		return;

	// attempt to open websocket for this post
	try {
		window.qr_ws = new WebSocket(`ws://${HOST}/api/ws/${pid}`);
	} catch { return; } // return on failure to do so

	window.qr_ws.addEventListener("message", (e) => {
		// div that stores all received messages
		let messages = document.getElementById("messages");
		let m = JSON.parse(e.data); // received message

		// create formatted p element for this message
		let message = document.createElement("div");
		message.classList.add("message");
		message.innerHTML = `
			<h3>${getShortTime(m.time)}</h3>
			<p>${m.text}</p>
		`;

		// add element to messages
		messages.appendChild(message);
		messages.scroll({ // scroll to newly received message
			top: messages.scrollHeight - messages.offsetHeight,
			left: 0,
			behavior: "smooth"
		});
	});

	// websocket is open; activate comment box
	comment_box.classList.add("active");
	let return_prompt = document.getElementById("return-prompt");
	return_prompt.onclick = () => close_ws();

	// element that receives user input (new messages)
	let ws_message = document.getElementById("ws-message");
	ws_message.value = ""; // reset previously typed message
	if (ws_message.getAttribute("keypress-listener") != "true") {
		ws_message.setAttribute("keypress-listener", "true");
		ws_message.addEventListener("keypress", (e) => {
			// on enter key pressed
			if (e.key == "Enter") {
				// attempt to send message to server
				try {
					window.qr_ws.send(ws_message.value);
				} catch {
					let messages = document.getElementById("messages");
					// notify user of failure
					messages.innerHTML += `<p><span class="info">Could not send message.</span></p>`;
				}

				ws_message.value = "";
			}
		});
	}

	messages.innerHTML = ""; // reset messages to nothing
	messages.style.visibility = "hidden"; // temporarily hide messages

	// after a short period of time,
	// scroll to bottom of received messages instantly,
	// then make messages visible
	setTimeout(() => {
		messages.scroll({
			top: messages.scrollHeight - messages.offsetHeight,
			left: 0,
			behavior: "instant"
		});
		messages.style.visibility = "visible";
	}, 100);
}

// selectPost: takes in posts_i; index in an array of posts visible under a topic
function selectPost(posts_i) {
	// ensure that index is valid
	if (posts_i < 0 || posts_i >= window.qr_posts_e.length || window.qr_posts_i == posts_i)
		return;

	if (window.qr_posts_i != -1) {
		window.qr_posts_e[window.qr_posts_i].classList.remove("select");
	}

	window.qr_posts_e[posts_i].classList.add("select");
	window.qr_posts_i = posts_i;
	window.history.replaceState({}, null, `?post=${window.qr_posts[window.qr_posts_i].pid}`);
}

// populate: populates the index page with an array of posts
function populate(posts, selected_pid) {
	window.qr_posts = posts;
	window.qr_posts_e = [];
	window.qr_posts_i = -1;

	let scroller = document.getElementById("scroller");
	let root = getComputedStyle(document.body);
	let scrollw = // space between each post; scroll width
		parseInt(root.getPropertyValue("--postsz")) +
		2*parseInt(root.getPropertyValue("--postpad")) +
		2*parseInt(root.getPropertyValue("--postmar"));
	let scrollto = (_i, _behavior) => {
		scroller.scroll({
			"top": 0,
			"left": _i * scrollw,
			"behavior": _behavior
		});
		selectPost(_i);
	};

	let _posts = document.getElementById("posts");
	_posts.innerHTML = "";
	let i = 0, selected_i = -1;

	for (const p of posts) {
		let post = document.createElement("div");
		post.classList.add("post");
		post.innerHTML = `
			<img src="/api/f/${p.file}" alt="${p.pid}'s image" />
			<h3>${getTime(p.time)}</h3>
			<p>${p.text}</p>
		`;
		let open_prompt = document.createElement("a");
		open_prompt.innerHTML = "Open";
		open_prompt.onclick = () => init_ws(p.pid);
		post.appendChild(open_prompt);
		const _i = i;
		post.onclick = () => {
			// jumping to a post is only allowed if it isn't selected
			if (post.classList.contains("select"))
				return;

			// scroll to this post
			scroller.scroll({
				"top": 0,
				"left": _i * scrollw,
				"behavior": "smooth"
			});
		};

		post = _posts.appendChild(post);
		window.qr_posts_e.push(post);

		if (p.pid == selected_pid)
			selected_i = i;

		i++;
	}

	// post selection is invalid
	if (selected_i == -1) {
		// select the first post instead
		selected_pid = posts[0].pid;
		selected_i = 0;
	}

	scroller.onscroll = () => {
		let x = scroller.scrollLeft + scrollw/2;
		selectPost(Math.floor(x/scrollw));
	};

	// scroll to selected post
	scroller.scroll({
		"top": 0,
		"left": selected_i * scrollw,
		"behavior": "instant"
	});
	selectPost(selected_i);
}

function spawn(innerHTML, initiator) {
	if (window.qrInitiator && window.qrInitiator.disabled == true)
		return;

	let e = document.createElement("div");

	initiator.disabled = true;
	window.qrInitiator = initiator;

	e.classList.add("menu");
	e.innerHTML = `
		<a id="close" class="btn-icon" onclick="
			window.qrInitiator.disabled = false;
			this.parentElement.remove();
			">&times;</a>
		${innerHTML}
	`;

	document.body.appendChild(e);
}

function spawnCreate(initiator) {
	spawn(`
		<input id="create-file" type="file" name="file" /><br>
		<input id="create-topic" type="text" /><br>
		<input id="create-text" type="text" /><br>
		<button id="create-submit">Submit</button>
		<p id="create-message"></p>
	`, initiator);

	let submitButton = document.getElementById("create-submit");
	submitButton.onclick = async () => {
		const message = document.getElementById("create-message");

		let fileForm = new FormData();
		const fileInput = document.getElementById("create-file");

		fileForm.append("file", fileInput.files[0]);

		let file;

		try {
			file = await fetch("/api/file", {
				method: "POST",
				body: fileForm
			});
		} catch {
			message.innerHTML = "Failed to upload file.";
			return;
		}

		if (!file.ok) {
			message.innerHTML = `Server responded ${file.status}`;
			return;
		}

		message.innerHTML = "File uploaded...";

		const fid = parseInt(await file.text());
		const topic = document.getElementById("create-topic").value;
		const text = document.getElementById("create-text").value;

		let postForm = new FormData();

		postForm.append("fid", fid);
		postForm.append("topic", topic);
		postForm.append("text", text);

		let post;

		try {
			post = await fetch("/api/post", {
				method: "POST",
				body: postForm
			});
		} catch {
			message.innerHTML = "Failed to create post.";
			return;
		}

		if (!post.ok) {
			message.innerHTML = `Server responded ${post.status}.`;
			return;
		}

		const pid = await post.json();
		window.location = `/post?pid=${pid}`;
	};
}

function getCookie(key) {
	let v = document.cookie.split("; ").find((s) => s.startsWith(`${key}=`));

	if (v === undefined)
		return undefined;

	return v.split("=")[1];
}

function setCookie(key, value) {
	document.cookie = `${key}=${value}`;
}

function getTime(unix) {
	const options = {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric"
	};

	let d = new Date(unix * 1000);

	return d.toLocaleDateString("en-US", options);
}

function getShortTime(unix) {
	const options = {
		hour: "numeric",
		minute: "numeric"
	};

	let d = new Date(unix * 1000);

	return d.toLocaleDateString("en-US", options);
}

export {
	HOST,
	populate,
	spawn,
	spawnCreate,
	getCookie,
	setCookie,
	getTime,
	getShortTime
};
