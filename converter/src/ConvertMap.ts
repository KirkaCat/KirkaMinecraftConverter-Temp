import { BlockTranslation } from "./BlockTranslationReference.js";
import { KirkaMap } from "./Kirka/KirkaMap.js";
import nbt from './lib/nbt.js';
import pako from './lib/pako.js';
import KirkaMarkerBlueSpawn from "./Minecraft/json-nbt/KirkaMarkerBlueSpawn.js";
import KirkaMarkerRedSpawn from './Minecraft/json-nbt/KirkaMarkerRedSpawn.js';
import KirkaMarkerRegionDebug from './Minecraft/json-nbt/KirkaMarkerRegionDebug.js';
import KirkaMarkerCheckpointDebug from './Minecraft/json-nbt/KirkaMarkerCheckpointDebug.js';

const radiansToMinecraft = (radians: number) => {
  const degrees = radians * (180 / Math.PI);
  return (((-degrees - 180) + 180) % 360) - 180;
}

function minecraftToRadians(degrees: number) {
  return ((((-degrees - 180) * (Math.PI / 180)) % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
}

type ConvertOptions = {
    schematicName?: string;
    convertTeam1Spawns?: boolean;
    convertTeam2Spawns?: boolean;
    convertRegions?: boolean;
    convertCheckpoints?: boolean;
}

function _toMinecraft(mapData: KirkaMap<false>, options?: ConvertOptions) {
    options = options ?? {};
    options.schematicName = options.schematicName ?? ((mapData.mapName ?? "") || "convertedKirkaMap");
    options.convertTeam1Spawns = options.convertTeam1Spawns ?? true;
    options.convertTeam2Spawns = options.convertTeam2Spawns ?? true;
    options.convertRegions = options.convertRegions ?? true;
    options.convertCheckpoints = options.convertCheckpoints ?? true;

    const translationPalette: Set<BlockTranslation> = new Set([BlockTranslation.get(0) as BlockTranslation]); // Initialize the block palette with the air translation.
    const blockData: { translation: BlockTranslation, x: number, y: number, z: number }[] = [];

    let [minGlobalX, maxGlobalX] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
    let [minGlobalY, maxGlobalY] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
    let [minGlobalZ, maxGlobalZ] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

    for (const chunkCoordStr of Object.keys(mapData.chunks) as KirkaMap.Config.ChunkCoordinate[]) {
        const [cx, cy, cz] = chunkCoordStr.split(',').map(Number);
        const decompressedChunkData = KirkaMap.ChunkUtils.expand(mapData.chunks[chunkCoordStr], true);

        for (const block of decompressedChunkData) {
            const [blockPosIndex, blockId] = [block[0], block[1]];
            const translation = BlockTranslation.get(blockId);
            if (translation === undefined) throw new Error(`No block translation found for Kirka block ID: ${blockId}`);
            const [gx, gy, gz] = KirkaMap.BlockUtils.FromIndexPosition.toGlobal(blockPosIndex, cx, cy, cz);

            // Get min/max X/Y/Z

            [minGlobalX, maxGlobalX] = [
                Math.min(minGlobalX, gx),
                Math.max(maxGlobalX, gx)
            ];

            [minGlobalY, maxGlobalY] = [
                Math.min(minGlobalY, gy),
                Math.max(maxGlobalY, gy)
            ];

            [minGlobalZ, maxGlobalZ] = [
                Math.min(minGlobalZ, gz),
                Math.max(maxGlobalZ, gz)
            ];

            translationPalette.add(translation);
            blockData.push({
                translation: BlockTranslation.get(blockId) as BlockTranslation,
                x: gx,
                y: gy,
                z: gz,
            });

        }
    }

    const team1SpawnData: { x: number, y: number, z: number, rotation: number }[] = [];
    const team2SpawnData: { x: number, y: number, z: number, rotation: number }[] = [];
    const regionData: { x: number, y: number, z: number }[] = [];
    const checkpointData: { x: number, y: number, z: number }[] = [];

    // Team 1 spawn points
    if (options.convertTeam1Spawns && (mapData.spawnPlaces?.firstTeam)) {
        for (const spawnpoint of mapData.spawnPlaces.firstTeam) {
            const [gx, gy, gz, rotation] = [ spawnpoint.pos[0], spawnpoint.pos[1], spawnpoint.pos[2], spawnpoint.rotation[1] ];

            // Update the min/max X/Y/Z for the schematic data.

            [minGlobalX, maxGlobalX] = [
                Math.min(minGlobalX, gx),
                Math.max(maxGlobalX, gx)
            ];

            [minGlobalY, maxGlobalY] = [
                Math.min(minGlobalY, gy),
                Math.max(maxGlobalY, gy)
            ];

            [minGlobalZ, maxGlobalZ] = [
                Math.min(minGlobalZ, gz),
                Math.max(maxGlobalZ, gz)
            ];

            team1SpawnData.push({
                x: gx,
                y: gy,
                z: gz,
                rotation: rotation
            })

        }
    }

    // Team 2 spawn points
    if (options.convertTeam2Spawns && (mapData.spawnPlaces?.secondTeam)) {
        for (const spawnpoint of mapData.spawnPlaces.secondTeam) {
            const [gx, gy, gz, rotation] = [ spawnpoint.pos[0], spawnpoint.pos[1], spawnpoint.pos[2], spawnpoint.rotation[1] ];

            // Update the min/max X/Y/Z for the schematic data.

            [minGlobalX, maxGlobalX] = [
                Math.min(minGlobalX, gx),
                Math.max(maxGlobalX, gx)
            ];

            [minGlobalY, maxGlobalY] = [
                Math.min(minGlobalY, gy),
                Math.max(maxGlobalY, gy)
            ];

            [minGlobalZ, maxGlobalZ] = [
                Math.min(minGlobalZ, gz),
                Math.max(maxGlobalZ, gz)
            ];

            team2SpawnData.push({
                x: gx,
                y: gy,
                z: gz,
                rotation: rotation
            })

        }
    }

    // Region positions
    if (options.convertRegions && (mapData.flagPlaces)) {
        for (const regionPosition of mapData.flagPlaces) {
            const [gx, gy, gz] = [ regionPosition[0], regionPosition[1], regionPosition[2] ];

            // Update the min/max X/Y/Z for the schematic data.

            [minGlobalX, maxGlobalX] = [
                Math.min(minGlobalX, gx),
                Math.max(maxGlobalX, gx)
            ];

            [minGlobalY, maxGlobalY] = [
                Math.min(minGlobalY, gy),
                Math.max(maxGlobalY, gy)
            ];

            [minGlobalZ, maxGlobalZ] = [
                Math.min(minGlobalZ, gz),
                Math.max(maxGlobalZ, gz)
            ];

            regionData.push({
                x: gx,
                y: gy,
                z: gz
            })

        }
    }

    // Checkpoint positions
    if (options.convertCheckpoints && (mapData.yellowFlagPlaces)) {
        for (const checkpointPosition of mapData.yellowFlagPlaces) {
            const [gx, gy, gz] = [ checkpointPosition[0], checkpointPosition[1], checkpointPosition[2] ];

            // Update the min/max X/Y/Z for the schematic data.

            [minGlobalX, maxGlobalX] = [
                Math.min(minGlobalX, gx),
                Math.max(maxGlobalX, gx)
            ];

            [minGlobalY, maxGlobalY] = [
                Math.min(minGlobalY, gy),
                Math.max(maxGlobalY, gy)
            ];

            [minGlobalZ, maxGlobalZ] = [
                Math.min(minGlobalZ, gz),
                Math.max(maxGlobalZ, gz)
            ];

            checkpointData.push({
                x: gx,
                y: gy,
                z: gz
            })

        }
    }

    const [mapWidth, mapLength, mapHeight] = [
        (maxGlobalX - minGlobalX) + 1,
        (maxGlobalZ - minGlobalZ) + 1,
        (maxGlobalY - minGlobalY) + 1,
    ];

    // Apply normalization offset
    [...blockData, ...team1SpawnData, ...team2SpawnData, ...regionData, ...checkpointData ].forEach(pos => {
        pos.x = pos.x < 0
            ? pos.x + (0 - minGlobalX)
            : pos.x - minGlobalX

        pos.y = pos.y < 0
            ? pos.y + (0 - minGlobalY)
            : pos.y - minGlobalY

        pos.z = pos.z < 0
            ? pos.z + (0 - minGlobalZ)
            : pos.z - minGlobalZ
    })

    const [paletteMap, schematicBlockData]: [Record<string, number>, number[]] = [Object.fromEntries([...translationPalette.values()].map((translation, index) => [translation.minecraft.blockStateId, index])), []];
    for (const block of blockData) {
        const byteDataIndex = block.x + block.z * mapWidth + block.y * mapWidth * mapLength;
        const palletIndex = paletteMap[block.translation.minecraft.blockStateId];
        schematicBlockData[byteDataIndex] = palletIndex;
    }

    // Encode as varint array
    const byteData: number[] = [];
    Array.from(schematicBlockData, v => (v ?? 0)).forEach(int => {
        const bytes = [];
        while (int > 127) {
            bytes.push((int & 0x7F) | 0x80);
            int >>>= 7;
        }
        bytes.push(int);
        byteData.push(...bytes);
    })

    const entityNbtData: nbt.ListTag<nbt.CompoundTag> = { type: 'list', value: { type: 'compound', value: [] } };

    if (team1SpawnData.length >0) {
        for (const i in team1SpawnData) {
            const spawn = team1SpawnData[i];
            const mcRotation = radiansToMinecraft(spawn.rotation);
            const entityNbt = (JSON.parse(JSON.stringify(KirkaMarkerBlueSpawn)) as typeof KirkaMarkerBlueSpawn).value.components.value["minecraft:entity_data"];
            entityNbt.value.Rotation.value.value[0] = mcRotation;
            entityNbt.value.PortalCooldown.value = entityNbt.value.PortalCooldown.value - Number(i);
            entityNbtData.value.value.push({
                // @ts-ignore
                Data: { type: 'compound', value: entityNbt.value },
                Pos: { type: 'list', value: { type: 'double', value: [
                    spawn.x,
                    spawn.y,
                    spawn.z
                ]}},
                Id: { type: 'string', value: 'minecraft:armor_stand' }
            })
        }
    }

    if (team2SpawnData.length >0) {
        for (const i in team2SpawnData) {
            const spawn = team2SpawnData[i];
            const mcRotation = radiansToMinecraft(spawn.rotation);
            const entityNbt = (JSON.parse(JSON.stringify(KirkaMarkerRedSpawn)) as typeof KirkaMarkerRedSpawn).value.components.value["minecraft:entity_data"];
            entityNbt.value.Rotation.value.value[0] = mcRotation;
            entityNbt.value.PortalCooldown.value = entityNbt.value.PortalCooldown.value - Number(i);
            entityNbtData.value.value.push({
                // @ts-ignore
                Data: { type: 'compound', value: entityNbt.value },
                Pos: { type: 'list', value: { type: 'double', value: [
                    spawn.x,
                    spawn.y,
                    spawn.z
                ]}},
                Id: { type: 'string', value: 'minecraft:armor_stand' }
            })
        }
    }

    if (regionData.length >0) {
        for (const i in regionData) {
            const region = regionData[i];
            const entityNbt = (JSON.parse(JSON.stringify(KirkaMarkerRegionDebug)) as typeof KirkaMarkerRegionDebug).value.components.value["minecraft:entity_data"];
            entityNbt.value.PortalCooldown.value = entityNbt.value.PortalCooldown.value - Number(i);
            entityNbtData.value.value.push({
                // @ts-ignore
                Data: { type: 'compound', value: entityNbt.value },
                Pos: { type: 'list', value: { type: 'double', value: [
                    region.x,
                    region.y,
                    region.z
                ]}},
                Id: { type: 'string', value: 'minecraft:armor_stand' }
            })
        }
    }

    if (checkpointData.length >0) {
        for (const i in checkpointData) {
            const checkpoint = checkpointData[i];
            const entityNbt = (JSON.parse(JSON.stringify(KirkaMarkerCheckpointDebug)) as typeof KirkaMarkerCheckpointDebug).value.components.value["minecraft:entity_data"];
            entityNbt.value.PortalCooldown.value = entityNbt.value.PortalCooldown.value - Number(i);
            entityNbtData.value.value.push({
                // @ts-ignore
                Data: { type: 'compound', value: entityNbt.value },
                Pos: { type: 'list', value: { type: 'double', value: [
                    checkpoint.x,
                    checkpoint.y,
                    checkpoint.z
                ]}},
                Id: { type: 'string', value: 'minecraft:armor_stand' }
            })
        }
    }

    const nbtData: Record<string, nbt.Tag> = {
        '': { type: 'compound', value: {
            Schematic: { type: 'compound', value: {
                Width: { type: 'short', value: mapWidth },
                Length: { type: 'short', value: mapLength },
                Height: { type: 'short', value: mapHeight },
                DataVersion: { type: 'int', value: 3839 },
                Version: { type: 'int', value: 3 },
                Blocks: { type: 'compound', value: {
                    BlockEntities: { type: 'list', value: { type: 'compound', value: [] } },
                    Data: { type: 'byteArray', value: byteData},
                    Palette: {
                        type: 'compound', value: Object.fromEntries([...translationPalette.values()].map((translation, index) => [translation.minecraft.blockStateId, { type: 'int', value: index }]))
                    }
                }},
                ...(entityNbtData.value.value.length > 0 ? { Entities: entityNbtData } : {})
            }}
        }}
    };

    const nbtWriter = new nbt.Writer();
    nbtWriter.compound(nbtData);
    const zippedData = pako.gzip(nbtWriter.getData());
    return zippedData;

    // const output = pako.gzip(nbtWriter.getData());
    // fs.writeFileSync(`D:/Other Software/MultiMC/instances/1.20.6/.minecraft/config/worldedit/schematics/${options.schematicName}.schem`, output as Uint8Array);
    // console.log(byteData.join(','));
    // console.log(`Width: ${mapWidth} | Length: ${mapLength} | Height: ${mapHeight}`);

}

export namespace ConvertMap {

    export const toMinecraft = _toMinecraft;

}