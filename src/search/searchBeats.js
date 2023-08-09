import { Database } from "../database/database.js";
import * as inlineMarkups from "../markups/inlineMarkups.js";
import { Input } from "telegraf";

const db = new Database();

export async function getBeat(ctx, page, type) {
    const beats = await db.getBeats(type);
    const beat = beats[page];

    let beat_path;
    let f;

    //если есть айди файла в базе то загружать по нему, если нет то загружать файл с диска
    if(beat.telegram_id != null) { beat_path = beat.telegram_id; f = await Input.fromFileId(beat.telegram_id) }
    else { beat_path = `./beats/b${beat.beat_id}.m4a`; f = await Input.fromLocalFile(beat_path, beat.title) }

    const inlineButtons = await inlineMarkups.pageButtons(page, type, beats);

    //есле типо страницк перелистнули а не через команду поиск начали чтобы сообщение замениолсь а не новое отправилось
    if (ctx.callbackQuery) {
        ctx.editMessageMedia({ media: f, type: "audio" }, inlineButtons)
            .then((msg) => { if(beat.telegram_id === null) beat.insertTelegramId(msg.audio.file_id) });
    }
    else { 
        ctx.replyWithAudio(f, inlineButtons, { filename: beat.title } )
            .then((msg) => { if(beat.telegram_id === null) beat.insertTelegramId(msg.audio.file_id) });
    }
}