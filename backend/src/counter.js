function nextCount(item) {
  const current = Number.isInteger(item?.count) ? item.count : 0;
  return current + 1;
}

module.exports = { nextCount };