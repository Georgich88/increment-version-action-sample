/**
 * Gets Shortcut story ids from the PR's description and comments
 * @param description the PR's description
 * @param comments array of the PR's comments
 * @returns {Promise<String[]>}
 */
const extractStoryIdsFromPrDescriptionAndPrComments = async function (description, comments) {

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
const extractStoryIdsFromText = function(text) {
  return text.match(/(?<=shortcut.com\/georgy-aktiv-test\/story\/)(\d*)(?=\/)/g)
}

module.exports = {
  extractStoryIdsFromPrDescriptionAndPrComments,
  extractStoryIdsFromText
}