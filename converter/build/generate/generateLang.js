import fs from 'node:fs';
import { BlockTranslation } from "../BlockTranslationReference";
const DATA_LANG_DIR = `../minecraft data/lang`;
const PACK_LANG_DIR = `../resources/minecraft/resource pack/pack/assets/minecraft/lang`;
const LANG_BLOCK_PREFIX = 'block.minecraft.';
const formatLangPrefix = (ids) => `§8[§fK§7irka ${ids}§8]§b `;
export default (function () {
    // Assign Kirka ID translations to Minecraft resource location IDs.
    const translatableMinecraftIds = BlockTranslation.Ids.minecraft;
    const translatedIdPrefixMap = new Map();
    for (const minecraftId of translatableMinecraftIds) {
        const translations = BlockTranslation.get(minecraftId);
        if (translations === undefined)
            continue;
        const kirkaIds = [...translations.values()].map(translation => translation.kirka).sort(); // Get all Kirka IDs that translate from the Minecraft ID.
        const idGroups = [];
        // Group sequential IDs to form a cleaner prefix like `10-14 & 38-40`
        let index = 0;
        while (index < kirkaIds.length) {
            const newGroup = [];
            let lastValue;
            do {
                lastValue = kirkaIds[index];
                newGroup.push(lastValue);
            } while ((kirkaIds[++index] - lastValue) === 1);
            idGroups.push(newGroup);
        }
        const prefix = formatLangPrefix(idGroups.map(idGroup => {
            if (idGroup.length === 1)
                return idGroup[0];
            return `${Math.min.apply(Math, idGroup)}-${Math.max.apply(Math, idGroup)}`;
        }).join(' & '));
        const blockName = minecraftId.replace('minecraft:', '');
        if (blockName.startsWith('potted_')) { // HACK: Fuck you, potted plants - probably needs a better solution
            translatedIdPrefixMap.set(blockName.replace('potted_', ''), prefix);
        }
        else {
            translatedIdPrefixMap.set(blockName, prefix);
        }
    }
    translatedIdPrefixMap.forEach((prefix, id) => console.log(`${prefix}${id}`));
    const langFileNames = fs.readdirSync(DATA_LANG_DIR);
    for (const fileName of langFileNames) {
        try {
            const data = fs.readFileSync(`${DATA_LANG_DIR}/${fileName}`, 'utf8');
            const lang = JSON.parse(data);
            const newLang = {};
            translatedIdPrefixMap.forEach((prefix, id) => {
                const localizedBlockName = lang[`${LANG_BLOCK_PREFIX}${id}`];
                newLang[`${LANG_BLOCK_PREFIX}${id}`] = `${prefix}${localizedBlockName}`;
            });
            if (!fs.existsSync(PACK_LANG_DIR))
                fs.mkdirSync(PACK_LANG_DIR);
            fs.writeFileSync(`${PACK_LANG_DIR}/${fileName}`, JSON.stringify(newLang, undefined, 2));
        }
        catch (err) {
            console.error(err); // TODO: Maybe better error handling, I'm too lazy rn.
        }
    }
})();
