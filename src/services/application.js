import { Database } from "../database/database.js";
import { bot } from "../bot.js";
import * as utils from "../services/utils.js";
import * as inlineMarkups from "../markups/inlineMarkups.js";
import * as keyboardMarkups from "../markups/keyboardMarkups.js";

const db = new Database();

export async function sendApplication(user) {
    const admins = await db.getAdmins();

    const msg = `*Новая заявка на верификацию*\n\n*Айди телеграма:* ${user.user_id}\n*Никнейм:* ${user.nickname}\n*Соцсеть:* ${utils.prepareString(user.media_link)}`;
    const inlineButtons = await inlineMarkups.applicationCheckButtons(user.user_id);

    admins.forEach(user => {
        bot.telegram.sendMessage(user.user_id, msg, { parse_mode: "MarkdownV2", reply_markup: inlineButtons.reply_markup });
    });
};

bot.action(/^application_/, async ctx => {
    let zalupa, action, user_id;
    [zalupa, action, user_id] = ctx.callbackQuery.data.split("_");

    const user = await db.getUser(user_id)

    if (!user.haveApplied) { ctx.editMessageText(`Заявка уже была рассмотрена другим модератором\nСтатус верификации пользователя ${user.user_id}: ${user.isVerified}`, inlineMarkups.deleteMessageButton); return }

    if (action === "apply") {
        ctx.editMessageText(`✅ Заявка пользователя ${user_id} одобрена`);

        user.setApplied(0);
        user.setVerified(1);

        const mainButtons = await keyboardMarkups.mainButtons(user);
        bot.telegram.sendMessage(user_id, "Ваша заяыка одобрена", mainButtons);
        return;
    }

    if (action === "deny") {
        ctx.editMessageText(`❌ Заявка пользователя ${user_id} отклонена`);

        user.setApplied(0);
        bot.telegram.sendMessage(user_id, "❌❌❌❌ Ваша заяыка отклонена ывалриывалшориывароапливапормпива");
        return;
    }
})