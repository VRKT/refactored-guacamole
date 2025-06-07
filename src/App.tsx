import { useRef, useState, useEffect } from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';
import type { GraphNode, GraphEdge } from './types';

const defaultJson = `{
  "nodes": [
    { "id": 1, "label": "Dokument A", "link": "https://example.com/doc-a" },
    { "id": 2, "label": "Dokument B", "link": "https://example.com/doc-b" },
    { "id": 3, "label": "Dokument C", "link": "https://example.com/doc-c" }
  ],
  "edges": [
    { "from": 1, "to": 2 },
    { "from": 1, "to": 3 }
  ]
}`;

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState<string>(defaultJson);
  const [network, setNetwork] = useState<Network | null>(null);

  const renderGraph = (json: string) => {
    try {
      if (!containerRef.current) {
        console.error('Container reference is not available');
        return;
      }
      
      const parsed = JSON.parse(json) as { nodes: GraphNode[]; edges: GraphEdge[] };

      const edgesWithIds = parsed.edges.map((edge, index) => ({
        ...edge,
        id: edge.id || `e${index}`
      }));

      const nodes = new DataSet<GraphNode>(parsed.nodes);
      const edges = new DataSet<GraphEdge>(edgesWithIds);

      const data = { nodes, edges };
      const options = {
        nodes: {
          shape: 'dot',
          size: 16,
          font: { size: 16 },
          color: {
            hover: {
              border: '#2B7CE9',
              background: '#D2E5FF',
            },
          }
        },
        edges: {
          arrows: { to: true },
          smooth: true,
        },
        physics: {
          stabilization: true,
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
        },
      };

      if (network) {
        network.setData(data);
      } else {
        const newNet = new Network(containerRef.current, data, options);
        
        newNet.on('click', function(params) {
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = nodes.get(nodeId);
            if (node && typeof node === 'object' && 'link' in node && typeof node.link === 'string') {
              window.open(node.link, '_blank', 'noopener,noreferrer');
            }
          }
        });

        newNet.on('hoverNode', function(params) {
          const node = nodes.get(params.node);
          if (node && typeof node === 'object' && 'link' in node && typeof node.link === 'string') {
            containerRef.current!.style.cursor = 'pointer';
          }
        });
                
        newNet.on('blurNode', function() {
          containerRef.current!.style.cursor = 'default';
        });
        
        setNetwork(newNet);
      }
    } catch (e) {
      console.error('Fehler beim Parsen des JSON:', e);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      renderGraph(defaultJson);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (network) {
        network.destroy();
      }
    };
  }, [network]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dokumenten-Graph Prototyp</h2>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        style={{ width: '100%', fontFamily: 'monospace' }}
      />
      <button onClick={() => renderGraph(input)} style={{ marginTop: 10, border: '1px solid #ccc', padding: '10px 20px', cursor: 'pointer' }}>
        Update Graph
      </button>
      <div
        ref={containerRef}
        style={{ height: '500px', border: '1px solid #ccc', marginTop: 20 }}
      />
    </div>
  );
}

export default App;
