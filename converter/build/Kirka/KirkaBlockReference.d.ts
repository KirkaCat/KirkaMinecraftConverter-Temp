export type KirkaBlockReference = {
    [K in KirkaBlock.Id]: null | typeof KirkaBlockReference[K] extends null ? null : KirkaBlock<K>;
};
export declare const KirkaBlockReference: Record<number, KirkaBlock | null>;
export declare namespace KirkaBlock {
    type Id = keyof typeof KirkaBlockReference;
    interface ITransparrent<T extends boolean = any> {
        /**
         * Whether or not this block is transparrent, meaning the texture can be seen through.
         */
        isTransparrent: T;
    }
    interface IDeathPlane<T extends boolean = any> {
        /**
         * Whether or not this block is a death plane, killing players when they step on it.
         */
        isDeathPlane: T;
    }
    /**
     * A block type where one single block is used to place many.
     * E.g. Ladders, slabs etc...
     */
    interface IDynamic {
        /**
         * The ID of the block that is held and used to place this block; or the same ID if the current block is the primary block.
         */
        parent: Id;
    }
    interface IDoubleSlab {
        slabs: Record<SlabType, Id>;
    }
    interface ISlab {
        /**
         * The ID of the block that this slab is derived from (a double slab/full block).
         * Some slab blocks like `114` & `115` are not a derivative of any block and have their own unique texture; flagged as `null`.
         */
        derivedFrom?: Id | null;
        /**
         * Which half of the slab this block represents (bottom/top).
         */
        slabType: SlabType;
    }
    interface IDirectional<T extends FacingDirection = any> {
        /**
         * The facing direction of this block.
         * If you are facing north and looking at the front of a ladder, that ladder's facing direction is south.
         */
        facing: T;
    }
    enum EUICatagory {
        AIR = "air",
        CUBE = "cube",
        HALF_BLOCK = "HB",
        PLANTS = "plants",
        DIFFERENT = "different"
    }
    type UICatagory = 'air' | 'cube' | 'HB' | 'plants' | 'different';
    enum ESlabType {
        BOTTOM = "bottom",
        TOP = "top"
    }
    type SlabType = 'bottom' | 'top';
    enum EFacingDirection {
        NORTH = "north",
        EAST = "east",
        SOUTH = "south",
        WEST = "west"
    }
    type FacingDirection = 'north' | 'east' | 'south' | 'west';
}
export type KirkaBlock<T extends KirkaBlock.Id = number> = Partial<KirkaBlock.ITransparrent> & Partial<KirkaBlock.IDeathPlane> & Partial<KirkaBlock.IDynamic> & Partial<KirkaBlock.IDoubleSlab> & Partial<KirkaBlock.ISlab> & Partial<KirkaBlock.IDirectional> & {
    /**
     * The numerical block ID within Kirka.
     */
    id: T;
    /**
     * The catagory in which this block appears in via the block selection menu.
     */
    uiCatagory: KirkaBlock.UICatagory;
    description?: string;
};
