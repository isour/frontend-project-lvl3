// @ts-check
const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

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

  const currentId = uid();

  feedObject = {
    url,
    id: currentId,
    status: 'loaded',
    title: parsed.querySelector('title').textContent,
    description: parsed.querySelector('description').textContent,
  };

  const newPosts = [...parsed.querySelectorAll('item')];
  const oldsPosts = state.postsList.map((post) => post.title);

  const differenceItems$ = newPosts.filter((x) => !oldsPosts.includes(x.querySelector('title').textContent));

  const differecePosts = [];
  differenceItems$.forEach((item) => {
    differecePosts.push({
      title: item.querySelector('title').textContent,
      guid: uid(),
      link: item.querySelector('link').textContent,
      description: item.querySelector('description').textContent,
      pubDate: item.querySelector('pubDate').textContent,
      parentId: currentId,
    });
  });

  return {
    differecePosts,
    feedObject,
  };
};

export default init;
