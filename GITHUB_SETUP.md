# GitHub API Integration Setup

This guide will help you set up real GitHub API integration for the Yek Salai website's Community Features.

## Prerequisites

1. A GitHub account
2. A GitHub repository (can be the same as your website repository)
3. Admin access to the repository

## Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give your token a descriptive name (e.g., "Yek Salai Website API")
4. Select the following scopes:
   - For **public repositories**: `public_repo`
   - For **private repositories**: `repo`
5. Click "Generate token"
6. **IMPORTANT**: Copy the token immediately - you won't be able to see it again!

## Step 2: Configure the Website

1. Open `github-config.js` in your website directory
2. Update the following values:
   ```javascript
   const GITHUB_CONFIG = {
       owner: 'YOUR_GITHUB_USERNAME',        // Replace with your GitHub username
       repo: 'yek-salai-website',           // Replace with your repository name
       token: 'YOUR_GITHUB_TOKEN',          // Replace with the token you created
       // ... other settings
   };
   ```

## Step 3: Test the Integration

1. Open your website
2. Go to the Community section
3. Try submitting feedback or a new surname
4. Check your GitHub repository - you should see new issues created automatically

## Step 4: Customize Labels and Settings

You can customize the GitHub integration by modifying these settings in `github-config.js`:

- **Labels**: Change the labels applied to different types of issues
- **Assignees**: Add GitHub usernames to automatically assign issues
- **Milestone**: Set a milestone ID to organize issues

## Troubleshooting

### Common Issues

1. **"GitHub API not configured" message**
   - Make sure you've updated `github-config.js` with your actual GitHub details
   - Check that the token is correct and has the right permissions

2. **"Failed to create GitHub issue" error**
   - Verify your repository exists and is accessible
   - Check that your token has the correct scopes
   - Ensure the repository name and owner are correct

3. **CORS errors**
   - GitHub API supports CORS, but if you're testing locally, make sure you're using a proper web server

### Security Notes

- **Never commit your GitHub token to version control**
- Consider using environment variables for production deployments
- Regularly rotate your personal access tokens
- Use the minimum required permissions for your token

## Fallback Behavior

If GitHub API integration fails for any reason, the system will automatically fall back to local storage. Users will see a notification that their submission was saved locally.

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your GitHub configuration
3. Test with a simple repository first
4. Check GitHub's API status at [status.github.com](https://status.github.com) 