const {exec} = require('child_process');
const axios = require('axios')
const github = require('@actions/github')
const core = require('@actions/core')

async function notifyShortcut() {

  // find all tags with output like:
  // 0e76920bea4381cfc676825f3143fdd5fcf8c21f refs/tags/1.0.0
  exec('git show-ref --tags', (err, showRefOutput, stderr) => {

    if (err) {
      console.log('\x1b[33m%s\x1b[0m', 'Could not find any tags because: ');
      console.log('\x1b[31m%s\x1b[0m', showRefOutput);
      console.log('\x1b[31m%s\x1b[0m', err);
      console.log('\x1b[31m%s\x1b[0m', stderr);
      process.exit(1);
    }

    // set action params
    const CURRENT_BRANCH = core.getInput('branch-name');
    const CURRENT_VERSION = core.getInput('current-version');
    const NEXT_VERSION = core.getInput('next-version');
    const SHORTCUT_TOKEN = core.getInput('shortcut-token');
    const GITHUB_TOKEN = core.getInput('github-token');

    // version tags
    const currentVersionTag = 'v' + CURRENT_VERSION;
    const nextVersionTag = 'v' + NEXT_VERSION;

    // parse output from `git show-ref --tags` and find required tag
    const tagHashes = showRefOutput.split(/\r?\n/);
    let commitSha;
    for (const tagHash of tagHashes) {
      let hashAndTag = tagHash.split(/\s+/);
      if (hashAndTag.length > 1
        && currentVersionTag === hashAndTag.at(1).replace('refs/tags/', '')) {
        commitSha = hashAndTag.at(0);
        break;
      }
    }

    // cannot find commit tags
    if (!commitSha) {
      console.log('\x1b[33m%s\x1b[0m', 'Could not find a commit with current tag: ' + currentVersionTag);
      process.exit(1);
    }

    // get all commits earlier than current version commit
    exec(`git rev-list ${commitSha}..HEAD --branches=${CURRENT_BRANCH}`, async (err, revListOutput, stderr) => {

      if (err) {
        console.log('\x1b[33m%s\x1b[0m', 'Could not find any commits because: ');
        console.log('\x1b[31m%s\x1b[0m', stderr);
        process.exit(1);
      }

      // notification message
      let deploymentDescription = `Aktiv-Server is preparing a release for ${currentVersionTag}. This has been deployed to dev and staging. All associated tickets have been labelled ${currentVersionTag} as well. The tickets to be released are:`

      // find all merged pull requests from the latest version
      const commitHashes = revListOutput.split(/\r?\n/);
      core.info(`Found ${commitHashes.length} commits from the ${currentVersionTag}`)

      // retrieve PRs for commits
      const prs = [];
      for (const sha of commitHashes) {
        if (!sha || !sha.trim()) continue;
        // find PRs associated with the commit SHA
        prs.push(...await findPrsByCommitSha(sha, GITHUB_TOKEN));
      }

      // only unique prs
      const uniquePrNumbers = new Set();
      const uniqueOrderedPrs = [];
      for (const prDetails of prs) {
        if (uniquePrNumbers.has(prDetails.number)) continue;
        uniquePrNumbers.add(prDetails.number);
        uniqueOrderedPrs.push(prDetails);
      }
      core.info(`Found ${uniqueOrderedPrs.length} PRs from the ${currentVersionTag}`)

      // prepare description and update tags for stories associated with PRs
      for (const prDetails of uniqueOrderedPrs) {
        // pull request details
        const prNumber = prDetails.number != null ? prDetails.number : '';
        const prDescription = prDetails.body != null ? prDetails.body : '';
        const prTitle = prDetails.title != null ? prDetails.title : '';
        const prLink = prDetails.html_url != null ? prDetails.html_url : '';

        // retrieve stories from the pull request
        const prComments = await findPrCommentsByPrNumber(prNumber, GITHUB_TOKEN);
        const storyIds = await extractStoryIdsFromPrDescriptionAndPrComments(prDescription, prComments);
        const uniqueStoryIds = storyIds.filter((value, index, self) => self.indexOf(value) === index);

        // update story tags
        let storyFound = false;
        for (const storyId of uniqueStoryIds) {
          const story = await updateStoryWithVersionTagLabel(storyId, nextVersionTag, SHORTCUT_TOKEN);
          if (story) {
            storyFound = true;
            const storyCommentForDeployment = `\n - [${prTitle}](${prLink}) - [${story.name}](${story.app_url})`;
            deploymentDescription = deploymentDescription.concat(storyCommentForDeployment)
          }
        }

        // if there is no story, just add pr info to final description
        if (!storyFound) {
          deploymentDescription = deploymentDescription.concat(`\n - [${prTitle}](${prLink})`)
        }

      }

      // set deployment description for a further steps
      console.log(`::set-output name=deployment-description::${deploymentDescription}`);
      process.exit(0);

    });
  });

}

/**
 * Retrieves pull requests associated with a commit
 * @param {String} commitSha commit sha associated with a pr
 * @param {String} token github token
 * @returns {Promise<boolean|any>}
 */
async function findPrsByCommitSha(commitSha, token) {

  const octokit = github.getOctokit(token);

  try {
    const {data} = await octokit.request('GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls', {
      owner: github.context.repo.owner, repo: github.context.repo.repo, commit_sha: commitSha
    })
    return data;
  } catch (error) {
    console.log('\x1b[33m%s\x1b[0m', 'Could not find PR by ' + commitSha + ' because : ');
    console.log('\x1b[31m%s\x1b[0m', error);
    return false; // return false if unable fetch pr details
  }
}


/**
 * Finds comments on the PR
 * @param prNumber the number of PR to find a commits
 * @param {String} token github token
 * @returns {Promise<String[]>} array of PR's commits
 */
async function findPrCommentsByPrNumber(prNumber, token) {
  const octokit = github.getOctokit(token)
  try {
    const {data} = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner: github.context.repo.owner, repo: github.context.repo.repo, issue_number: prNumber
    })
    return data.map(comment => comment.body);
  } catch (error) {
    console.log('\x1b[33m%s\x1b[0m', 'Could not find comments by PR number:' + prNumber + ' because : ');
    console.log('\x1b[31m%s\x1b[0m', error);
    return [] // return empty comments array if error occurs
  }
}

/**
 * Gets Shortcut story ids from the PR's description and comments
 * @param description the PR's description
 * @param comments array of the PR's comments
 * @returns {String[]}
 */
async function extractStoryIdsFromPrDescriptionAndPrComments(description, comments) {

  const storyIDsFromDescription = extractStoryIdsFromText(description);
  const storyIDsFromComments = comments.flatMap(comment => extractStoryIdsFromText(comment)).filter(Boolean);

  if (storyIDsFromDescription === null) {
    return storyIDsFromComments;
  }

  return [...storyIDsFromDescription, ...storyIDsFromComments];

}

/**
 * Matches all the numbers in the text
 * that are like this shortcut.com/101education/story/123123/something
 * @param text
 * @returns {String}
 */
function extractStoryIdsFromText(text) {
  return text.match(/(?<=shortcut.com\/101education\/story\/)(\d*)(?=\/)/g)
}

// Add a label with version to the story and return updated story
async function updateStoryWithVersionTagLabel(storyId, tagVersion, SHORTCUT_TOKEN) {
  const storiesUrl = `https://api.app.shortcut.com/api/v3/stories`;
  try {
    const story = await axios.get(`${storiesUrl}/${storyId}?token=${SHORTCUT_TOKEN}`);
    const tagLabels = [{name: tagVersion, color: '#fdeba5'}];
    return await axios.put(`${storiesUrl}/${storyId}?token=${SHORTCUT_TOKEN}`,
      {
        labels: [...story, ...tagLabels]
      });
  } catch (error) {
    console.log('\x1b[33m%s\x1b[0m', 'Could not update story label' + storyId + ' because : ');
    console.log('\x1b[31m%s\x1b[0m', error);
    return false; // return false if cannot to update story
  }
}

// Main call
(async () => {
  await notifyShortcut();
})()
