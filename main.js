import '@picocss/pico';
import './style.css';
import Alpine from 'alpinejs';
import { Directus } from '@directus/sdk';
const directus = new Directus('https://api.traist.co.uk');
window.Alpine = Alpine;
Alpine.store('posts', {
  setPosts(posts) {
    this.data = posts;
  },
  data: [],
});

Alpine.store('authenticated', false);

Alpine.start();

async function init() {
  try {
    await directus.auth
      .refresh()
      .then((e) => {
        Alpine.store('authenticated', true);
      })
      .catch(() => {});

    const data = await directus.items('posts').readByQuery({
      fields: ['*', 'files.directus_files_id'],
    });
    console.log(data);
    Alpine.store('posts').setPosts(data.data);
  } catch (e) {
    console.error(e);
  }
}

init();
