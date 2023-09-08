import Router from 'koa-router';
import * as postsCtrl from './posts.ctrl';

const posts = new Router();

posts.get('/', postsCtrl.list);
posts.post('/', postsCtrl.write);
posts.get('/:id', postsCtrl.read);
posts.delete('/:id', postsCtrl.remove);
// posts.put('/:id', postsCtrl.replace); // 구현하지 않을 예정이므로 제거함
posts.patch('/:id', postsCtrl.update);

export default posts;
