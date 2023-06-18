// set to localhost for development; set to an empty string for production
const HOST = "http://localhost:8000";

function populate(arr) {
	let posts = document.getElementById("posts");

	posts.innerHTML = "";

	for (const p of arr) {
		let text = p.text;

		if (text.length > 100)
			text = text.substring(0, 100) + "...";

		posts.innerHTML += `
			<div class="post">
				<img src="${HOST}${p.file}" />
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
			response = await fetch(HOST + "/api/t/" + topic);
		} catch {
			message.innerHTML = "Could not contact server.";
			return;
		}

		if (!response.ok) {
			message.innerHML = `Received ${response.status}.`;
			return;
		}

		let posts = await response.json();
		message.innerHTML = `Loaded ${posts.length} post${posts.length == 1 ? '' : 's'}.`;

		populate(posts);
	};
	topicInput.onchange();
};
