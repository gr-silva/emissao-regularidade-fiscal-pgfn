/**
 * The `chunkArray` function divides an array into smaller chunks of a specified
 * size.
 * @param array - Array that you want to split into chunks.
 * @param chunkSize - Chunk size is the number of elements you want in each chunk
 * when splitting the array.
 * @returns The `chunkArray` function returns an array of chunks, where each chunk
 * contains `chunkSize` number of elements from the input `array`.
 */
const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

module.exports = chunkArray;
