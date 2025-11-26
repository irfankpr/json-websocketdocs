# json-websocketdocs

A lightweight, browser-based WebSocket documentation and testing tool driven by a simple JSON schema.

This project was built to solve a real gap: REST APIs have established tooling for documentation, but WebSocket systems usually rely on scattered examples, messages, or guesswork. This tool allows defining WebSocket endpoints in a structured JSON format and instantly transforms it into a usable testing and reference interface — no backend runner or installation required.

---

## Features

- Schema-driven WebSocket documentation UI
- Live WebSocket testing console
- Request and response model previews
- Authentication token field (auto-appended to requests)
- Query parameter UI generated automatically from the schema
- URL preview with dynamic values applied
- Load custom JSON schema directly from the interface
- Light/Dark mode toggle
- Built-in real-time logging for received/sent messages

Just open `index.html` in a browser — nothing to install.

---

## Designed For

- Developers building realtime features  
- Backend teams providing WebSocket interfaces  
- Frontend teams integrating live messaging  
- QA engineers validating WebSocket flows  

Compatible with any WebSocket backend, including:

- Django Channels  
- FastAPI WebSockets  
- Node.js WebSocket servers  
- Go WS servers  
- Phoenix Channels  
- Rust WebSocket frameworks  
- And more

---

## How to Use

1. Clone or download the repository  
2. Open `index.html` in a browser  
3. (Optional) upload your own JSON schema file  
4. Choose an endpoint, fill parameters, and connect  
5. Modify payload and send live messages  
6. Observe real-time responses in the log panel  

No dependencies or build steps.

---

## JSON Schema Format Example

```json
{
  "title": "WebSocket API",
  "base_url": "ws://localhost:8800/",
  "auth_param": "token",
  "channels": [
    {
      "tag": "Chat",
      "path": "ws/chat/{room_id}/",
      "description": "Send and receive messages.",
      "query_params": [
        { "name": "room_id", "description": "Chat room identifier" }
      ],
      "request": {
        "data_model": { "type": "chat.message", "payload": { "text": "string" } }
      },
      "response": {
        "data_model": { "type": "chat.message", "payload": { "text": "string" } }
      }
    }
  ]
}
```

Update this file or load another JSON schema via the UI.

---

## Roadmap

- Save last used schema (localStorage)
- Schema validation messaging
- Import schema via URL
- Export request/response history

---

## Contributing

Pull requests, improvements, and ideas are welcome.  
If you've used this in your workflow and have feedback, feel free to open an issue.

---

⭐ If this tool saves you time or helps your team collaborate better, consider giving the repository a star.



---

## 🧵 Behind the Build

This project wasn’t something random — it came from a real problem in day-to-day development.

As a backend developer, I always care about giving **clear, reliable documentation** to the frontend developers I work with. Good documentation reduces confusion, prevents guesswork, and keeps teamwork smooth.

Tools like DRF Spectacular make documenting REST APIs effortless — everything is structured, testable, and shareable.

But when our team introduced real-time features using WebSockets, everything changed — and not in a good way.

There was:

- No consistent format for documenting WebSocket endpoints  
- No unified way to show request and response structures  
- No built-in testing interface like REST tools provide  
- No “single source of truth” frontend developers could trust  

Every method found online felt incomplete, improvised, or too tied to specific frameworks.  
Nothing felt like:  
> **“Okay, THIS is how WebSocket docs should look.”**

So instead of accepting chaos as the standard — I built this.

Not with generators.  
Not with templates.  
Not with frameworks.

The entire project — including this README — was built through **vibe coding**.  
I didn’t manually type a single line.  
It evolved naturally, idea by idea.

💡 The goal was simple:

> Make WebSocket docs feel as natural and usable as REST API docs.

If this project helps even one more developer avoid the same confusion we faced — then it already succeeded.

---

✨ Thanks for visiting — and if this project helps you or your team, a ⭐ means a lot.
