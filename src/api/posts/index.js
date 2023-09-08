import Router from 'koa-router';
import * as postsCtrl from './posts.ctrl';

const posts = new Router();

posts.get('/', postsCtrl.list);
posts.post('/', postsCtrl.write);

const post = new Router(); // /api/pposts/:id
post.get('/', postsCtrl.read); // id 검증이 필요한 부분에 "checkObjectId" 미들웨어를 추가함
post.delete('/', postsCtrl.remove);
// psts.put('/:id', postsCtrl.replace); // 구현하지 않을 예정이므로 제거함
post.patch('/', postsCtrl.update);

posts.use('/:id', postsCtrl.checkObjectId, post.routes());

export default posts;
