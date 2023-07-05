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
	spawn,
	getCookie,
	setCookie,
	getTime
};
