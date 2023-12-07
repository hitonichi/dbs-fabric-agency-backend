exports.parsePhoneNumber = (list) => {
  if (!list || list.length == 0) return [];
  return list
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p !== "");
};
