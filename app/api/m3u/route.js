import { getLiveStreams, transformUrl } from '../../../lib/parser';

// 强制使用 Node.js 运行时，确保完整支持 crypto 的 aes-128-cbc 解密
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // 禁用缓存，每次请求实时获取

export async function GET() {
    try {
        const results = await getLiveStreams();
        
        if (results.length === 0) {
            return new Response("警告：未获取到任何比赛。请核对 TOKEN 是否失效。", {
                status: 200,
                headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" }
            });
        }

        let m3uOutput = "#EXTM3U\n";
        let successCount = 0;

        for (const item of results) {
            if (!item.rawUrl) continue;
            successCount++;
            
            const gName = item.room.group;
            // 已去除 高清-M3U8
            const streams = [
                { name: "高清-FLV",  url: transformUrl(item.rawUrl, "gqzm", "flv") },
                { name: "蓝光-FLV",  url: transformUrl(item.rawUrl, "lgzm", "flv") }
            ];

            for (const stream of streams) {
                const fullTitle = `${item.room.title}-${stream.name}`;
                m3uOutput += `#EXTINF:-1 tvg-logo="${item.room.logo}" group-title="${gName}",${fullTitle}\n${stream.url}\n`;
            }
        }

        if (successCount === 0) {
            return new Response("错误：列表获取成功，但直播流链接提取全部失败！", {
                status: 500,
                headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" }
            });
        }

        return new Response(m3uOutput, {
            headers: { 
                "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8", 
                "Access-Control-Allow-Origin": "*" 
            }
        });

    } catch (err) {
        return new Response("API 内部致命错误: " + err.message, { status: 500 });
    }
}
