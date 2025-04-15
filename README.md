# ☀️ noonjs

**noonjs** is a powerful zero-boilerplate backend framework for modern web applications.  
Define your entire backend structure in a single **config**, and let noonjs generate the complete API, database models, authentication system, real-time events, and permission logic — automatically.

> 🚀 Fast to start, easy to extend — all with clean code and no clutter.  

> 🔧 **Beta Release**: This is an early release of noonjs. Features are being refined, and your feedback is highly appreciated.

---

## 🌟 Highlights

- 🧩 **Single Config** — define all your schemas, roles, and behaviors in a clean JSON **config**.
- 🔐 **Authentication Out-of-the-Box** — JWT with refresh token support, no setup required.
- 🧑‍🤝‍🧑 **Role-based Permissions** — control exactly who can do what.
- 🔄 **Real-time Support** — built-in Socket.IO for pushing real-time updates.
- 🗂 **Auto CRUD API** — instant REST API generation for all your models.
- 🧪 **Validation** — request validation without writing a single line of code.
---

Full documentation and examples: [https://noonjs.com](https://noonjs.com)

---

## ⚡ Quick Start

### 1. Install noonjs

```bash
npm install noonjs
```
### 2. Usage
```js
import Noonjs from "noonjs"
const noonjs = new Noonjs({config})
noonjs.start()
```