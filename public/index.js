window.onload = () => {
	topic = document.getElementById("topic");

	topic.oninput = () => {
		if (topic.value[0] != ':')
			topic.value = ":" + topic.value;

		if (topic.value.length > 5)
			topic.value = topic.value.substring(0, 5);
	};
};
