# 🦂 Wumpus World — Dynamic Logic Agent

A browser-based implementation of the classic **Wumpus World** AI problem, featuring a dynamic logic agent that navigates a grid environment, reasons about dangers, and hunts for gold.

> Built with vanilla JavaScript, HTML, and CSS — no frameworks required.

---

## 🎮 Demo

[**Live Demo →**](https://wumpus-world-rosy.vercel.app)

---

## 📖 About

The Wumpus World is a well-known problem in artificial intelligence, originally described in *Artificial Intelligence: A Modern Approach* by Russell & Norvig. It demonstrates the power of **knowledge-based agents** using logical inference to act in a partially observable environment.

The agent is placed in a grid-based cave and must:

- Navigate rooms without falling into **pits** (detected by nearby **breezes**)
- Avoid or eliminate the **Wumpus** (detected by nearby **stenches**)
- Locate and grab the **gold** (detected by a **glitter** in the same room)
- Escape the cave alive

The agent builds a knowledge base as it explores, using percepts to deduce which rooms are safe, which are dangerous, and which have been visited.

---

## ✨ Features

- **Dynamic logic agent** that updates its knowledge base in real time
- **Percept system** — breezes, stenches, glitter, bumps, and screams
- **Interactive grid visualization** rendered in the browser
- **Step-by-step agent execution** to observe decision-making
- Fully client-side — runs without a backend

---

## 🛠️ Tech Stack

| Layer    | Technology        |
|----------|-------------------|
| Logic    | JavaScript (ES6+) |
| UI       | HTML5             |
| Styling  | CSS3              |
| Hosting  | Vercel            |

---

## 🚀 Getting Started

### Dependencies

**Runtime (no dependencies):** This project has **zero runtime dependencies**. It uses vanilla JavaScript, HTML, and CSS only — no npm packages required.

**Development (optional):** If you want to run a local dev server:
- [Node.js](https://nodejs.org/) 14+ (includes `npm`)

### Installation & Setup

#### Option 1: Run Directly (Recommended)

No installation needed. Just clone and open in your browser:

```bash
git clone https://github.com/Mzt00/WumpusWorld.git
cd WumpusWorld
```

Then open `index.html` in your browser (double-click the file, or right-click → "Open with").

#### Option 2: Run with a Local Dev Server

If you prefer to use a local server for development:

```bash
# Clone the repository
git clone https://github.com/Mzt00/WumpusWorld.git
cd WumpusWorld

# Start a simple HTTP server (requires Node.js)
npx serve .
```

Then open `http://localhost:3000` in your browser.

**Alternative servers** (if you prefer):
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using PHP
php -S localhost:8000
```

---

## 📁 Project Structure

```
WumpusWorld/
├── index.html        # Entry point and UI layout
├── style.css         # Grid and agent styling
├── package.json      # Project metadata only (no dependencies)
└── src/              # Agent logic and game engine
```

### About package.json

The `package.json` file is included for metadata purposes (project name, version, description) and may contain dev tools like `serve` for local testing. **It contains no runtime dependencies** — the application works entirely without installing anything.

---

## 🧠 How the Agent Works

1. **Perceive** — The agent reads percepts from its current cell (breeze, stench, glitter, etc.)
2. **Update knowledge base** — Percepts are used to infer facts about neighboring cells
3. **Infer safe moves** — Cells with no evidence of pits or Wumpus are marked safe
4. **Act** — The agent moves to the safest known cell, shoots if the Wumpus location is deduced, or grabs gold when detected
5. **Repeat** — Until gold is retrieved and the agent escapes, or it meets an unfortunate end

---

## 🗺️ Game Rules

| Percept  | Meaning                                      |
|----------|----------------------------------------------|
| Breeze   | A pit is in an adjacent room                 |
| Stench   | The Wumpus is in an adjacent room            |
| Glitter  | Gold is in the current room                  |
| Bump     | The agent walked into a wall                 |
| Scream   | The Wumpus has been killed by an arrow       |

**Win condition:** Grab the gold and return to the starting cell.  
**Lose condition:** Enter a room containing the Wumpus or a pit.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request for bug fixes, new features, or improvements to the agent's reasoning logic.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request


## 🙏 Acknowledgements

- *Artificial Intelligence: A Modern Approach* — Russell & Norvig
- Original concept: *Hunt the Wumpus* by Gregory Yob (1973)
