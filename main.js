import './style.css';
import Alpine from 'alpinejs';
import intersect from '@alpinejs/intersect';

Alpine.plugin(intersect);
import { Directus } from '@directus/sdk';
const directus = new Directus('https://api.traist.co.uk');
const defaultQuery = {
  fields: ['*', 'files.directus_files_id'],
  sort: ['-post_date'],
  limit: 15,
};
window.Alpine = Alpine;
Alpine.store('posts', {
  setPosts(posts) {
    this.data = posts;
  },
  data: [],
  allLoaded: false,
});

Alpine.store('authenticated', false);
Alpine.store('page', 1);
Alpine.store('paginate', async (param = 0) => {
  let nextPage = 0;
  if (!param) {
    nextPage = Alpine.store('page') + 1;
  } else {
    nextPage = param;
  }
  Alpine.store('page', nextPage);

  const data = await directus
    .items('posts')
    .readByQuery({ ...defaultQuery, page: Alpine.store('page') });

  if (!data.data.length) {
    Alpine.store('posts').allLoaded = true;
    return;
  }
  Alpine.store('posts').setPosts([...Alpine.store('posts').data, ...data.data]);
});
Alpine.store('login', async (email, password) => {
  await directus.auth.login({ email, password });
  Alpine.store('authenticated', true);
  const data = await directus
    .items('posts')
    .readByQuery({ ...defaultQuery, page: Alpine.store('page') });
  Alpine.store('posts').setPosts(data.data);
});

Alpine.start();

async function init() {
  try {
    await directus.auth
      .refresh()
      .then((e) => {
        Alpine.store('authenticated', true);
      })
      .catch(() => {});

    const data = await directus
      .items('posts')
      .readByQuery({ ...defaultQuery, page: Alpine.store('page') });
    Alpine.store('posts').setPosts(data.data);
  } catch (e) {
    console.error(e);
  }
}

init();
