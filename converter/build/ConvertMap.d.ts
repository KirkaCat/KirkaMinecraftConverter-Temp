import { KirkaMap } from "./Kirka/KirkaMap";
type ConvertOptions = {
    schematicName?: string;
    convertTeam1Spawns?: boolean;
    convertTeam2Spawns?: boolean;
    convertRegions?: boolean;
    convertCheckpoints?: boolean;
};
declare function _toMinecraft(mapData: KirkaMap<false>, options?: ConvertOptions): Uint8Array<ArrayBuffer> | undefined;
export declare namespace ConvertMap {
    const toMinecraft: typeof _toMinecraft;
}
export {};
