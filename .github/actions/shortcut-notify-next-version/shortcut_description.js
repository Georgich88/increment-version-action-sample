const ESCAPE_NEW_LINE = '%0A'; // to escape '\n'

/**
 * Adds a ticket description to the release description
 * @param deploymentDescription {string} the initial description
 * @param prTitle {string} the GitHub PR title
 * @param prLink {string} the GitHub PR link
 * @param story {Object} the shortcut ticket object
 * @param story.name {string} the shortcut ticket name
 * @param story.app_url {string} the shortcut ticket ULR
 * @returns {string} the updated release description
 * */
const addStoryDescriptionToDeploymentDescription = function (deploymentDescription, prTitle, prLink, storyTitle, storyLink) {
  const storyCommentForDeployment = `${ESCAPE_NEW_LINE}<li> <${prLink}|\`${prTitle}\`> - <${storyLink}|\`${storyTitle}\`> </li>`;
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
  return deploymentDescription.concat(`${ESCAPE_NEW_LINE}<li> <${prLink}|\`${prTitle}\`> </li>`)
}

module.exports = {
  ESCAPE_NEW_LINE,
  addStoryDescriptionToDeploymentDescription,
  addPrDescriptionToDeploymentDescription
}