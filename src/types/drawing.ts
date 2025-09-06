export type LayerType = "brush" | "text" | "shape" | "image" | "speechBubble";

export interface Page {
  id: string;
  project_id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Canvas {
  id: string;
  page_id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface BrushDabData {
  x?: number;
  y?: number;
  radius?: number;
  opacity?: number;
  color?: string;
  hardness?: number;
  roundness?: number;
  angle?: number;
}

export interface BrushStroke {
  id: string;
  points: Array<{
    x: number;
    y: number;
    pressure: number;
    timestamp: number;
    actualRadius?: number;
    actualOpacity?: number;
    speed?: number;
    direction?: number;
  }>;
  brushSettings: {
    radius?: number;
    color?: string;
    opacity?: number;
    hardness?: number;
    blendMode?: string;
    pressureOpacity?: number;
    pressureSize?: number;
    speedSize?: number;
    smudgeLength?: number;
    smudgeRadius?: number;
    spacing?: number;
    jitter?: number;
    angle?: number;
    roundness?: number;
    dabsPerSecond?: number;
    dabsPerRadius?: number;
    speedOpacity?: number;
    randomRadius?: number;
    strokeThreshold?: number;
    strokeDuration?: number;
    slowTracking?: number;
    slowTrackingPerDab?: number;
    colorMixing?: number;
    eraser?: number;
    lockAlpha?: number;
    colorizeMode?: number;
    snapToPixel?: number;
  };
  timestamp: number;
  duration?: number;
  bounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  renderData?: BrushDabData[];
}

export interface TextStyleData {
  fontSize: number;
  fontFamily: string;
  fill: string;
  letterSpacing: number;
  lineHeight: number;
  fontWeight: string;
  fontStyle: string;
  align: "left" | "center" | "right" | "justify";
  wordWrap: boolean;
  wordWrapWidth: number;
}

export interface TextObject {
  id: string;
  content: string;
  x: number;
  y: number;
  style: TextStyleData;
  timestamp: number;
}

export interface SpeechBubbleData {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface LayerPersistentData {
  brushStrokes?: BrushStroke[];
  textObjects?: TextObject[];
  speechBubbleData?: SpeechBubbleData;
  renderedImage?: string;
  contentBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Layer {
  id: string;
  canvas_id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blend_mode: string;
  order_index: number;
  layer_data: LayerPersistentData;
  created_at: string;
  updated_at: string;
}

export interface PageCreateRequest {
  name: string;
  order?: number;
}

export interface PageUpdateRequest {
  name?: string;
  order?: number;
}

export interface CanvasCreateRequest {
  name: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  scale?: number;
  order?: number;
}

export interface CanvasUpdateRequest {
  name?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  scale?: number;
  order?: number;
}

export interface LayerCreateRequest {
  name: string;
  type: LayerType;
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  blend_mode?: string;
  order?: number;
  layer_data?: LayerPersistentData;
}

export interface LayerUpdateRequest {
  name?: string;
  type?: LayerType;
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  blend_mode?: string;
  order?: number;
  layer_data?: LayerPersistentData;
}

export interface WorkspaceData {
  project: {
    id: string;
    name: string;
    description?: string;
    thumbnail?: string;
    created_at: string;
    updated_at: string;
  };
  pages: Array<{
    id: string;
    name: string;
    order: number;
    canvases: Array<{
      id: string;
      name: string;
      width: number;
      height: number;
      x: number;
      y: number;
      scale: number;
      order: number;
      layers: Array<{
        id: string;
        name: string;
        type: LayerType;
        visible: boolean;
        locked: boolean;
        opacity: number;
        blend_mode: string;
        order: number;
        layer_data: Record<string, any>;
      }>;
    }>;
  }>;
}
