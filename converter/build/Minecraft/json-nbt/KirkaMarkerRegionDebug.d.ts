declare const KirkaMarkerRegionDebug: {
    name: string;
    value: {
        components: {
            type: string;
            value: {
                "minecraft:custom_model_data": {
                    type: string;
                    value: number;
                };
                "minecraft:entity_data": {
                    type: string;
                    value: {
                        NoGravity: {
                            type: string;
                            value: number;
                        };
                        Pose: {
                            type: string;
                            value: {
                                RightArm: {
                                    type: string;
                                    value: {
                                        type: string;
                                        value: number[];
                                    };
                                };
                            };
                        };
                        NoBasePlate: {
                            type: string;
                            value: number;
                        };
                        Team: {
                            type: string;
                            value: string;
                        };
                        Invulnerable: {
                            type: string;
                            value: number;
                        };
                        id: {
                            type: string;
                            value: string;
                        };
                        Marker: {
                            type: string;
                            value: number;
                        };
                        Invisible: {
                            type: string;
                            value: number;
                        };
                        PortalCooldown: {
                            type: string;
                            value: number;
                        };
                        Rotation: {
                            type: string;
                            value: {
                                type: string;
                                value: number[];
                            };
                        };
                        Tags: {
                            type: string;
                            value: {
                                type: string;
                                value: string[];
                            };
                        };
                        HandItems: {
                            type: string;
                            value: {
                                type: string;
                                value: ({
                                    components: {
                                        type: string;
                                        value: {
                                            "minecraft:custom_model_data": {
                                                type: string;
                                                value: number;
                                            };
                                        };
                                    };
                                    count: {
                                        type: string;
                                        value: number;
                                    };
                                    id: {
                                        type: string;
                                        value: string;
                                    };
                                } | {
                                    components?: undefined;
                                    count?: undefined;
                                    id?: undefined;
                                })[];
                            };
                        };
                    };
                };
                "minecraft:lore": {
                    type: string;
                    value: {
                        type: string;
                        value: string[];
                    };
                };
                "minecraft:custom_name": {
                    type: string;
                    value: string;
                };
                "minecraft:hide_additional_tooltip": {
                    type: string;
                    value: {};
                };
            };
        };
        count: {
            type: string;
            value: number;
        };
        id: {
            type: string;
            value: string;
        };
        DataVersion: {
            type: string;
            value: number;
        };
        type: {
            type: string;
            value: string;
        };
    };
};
export default KirkaMarkerRegionDebug;
