# Pesewas2
Complete Accounting System

## Safer Git Workflow

Follow these steps to keep your repository clean and avoid "ahead" or unstaged-change issues:

1. Pull the latest changes before you work:
   ```bash
git pull origin main
```
2. Check your current state:
   ```bash
git status
```
3. Stage only files you want to keep:
   ```bash
git add <file1> <file2>
```
4. Commit with a clear message:
   ```bash
git commit -m "Describe your change"
```
5. Push your commit to GitHub:
   ```bash
git push origin main
```

## Recommended Git settings for Windows

Run these once if you are on Windows to normalize line endings safely:

```bash
git config --global core.autocrlf true
git config --global core.safecrlf warn
```

## Helpful Git aliases

You can make Git easier to use with these aliases:

```bash
git config --global alias.st status
git config --global alias.ci commit
git config --global alias.co checkout
git config --global alias.last "log -1 --oneline --decorate"
```

## What was added

- `.gitattributes` to normalize text files and avoid CRLF issues
- `.editorconfig` to keep file formatting consistent across editors
