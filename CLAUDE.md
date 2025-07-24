# Workflow

Whenever you process a new prompt, always follow this workflow only if there are code changes. Keep this as the baseline, high priority context.

1. First, think through the problem. If it requires code changes, read the codebase for relevant files, and write a plan to the plans/ directory as a markdown file. If there are no code changes, no need to follow the steps below.
2. The plan should have a list of todo items that you can check off as you complete them.
3. Before you begin working, check in with me, asky any clarifying questions, and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
6. Add a review section to the plan file with a summary of the changes you made and any other relevant info.
7. After finishing coding, please explain the functionality and code you built out clearly in detail as well as the packages introduced and why. Walk me through what you changed and how it works. Act like you're a senior engineer teaching me code.

# Code Patterns

Whenever you process a new prompt, always follow the below code patterns only if there are code changes. Keep this as the baseline, high priority context.

1. In the same plans/ directory, write a test file following behavior-driven development principles with cucumber syntax, thinking in the end-user perspective on the key flows that will be delivered. And then in the app's test/ directory, write corresponding Playwright e2e tests only if a UX flow has changed.
2. Follow Test Driven Development.
3. Follow Javascript/Typescript Standard Style.
4. Add comments in the code wherever possible to clarify how the code works and why it was done this way as if I'm a junior developer.
5. Use @apply everywhere where Tailwind is used and follow readable BEM naming conventions.
6. Ensure responsiveness on mobile and desktop.
7. Ensure WCAG 2.1 AA compliance.
8. Ensure the code follows security best practices with no sensitive info and vulnerabilities that can be exploited.
9. Ensure high performance and simple, direct solutions.

# Project Specific

1. Ensure all changes apply to both web and print versions.

<!-- GIT COMMIT: Prepare to push to Github. Don't reference anything about Claude in the commit messages. Selectively add and commit only relevant changes. If changes don't affect the end-user experience on the front-end, treat it as a "chore:" instead of a feat:". Each commit should be clear and focused. Increment the version following Semantic Versioning based on the commits made. -->
