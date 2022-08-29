const ESCAPE_NEW_LINE = '%0A'; // to escape '\n'

/**
 * Adds a ticket description to the release description
 * @param deploymentDescription {string} the initial description
 * @param prTitle {string} the GitHub PR title
 * @param prLink {string} the GitHub PR link
 * @param storyTitle {string} the shortcut ticket title
 * @param storyLink {string} the shortcut ticket ULR
 * @returns {string} the updated release description
 * */
const addStoryDescriptionToDeploymentDescription = function (deploymentDescription, prTitle, prLink, storyTitle, storyLink) {
  const storyCommentForDeployment = `${ESCAPE_NEW_LINE} &#8226 <${prLink}|${prTitle}> - <${storyLink}|${storyTitle}>`;
  return deploymentDescription.concat(storyCommentForDeployment)
}

/**
 * Adds a PR description to the release description
 * @param deploymentDescription {string} the initial description
 * @param prTitle {string} the GitHub PR title
 * @param prLink {string} the GitHub PR link
 * @returns {string} the updated release description
 */
const addPrDescriptionToDeploymentDescription = function (deploymentDescription, prTitle, prLink) {
  return deploymentDescription.concat(`${ESCAPE_NEW_LINE} &#8226 <${prLink}|${prTitle}>`)
}

module.exports = {
  ESCAPE_NEW_LINE,
  addStoryDescriptionToDeploymentDescription,
  addPrDescriptionToDeploymentDescription
}