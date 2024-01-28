# VS Code legacy csproj

Are you working on a very old codebase where upgrading to an sdk style project is not possible in a timely manner?
Do you work with other developers who use Visual Studio? Well then this extension is for you.

This vscode extension automatically keeps your legacy csproj (non sdk project) up to date as you add and remove files.

# Features

- When adding files the csproj will automatically be updated.
- When deleting files or directories the csproj will automatically be updated.
- When renaming files the csproj will automatically be updated.
- When moving files the csproj will automatically be updated.

# Development

## Try it on the web

Simply select the green "Code" button in the top right of the GitHub repo page.
Then select "Codespaces" and "Open in Codespace".

## Setup

Open the project in a `devcontainer` compatible IDE like vscode.
When prompted to open the project in a container select `Reopen in Container`.

You're ready to dev! 🎉

## Build & Run

install dependencies

```bash
npm install
```

compile the extension

```bash
npm run compile
```

Start the extension in debug mode by opening `/src/extension.ts` in vscode and pressing `F5`
