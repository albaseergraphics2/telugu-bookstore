export const makeSlug = (text) => {
  return text.toLowerCase().trim().replace(/[\s\W-]+/g, "-");
};