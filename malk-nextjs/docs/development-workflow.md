# Development Branch Workflow Guide

## Overview
This guide explains how to work with the development branch in Cursor before pushing changes to production.

## Basic Workflow

### 1. Switch to Development Branch
```bash
git checkout development
```
Verify your current branch in Cursor's bottom status bar - it should show "development"

### 2. Working on Features
- Make your code changes in Cursor as normal
- The changes you make will be isolated to the development branch
- This means your production (master) branch remains untouched and stable

### 3. Testing Your Changes
- When you make changes in the development branch, Vercel will automatically create a preview deployment
- The "Preview" environment handles "All unassigned git branches"
- Every push to development gets a preview URL for testing

### 4. Committing Your Changes
```bash
git add .
git commit -m "Your descriptive commit message"
git push origin development
```

### 5. Reviewing the Preview
- After pushing, Vercel will create a preview deployment
- Test your changes in this preview environment before merging to production
- The preview URL will be different from your production URL

### 6. Pushing to Production
Once you're satisfied with your changes:
```bash
# Switch to master branch
git checkout master

# Merge development into master
git merge development

# Push to production
git push origin master
```

## Practical Example: Updating the Navbar

1. **Start in development**:
```bash
git checkout development
```

2. **Make your changes** in Cursor to the navbar component:
```typescript
// Edit src/components/Navbar.tsx
// Make your changes...
```

3. **Test locally**:
```bash
npm run dev
```

4. **Commit and push**:
```bash
git add .
git commit -m "Update navbar design"
git push origin development
```

5. **Check the preview deployment** in Vercel
   - Vercel will generate a unique URL for your development branch
   - Test thoroughly in this preview environment

6. **If everything looks good**, merge to production:
```bash
git checkout master
git merge development
git push origin master
```

## Pro Tips

1. Always make your changes in development first
2. Use meaningful commit messages
3. Test thoroughly in the preview deployment before merging to master

### Quick Fixes in Development
```bash
# If you're in master, switch back to development
git checkout development
# Make your fixes
# Commit and push again
```

### Pulling Latest Changes
```bash
git checkout development
git pull origin development
```

## Environment Setup in Vercel

Your Vercel project is configured with:
- Production environment tracking the `master` branch
- Preview environment handling all other branches (including development)
- Development environment accessible via CLI

This setup ensures:
- Safe development without affecting the live site
- Automatic preview deployments for testing
- Clear separation between development and production environments

## Remember

The development branch is your safe space to experiment and make changes without affecting the live site. Only merge to master when you're confident everything works as intended. 