# Contributing to Asset Manager

Thank you for your interest in contributing to Asset Manager! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots (if applicable)
- Your environment (OS, Node version, browser)

### Suggesting Features

Feature suggestions are welcome! Please:
- Check if the feature has already been suggested
- Provide a clear use case
- Explain how it would benefit users
- Consider implementation complexity

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test thoroughly** - ensure all existing features still work
4. **Update documentation** if you're changing functionality
5. **Write clear commit messages** describing what and why
6. **Submit a pull request** with a comprehensive description

## 💻 Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/your-username/assetManager.git
   cd assetManager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see README.md)

4. Run the development server:
   ```bash
   npm run dev
   ```

## 📝 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` types when possible

### Code Style
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### React Components
- Use functional components with hooks
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use proper prop types

### File Organization
```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Utility functions and API clients
├── types/            # TypeScript type definitions
├── contexts/         # React contexts
└── hooks/            # Custom React hooks
```

## 🧪 Testing

Before submitting a PR:
- Test all affected features manually
- Verify the build succeeds: `npm run build`
- Check for TypeScript errors: `npm run lint`

## 📋 Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: Add support for dividend tracking
fix: Resolve price update issue for Taiwan stocks
docs: Update Google Sheets setup instructions
refactor: Simplify transaction form validation
style: Format code with prettier
```

Prefixes:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `style`: Code style changes (formatting)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🔍 Code Review Process

All submissions require review. We'll:
- Check code quality and style
- Verify functionality
- Ensure documentation is updated
- Test for edge cases
- Provide constructive feedback

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

Feel free to create an issue for any questions about contributing!

---

Thank you for contributing to Asset Manager! 🎉
