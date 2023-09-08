import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from '../../../node_modules/joi/lib/index';

const { ObjectId } = mongoose.Types;

// 올바른 id임을 검증하기 위한 미들웨어
export const checkObjectId = (ctx, next) => {
    const { id } = ctx.params;
    if (!ObjectId.isValid(id)) {
        ctx.status = 400; // Bad Request
        return;
    }
    return next();
};

/*
    POST /api/posts
    {
        title: '제목'
        body: '내용'
        tags: ['태그1', '태그2']
    }
*/
export const write = async (ctx) => {
    const schema = Joi.object().keys({
        // 객체가 다음 필드를 갖고 있음을 검증함(Joi 라이브러리를 이용)
        title: Joi.string().required(), // required()가 있으면 필수 항목
        body: Joi.string().required(),
        tags: Joi.array().items(Joi.string()).required(),
    });

    // 검증한 이후 실패했을 때 에러 처리
    const result = schema.validate(ctx.request.body);
    if (result.error) {
        ctx.status = 400; // Bad Request
        ctx.body = result.error;
        return;
    }

    const { title, body, tags } = ctx.request.body;
    const post = new Post({
        title,
        body,
        tags,
    });
    try {
        await post.save();
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};

/*
    GET /api/posts
*/
export const list = async (ctx) => {
    try {
        const posts = await Post.find().exec();
        ctx.body = posts;
    } catch (e) {
        ctx.throw(500, e);
    }
};

/*
    GET /api/posts/:id
*/
export const read = async (ctx) => {
    const { id } = ctx.params;
    try {
        const post = await Post.findById(id).exec();
        if (!post) {
            ctx.status = 404; // Not Found
            return;
        }
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};

/*
    DELETE /api/posts/:id
*/
export const remove = async (ctx) => {
    const { id } = ctx.params;
    try {
        await Post.findByIdAndRemove(id).exec();
        ctx.status = 204; // No Content(성공은 했으나 응답할 데이터가 없음)
    } catch (e) {
        ctx.throw(500, e);
    }
};

/*
    PATCH /api/posts/:id
    {
        title: '수정' 
        body: '수정 내용'
        tags: ['수정', '태그']
    }
*/
export const update = async (ctx) => {
    const { id } = ctx.params;
    // Request Body 검증은 write에서 사용한 schema와 비슷하나 required()가 사용되지 않음
    const schema = Joi.object().keys({
        title: Joi.string(),
        body: Joi.string(),
        tags: Joi.array().items(Joi.string()),
    });

    // 검증 시 실패인 경우 에러처리
    const result = schema.validate(ctx.request.body);
    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }
    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true,
            // true: 업데이트된 데이터를 반환
            // false: 업데이트되기 전의 데이터를 반환
        }).exec();
        if (!post) {
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};

// 자바스크립트 배열 데이터는 시스템 메모리 쪽에 위치하므로 서버를 재시작하면 모두 초기화 됨
// 배열 대신에 MongoDB에 데이터를 등록하여 데이터를 보존할 것이므로 기존의 작성했던 모든 데이터를 제거하고 상단에 새로 작성함

// let postId = 1; // id의 초기값

// // posts 배열 초기 데이터
// const posts = [
//     {
//         id: 1,
//         title: '제목',
//         body: '내용',
//     },
// ];

// /*  포스트 작성
//     POST /api/posts
//     { title, body }
// */
// export const write = (ctx) => {
//     const { title, body } = ctx.request.body;
//     postId += 1;
//     const post = { id: postId, title, body };
//     posts.push(post);
//     ctx.body = post;
// };

// /*  포스트 목록 조회
//     GET /api/posts
// */
// export const list = (ctx) => {
//     ctx.body = posts;
// };

// /*  특정 포스트 조회
//     GET /api/posts/:id
// */
// export const read = (ctx) => {
//     const { id } = ctx.params;
//     const post = posts.find((p) => p.id.toString() === id);
//     if (!post) {
//         ctx.status = 404;
//         ctx.body = {
//             message: '포스트 없음',
//         };
//         return;
//     }
//     ctx.body = post;
// };

// /*  특정 포스트 제거
//     DELETE /api/posts/:id
// */
// export const remove = (ctx) => {
//     const { id } = ctx.params;
//     const index = posts.findIndex((p) => p.id.toString() === id);
//     if (index === -1) {
//         ctx.status = 404;
//         ctx.body = {
//             message: '포스트 없음',
//         };
//         return;
//     }
//     posts.splice(index, 1);
//     ctx.status = 204; // No Content
// };

// /*  포스트 수정(교체)
//     PUT /api/posts/:id
//     { title, body }
// */
// export const replace = (ctx) => {
//     const { id } = ctx.params;
//     const index = posts.findIndex((p) => p.id.toString() === id);
//     if (index === -1) {
//         ctx.status = 404;
//         ctx.body = {
//             message: '포스트 없음',
//         };
//         return;
//     }
//     posts[index] = {
//         id,
//         ...ctx.request.body,
//     };
//     ctx.body = posts[index];
// };

// /*  포스트 수정(특정 필드 변경)
//     PATCH /api/posts/:id
//     { title, body }
// */
// export const update = (ctx) => {
//     const { id } = ctx.params;
//     const index = posts.findIndex((p) => p.id.toString() === id);
//     if (index === -1) {
//         ctx.status = 404;
//         ctx.body = {
//             message: '포스트 없음',
//         };
//         return;
//     }
//     posts[index] = {
//         ...posts[index],
//         ...ctx.request.body,
//     };
//     ctx.body = posts[index];
// };
