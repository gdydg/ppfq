import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';

const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvYXBpLm9wZW5pbS5jb20iLCJpYXQiOjE3Nzg2ODE5NDcsImV4cCI6MTc3OTI4Njc0NywiZGF0YSI6eyJpZCI6OTgzMDk1LCJ1c2VyaWQiOiJJUWRnV0VSdiIsInVzZXJfaWQiOiJJUWRnV0VSdiIsInVzZXJfbmlja25hbWUiOiJcdTVjMGZcdTc0MDNcdThmZjdJUWRnV0VSdiIsIm1vYmlsZSI6IiIsImNoYXRyb29tX2lkIjoiIiwicG9ydHJhaXQiOiJodHRwczpcL1wvb3BlbmltLWFwaS5jaGZ4ZDhoc3dlb3RlLnh5elwvb2JqZWN0XC9pbUFkbWluXC9pbS1kZWZhdWx0LmpwZyIsImV4cGVyaWVuY2UiOiIwLjAwIiwibmV4dF9leHBlcmllbmNlIjoyMCwiZ3JhZGUiOjEsImZhbnNfbnVtIjowLCJjb2luX251bSI6MCwiZGlhbW9uZF9udW0iOjAsInBheXB3ZCI6MCwiaW1fdWlkIjoiNzE4NDk5MDY3NSIsImVtYWlsIjoiaWt1bkBpa3VuLngxMC5ieiIsInBhc3N3ZF9tZDUiOjEsInVzZXJfbG9naW4iOiIiLCJnZW5kZXIiOjAsImxvZ2luX2FwcCI6MCwicmVnaXN0ZXJfdGltZSI6IjIwMjYtMDUtMTMgMjI6MTk6MDYiLCJmb2xsb3dfbnVtIjowLCJhbmNob3JfYXV0aCI6ImZhbHNlIiwiaGlnaF9hdXRoIjoiZmFsc2UiLCJvcGVyYXRpb25fYXV0aCI6ImZhbHNlIiwiY2hhdF9hdXRoIjoiZmFsc2UiLCJhbGxvd19hZGRfZnJpZW5kIjowLCJpbV90b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpWYzJWeVNVUWlPaUkzTVRnME9Ua3dOamMxSWl3aVVHeGhkR1p2Y20xSlJDSTZOU3dpWlhod0lqb3hOemswTWpNek9UUTNMQ0p1WW1ZaU9qRTNOemcyT0RFMk5EY3NJbWxoZENJNk1UYzNPRFk0TVRrME4zMC5mQ3U3Y2RTSjZwVlR3OGd2TS1HUkx3WXJFSnBJR2FReFVXZTJRNWVUNldZIiwiY2hhdF90b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpWYzJWeVNVUWlPaUkzTVRnME9Ua3dOamMxSWl3aVZYTmxjbFI1Y0dVaU9qRXNJbEJzWVhSbWIzSnRTVVFpT2pBc0ltVjRjQ0k2T1RJME16WTBNVGswTnl3aWJtSm1Jam94TnpjNE5qZ3hOalEzTENKcFlYUWlPakUzTnpnMk9ERTVORGQ5LnR5elBoRkJiaVhiUGNXN2hlWThvaFlYVTJVSWVvRGVyUzBweWY1ZVVXeWsiLCJoaWdoX2FjY291bnQiOjAsIm9wZXJhdGVfYWNjb3VudCI6MH19.u16qiUJHr8SWx0NjflBnI8-gYo5FAc6pz91ce5Zu1FM";

const SALT = "yKBm0pKLdVcGbnu4XGon13TsyBdEsjj3WVAzszpoqjn3BNmovLgzvcRTxD1Wey7QQ10kcov0b8e9oBi7jAUR";
const AES_KEY = "j3Qpq3BWs6qUCctm";
const AES_IV = "b2mdEEYbW1qprFsg";

const API_PAGELIST = "https://apc.j8w1d1r1p4g4q6t.cc/v14/live/pagelist?plate_id=11&page_size=36";
const PLAY_API = "https://openim-php-api.x3t9p9f5h0l3.cc/v230/play/url";
const MAX_MATCH_CHANNELS = 47;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function generateSignature(params) {
    const sortedKeys = Object.keys(params).sort();
    const paramStr = sortedKeys.map(k => k + params[k]).join("");
    const rawStr = paramStr + SALT;
    return crypto.createHash('md5').update(rawStr).digest('hex');
}

function decryptData(base64Str) {
    try {
        const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(AES_KEY), Buffer.from(AES_IV));
        let decrypted = decipher.update(base64Str, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        return null;
    }
}

async function fetchRealStreamUrl(roomId, matchId, sportId) {
    const time = Math.floor(Date.now() / 1000).toString();
    const payload = {
        room_id: roomId.toString(),
        code_id: "gqzm",
        time: time,
        match_id: matchId.toString(),
        sport_id: sportId.toString()
    };
    
    payload.signature = generateSignature(payload);
    const bodyParams = new URLSearchParams(payload).toString();

    try {
        const res = await fetch(PLAY_API, {
            method: "POST",
            // 【修改点】：加入 no-store 防止死缓存
            cache: 'no-store', 
            headers: {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "api-version": "8",
                "authorization": TOKEN,
                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                "device": "3",
                "device2": "3",
                "dun-imei": "GoIjGpOHazlEI0FBEQaSrR9RZwDRokwo",
                "imei": "2ce3b97beaa09480a790ba5a4387265f",
                "platform": "fqzb",
                "origin": "https://fqzb7.com",
                "referer": "https://fqzb7.com/",
                // 升级一下 User-Agent，显得更像真实浏览器
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            },
            body: bodyParams
        });

        const encryptedText = (await res.text()).trim().replace(/^"|"$/g, '');
        if (!encryptedText || encryptedText.startsWith("{")) return null;

        const decryptedStr = decryptData(encryptedText);
        if (!decryptedStr) return null;

        let finalUrl = null;
        const urlMatch = decryptedStr.match(/(https?:\/\/[^"'\s]+\.(?:m3u8|flv)[^"'\s]*)/i);
        if (urlMatch) {
            finalUrl = urlMatch[1].replace(/\\\//g, '/');
        }
        
        if (!finalUrl) {
            try {
                const parsed = JSON.parse(decryptedStr);
                const dataObj = parsed.data || parsed;
                const keys = ['play_url', 'pull_url', 'pull_flv_url', 'url', 'video_url', 'flv', 'm3u8_url', 'hls_url'];
                for (const key of keys) {
                    if (dataObj[key] && typeof dataObj[key] === 'string' && dataObj[key].startsWith('http')) {
                        finalUrl = dataObj[key];
                        break;
                    }
                }
            } catch (jsonErr) {}
        }
        return finalUrl;
    } catch (e) {
        return null;
    }
}

export function transformUrl(rawUrl, targetQuality, targetExt) {
    if (!rawUrl) return null;
    let newUrl = rawUrl.replace(/https?:\/\/play\.gpycvac\.com/ig, "https://fq3qq.zh-cn.edgeone.run");
    newUrl = newUrl.replace(/_(lgzm|gqzm|bqzm)\.(m3u8|flv)/i, `_${targetQuality}.${targetExt}`);
    return newUrl;
}

export async function getLiveStreams() {
    let validRooms = [];
    let debugMsg = ""; // 新增：用于收集报错原因
    
    const fetchHeaders = {
        "authorization": TOKEN,
        "api-version": "8",
        "platform": "fqzb",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    };

    for (let page = 0; page <= 1; page++) {
        const pageUrl = `${API_PAGELIST}&page=${page}`;
        try {
            // 【关键修复 1】：强行禁用 Next.js 的 fetch 缓存
            const res = await fetch(pageUrl, { 
                headers: fetchHeaders,
                cache: 'no-store' 
            });
            
            if (!res.ok) {
                debugMsg += `[页码${page} HTTP错误: ${res.status}] `;
                continue;
            }

            const data = await res.json();

            if (data && data.code === 200 && data.data && Array.isArray(data.data)) {
                if (data.data.length === 0) debugMsg += `[页码${page} 数组为空] `;
                
                for (const room of data.data) {
                    const roomId = room.chatroom_id || room.room_id;
                    const matchId = room.match_id;
                    
                    // 【关键修复 2】：使用 == 弱类型判断，防止 API 返回 "888888888" 字符串导致跳过
                    if (roomId == 888888888 && matchId > 0) {
                        if (!validRooms.find(r => r.matchId === matchId)) {
                            validRooms.push({
                                title: room.room_title || "未知赛事",
                                logo: room.screenshot_url || "",
                                group: "原声(播不了上魔法)",
                                roomId,
                                matchId,
                                sportId: room.sport_id || 1
                            });
                        }
                    }
                }
            } else {
                debugMsg += `[页码${page} 接口响应异常: ${JSON.stringify(data).substring(0, 80)}] `;
            }
        } catch (e) {
            debugMsg += `[页码${page} 报错: ${e.message}] `;
        }

        if (page === 0) await sleep(800);
    }

    // 【修改点】：直接抛出详细的错误信息
    if (validRooms.length === 0) {
        throw new Error(`获取比赛失败 (Token确认有效)。\n内部调试信息：${debugMsg || "未知原因过滤"}\n这表示源站要么没比赛，要么拦截了EdgeOne的IP。`);
    }

    validRooms = validRooms.slice(0, MAX_MATCH_CHANNELS);

    const BATCH_SIZE = 5;
    const results = [];
    for (let i = 0; i < validRooms.length; i += BATCH_SIZE) {
        const batch = validRooms.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async room => {
            const rawUrl = await fetchRealStreamUrl(room.roomId, room.matchId, room.sportId);
            return { room, rawUrl };
        });
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }

    return results;
}
