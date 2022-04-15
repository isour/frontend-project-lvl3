// @ts-check
const init = (url, raw, state) => {
  const parser = new DOMParser();
  let feedObject = {};

  const parsed = parser.parseFromString(raw, 'text/xml');

  const parseError = parsed.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsing = true;
    throw error;
  }

  const title = parsed.querySelector('title').textContent;

  feedObject = {
    url,
    id: title,
    title,
    description: parsed.querySelector('description').textContent,
  };

  const newPosts = [...parsed.querySelectorAll('item')];
  const oldsPosts = state.postsList.map((post) => post.title);

  const differenceItems$ = newPosts.filter((x) => !oldsPosts.includes(x.querySelector('title').textContent));

  const differecePosts = [];
  differenceItems$.forEach((item) => {
    differecePosts.push({
      title: item.querySelector('title').textContent,
      guid: item.querySelector('guid').textContent,
      link: item.querySelector('link').textContent,
      description: item.querySelector('description').textContent,
      parentId: title,
    });
  });

  return {
    differecePosts,
    feedObject,
  };
};

export default init;
