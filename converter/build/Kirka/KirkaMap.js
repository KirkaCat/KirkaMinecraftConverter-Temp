const DECORATOR_SUFFIX = '___DATA';
const isMappedObject = (value) => typeof (value) === 'object' && !Array.isArray(value) && value !== null;
const removeMappedDecoratorSuffix = (data) => {
    if (isMappedObject(data)) {
        const newObj = {};
        for (const [key, value] of Object.entries(data)) {
            const correctedKey = key.replace(DECORATOR_SUFFIX, '');
            newObj[correctedKey] = removeMappedDecoratorSuffix(value);
        }
        return newObj;
    }
    else if (Array.isArray(data)) {
        return data.map(v => removeMappedDecoratorSuffix(v));
    }
    return data;
};
function _clone(obj) {
    if (typeof (obj) === 'object' && (obj instanceof Object)) {
        let newData;
        if (Array.isArray(obj)) {
            newData = [];
            for (const value of obj)
                newData.push(_clone(value));
        }
        else {
            newData = {};
            for (const key of Object.keys(obj)) {
                const value = obj[key];
                newData[key] = _clone(value);
            }
        }
        return newData;
    }
    return obj;
}
export var KirkaMap;
(function (KirkaMap) {
    KirkaMap.CHUNK_SIZE = 16;
    KirkaMap.CHUNK_VOLUME = Math.pow(KirkaMap.CHUNK_SIZE, 3);
    let Config;
    (function (Config) {
        // -- -- --
        /**
         * Remove TypeScript's decorator suffix from the map data's property keys.
         * @param mapConfig The map config data.
         * @returns the cleaned map data.
         */
        function clean(mapConfig) {
            let data;
            if (typeof (mapConfig) === 'string') {
                try {
                    data = JSON.parse(mapConfig);
                }
                catch {
                    throw new Error("Invalid map data - couldn't parse as valid JSON string.");
                }
            }
            else if (isMappedObject(mapConfig)) {
                data = mapConfig;
            }
            if (data === undefined)
                throw new Error("Invalid map config data.");
            return removeMappedDecoratorSuffix(data);
        }
        Config.clean = clean;
    })(Config = KirkaMap.Config || (KirkaMap.Config = {}));
    let ChunkUtils;
    (function (ChunkUtils) {
        /**
         * Parse a coordinate string to X/Y/Z numbers.
         * @param coord The coord string.
         * @param asTuple Return the coords as a tuple instead of a mapped object. Default: `false`.
         * @returns The parsed chunk coord.
         */
        function parseCoord(coord, asTuple = false) {
            const [x, y, z] = coord.split(',').map(Number);
            return (asTuple ? [x, y, z] : { x: x, y: y, z: z });
        }
        ChunkUtils.parseCoord = parseCoord;
        /**
         * Decompress chunk data, separating compressed block definitions into individuals.
         * Also adds explicit air block definitions in any spaces where there is no block defined.
         * @param chunkData An array of blocks that belong to the chunk.
         * @param removeAir Whether or not to remove air blocks. Default: `false`.
         * @returns an expanded copy of the chunk data.
         */
        function expand(chunkData, removeAir = false) {
            chunkData = _clone(chunkData).sort((a, b) => a[0] - b[0]);
            let [index, blocks] = [0, []];
            for (const blockData of chunkData) {
                const [blockPosIndex, blockId, blockCount] = [blockData[0], blockData[1], blockData[2]];
                while (index < blockPosIndex)
                    blocks.push([index++, 0, 1]); // Explicitly fill empty spaces wth air blocks
                for (let i = 0; (i < blockCount && index < KirkaMap.CHUNK_VOLUME); i++)
                    blocks.push([index++, blockId, 1]); // Separate compressed block definitions
            }
            while (index < KirkaMap.CHUNK_VOLUME)
                blocks.push([index++, 0, 1]); // Fill any remaining spaces wth air blocks 
            return removeAir ? blocks.filter(block => block[1] > 0) : blocks;
        }
        ChunkUtils.expand = expand;
        /**
         * Compress the chunk data, combining sequential blocks of the same type into singular definitions.
         * @param chunkData An array of blocks that belong to the chunk.
         * @param keepAir Whether or not to keep air blocks. Default: `false`.
         * @returns a compressed copy of the chunk data.
         */
        function compress(chunkData, keepAir = false) {
            chunkData = _clone(chunkData).sort((a, b) => a[0] - b[0]).filter(block => block[2] > 0); // Sort by position index and remove zero-count blocks
            if (!keepAir)
                chunkData = chunkData.filter(block => block[1] > 0); // Remove air blocks
            const compressedChunkData = [];
            const chunkDataEntries = chunkData.entries();
            let block = chunkDataEntries.next().value;
            while (block !== undefined) {
                const groupedBlocks = [];
                let lastBlock;
                do {
                    groupedBlocks.push(block[1]);
                    [lastBlock, block] = [block, chunkDataEntries.next().value];
                } while (block !== undefined &&
                    (block[1][0] - lastBlock[1][0]) === 1 && // Make sure the next block definition is one more in the block position index.
                    block[1][1] === lastBlock[1][1] // Make sure the block ID is the same as the last
                );
                const compressedBlock = groupedBlocks[0];
                for (let i = 1; i < groupedBlocks.length; i++)
                    compressedBlock[2] += groupedBlocks[i][2];
                compressedChunkData.push(compressedBlock);
            }
            return compressedChunkData;
        }
        ChunkUtils.compress = compress;
    })(ChunkUtils = KirkaMap.ChunkUtils || (KirkaMap.ChunkUtils = {}));
    let BlockUtils;
    (function (BlockUtils) {
        let FromIndexPosition;
        (function (FromIndexPosition) {
            /**
             * Convert a block position index to a local XYZ coordinate.
             * @param index The block position index.
             * @returns the XYZ coordinates relative to the chunk.
             */
            function toLocal(index) {
                const y = Math.floor(index / (KirkaMap.CHUNK_SIZE * KirkaMap.CHUNK_SIZE));
                const z = Math.floor((index % (KirkaMap.CHUNK_SIZE * KirkaMap.CHUNK_SIZE)) / KirkaMap.CHUNK_SIZE);
                const x = index % KirkaMap.CHUNK_SIZE;
                return [x, y, z];
            }
            FromIndexPosition.toLocal = toLocal;
            /**
             * Convert a block position index to a global XYZ coordinate.
             * @param index The block position index within the chunk.
             * @param cx Chunk X.
             * @param cy Chunk Y.
             * @param cz Chunk Z.
             * @returns the XYZ coordinates relative to the world.
             */
            function toGlobal(index, cx = 0, cy = 0, cz = 0) {
                const [lx, ly, lz] = toLocal(index);
                return [
                    (cx * KirkaMap.CHUNK_SIZE) + lx,
                    (cy * KirkaMap.CHUNK_SIZE) + ly,
                    (cz * KirkaMap.CHUNK_SIZE) + lz,
                ];
            }
            FromIndexPosition.toGlobal = toGlobal;
        })(FromIndexPosition = BlockUtils.FromIndexPosition || (BlockUtils.FromIndexPosition = {}));
        let FromLocalPosition;
        (function (FromLocalPosition) {
            /**
             * Convert a local XYZ coordinate to a local block position index.
             * @param lx Local X.
             * @param ly Local Y.
             * @param lz Local Z.
             * @returns the block position index.
             */
            function toIndex(lx, ly, lz) {
                return ly * KirkaMap.CHUNK_SIZE * KirkaMap.CHUNK_SIZE + lz * KirkaMap.CHUNK_SIZE + lx;
            }
            FromLocalPosition.toIndex = toIndex;
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
            function toGlobal(lx, ly, lz, cx = 0, cy = 0, cz = 0) {
                const index = toIndex(lx, ly, lz);
                return FromIndexPosition.toGlobal(index, cx, cy, cz);
            }
            FromLocalPosition.toGlobal = toGlobal;
        })(FromLocalPosition = BlockUtils.FromLocalPosition || (BlockUtils.FromLocalPosition = {}));
        let FromGlobalPosition;
        (function (FromGlobalPosition) {
            /**
             * Converts a global XYZ coordinates to a local block position index.
             * @param gx Global X.
             * @param gy Global Y.
             * @param gz Global Z.
             * @returns the block position index, and the chunk coordinates it is relative to.
             */
            function toIndex(gx, gy, gz) {
                const [lx, ly, lz, chunkXYZ] = toLocal(gx, gy, gz);
                return [FromLocalPosition.toIndex(lx, ly, lz), chunkXYZ];
            }
            FromGlobalPosition.toIndex = toIndex;
            /**
             * Converts a global XYZ coordinates to local XYZ coordinates.
             * @param gx Global X.
             * @param gy Global Y.
             * @param gz Global Z.
             * @returns the local XYZ coordinates, and the chunk coordinates they are relative to.
             */
            function toLocal(gx, gy, gz) {
                const [cx, cy, cz] = [
                    Math.floor(gx / KirkaMap.CHUNK_SIZE),
                    Math.floor(gy / KirkaMap.CHUNK_SIZE),
                    Math.floor(gz / KirkaMap.CHUNK_SIZE),
                ];
                return [
                    ((gx % KirkaMap.CHUNK_SIZE) + KirkaMap.CHUNK_SIZE) % KirkaMap.CHUNK_SIZE,
                    ((gy % KirkaMap.CHUNK_SIZE) + KirkaMap.CHUNK_SIZE) % KirkaMap.CHUNK_SIZE,
                    ((gz % KirkaMap.CHUNK_SIZE) + KirkaMap.CHUNK_SIZE) % KirkaMap.CHUNK_SIZE,
                    [cx, cy, cz]
                ];
            }
            FromGlobalPosition.toLocal = toLocal;
        })(FromGlobalPosition = BlockUtils.FromGlobalPosition || (BlockUtils.FromGlobalPosition = {}));
    })(BlockUtils = KirkaMap.BlockUtils || (KirkaMap.BlockUtils = {}));
})(KirkaMap || (KirkaMap = {}));
