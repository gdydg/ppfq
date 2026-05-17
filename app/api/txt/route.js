import { getLiveStreams, transformUrl } from '../../../lib/parser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const results = await getLiveStreams();
        
        if (results.length === 0) {
            return new Response("警告：未获取到任何比赛。请核对 TOKEN 是否失效。", {
                status: 200,
                headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" }
            });
        }

        let txtOutput = "原声(播不了上魔法),#genre#\n";
        let successCount = 0;

        for (const item of results) {
            if (!item.rawUrl) continue;
            successCount++;
            
            const streams = [
                { name: "高清-FLV",  url: transformUrl(item.rawUrl, "gqzm", "flv") },
                { name: "蓝光-FLV",  url: transformUrl(item.rawUrl, "lgzm", "flv") }
            ];

            for (const stream of streams) {
                const fullTitle = `${item.room.title}-${stream.name}`;
                txtOutput += `${fullTitle},${stream.url}\n`;
            }
        }

        if (successCount === 0) {
            return new Response("错误：列表获取成功，但直播流链接提取全部失败！", {
                status: 500,
                headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" }
            });
        }

        return new Response(txtOutput.trim(), {
            headers: { 
                "Content-Type": "text/plain; charset=utf-8", 
                "Access-Control-Allow-Origin": "*" 
            }
        });

    } catch (err) {
        return new Response("API 内部致命错误: " + err.message, { status: 500 });
    }
}
