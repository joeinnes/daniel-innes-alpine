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
      .then(async (e) => {
        Alpine.store('authenticated', true);
        const me = await directus.users.me.read();
        if (me.role === 'b043c539-89d9-49f9-87f0-30e63908ca6f') {
          Alpine.store('canPost', true);
        }
      })
      .catch(() => {});

    Alpine.store('page', 1);

    const data = await directus
      .items('posts')
      .readByQuery({ ...defaultQuery, page: Alpine.store('page') });
    Alpine.store('posts').setPosts(data.data);
  } catch (e) {
    console.error(e);
  }
}

init();

Alpine.store('uploadFiles', async (fileForm) => {
  try {
    const form = new FormData(fileForm);
    const res = await directus.files.createOne(form);
    console.log(res);
    if (Array.isArray(res)) {
      return res;
    }
    return [res];
  } catch (e) {}
});

Alpine.store('uploadPost', async (post) => {
  post.post_date = new Date(post.post_date);
  try {
    const res = await directus.items('posts').createOne(post);
    console.log(res);
    if (Array.isArray(res)) {
      return res;
    }
  } catch (e) {
    console.error(e);
  }
});
