# Contributing to Final Roofing & Retro-Fit CRM

Thank you for considering contributing to our project! This document provides guidelines and instructions to help you contribute effectively.

## Code of Conduct

- Be respectful and inclusive in all communications
- Provide constructive feedback
- Focus on the best outcome for the project

## Branching Strategy

- The `main` branch is protected and requires pull requests
- Create feature branches from `main` using the following naming convention:
  - `feat/feature-name` for new features
  - `fix/issue-description` for bug fixes
  - `chore/task-description` for maintenance tasks
  - `docs/documentation-update` for documentation changes
  - `test/test-description` for test-related changes

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or fixing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:
```
feat(leads): add lead conversion workflow
fix(auth): resolve login redirect issue
docs(readme): update setup instructions
```

## Pull Request Process

1. **Reference Task**: All PRs must reference a task from TASK.md
2. **Description**: Include a summary of changes and the problem being solved
3. **Testing Notes**: Explain how to test your changes
4. **Screenshots**: Include screenshots for UI changes
5. **Review**: Request review from at least one team member

## PR Review Checklist

Before submitting a PR, ensure:

- [ ] Code passes CI checks (lint, type-check, tests)
- [ ] Tests are added for new features or bug fixes
- [ ] No console logs or debugging code remains
- [ ] UI changes preserve existing layout and styling
- [ ] Code follows project conventions in `.cursorrules`
- [ ] Documentation is updated if necessary

## Development Environment

1. Follow the setup instructions in the README.md
2. Install recommended VS Code extensions:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - Cursor AI Pro

## Testing Guidelines

- **Unit Tests**: Required for utility functions and isolated components
- **Integration Tests**: Required for workflows and connected components
- **Test Coverage**: Aim for at least 80% coverage for new code
- **Test Naming**: Use descriptive names following the pattern `should_expectedBehavior_when_condition`

## Code Style

- Follow ESLint and TypeScript configuration
- Use functional components with hooks
- Prefer named exports over default exports
- Keep components under 500 lines (split if necessary)
- Follow DRY principles and create reusable components

## Database Changes

- Create migration files in `supabase/migrations/`
- Include both "up" and "down" migrations
- Test migrations locally before submitting
- Update TypeScript types in `src/integrations/supabase/types.ts`

## Documentation

- Update README.md for significant changes
- Document new features or APIs
- Keep ARCHITECTURE.md up to date with design decisions
- Add inline comments for complex logic

## Questions?

If you have questions or need help, please:
1. Check existing documentation
2. Search for similar issues
3. Ask in the project's communication channel
4. Create an issue with the "question" label
