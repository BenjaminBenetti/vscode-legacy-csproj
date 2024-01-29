# VS Code legacy csproj

Are you working on a very old codebase where upgrading to an sdk style project is not possible in a timely manner?
Do you work with other developers who use Visual Studio? Well then this extension is for you.

This vscode extension automatically keeps your legacy csproj (non sdk project) up to date as you add and remove files.

<img src="./doc/readme-video_2.gif?raw=true">

# Features

- When performing normal operations in the file explorer (add, rename, delete, copy) this extension will automatically update the appropriate csproj file.
- Produces a csproj that is compatible Visual Studio. That is
  to say, if some developers use Visual Studio and others use vscode, the csproj won't constantly reformat
  as developers switch between the two, causing unnecessary git changes.
- Context menu actions to manually add, and remove files from the csproj
- Sync csproj with file system (add missing files, remove files that don't exist on disk)
- Indicator on status bar showing if the current file is in the csproj.
- `.gitignore` is respected (configurable).

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
