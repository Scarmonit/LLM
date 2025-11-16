# Git Setup Guide for LLM Multi-Provider Framework Project

## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Basic Workflow Commands](#basic-workflow-commands)
4. [Branching Strategy](#branching-strategy)
5. [Best Practices](#best-practices)

## Installation

### Prerequisites
- Ensure you have Git installed on your machine. You can download and install it from [git-scm.com](https://git-scm.com/).
- Basic familiarity with command-line interfaces.

### Install Git
1. **For Windows**: Download the installer from [Git for Windows](https://gitforwindows.org/).
2. **For macOS**: Use Homebrew: `brew install git` or download from the official site.
3. **For Linux**: Use your distribution's package manager, e.g., `sudo apt-get install git` (Debian/Ubuntu).

## Configuration

To set up Git for your user account, run the following commands in your terminal:

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email address
git config --global user.email "youremail@example.com"

# Set the default text editor
git config --global core.editor nano
# or use your preferred text editor

# Verify your configuration
git config --list
```

## Basic Workflow Commands

1. **Clone a repository**:
    ```bash
    git clone https://github.com/Scarmonit/LLM.git
    ```
2. **Check status**:
    ```bash
    git status
    ```
3. **Stage changes**:
    ```bash
    git add <file(s)>
    # or to add all changes
    git add .
    ```
4. **Commit changes**:
    ```bash
    git commit -m "Your commit message"
    ```
5. **Push changes to remote**:
    ```bash
    git push origin <branch-name>
    ```
6. **Pull latest changes from remote**:
    ```bash
    git pull origin <branch-name>
    ```

## Branching Strategy

A clear branching strategy can enhance your workflow and collaboration. This project suggests the following:
- **Main Branch**: `main` - The production-ready code.
- **Development Branch**: `develop` - All feature branches branch from here.
- **Feature Branches**: `feature/branch-name` - Specific features or enhancements.
- **Hotfix Branches**: `hotfix/branch-name` - Quick patches or fixes.

### Creating Branches
To create a new feature branch:
```bash
git checkout -b feature/your-feature-name
```

### Merging Branches
- Once the feature is complete, switch back to the development branch:
    ```bash
    git checkout develop
    ```
- Merge the feature branch:
    ```bash
    git merge feature/your-feature-name
    ```

## Best Practices

1. **Commit often**: Make small, meaningful commits with clear messages.
2. **Use branches**: Always create branches for new features or bug fixes to avoid conflicts.
3. **Pull regularly**: Update your local repository frequently to keep it in sync with the remote.
4. **Documentation**: Keep your code well-documented and maintain a changelog.
5. **Code reviews**: Encourage code reviews through pull requests before merging to ensure quality and shared knowledge.

---

This guide serves as a foundation for working with Git in the LLM Multi-Provider Framework project. For in-depth Git knowledge, consider the official [Git documentation](https://git-scm.com/doc).