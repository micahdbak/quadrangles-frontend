const TRANSITION_SPEED = 500; // ms
const QRI = [ "qrg", "qrl", "qrc", "qrr", "qrg" ];

let last = null;

class CPost {
	constructor(innerHTML, root, pos) {
		this.innerHTML = innerHTML;
		this.root = root;
		this.i = pos + 1; // position; 0: l, 1: c, 2: r
		this.e = null;
	}
	create() {
		this.e = document.createElement("div");
		this.e.classList.add("post");
		this.e.classList.add(QRI[this.i]);
		this.e.innerHTML = this.innerHTML;
		this.root.appendChild(this.e);
	}
	timeout() {
		if (last != null && last.e != null && (last.i <= 0 || last.i >= 4))
			last.e.style.display = "none";

		last = this;

		setTimeout(() => {
			if (this.e != null) {
				this.e.remove();
				this.e = null;
			}
		}, TRANSITION_SPEED);
	}
	left() {
		this.i--;

		if (this.e != null) {
			// check if image is ready to remove
			if (this.i <= 0)
				this.timeout();

			this.e.classList.replace(
				QRI[this.i + 1],
				QRI[this.i]
			);
		} else
		if (this.i > 0 && this.i < 4)
			this.create();
	}
	right() {
		this.i++;

		if (this.e != null) {
			// check if image is ready to remove
			if (this.i >= 4)
				this.timeout();

			this.e.classList.replace(
				QRI[this.i - 1],
				QRI[this.i]
			);
		} else
		if (this.i > 0 && this.i < 4)
			this.create();
	}
}

export default class Carousel {
	constructor(posts) {
		this.root = document.getElementById("root");
		this.carousel = [];
		this.i = 0;

		for (let i = 0; i < posts.length; i++) {
			let p = posts[i];
			let post = new CPost(`
				<img src="/api/f/${p.file}" alt="" />
				<section>
					<p>${p.text}</p>
					<a href="post?pid=${p.pid}">
						View &nearr;
					</a>
				</section>
			`, this.root, i + 1);
			this.carousel.push(post);
		}

		for (let i = 0; i < 3; i++)
			this.carousel[i].create();
	}
	left() {
		if (this.i == this.carousel.length - 1)
			return;

		this.i++;

		for (let i = 0; i < this.carousel.length; i++)
			this.carousel[i].left();
	}
	right() {
		if (this.i == 0)
			return;

		this.i--;

		for (let i = 0; i < this.carousel.length; i++)
			this.carousel[i].right();
	}
}
