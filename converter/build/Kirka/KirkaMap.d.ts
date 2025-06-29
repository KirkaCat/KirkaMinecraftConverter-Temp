declare const DECORATOR_SUFFIX = "___DATA";
type Decorated<T> = {
    [K in keyof T as `${string & K}${typeof DECORATOR_SUFFIX}`]: T[K] extends object ? Decorated<T[K]> : T[K];
};
type _KirkaMap = KirkaMap.Config.IRequired & Partial<KirkaMap.Config.IOptional> & Partial<KirkaMap.Config.IEnvironment>;
export type KirkaMap<isDecorated extends boolean = boolean> = isDecorated extends true ? Decorated<_KirkaMap> : (isDecorated extends false ? _KirkaMap : (_KirkaMap | Decorated<_KirkaMap>));
export declare namespace KirkaMap {
    const CHUNK_SIZE = 16;
    const CHUNK_VOLUME: number;
    namespace Config {
        type ChunkCoordinate = `${number},${number},${number}`;
        type ChunkBlock = [positionIndex: number, blockId: number, count: number];
        type ChunkData = ChunkBlock[];
        type Chunks = Record<ChunkCoordinate, ChunkData>;
        /** A player spawn position & rotation. */
        type SpawnPoint = {
            /**
             * The spawn position.
             *  - X & Z axis is forcefully aligned by Kirka to the center of the block (0.5, 0.0, 0.5)
             *  - Y axis has no restrictions and can be precisely placed.
             */
            pos: [x: number, y: number, z: number];
            /**
              * The spawn point's facing direction(s).
              *  - The pitch (up/down) has no affect and is always forced by Kirka to be 0.
              *  - The yaw amount is 0-360, counter-clockwise, in radians (0-6.28319):
              *    - North (-Z): `0.0`
              *    - West (-X): `1.5708`
              *    - South (+Z): `3.14159`
              *    - East (+X): `4.71239`
              */
            rotation: [pitch: number, yaw: number];
        };
        /**
         * Player spawns for the blue and red team.
         * Color/team does not matter in solo modes, and players will spawn at any spawn point.
         */
        type SpawnPoints = {
            /** An array of {@link SpawnPoint} for team 1 (Blue Team) */
            firstTeam: SpawnPoint[];
            /** An array of {@link SpawnPoint} for team 2 (Red Team) */
            secondTeam: SpawnPoint[];
        };
        /**
         * Regions extend from it's center potsition; 2.5 blocks X & Z, and 3 blocks Y (5x5x6 total)
         *
         *  - No placement restrictions and can be placed with precision on any axis.
         *  - Cannot be placed within 15m of each other in the Kirka map editor, but can be overridden manually.
         *  - Multiple purposes & functionality across various gamemodes.
         *
         * **Search & Destroy (S&D)**
         *  - Used to define where the gem can be placed.
         *  - TODO: Figure out if by placing region so it overlaps 2 blocks, will it allow gem placement in that partially-valid block-position.
         *
         * **Point**
         *  - As long as the player's feet are within the region, they will gain points.
         *  - Standing on top of the region is valid and will award points.
         *  - In point gamemodes, the point regions switch, going in the order that they appear in the array.
         *
         * **Parkour**
         *  - A region is used to define a parkour map's end point that completes the course.
         *  - If no region is defined and the map is loaded into a parkour gamemode, one will automatically be created at 0,0,0.
         *  - Only the first region definition (in the array) from the map data is used. All others are ignored, and will not trigger course completion.
         *
         */
        type Region = [x: number, y: number, z: number];
        /**
         * A checkpoint for parkour gamemodes; also known as a yellow flag.
         *
         * Checkpoints act as both a respawn point, and a mini-region that detects when a player steps within it's bounds.
         * The dimensions are 1x1 and 1.6 blocks both up & down from the center origin (3.2 blocks high total)
         *
         *  - No positioning restrictions and can be placed precisely on any axis.
         *  - Respawning at a checkpoint will retain your current facing direction.
         *  - Triggering a checkpoint will allow you to re-use and trigger any previous
         *  - The order of placement/appearance (in the array) will affect the message "Player has reached chekpoint X"
         *
         */
        type Checkpoint = [x: number, y: number, z: number];
        /** Settings that are required for the map config to be considered valid */
        interface IRequired {
            mapName?: string;
            chunks: Config.Chunks;
            spawnPlaces: Config.SpawnPoints;
        }
        interface IOptional {
            flagPlaces: KirkaMap.Config.Region[];
            yellowFlagPlaces: Config.Checkpoint[];
        }
        interface IEnvironment {
            /** Default: 0.6 */
            light: number;
            /** Default: 0.25 */
            blockLight: number;
            /** Default: 0.3 */
            brightness: number;
            /** Default: #ffffff */
            skyboxColor: `#${string}`;
            /** Default: blue */
            skyboxTexture: '' | 'blue' | 'blue-sun';
            /** Default: '' */
            fogColor: '' | `#${string}`;
            /** Default: 0 */
            fogNear: number;
            /** Default: 0 */
            fogFar: number;
            /** Default: #ffffff */
            fogAmbientColor: `#${string}`;
        }
        /**
         * Remove TypeScript's decorator suffix from the map data's property keys.
         * @param mapConfig The map config data.
         * @returns the cleaned map data.
         */
        function clean(mapConfig: any): KirkaMap<false>;
    }
    namespace ChunkUtils {
        /**
         * Parse a coordinate string to X/Y/Z numbers.
         * @param coord The coord string.
         * @param asTuple Return the coords as a tuple instead of a mapped object. Default: `false`.
         * @returns The parsed chunk coord.
         */
        function parseCoord<T extends boolean = false>(coord: string, asTuple?: T): T extends true ? [x: number, y: number, z: number] : {
            x: number;
            y: number;
            z: number;
        };
        /**
         * Decompress chunk data, separating compressed block definitions into individuals.
         * Also adds explicit air block definitions in any spaces where there is no block defined.
         * @param chunkData An array of blocks that belong to the chunk.
         * @param removeAir Whether or not to remove air blocks. Default: `false`.
         * @returns an expanded copy of the chunk data.
         */
        function expand(chunkData: Config.ChunkData, removeAir?: boolean): Config.ChunkBlock[];
        /**
         * Compress the chunk data, combining sequential blocks of the same type into singular definitions.
         * @param chunkData An array of blocks that belong to the chunk.
         * @param keepAir Whether or not to keep air blocks. Default: `false`.
         * @returns a compressed copy of the chunk data.
         */
        function compress(chunkData: Config.ChunkData, keepAir?: boolean): Config.ChunkData;
    }
    namespace BlockUtils {
        namespace FromIndexPosition {
            /**
             * Convert a block position index to a local XYZ coordinate.
             * @param index The block position index.
             * @returns the XYZ coordinates relative to the chunk.
             */
            function toLocal(index: number): [lx: number, ly: number, lz: number];
            /**
             * Convert a block position index to a global XYZ coordinate.
             * @param index The block position index within the chunk.
             * @param cx Chunk X.
             * @param cy Chunk Y.
             * @param cz Chunk Z.
             * @returns the XYZ coordinates relative to the world.
             */
            function toGlobal(index: number, cx?: number, cy?: number, cz?: number): [gx: number, gy: number, gz: number];
        }
        namespace FromLocalPosition {
            /**
             * Convert a local XYZ coordinate to a local block position index.
             * @param lx Local X.
             * @param ly Local Y.
             * @param lz Local Z.
             * @returns the block position index.
             */
            function toIndex(lx: number, ly: number, lz: number): number;
            /**
             * Convert local XYZ coordinates to global XYZ coordinates.
             * @param lx Local X.
             * @param ly Local Y.
             * @param lz Local Z.
             * @param cx Chunk X.
             * @param cy Chunk Y.
             * @param cz Chunk Z.
             * @returns the XYZ coordinates relative to the world.
             */
            function toGlobal(lx: number, ly: number, lz: number, cx?: number, cy?: number, cz?: number): [gx: number, gy: number, gz: number];
        }
        namespace FromGlobalPosition {
            /**
             * Converts a global XYZ coordinates to a local block position index.
             * @param gx Global X.
             * @param gy Global Y.
             * @param gz Global Z.
             * @returns the block position index, and the chunk coordinates it is relative to.
             */
            function toIndex(gx: number, gy: number, gz: number): [index: number, [cx: number, cy: number, cz: number]];
            /**
             * Converts a global XYZ coordinates to local XYZ coordinates.
             * @param gx Global X.
             * @param gy Global Y.
             * @param gz Global Z.
             * @returns the local XYZ coordinates, and the chunk coordinates they are relative to.
             */
            function toLocal(gx: number, gy: number, gz: number): [
                lx: number,
                ly: number,
                lz: number,
                [
                    cx: number,
                    cy: number,
                    cz: number
                ]
            ];
        }
    }
}
export {};
