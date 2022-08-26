const shortcut_parsing = require("./shortcut_parsing");
const shortcut_description = require("./shortcut_description");

test('Should extract shortcut ticket number from a PR comment', async () => {
  const prComment = 'https://app.shortcut.com/georgy-aktiv-test/story/19671/create-a-github-action-to-prepare-release';
  const extractedNumber = shortcut_parsing.extractStoryIdsFromText(prComment);
  expect(extractedNumber).toEqual(['19671'])
});


test('Should form description with new line escape characters', async () => {
  let deploymentDescription = 'The tickets to be released are:';
  deploymentDescription = shortcut_description.addPrDescriptionToDeploymentDescription(deploymentDescription, 'prTitle1', 'http://prLink1');
  deploymentDescription = shortcut_description.addPrDescriptionToDeploymentDescription(deploymentDescription, 'prTitle2', 'http://prLink2');
  expect(deploymentDescription.split(/\r?\n/).length).toBe(1);
  // emulate unescaping by runner
  deploymentDescription = deploymentDescription.replaceAll(shortcut_description.ESCAPE_NEW_LINE, '\n')
  expect(deploymentDescription.split(/\r?\n/).length).toBe(3);
});