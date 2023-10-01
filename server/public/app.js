const socket = io('ws://localhost:3500');

function waitForVariableValue() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                clearInterval(interval);
                resolve();
            }
        }, 10);
    });
}

var targetObj = {};
var targetProxy = new Proxy(targetObj, {
    set: async function (target, key, value) {
        if (typeof document.visibilityState !== "undefined" && document.visibilityState === "hidden") await waitForVariableValue();
        target[key] = value;
        if (target[key] == 1) document.dispatchEvent(new Event("scrollDown"));
        return true;
    }
});

function sendMessage(e) {
    e.preventDefault();
    const input = document.querySelector('input');
    if (input.value) {
        socket.emit('message', input.value);
        input.value = "";
    }
    input.focus();
}

document.querySelector('form').addEventListener('submit', sendMessage);

socket.addEventListener("open", (e) => {
    socket.send("Server opened...");
})

socket.on("message", (data) => {
    const li = document.createElement("li");
    li.textContent = data.type === "message" ? `${data.shortId}: ${data.text}` : data.type === "disconnect" ? `User ${data.shortId} disconnected.` : "";
    li.title = `id: ${data.id}`;
    document.querySelector("ul").appendChild(li);
    targetProxy.scroll = 1;
})

document.addEventListener("scrollDown", () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        left: 0,
        behavior: "smooth"
    });
    targetProxy.scroll = 0;
})
