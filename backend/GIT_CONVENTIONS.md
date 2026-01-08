# Git Conventions - Smart Moto Service Center

## Branch Naming Convention

### Main Branches
- `main` - Production-ready code
- `develop` - Integration branch for new features

### Feature Branches
- `feature/<feature-name>` - For new features
  - Examples: `feature/user-auth`, `feature/product-catalog`, `feature/job-tracking`
- `bugfix/<issue-id>-<short-description>` - For bug fixes
  - Examples: `bugfix/123-login-error`, `bugfix/456-payment-calculation`
- `hotfix/<issue-id>-<short-description>` - For urgent production fixes
  - Examples: `hotfix/789-critical-security-patch`
- `refactor/<short-description>` - For code refactoring
  - Examples: `refactor/service-layer`, `refactor/database-relations`

## Commit Message Convention

ใช้ [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi colons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Examples:

```bash
feat(auth): add JWT authentication
fix(payments): correct total amount calculation
docs(api): update Swagger documentation
refactor(services): extract common validation logic
test(jobs): add unit tests for job service
chore(deps): update NestJS to v11
```

### Subject Guidelines:
- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Keep it concise (50 characters or less if possible)

### Body (Optional):
- Explain the "what" and "why" vs "how"
- Wrap at 72 characters
- Can include multiple paragraphs

### Footer (Optional):
- Reference issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: <description>`

## Pull Request Guidelines

1. **Title**: Use the same format as commit messages
2. **Description**: Fill out the PR template completely
3. **Size**: Keep PRs focused and reasonably sized
4. **Review**: Require at least 1 approval before merging
5. **Tests**: All tests must pass
6. **Linter**: No linter errors

## Workflow

1. Create feature branch from `develop`
2. Make commits following convention
3. Push to remote
4. Create PR targeting `develop`
5. After review and approval, merge via "Squash and merge"
6. Delete feature branch after merge

## Examples

### Good Commit Messages:
```
feat(jobs): add job status tracking
fix(api): resolve 401 unauthorized error
docs(readme): update setup instructions
refactor(services): improve error handling
```

### Bad Commit Messages:
```
update code
fix bug
WIP
changes
```


