export function flattenRecords<TItem>(
  objectOrObjects: Record<string, TItem> | Record<string, TItem>[]
): Record<string, TItem> {
  if (Array.isArray(objectOrObjects)) {
    return objectOrObjects.reduce((agg, item) => {
      Object.assign(agg, item);
      return agg;
    }, {});
  }
  return objectOrObjects;
}
