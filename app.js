let channelsData = null;
const sockets = {};

function loadSchema(json) {
    channelsData = json;
    document.getElementById("title").textContent = json.title;
    document.getElementById("base-url").value = json.base_url;


    renderChannels();
}

/* Load default channels.json */
fetch("channels.json")
    .then(r => r.json())
    .then(loadSchema);

/* Theme Toggle */
function toggleDark() {
    const btn = document.querySelector(".toggle-btn");
    document.body.classList.toggle("light");
    btn.textContent = document.body.classList.contains("light") ? "🌙 Dark" : "🌞 Light";
}

/* Handle uploaded schema file */
document.getElementById("json-upload").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            const json = JSON.parse(e.target.result);
            loadSchema(json);
        } catch {
            alert("Invalid JSON file");
        }
    };
    reader.readAsText(file);
});

/* Rendering UI */

function renderChannels() {
    const root = document.getElementById("channels-root");
    root.innerHTML = "";

    const groups = {};

    channelsData.channels.forEach(ch => {
        if (!groups[ch.tag]) groups[ch.tag] = [];
        groups[ch.tag].push(ch);
    });

    Object.keys(groups).forEach(tag => {
        root.innerHTML += `<div class="tag-header">${tag}</div>`;
        groups[tag].forEach((endpoint, i) => buildEndpoint(tag, i, endpoint, root));
    });

    refreshAllUrls();
}

function buildEndpoint(tag, index, endpoint, root) {
    const id = `${tag}_${index}`;
    const queryFields = (endpoint.query_params ?? [])
        .map(p => `
        <div class="query-row">
            <input class="query-key" value="${p.name}" readonly>
            <input class="query-value" placeholder="${p.description}">
        </div>
    `).join("");

    // Build payload section only if `request` exists
    const payloadSection = endpoint.request
        ? `
            <label>Payload:</label>
            <textarea id="ws-send-${id}">${JSON.stringify(endpoint.request?.data_model || {}, null, 2)}</textarea>
            <button class="btn" onclick="sendWS('${id}')">Send</button>
        `
        : "";


    const div = document.createElement("div");
    div.className = "endpoint";
    div.innerHTML = `
        <div class="endpoint-header" onclick="toggleBody('${id}')">
            <div class="endpoint-path">${endpoint.path}</div>
            <div class="arrow" id="arrow-${id}">▶</div>
        </div>

        <div class="endpoint-body" id="body-${id}">
            <div>${endpoint.description}</div>

            ${endpoint.request ? `<b>Client → Server:</b><pre>${JSON.stringify(endpoint.request.data_model, null, 2)}</pre>` : ""}
            ${endpoint.response ? `<b>Server → Client:</b><pre>${JSON.stringify(endpoint.response.data_model, null, 2)}</pre>` : ""}

            <div class="trybox">
                <label>Query Parameters</label>
                <div id="query-${id}">${queryFields}</div>

                <label>Final URL</label>
                <input id="ws-url-${id}" data-path="${endpoint.path}"/>

                <button class="btn" onclick="connectWS('${id}')">Connect</button>
                <button class="btn-outline" onclick="disconnectWS('${id}')">Disconnect</button>

                ${payloadSection}
                
                <button class="btn-outline" onclick="clearLogs('${id}')">Clear Logs</button>

                <div class="log-box" id="ws-log-${id}">Logs...</div>
            </div>
        </div>
    `;

    root.appendChild(div);
}

/* Live Query Change */
document.addEventListener("input", e => {
    if (e.target.classList.contains("query-value")) {
        const trybox = e.target.closest(".trybox");
        updateFinalURL(trybox.querySelector("input[id^='ws-url']").id.replace("ws-url-", ""));
    }
});

/* URL Builder */
document.getElementById("base-url").addEventListener("input", refreshAllUrls);
document.getElementById("auth-token").addEventListener("input", refreshAllUrls);

function refreshAllUrls() {
    document.querySelectorAll("input[id^='ws-url']").forEach(el => {
        updateFinalURL(el.id.replace("ws-url-", ""));
    });
}

function updateFinalURL(id) {
    const base = document.getElementById("base-url").value;
    const token = document.getElementById("auth-token").value;
    const path = document.getElementById(`ws-url-${id}`).dataset.path;

    const params = [...document.querySelectorAll(`#query-${id} .query-row`)]
        .map(row => {
            const key = row.querySelector(".query-key").value;
            const val = row.querySelector(".query-value").value;
            return val ? `${key}=${encodeURIComponent(val)}` : null;
        })
        .filter(Boolean);

    if (token && channelsData.auth_param) {
        params.unshift(`${channelsData.auth_param}=${token}`);
    }

    document.getElementById(`ws-url-${id}`).value =
        params.length ? `${base}${path}?${params.join("&")}` : `${base}${path}`;
}

/* WebSocket actions */

function connectWS(id) {
    const url = document.getElementById(`ws-url-${id}`).value;
    const log = document.getElementById(`ws-log-${id}`);
    log.innerHTML += `Connecting → ${url}\n`;

    const ws = new WebSocket(url);
    ws.onopen = () => log.innerHTML += "🟢 Connected\n";
    ws.onerror = () => log.innerHTML += "⚠️ Error\n";
    ws.onclose = () => log.innerHTML += "🔌 Disconnected\n";
    ws.onmessage = (e) => {
        let formatted;
        try {
            const json = JSON.parse(e.data);
            formatted = `<pre>${JSON.stringify(json, null, 2)}</pre>`;
        } catch {
            // Not valid JSON → print raw text
            formatted = e.data;
        }

            log.innerHTML += `${formatted}\n`;
    };

    sockets[id] = ws;
}

function disconnectWS(id) {
    sockets[id]?.close();
}

function sendWS(id) {
    const log = document.getElementById(`ws-log-${id}`);
    if (!sockets[id] || sockets[id].readyState !== WebSocket.OPEN) {
        return (log.innerHTML += "❌ Not connected\n");
    }

    let msgText = document.getElementById(`ws-send-${id}`).value;
    let msg = msgText;

    try {
        msg = JSON.stringify(JSON.parse(msgText)); // normalize formatting
    } catch (err) {
        log.innerHTML += "⚠️ Invalid JSON — sending raw text\n";
    }

    sockets[id].send(msg);
    log.innerHTML += `➡️ Sent:\n<pre>${msg}</pre>\n`;
}

function clearLogs(id) {
    document.getElementById(`ws-log-${id}`).innerHTML = "";
}

function toggleBody(id) {
    const body = document.getElementById(`body-${id}`);
    const arrow = document.getElementById(`arrow-${id}`);
    const open = body.style.display === "block";
    body.style.display = open ? "none" : "block";
    arrow.style.transform = open ? "" : "rotate(90deg)";
}
