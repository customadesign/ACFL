#!/bin/bash

# Script to fix Git author information and remove Timqtzy from commit history

echo "Starting Git history cleanup..."

# Create a new branch for the cleaned history
git checkout -b clean-history

# Use git filter-branch to rewrite commit history
git filter-branch --env-filter '
    # Change author information for commits by Timqtzy
    if [ "$GIT_AUTHOR_NAME" = "Timqtzy" ]; then
        export GIT_AUTHOR_NAME="Customadesign"
        export GIT_AUTHOR_EMAIL="pat@customadesign.com"
    fi
    
    # Change committer information for commits by Timqtzy
    if [ "$GIT_COMMITTER_NAME" = "Timqtzy" ]; then
        export GIT_COMMITTER_NAME="Customadesign"
        export GIT_COMMITTER_EMAIL="pat@customadesign.com"
    fi
' --tag-name-filter cat -- --branches --tags

echo "Git history cleanup completed!"
echo "New branch 'clean-history' has been created with corrected author information."
echo ""
echo "To apply these changes:"
echo "1. Review the changes: git log --oneline"
echo "2. Force push to update remote: git push origin clean-history --force"
echo "3. Switch to clean-history branch: git checkout clean-history"
echo "4. Delete old main branch and rename: git branch -D main && git branch -m main" 