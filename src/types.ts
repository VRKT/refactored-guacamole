export interface GraphNode {
    id?: string | number;
    label: string;
    group?: string;
    color?: string;
    link?: string;
}

export interface GraphEdge {
    id?: string | number;
    from: string | number;
    to: string | number;
    label?: string;
}