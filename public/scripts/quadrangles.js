const HOST = "localhost:8080";

function header(post) {
	let text = post == null ? `
		<input id="topic" type="text" maxlength="5" value=":root"></input>
		<h3 id="message"></h3>
	` : `
		<h2>?post=${post.pid}</h2>
		<a href="/index.html">Go Back</a>
	`;

	let header = document.createElement("header");
	header.innerHTML = `
		<div class="group">
			<h1>Quadrangles</h1>
			${text}
		</div>
		<div class="group">
			<a id="create" class="btn">Create</a>
		</div>
	`;
	document.body.prepend(header);

	let createButton = document.getElementById("create");

	createButton.onclick = () => {
		spawnCreate(createButton);
	};

	window.onscroll = () => {
		if (window.scrollY > 0)
			header.classList.add("sticky");
		else
			header.classList.remove("sticky");
	};
}

function updatePosts(_posts_i) {
	window.qr_posts_e[window.qr_posts_i].classList.remove("select");
	window.qr_posts_e[_posts_i].classList.add("select");
	window.qr_posts_i = _posts_i;
}

function populate(posts) {
	let root = document.getElementById("root");
	root.innerHTML = `
		<div id="btn-prev" class="btn-icon">&lt;</div>
		<div id="btn-next" class="btn-icon">&gt;</div>
		<div id="comment-box">
			<p id="up-prompt">&uarr;</p>
			<div class="comment-body">
				<p id="down-prompt">&darr;</p>
				<div id="messages"></div>
				<input type="text" id="message"></input>
			</div>
		</div>
	`;

	let comment_box = document.getElementById("comment-box");
	let up_prompt = document.getElementById("up-prompt");
	let down_prompt = document.getElementById("down-prompt");

	up_prompt.onclick = () => {
		comment_box.classList.add("active");
	};
	down_prompt.onclick = () => {
		comment_box.classList.remove("active");
	};

	window.qr_posts_e = [];
	window.qr_posts_i = 0;

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
		window.qr_posts_e.push(post);
		i++;
	}
	window.qr_posts_e[0].classList.add("select");

	let padding_post = document.createElement("div");
	padding_post.classList.add("padding-post");
	padding_post.style.left = `calc(50% + ${i} * 256px)`;
	root.appendChild(padding_post);

	let btn_prev = document.getElementById("btn-prev");
	let btn_next = document.getElementById("btn-next");

	btn_prev.onclick = () => {
		if (window.qr_posts_e === undefined || window.qr_posts_e.length == 0)
			return;

		if (window.qr_posts_i < 1) {
			window.qr_posts_i = 0;
			return;
		}

		updatePosts(window.qr_posts_i - 1);
		root.scrollLeft = 256 * window.qr_posts_i;
	}
	btn_next.onclick = () => {
		if (window.qr_posts_e === undefined || window.qr_posts_e.length == 0)
			return;

		if (window.qr_posts_i >= window.qr_posts_e.length - 1) {
			window.qr_posts_i = window.qr_posts_e.length - 1;
			return;
		}

		updatePosts(window.qr_posts_i + 1);
		root.scrollLeft = 256 * window.qr_posts_i;
	}
}

function spawn(innerHTML, initiator) {
	if (window.qrInitiator && window.qrInitiator.disabled == true)
		return;

	let e = document.createElement("div");

	initiator.disabled = true;
	window.qrInitiator = initiator;

	console.log("TRYING TO");

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

export {
	HOST,
	header,
	populate,
	spawn,
	getCookie,
	setCookie,
	getTime
};
