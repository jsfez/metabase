git reset HEAD~1
rm ./backport.sh
git cherry-pick 3e6612f075746ed2704d072606fb11daa6a59fae
echo 'Resolve conflicts and force push this branch.\n\nTo backport translations run: bin/i18n/merge-translations <release-branch>'
