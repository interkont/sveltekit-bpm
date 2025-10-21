import type { Node, Edge } from '@xyflow/svelte';
import type { ProcessElementPayload, SequenceFlowPayload } from '$lib/types';

/**
 * Maps SvelteFlow node types to the BPMN types required by the API.
 */
const nodeTypeToBpmnType: Record<string, ProcessElementPayload['type']> = {
  startEvent: 'START_EVENT',
  endEvent: 'END_EVENT',
  userTask: 'USER_TASK',
  autoTask: 'AUTO_TASK',
  exclusiveGateway: 'EXCLUSIVE_GATEWAY',
  parallelGateway: 'PARALLEL_GATEWAY',
};

/**
 * Transforms SvelteFlow nodes and edges into the clean format required by the backend API.
 * @param nodes The array of nodes from the SvelteFlow instance.
 * @param edges The array of edges from the SvelteFlow instance.
 * @returns An object containing the transformed `elements` and `sequences` arrays.
 */
export function transformFlowToAPI(
  nodes: Node[],
  edges: Edge[]
): { elements: ProcessElementPayload[]; sequences: SequenceFlowPayload[] } {
  
  const elements: ProcessElementPayload[] = nodes.map((node) => {
    const bpmnType = nodeTypeToBpmnType[node.type || ''];
    if (!bpmnType) {
      // Skip unknown node types or throw an error
      console.warn(`Skipping unknown node type: ${node.type}`);
      return null;
    }

    const element: ProcessElementPayload = {
      bpmnElementId: node.id,
      name: node.data.label || 'Unnamed Element',
      type: bpmnType,
    };

    // Add optional fields only if they exist and are relevant
    if (node.data.description) {
      element.description = node.data.description;
    }

    if (bpmnType === 'START_EVENT' || bpmnType === 'USER_TASK') {
      if (node.data.assignedRoleId) {
        element.assignedRoleId = Number(node.data.assignedRoleId);
      }
    }

    if (bpmnType === 'AUTO_TASK') {
      if (node.data.webhook) {
        element.webhook_target = node.data.webhook;
      }
    }
    
    // Future-proofing for SLA
    if (node.data.sla_definition) {
      element.sla_definition = node.data.sla_definition;
    }

    return element;
  }).filter((el): el is ProcessElementPayload => el !== null); // Filter out any nulls from unknown types

  const sequences: SequenceFlowPayload[] = edges.map((edge) => {
    const sequence: SequenceFlowPayload = {
      sourceElementBpmnId: edge.source,
      targetElementBpmnId: edge.target,
    };

    // Add condition expression only if it's relevant and has a value
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (sourceNode?.type === 'exclusiveGateway' && edge.data?.condition) {
      sequence.conditionExpression = edge.data.condition;
    }

    return sequence;
  });

  return { elements, sequences };
}
