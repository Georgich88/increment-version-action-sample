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
    const CURRENT_BRANCH = process.argv[2]
    const CURRENT_VERSION = process.argv[3]
    const NEXT_VERSION = process.argv[4]
    const SHORTCUT_TOKEN = process.argv[5]
    const GITHUB_TOKEN = process.argv[6]

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
      let deploymentDescription = `AktivChem-Server is preparing a release for ${currentVersionTag}. This has been deployed to dev and staging. All associated tickets have been labelled ${currentVersionTag} as well. The tickets to be released are:`

      // find all merged pull requests from the latest version
      const commitHashes = revListOutput.split(/\r?\n/);
      core.info(`Found ${commitHashes.length} commits from the ${currentVersionTag}`)

      const prs = [];
      console.log('sha', commitHashes);

      // retrieve PRs for commits
      for (const sha of commitHashes) {
        if (!sha || !sha.trim()) continue;
        // find PRs associated with the commit SHA
        prs.push(...await findPrsByCommitSha(sha, GITHUB_TOKEN));
      }

      //
      const uniquePrNumbers = new Set();
      const uniqueOrderedPrs = [];
      for (const prDetails of prs) {
        if (uniquePrNumbers.has(prDetails.number)) continue;
        uniquePrNumbers.add(prDetails.number);
        uniqueOrderedPrs.push(prDetails);
      }

      console.log('uniqueOrderedPrs', uniqueOrderedPrs);

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
        for (const storyId of uniqueStoryIds) {
          const story = await updateStoryWithVersionTagLabel(storyId, nextVersionTag, SHORTCUT_TOKEN);
          if (story) {
            const storyCommentForDeployment = `\n - [${prTitle}](${prLink}) - [${story.name}](${story.app_url})`;
            deploymentDescription = deploymentDescription.concat(storyCommentForDeployment)
          }
        }

        // if there is no story, just add pr info to final description
        if (uniqueStoryIds.length === 0) {
          deploymentDescription = deploymentDescription.concat(`\n - [${prTitle}](${prLink})`)
        }

      }

      core.info(`${deploymentDescription}`)
      console.log('\x1b[31m%s\x1b[0m', deploymentDescription);
      console.log(`::set-output name=deployment-description::${deploymentDescription}`);
      process.exit(0);

    });
  });

}

// Retrieves pull requests associated with a commit
async function findPrsByCommitSha(commitSha, token) {

  const octokit = github.getOctokit(token)

  try {
    const {data} = await octokit.request('GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls', {
      owner: github.context.repo.owner, repo: github.context.repo.repo, commit_sha: commitSha
    })
    return data
  } catch (error) {
    console.log('\x1b[33m%s\x1b[0m', 'Could not find PR by ' + commitSha + ' because : ');
    console.log('\x1b[31m%s\x1b[0m', error);
    return false // return false if unable fetch pr details
  }
}


// Finds comments on the PR
async function findPrCommentsByPrNumber(prNumber, token) {
  const octokit = github.getOctokit(token)
  try {
    const {data} = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner: github.context.repo.owner, repo: github.context.repo.repo, issue_number: prNumber
    })
    return data.map(comment => comment.body)
  } catch (error) {
    console.log('\x1b[33m%s\x1b[0m', 'Could not find comments by PR number:' + prNumber + ' because : ');
    console.log('\x1b[31m%s\x1b[0m', error);
    return [] // return empty comments array if error occurs
  }
}


function extractStoryIdsFromPrDescriptionAndPrComments(description, comments) {

  const storyIDsFromDescription = extractStoryIdsFromText(description)
  const storyIDsFromComments = comments.flatMap(comment => extractStoryIdsFromText(comment)).filter(Boolean)

  if (storyIDsFromDescription === null) {
    return storyIDsFromComments
  } else {
    return [...storyIDsFromDescription, ...storyIDsFromComments]
  }

}

function extractStoryIdsFromText(text) {
  // match all the numbers in the text that are like this shortcut.com/101education/story/123123/something
  return text.match(/(?<=shortcut.com\/101education\/story\/)(\d*)(?=\/)/g)
}

// Add a label with version to the story and return updated story
async function updateStoryWithVersionTagLabel(storyId, tagVersion, SHORTCUT_TOKEN) {
  try {
    const story = await axios.get(`https://api.app.shortcut.com/api/v3/stories/${storyId}?token=${SHORTCUT_TOKEN}`);
    const tagLabels = [{name: tagVersion, color: '#fdeba5'}];
    return await axios.put(`https://api.app.shortcut.com/api/v3/stories/${storyId}?token=${SHORTCUT_TOKEN}`,
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
  await notifyShortcut()
})()