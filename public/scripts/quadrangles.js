const HOST = "localhost:8080";

function populate(posts) {
	let _posts = document.getElementById("posts");

	_posts.innerHTML = "";

	for (const p of posts) {
		let text = p.text;

		if (text.length > 100)
			text = text.substring(0, 100) + "...";

		_posts.innerHTML += `
			<div class="post">
				<img src="/api/f/${p.file}" />
				<section>
					<!--<h1>${p.title}</h1>-->
					<p>${text}</p>
					<a href="post?pid=${p.pid}">
						Open Post &nearr;
					</a>
				</section>
			</div>
		`;
	}
}

function spawn(innerHTML, initiator) {
	if (window.qrInitiator && window.qrInitiator.disabled == true)
		return;

	let e = document.createElement("div");

	initiator.disabled = true;
	window.qrInitiator = initiator;

	e.classList.add("menu");
	e.innerHTML = `
		<p id="close" onclick="
			window.qrInitiator.disabled = false;
			this.parentElement.remove();
			">x</p>
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

export { HOST, populate, spawn, spawnCreate, getCookie, setCookie };