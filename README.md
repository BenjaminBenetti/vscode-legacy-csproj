# VS Code legacy csproj

Are you working on a very old codebase where upgrading to a sdk style project is not possible in a timely manner?
Do you work with other developers who use Visual Studio? Well then this extension is for you.

This vscode extension automatically keeps your legacy csproj (non sdk project) up to date as you add and remove files.

# Features

- When adding files the csproj will automatically be updated.
- When deleting files or directories the csproj will automatically be updated.
- `TODO` When renaming files the csproj will automatically be updated.
- `TODO` When moving files the csproj will automatically be updated.

# Development

## Pre-requisites

- [Node.js](https://nodejs.org/en/) v18 or higher
- [Visual Studio Code](https://code.visualstudio.com/)

## Setup

install dependencies

```bash
npm install
```

compile the extension

```bash
npm run compile
```

Start the extension in debug mode by opening `/src/extension.ts` in vscode and pressing `F5`
