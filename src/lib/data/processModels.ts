// Este archivo simula una base de datos de definiciones de procesos.
// Cada objeto contiene los metadatos del proceso y el XML del diagrama BPMN.

export const processModels = [
  {
    id: 'MODEL-001',
    name: 'Proceso de Solicitud de Compra',
    description: 'Flujo estándar para la adquisición de bienes y servicios.',
    version: '1.2',
    lastModified: '2023-11-10',
    // --- XML CORREGIDO: Ahora incluye la sección <bpmndi:BPMNDiagram> con las coordenadas ---
    bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Solicitud Recibida">
      <bpmn:outgoing>Flow_1o1ag9g</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_1l5clya" name="Registrar Solicitud en Sistema">
      <bpmn:incoming>Flow_1o1ag9g</bpmn:incoming>
      <bpmn:outgoing>Flow_0f8uf55</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_1o1ag9g" sourceRef="StartEvent_1" targetRef="Activity_1l5clya" />
    <bpmn:exclusiveGateway id="Gateway_1vgg39d" name="¿Monto mayor a $500?">
      <bpmn:incoming>Flow_0f8uf55</bpmn:incoming>
      <bpmn:outgoing>Flow_0p6sxxb</bpmn:outgoing>
      <bpmn:outgoing>Flow_1xsv1ma</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:sequenceFlow id="Flow_0f8uf55" sourceRef="Activity_1l5clya" targetRef="Gateway_1vgg39d" />
    <bpmn:task id="Activity_0k8ufh6" name="Aprobación de Gerencia">
      <bpmn:incoming>Flow_0p6sxxb</bpmn:incoming>
      <bpmn:outgoing>Flow_0y99z5d</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_0p6sxxb" name="Sí" sourceRef="Gateway_1vgg39d" targetRef="Activity_0k8ufh6" />
    <bpmn:task id="Activity_1s1a27q" name="Aprobación Automática">
      <bpmn:incoming>Flow_1xsv1ma</bpmn:incoming>
      <bpmn:outgoing>Flow_1q7b8pq</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_1xsv1ma" name="No" sourceRef="Gateway_1vgg39d" targetRef="Activity_1s1a27q" />
    <bpmn:exclusiveGateway id="Gateway_0f0d2w9">
      <bpmn:incoming>Flow_0y99z5d</bpmn:incoming>
      <bpmn:incoming>Flow_1q7b8pq</bpmn:incoming>
      <bpmn:outgoing>Flow_1gq6z2h</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:sequenceFlow id="Flow_0y99z5d" sourceRef="Activity_0k8ufh6" targetRef="Gateway_0f0d2w9" />
    <bpmn:sequenceFlow id="Flow_1q7b8pq" sourceRef="Activity_1s1a27q" targetRef="Gateway_0f0d2w9" />
    <bpmn:task id="Activity_035g13d" name="Generar Orden de Compra">
      <bpmn:incoming>Flow_1gq6z2h</bpmn:incoming>
      <bpmn:outgoing>Flow_04z5q0r</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_1gq6z2h" sourceRef="Gateway_0f0d2w9" targetRef="Activity_035g13d" />
    <bpmn:endEvent id="Event_0f3y6w7" name="Proceso Finalizado">
      <bpmn:incoming>Flow_04z5q0r</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_04z5q0r" sourceRef="Activity_035g13d" targetRef="Event_0f3y6w7" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNEdge id="Flow_04z5q0r_di" bpmnElement="Flow_04z5q0r">
        <di:waypoint x="1050" y="117" />
        <di:waypoint x="1112" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1gq6z2h_di" bpmnElement="Flow_1gq6z2h">
        <di:waypoint x="855" y="117" />
        <di:waypoint x="950" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1q7b8pq_di" bpmnElement="Flow_1q7b8pq">
        <di:waypoint x="730" y="210" />
        <di:waypoint x="830" y="210" />
        <di:waypoint x="830" y="142" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0y99z5d_di" bpmnElement="Flow_0y99z5d">
        <di:waypoint x="730" y="40" />
        <di:waypoint x="830" y="40" />
        <di:waypoint x="830" y="92" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1xsv1ma_di" bpmnElement="Flow_1xsv1ma">
        <di:waypoint x="510" y="142" />
        <di:waypoint x="510" y="210" />
        <di:waypoint x="630" y="210" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="518" y="173" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0p6sxxb_di" bpmnElement="Flow_0p6sxxb">
        <di:waypoint x="510" y="92" />
        <di:waypoint x="510" y="40" />
        <di:waypoint x="630" y="40" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="561" y="22" width="13" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0f8uf55_di" bpmnElement="Flow_0f8uf55">
        <di:waypoint x="420" y="117" />
        <di:waypoint x="485" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1o1ag9g_di" bpmnElement="Flow_1o1ag9g">
        <di:waypoint x="238" y="117" />
        <di:waypoint x="320" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="202" y="99" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="180" y="142" width="81" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1l5clya_di" bpmnElement="Activity_1l5clya">
        <dc:Bounds x="320" y="77" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_1vgg39d_di" bpmnElement="Gateway_1vgg39d" isMarkerVisible="true">
        <dc:Bounds x="485" y="92" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="473" y="55" width="74" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0k8ufh6_di" bpmnElement="Activity_0k8ufh6">
        <dc:Bounds x="630" y="0" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1s1a27q_di" bpmnElement="Activity_1s1a27q">
        <dc:Bounds x="630" y="170" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_0f0d2w9_di" bpmnElement="Gateway_0f0d2w9" isMarkerVisible="true">
        <dc:Bounds x="805" y="92" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_035g13d_di" bpmnElement="Activity_035g13d">
        <dc:Bounds x="950" y="77" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0f3y6w7_di" bpmnElement="Event_0f3y6w7">
        <dc:Bounds x="1112" y="99" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1090" y="142" width="81" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
  },
  {
    id: 'MODEL-002',
    name: 'Proceso de Solicitud de Vacaciones',
    description: 'Flujo para gestionar las solicitudes de vacaciones de los empleados.',
    version: '1.0',
    lastModified: '2023-10-15',
    bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_029k075" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="4.4.0">
  <bpmn:process id="Process_VacationRequest" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Solicitud Recibida">
      <bpmn:outgoing>Flow_1f56s1m</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_1f56s1m" sourceRef="StartEvent_1" targetRef="Activity_1w5h8xa" />
    <bpmn:userTask id="Activity_1w5h8xa" name="Revisar Solicitud por Supervisor">
      <bpmn:incoming>Flow_1f56s1m</bpmn:incoming>
      <bpmn:outgoing>Flow_09d2kld</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_0k7f3j3" name="¿Aprobada?">
      <bpmn:incoming>Flow_09d2kld</bpmn:incoming>
      <bpmn:outgoing>Flow_1j3t2o2</bpmn:outgoing>
      <bpmn:outgoing>Flow_1o0s0u1</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:sequenceFlow id="Flow_09d2kld" sourceRef="Activity_1w5h8xa" targetRef="Gateway_0k7f3j3" />
    <bpmn:userTask id="Activity_0t2a3f7" name="Notificar al Empleado y a RRHH">
      <bpmn:incoming>Flow_1j3t2o2</bpmn:incoming>
      <bpmn:outgoing>Flow_0w0q51y</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_1j3t2o2" name="Sí" sourceRef="Gateway_0k7f3j3" targetRef="Activity_0t2a3f7" />
    <bpmn:endEvent id="Event_0x7k3j2" name="Proceso Terminado">
      <bpmn:incoming>Flow_0w0q51y</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_0w0q51y" sourceRef="Activity_0t2a3f7" targetRef="Event_0x7k3j2" />
    <bpmn:userTask id="Activity_1k2g2f3" name="Notificar Rechazo al Empleado">
      <bpmn:incoming>Flow_1o0s0u1</bpmn:incoming>
      <bpmn:outgoing>Flow_0f8e1k2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_1o0s0u1" name="No" sourceRef="Gateway_0k7f3j3" targetRef="Activity_1k2g2f3" />
    <bpmn:endEvent id="Event_1l2d3g4" name="Solicitud Rechazada">
      <bpmn:incoming>Flow_0f8e1k2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_0f8e1k2" sourceRef="Activity_1k2g2f3" targetRef="Event_1l2d3g4" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_VacationRequest">
      <bpmndi:BPMNEdge id="Flow_0f8e1k2_di" bpmnElement="Flow_0f8e1k2">
        <di:waypoint x="740" y="247" />
        <di:waypoint x="802" y="247" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1o0s0u1_di" bpmnElement="Flow_1o0s0u1">
        <di:waypoint x="510" y="155" />
        <di:waypoint x="510" y="247" />
        <di:waypoint x="640" y="247" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="518" y="198" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0w0q51y_di" bpmnElement="Flow_0w0q51y">
        <di:waypoint x="740" y="117" />
        <di:waypoint x="802" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1j3t2o2_di" bpmnElement="Flow_1j3t2o2">
        <di:waypoint x="535" y="130" />
        <di:waypoint x="640" y="130" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="581" y="112" width="13" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_09d2kld_di" bpmnElement="Flow_09d2kld">
        <di:waypoint x="430" y="130" />
        <di:waypoint x="485" y="130" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1f56s1m_di" bpmnElement="Flow_1f56s1m">
        <di:waypoint x="215" y="130" />
        <di:waypoint x="330" y="130" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="112" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="157" y="155" width="81" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1g21if8_di" bpmnElement="Activity_1w5h8xa">
        <dc:Bounds x="330" y="90" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_0k7f3j3_di" bpmnElement="Gateway_0k7f3j3" isMarkerVisible="true">
        <dc:Bounds x="485" y="105" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="478" y="81" width="63" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0y5s26s_di" bpmnElement="Activity_0t2a3f7">
        <dc:Bounds x="640" y="90" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0x7k3j2_di" bpmnElement="Event_0x7k3j2">
        <dc:Bounds x="802" y="112" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="778" y="155" width="84" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_18y4f5v_di" bpmnElement="Activity_1k2g2f3">
        <dc:Bounds x="640" y="207" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1l2d3g4_di" bpmnElement="Event_1l2d3g4">
        <dc:Bounds x="802" y="229" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="781" y="272" width="79" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
  }
];