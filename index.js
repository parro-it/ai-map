export default async function* aiMap(data) {
  for (const item of data) {
    yield item;
  }
}
