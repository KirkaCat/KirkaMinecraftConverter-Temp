import { KirkaBlock } from "./Kirka/KirkaBlockReference";
import { MinecraftBlock } from "./Minecraft/MinecraftBlockReference";
export declare class BlockTranslation {
    /**
     * The Kirka block ID that this translation corresponds to.
     */
    readonly kirka: KirkaBlock.Id;
    /**
     * The primary Minecraft block translation for this Kirka block.
     * Used to translate both to and from Kirka blocks.
     */
    readonly minecraft: MinecraftBlockTranslation<any>;
    /**
     * Resolvable Minecraft block translations for this Kirka block.
     * Only used to translate to Kirka blocks, not from.
     */
    readonly resolvable?: MinecraftBlockTranslation<any>[];
    constructor(kirka: KirkaBlock.Id, minecraft: MinecraftBlockTranslation<any>, resolvable?: MinecraftBlockTranslation<any>[]);
    canTranslate<T extends KirkaBlock.Id | MinecraftBlock.Id>(id: T, blockStates?: T extends MinecraftBlock.Id ? BlockTranslation.PropertyStateMap<T> : never, strict?: boolean): boolean;
    canResolve<T extends MinecraftBlock.Id>(id: T, blockStates?: T extends MinecraftBlock.Id ? BlockTranslation.PropertyStateMap<T> : never, strict?: boolean): boolean;
}
declare class MinecraftBlockTranslation<T extends MinecraftBlock.Id> {
    readonly id: T;
    readonly blockStates?: BlockTranslation.PropertyStateMap<T>;
    constructor(id: T, blockStates?: BlockTranslation.PropertyStateMap<T>);
    get blockStateId(): string;
    is(id: MinecraftBlock.Id, blockStates?: BlockTranslation.PropertyStateMap<T>, strict?: boolean): boolean;
}
export declare const _BlockTranslationReference: Record<KirkaBlock.Id, {
    primary: BlockTranslation.Translation;
    resolvable?: BlockTranslation.Translation[];
} | null>;
export declare namespace BlockTranslation {
    namespace Ids {
        const kirka: any;
        const minecraft: any;
    }
    const translations: any;
    function get<T extends KirkaBlock.Id | MinecraftBlock.Id>(id: T): (T extends KirkaBlock.Id ? BlockTranslation : Set<BlockTranslation>) | undefined;
    type PropertyStateMap<T extends MinecraftBlock.Id> = {
        [K in MinecraftBlock.PropertyName<T>]: MinecraftBlock.PropertyState<T, K>;
    };
    type Translation = {
        [K in MinecraftBlock.Id]: {
            id: K;
        } & Partial<PropertyStateMap<K>>;
    }[MinecraftBlock.Id];
}
export {};
