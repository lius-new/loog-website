// /extensions/index-info.json:这次构建用的是扩展索引的哪一版。
// 刷新工作流(.github/workflows/refresh-extensions.yml)拿它和最新的索引比较,不一样就触发重新构建。
import type { APIRoute } from 'astro';
import { getIndexInfo } from '../../data/extensions';

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await getIndexInfo()), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
