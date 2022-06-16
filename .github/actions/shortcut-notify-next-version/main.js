const {exec} = require('child_process');
const axios = require('axios')
const github = require('@actions/github')
const core = require('@actions/core')

exec('cd ../../../', (err, ignored, stderr) => {

  // go to the main folder
  if (err) {
    console.log('\x1b[33m%s\x1b[0m', 'Could not go to main folder: ');
    console.log('\x1b[31m%s\x1b[0m', stderr);
    process.exit(1);
  }

  exec('git show-ref --tags', (err, showRefOutput, stderr) => {

    // find all tags with output like:
    // 0e76920bea4381cfc676825f3143fdd5fcf8c21f refs/tags/1.0.0

    if (err) {
      console.log('\x1b[33m%s\x1b[0m', 'Could not find any revisions because: ');
      console.log('\x1b[31m%s\x1b[0m', stderr);
      process.exit(1);
    }

    // set action params
    const CURRENT_VERSION = process.argv[2]
    const NEXT_VERSION = process.argv[3]
    const SHORTCUT_TOKEN = process.argv[4]
    const GITHUB_TOKEN = process.argv[5]

    // version tags
    const currentVersionTag = 'v' + CURRENT_VERSION;
    const nextVersionTag = 'v' + NEXT_VERSION;

    // parse and find required tag
    const tagHashes = showRefOutput.split(/\r?\n/);
    let tagHash;
    for (let tagHash in tagHashes) {
      let hashAndTag = tagHash.split(/\s+/);
      if (hashAndTag.length > 1 && currentVersionTag === hashAndTag.at(1).replace('refs/tags/', '')) {
        tagHash = hashAndTag.at(0);
      }
    }

    // cannot find commit tags
    if (!tagHash) {
      console.log('\x1b[33m%s\x1b[0m', 'Could not find a commit with current tag: ' + currentVersionTag);
      process.exit(1);
    }

    exec(`git rev-list ${tagHash}..HEAD`, (err, revListOutput, stderr) => {

      if (err) {
        console.log('\x1b[33m%s\x1b[0m', 'Could not find any commits because: ');
        console.log('\x1b[31m%s\x1b[0m', stderr);
        process.exit(1);
      }

      // slack notification message
      let deploymentDescription = `AktivChem-Server is preparing a release for ${currentVersionTag}. 
      This has been deployed to dev and staging. 
      All associated tickets have been labelled ${currentVersionTag} as well. 
      The tickets to be released are:`


      // find all merged pull requests from the latest version
      const commitHashes = revListOutput.split(/\r?\n/);
      core.info(`Found ${commitHashes.length} commits from the ${currentVersionTag}`)

      // prepare description and update tags for stories associated with PRs
      for (const commitSha in commitHashes) {
        // find PRs associated with the commit SHA
        const prs = findPrsByCommitSha(commitSha, GITHUB_TOKEN);
        if (!prs) {
          for (const prDetails in prs) {
            // pull request details
            const prNumber = prDetails.number;
            const prDescription = prDetails.body;
            const prTitle = prDetails.title;
            const prLink = prDetails.html_url;
            // retrieve stories from the pull request
            const prComments = findPrCommentsByPrNumber(prNumber, GITHUB_TOKEN);
            const storyIds = extractStoryIdsFromPrDescriptionAndPrComments(prDescription, prComments);
            const uniqueStoryIds = [...new Set(storyIds)];
            // update story tags
            uniqueStoryIds.forEach(async (storyId) => {
              const story = await updateStoryWithVersionTagLabel(storyId, nextVersionTag, SHORTCUT_TOKEN);
              if (story) {
                const storyCommentForDeployment = `\n - [${prTitle}](${prLink}) - [${story.name}](${story.app_url})`;
                deploymentDescription = deploymentDescription.concat(storyCommentForDeployment)
              }
            })
          }
        }
      }

      core.info(`${deploymentDescription}`)
      console.log('\x1b[31m%s\x1b[0m', deploymentDescription);
      console.log(`::set-output name=deployment-description::${deploymentDescription}`);
      process.exit(0);

    });
  });
});

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