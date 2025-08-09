// GitHub API Configuration
// Replace these values with your actual GitHub repository details
const GITHUB_CONFIG = {
    // Your GitHub username/organization
    owner: 'YOUR_GITHUB_USERNAME',
    
    // Your repository name
    repo: 'yek-salai-website',
    
    // GitHub Personal Access Token (create one at https://github.com/settings/tokens)
    // Required scopes: public_repo (for public repos) or repo (for private repos)
    token: 'YOUR_GITHUB_TOKEN',
    
    // API base URL
    apiBase: 'https://api.github.com',
    
    // Issue labels for different types of submissions
    labels: {
        feedback: ['community-feedback', 'user-feedback'],
        surname: ['surname-submission', 'community-review'],
        bug: ['bug', 'community-feedback'],
        feature: ['enhancement', 'community-feedback']
    },
    
    // Default assignees (GitHub usernames)
    assignees: [],
    
    // Milestone ID (optional)
    milestone: null
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GITHUB_CONFIG;
} else {
    window.GITHUB_CONFIG = GITHUB_CONFIG;
} 