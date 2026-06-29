# Asana AI Agent - Setup Instructions

This project simulates an AI-powered project management assistant integrated with Asana, designed specifically for a B2B SaaS eCommerce product team.

## Prerequisites
- Node.js installed
- An Anthropic API Key (Claude)

## Setup Instructions

1. **Install Dependencies**
   Run the following command in the terminal:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root of the project and add your Anthropic API Key:
   ```env
   ANTHROPIC_API_KEY=your_api_key_here
   ```

3. **Start the Backend Server**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`.

4. **Connect Frontend to Backend**
   Open `index.html` and ensure the `BACKEND` variable points to your server (e.g., `http://localhost:3000/chat`).

5. **Open the Frontend**
   Simply open `index.html` in your browser. You can double-click it, drag it into Chrome/Safari, or use a tool like VS Code Live Server.

## Features
- **Context-Aware**: The agent is pre-prompted with the context of "B2B Commerce Platform v2.0".
- **Team Knowledge**: It knows the active team members (Alex, Sam, Jordan, Priya, Chris).
- **Proactive Assistance**: It provides actionable PM advice and simulates realistic sprint data.

## Architecture Updates (20260628_172025)
- Introduced custom hooks for local state and debouncing.
- Established baseline Error Boundary component.
- Centralized shared types and utilities.
