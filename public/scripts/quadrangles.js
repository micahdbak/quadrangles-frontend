function populate(posts) {
	let _posts = document.getElementById("posts");

	_posts.innerHTML = "";

	for (const p of posts) {
		let text = p.text;

		if (text.length > 100)
			text = text.substring(0, 100) + "...";

		_posts.innerHTML += `
			<div class="post">
				<img src="${p.file}" />
				<section>
					<!--<h1>${p.title}</h1>-->
					<p>${text}</p>
					<a href="post.html?p=${p.pid}">
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

export { populate, spawn };
