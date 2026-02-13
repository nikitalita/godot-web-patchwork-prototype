export interface OrderedProperty {
    value: string;
    order: number;
}

export interface TypeOrInstance {
    Type?: string;
    Instance?: string;
}

export interface GodotNode {
    id: number;
    name: string;
    type_or_instance: TypeOrInstance;
    instance_placeholder?: string;
    parent_id?: number;
    parent_id_path?: number[];
    owner?: string;
    owner_uid_path?: number[];
    index?: number;
    groups?: string;
    node_paths?: string;
    properties: Record<string, OrderedProperty>;
    child_node_ids: number[];
}

export interface ExternalResourceNode {
    resource_type: string;
    uid?: string;
    path: string;
    id: string;
    idx: number;
}

export interface SubResourceNode {
    id: string;
    resource_type: string;
    properties: Record<string, OrderedProperty>;
    idx: number;
}

export interface GodotConnection {
    signal: string;
    from_node_id: number;
    to_node_id: number;
    method: string;
    flags?: number;
    unbinds?: number;
    binds?: string;
}

export interface GodotScene {
    load_steps: number;
    format: number;
    uid: string;
    script_class?: string;
    resource_type: string;
    root_node_id?: number;
    ext_resources: Record<string, ExternalResourceNode>;
    sub_resources: Record<string, SubResourceNode>;
    nodes: Record<string, GodotNode>;
    connections: Record<string, GodotConnection>;
    editable_instances: Set<string>;
    main_resource?: SubResourceNode;
    requires_resave: boolean;
}

export function serializeGodotScene(structured_content: GodotScene): string {
    let output = '';

    // Write header
    if (structured_content.resource_type !== "PackedScene") {
        output += `[gd_resource type="${structured_content.resource_type}"`;
        if (structured_content.script_class) {
            output += ` script_class="${structured_content.script_class}"`;
        }
    } else {
        output += '[gd_scene';
    }

    if (structured_content.load_steps !== 0) {
        output += ` load_steps=${structured_content.load_steps}`;
    }
    output += ` format=${structured_content.format} uid="${structured_content.uid}"]\n\n`;

    // Write external resources
    const sortedExtResources = Object.entries(structured_content.ext_resources)
        .sort(([, a], [, b]) => a.idx - b.idx);

    for (const [, resource] of sortedExtResources) {
        output += `[ext_resource type="${resource.resource_type}"`;
        if (resource.uid) {
            output += ` uid="${resource.uid}"`;
        }
        output += ` path="${resource.path}" id="${resource.id}"]\n`;
    }

    if (sortedExtResources.length > 0) {
        output += '\n';
    }

    // Write sub-resources
    const sortedSubResources = Object.entries(structured_content.sub_resources)
        .sort(([, a], [, b]) => a.idx - b.idx);

    for (const [, resource] of sortedSubResources) {
        output += `[sub_resource type="${resource.resource_type}" id="${resource.id}"]\n`;

        // Write properties sorted by order
        const sortedProps = Object.entries(resource.properties)
            .sort(([, a], [, b]) => a.order - b.order);

        for (const [key, property] of sortedProps) {
            output += `${key} = ${property.value}\n`;
        }
        output += '\n';
    }

    // Write main resource if it exists
    if (structured_content.main_resource) {
        output += '[resource]\n';
        const sortedProps = Object.entries(structured_content.main_resource.properties)
            .sort(([, a], [, b]) => a.order - b.order);

        for (const [key, property] of sortedProps) {
            output += `${key} = ${property.value}\n`;
        }
        return output
    } else if (structured_content.resource_type !== "PackedScene") {
        console.error("resource with no resource tag!!");
    }

    // Write nodes
    const nodePathMap = new Map<number, number>();

    if (structured_content.nodes && structured_content.root_node_id) {
        const rootNode = structured_content.nodes[structured_content.root_node_id];
        if (rootNode) {
            output += serializeNode(rootNode, structured_content, nodePathMap);
        }
    }

    // Write connections
    const sortedConnections = Object.entries(structured_content.connections)
        .sort(([, a], [, b]) => {
            const aSort = nodePathMap.get(a.from_node_id) ?? -1;
            const bSort = nodePathMap.get(b.from_node_id) ?? -1;
            if (aSort === bSort) {
                return a.signal.localeCompare(b.signal);
            }
            return aSort - bSort;
        });

    if (sortedConnections.length > 0) {
        output += '\n';
    }
    for (const [, connection] of sortedConnections) {
        const fromPath = getNodePath(connection.from_node_id, structured_content);
        const toPath = getNodePath(connection.to_node_id, structured_content);

        output += `[connection signal="${connection.signal}" from="${fromPath}" to="${toPath}" method="${connection.method}"`;
        if (connection.flags !== undefined && connection.flags !== null) {
            output += ` flags=${connection.flags}`;
        }
        if (connection.unbinds !== undefined && connection.unbinds !== null) {
            output += ` unbinds=${connection.unbinds}`;
        }
        if (connection.binds) {
            output += ` binds=${connection.binds}`;
        }
        output += ']\n';
    }
    if (structured_content.editable_instances.size > 0) {
        output += '\n';
    }
    // Write editable instances
    for (const path of structured_content.editable_instances) {
        output += `[editable path="${path}"]\n`;
    }

    return output;
}


export function serializeGodotSceneAsUint8Array(structured_content: GodotScene): Uint8Array {
    return new TextEncoder().encode(serializeGodotScene(structured_content));
}

function serializeNode(node: GodotNode, scene: GodotScene, nodePathMap: Map<number, number>): string {
    let output = '';
    output += `[node name="${node.name}"`;
    // name, type, parent, parent_id_path, owner, owner_uid_path, index, unique_id, node_paths, groups, instance_placeholder, instance

    let type = node.type_or_instance.Type;
    let instance = node.type_or_instance.Instance;
    if (type) {
        output += ` type="${type}"`;
    }

    if (node.parent_id) {
        const parentName = node.parent_id === scene.root_node_id ? '.' : getNodePath(node.parent_id, scene);
        output += ` parent="${parentName}"`;
    }

    if (node.parent_id_path) {
        output += ` parent_id_path=${node.parent_id_path.join(',')}`;
    }
    if (node.owner) {
        output += ` owner="${node.owner}"`;
    }
    if (node.owner_uid_path) {
        output += ` owner_uid_path=${node.owner_uid_path.join(',')}`;
    }

    nodePathMap.set(node.id, nodePathMap.size);

    if (node.index !== undefined && node.index !== null) {
        output += ` index=${node.index}`;
    }

    output += ` unique_id=${node.id}`;

    if (node.node_paths) {
        output += ` node_paths=${node.node_paths}`;
    }

    if (node.groups) {
        output += ` groups=${node.groups}`;
    }

    if (node.instance_placeholder) {
        output += ` instance_placeholder=${node.instance_placeholder}`;
    }

    if (instance) {
        output += ` instance=${instance}`;
    }

    output += ']\n';

    // Write properties
    const sortedProps = Object.entries(node.properties)
        .sort(([, a], [, b]) => a.order - b.order);

    for (const [key, property] of sortedProps) {
        output += `${key} = ${property.value}\n`;
    }

    // sort the children by index
    for (const childId of node.child_node_ids) {
        output += '\n';
        const childNode = scene.nodes[childId];
        if (childNode) {
            output += serializeNode(childNode, scene, nodePathMap);
        }
    }

    return output;
}

function getNodePath(nodeId: number, scene: GodotScene): string {
    const node = scene.nodes[nodeId];
    if (!node) return '';

    if (nodeId === scene.root_node_id) {
        return '.';
    }

    let path = node.name;
    let currentId = nodeId;

    while (true) {
        const currentNode = scene.nodes[currentId];
        if (!currentNode || !currentNode.parent_id) break;

        const parentId = currentNode.parent_id;
        if (parentId === scene.root_node_id) {
            return path;
        }

        const parentNode = scene.nodes[parentId];
        if (!parentNode) break;

        path = `${parentNode.name}/${path}`;
        currentId = parentId;
    }

    return path;
}
