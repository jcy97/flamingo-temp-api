import Joi from "joi";
import {
  LoginRequest,
  RegisterRequest,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  PageCreateRequest,
  PageUpdateRequest,
  CanvasCreateRequest,
  CanvasUpdateRequest,
  LayerCreateRequest,
  LayerUpdateRequest,
} from "../types";

export const loginSchema = Joi.object<LoginRequest>({
  email: Joi.string().email().required().messages({
    "string.email": "유효한 이메일 주소를 입력해주세요.",
    "any.required": "이메일을 입력해주세요.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "비밀번호는 최소 6자 이상이어야 합니다.",
    "any.required": "비밀번호를 입력해주세요.",
  }),
  remember: Joi.boolean().default(false),
});

export const registerSchema = Joi.object<RegisterRequest>({
  email: Joi.string().email().required().messages({
    "string.email": "유효한 이메일 주소를 입력해주세요.",
    "any.required": "이메일을 입력해주세요.",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.min": "비밀번호는 최소 8자 이상이어야 합니다.",
      "string.pattern.base":
        "비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.",
      "any.required": "비밀번호를 입력해주세요.",
    }),
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "이름은 최소 2자 이상이어야 합니다.",
    "string.max": "이름은 50자 이하여야 합니다.",
    "any.required": "이름을 입력해주세요.",
  }),
  user_type: Joi.string()
    .valid("artist", "student", "teacher")
    .required()
    .messages({
      "any.only": "유효한 사용자 타입을 선택해주세요.",
      "any.required": "사용자 타입을 선택해주세요.",
    }),
  agree_terms: Joi.boolean().valid(true).required().messages({
    "any.only": "서비스 이용약관에 동의해주세요.",
    "any.required": "서비스 이용약관에 동의해주세요.",
  }),
  agree_privacy: Joi.boolean().valid(true).required().messages({
    "any.only": "개인정보처리방침에 동의해주세요.",
    "any.required": "개인정보처리방침에 동의해주세요.",
  }),
  agree_marketing: Joi.boolean().default(false),
});

export const projectCreateSchema = Joi.object<ProjectCreateRequest>({
  name: Joi.string().min(1).max(100).required().messages({
    "string.min": "프로젝트 이름을 입력해주세요.",
    "string.max": "프로젝트 이름은 100자 이하여야 합니다.",
    "any.required": "프로젝트 이름을 입력해주세요.",
  }),
  description: Joi.string().max(500).optional().allow("").messages({
    "string.max": "프로젝트 설명은 500자 이하여야 합니다.",
  }),
});

export const projectUpdateSchema = Joi.object<ProjectUpdateRequest>({
  name: Joi.string().min(1).max(100).optional().messages({
    "string.min": "프로젝트 이름을 입력해주세요.",
    "string.max": "프로젝트 이름은 100자 이하여야 합니다.",
  }),
  description: Joi.string().max(500).optional().allow("").messages({
    "string.max": "프로젝트 설명은 500자 이하여야 합니다.",
  }),
  thumbnail: Joi.string().uri().optional().messages({
    "string.uri": "유효한 썸네일 URL을 입력해주세요.",
  }),
});

export const emailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "유효한 이메일 주소를 입력해주세요.",
    "any.required": "이메일을 입력해주세요.",
  }),
});

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    "any.required": "현재 비밀번호를 입력해주세요.",
  }),
  new_password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.min": "새 비밀번호는 최소 8자 이상이어야 합니다.",
      "string.pattern.base":
        "새 비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.",
      "any.required": "새 비밀번호를 입력해주세요.",
    }),
});

export const pageCreateSchema = Joi.object<PageCreateRequest>({
  name: Joi.string().min(1).max(100).required().messages({
    "string.min": "페이지 이름을 입력해주세요.",
    "string.max": "페이지 이름은 100자 이하여야 합니다.",
    "any.required": "페이지 이름을 입력해주세요.",
  }),
  order: Joi.number().integer().min(0).optional().messages({
    "number.integer": "순서는 정수여야 합니다.",
    "number.min": "순서는 0 이상이어야 합니다.",
  }),
});

export const pageUpdateSchema = Joi.object<PageUpdateRequest>({
  name: Joi.string().min(1).max(100).optional().messages({
    "string.min": "페이지 이름을 입력해주세요.",
    "string.max": "페이지 이름은 100자 이하여야 합니다.",
  }),
  order: Joi.number().integer().min(0).optional().messages({
    "number.integer": "순서는 정수여야 합니다.",
    "number.min": "순서는 0 이상이어야 합니다.",
  }),
});

export const canvasCreateSchema = Joi.object<CanvasCreateRequest>({
  name: Joi.string().min(1).max(100).required().messages({
    "string.min": "캔버스 이름을 입력해주세요.",
    "string.max": "캔버스 이름은 100자 이하여야 합니다.",
    "any.required": "캔버스 이름을 입력해주세요.",
  }),
  width: Joi.number().integer().min(1).max(10000).optional().messages({
    "number.integer": "너비는 정수여야 합니다.",
    "number.min": "너비는 1 이상이어야 합니다.",
    "number.max": "너비는 10000 이하여야 합니다.",
  }),
  height: Joi.number().integer().min(1).max(10000).optional().messages({
    "number.integer": "높이는 정수여야 합니다.",
    "number.min": "높이는 1 이상이어야 합니다.",
    "number.max": "높이는 10000 이하여야 합니다.",
  }),
  x: Joi.number().optional(),
  y: Joi.number().optional(),
  scale: Joi.number().min(0.1).max(10).optional().messages({
    "number.min": "배율은 0.1 이상이어야 합니다.",
    "number.max": "배율은 10 이하여야 합니다.",
  }),
  order: Joi.number().integer().min(0).optional().messages({
    "number.integer": "순서는 정수여야 합니다.",
    "number.min": "순서는 0 이상이어야 합니다.",
  }),
});

export const canvasUpdateSchema = Joi.object<CanvasUpdateRequest>({
  name: Joi.string().min(1).max(100).optional().messages({
    "string.min": "캔버스 이름을 입력해주세요.",
    "string.max": "캔버스 이름은 100자 이하여야 합니다.",
  }),
  width: Joi.number().integer().min(1).max(10000).optional().messages({
    "number.integer": "너비는 정수여야 합니다.",
    "number.min": "너비는 1 이상이어야 합니다.",
    "number.max": "너비는 10000 이하여야 합니다.",
  }),
  height: Joi.number().integer().min(1).max(10000).optional().messages({
    "number.integer": "높이는 정수여야 합니다.",
    "number.min": "높이는 1 이상이어야 합니다.",
    "number.max": "높이는 10000 이하여야 합니다.",
  }),
  x: Joi.number().optional(),
  y: Joi.number().optional(),
  scale: Joi.number().min(0.1).max(10).optional().messages({
    "number.min": "배율은 0.1 이상이어야 합니다.",
    "number.max": "배율은 10 이하여야 합니다.",
  }),
  order: Joi.number().integer().min(0).optional().messages({
    "number.integer": "순서는 정수여야 합니다.",
    "number.min": "순서는 0 이상이어야 합니다.",
  }),
});

const brushStrokeSchema = Joi.object({
  id: Joi.string().required(),
  points: Joi.array()
    .items(
      Joi.object({
        x: Joi.number().required(),
        y: Joi.number().required(),
        pressure: Joi.number().min(0).max(1).required(),
        timestamp: Joi.number().required(),
        actualRadius: Joi.number().min(0).optional(),
        actualOpacity: Joi.number().min(0).max(1).optional(),
        speed: Joi.number().min(0).optional(),
        direction: Joi.number().optional(),
      })
    )
    .required(),
  brushSettings: Joi.object({
    radius: Joi.number().min(0.1).optional(),
    color: Joi.string().optional(),
    opacity: Joi.number().min(0).max(1).optional(),
    hardness: Joi.number().min(0).max(1).optional(),
    blendMode: Joi.string().optional(),
    pressureOpacity: Joi.number().optional(),
    pressureSize: Joi.number().optional(),
    speedSize: Joi.number().optional(),
    smudgeLength: Joi.number().optional(),
    smudgeRadius: Joi.number().optional(),
    spacing: Joi.number().optional(),
    jitter: Joi.number().optional(),
    angle: Joi.number().optional(),
    roundness: Joi.number().optional(),
    dabsPerSecond: Joi.number().optional(),
    dabsPerRadius: Joi.number().optional(),
    speedOpacity: Joi.number().optional(),
    randomRadius: Joi.number().optional(),
    strokeThreshold: Joi.number().optional(),
    strokeDuration: Joi.number().optional(),
    slowTracking: Joi.number().optional(),
    slowTrackingPerDab: Joi.number().optional(),
    colorMixing: Joi.number().optional(),
    eraser: Joi.number().optional(),
    lockAlpha: Joi.number().optional(),
    colorizeMode: Joi.number().optional(),
    snapToPixel: Joi.number().optional(),
  }).required(),
  timestamp: Joi.number().required(),
  duration: Joi.number().min(0).optional(),
  bounds: Joi.object({
    minX: Joi.number().required(),
    minY: Joi.number().required(),
    maxX: Joi.number().required(),
    maxY: Joi.number().required(),
  }).optional(),
  renderData: Joi.array()
    .items(
      Joi.object({
        x: Joi.number().optional(),
        y: Joi.number().optional(),
        radius: Joi.number().min(0).optional(),
        opacity: Joi.number().min(0).max(1).optional(),
        color: Joi.string()
          .pattern(/^#[0-9A-Fa-f]{6}$/)
          .optional(),
        hardness: Joi.number().min(0).max(1).optional(),
        roundness: Joi.number().min(0).max(1).optional(),
        angle: Joi.number().optional(),
      })
    )
    .optional(),
});

const textStyleDataSchema = Joi.object({
  fontSize: Joi.number().min(1).required(),
  fontFamily: Joi.string().required(),
  fill: Joi.string().required(),
  letterSpacing: Joi.number().required(),
  lineHeight: Joi.number().min(0.1).required(),
  fontWeight: Joi.string().required(),
  fontStyle: Joi.string().required(),
  align: Joi.string().valid("left", "center", "right", "justify").required(),
  wordWrap: Joi.boolean().required(),
  wordWrapWidth: Joi.number().min(1).required(),
});

const textObjectSchema = Joi.object({
  id: Joi.string().required(),
  content: Joi.string().required(),
  x: Joi.number().required(),
  y: Joi.number().required(),
  style: textStyleDataSchema.required(),
  timestamp: Joi.number().required(),
});

const speechBubbleDataSchema = Joi.object({
  text: Joi.string().required(),
  x: Joi.number().required(),
  y: Joi.number().required(),
  width: Joi.number().min(1).required(),
  height: Joi.number().min(1).required(),
  style: Joi.string().required(),
  backgroundColor: Joi.string().optional(),
  borderColor: Joi.string().optional(),
  borderWidth: Joi.number().min(0).optional(),
});

const layerPersistentDataSchema = Joi.object({
  brushStrokes: Joi.array().items(brushStrokeSchema).optional(),
  textObjects: Joi.array().items(textObjectSchema).optional(),
  speechBubbleData: speechBubbleDataSchema.optional(),
  renderedImage: Joi.string().optional(),
  contentBounds: Joi.object({
    x: Joi.number().required(),
    y: Joi.number().required(),
    width: Joi.number().min(0).required(),
    height: Joi.number().min(0).required(),
  }).required(),
});

export const layerCreateSchema = Joi.object<LayerCreateRequest>({
  name: Joi.string().min(1).max(100).required().messages({
    "string.min": "레이어 이름을 입력해주세요.",
    "string.max": "레이어 이름은 100자 이하여야 합니다.",
    "any.required": "레이어 이름을 입력해주세요.",
  }),
  type: Joi.string()
    .valid("brush", "text", "shape", "image", "speechBubble")
    .required()
    .messages({
      "any.only": "유효한 레이어 타입을 선택해주세요.",
      "any.required": "레이어 타입을 입력해주세요.",
    }),
  visible: Joi.boolean().optional(),
  locked: Joi.boolean().optional(),
  opacity: Joi.number().min(0).max(1).optional().messages({
    "number.min": "투명도는 0 이상이어야 합니다.",
    "number.max": "투명도는 1 이하여야 합니다.",
  }),
  blend_mode: Joi.string().optional(),
  order: Joi.number().integer().min(0).optional().messages({
    "number.integer": "순서는 정수여야 합니다.",
    "number.min": "순서는 0 이상이어야 합니다.",
  }),
  layer_data: layerPersistentDataSchema.optional(),
});

export const layerUpdateSchema = Joi.object<LayerUpdateRequest>({
  name: Joi.string().min(1).max(100).optional().messages({
    "string.min": "레이어 이름을 입력해주세요.",
    "string.max": "레이어 이름은 100자 이하여야 합니다.",
  }),
  type: Joi.string()
    .valid("brush", "text", "shape", "image", "speechBubble")
    .optional()
    .messages({
      "any.only": "유효한 레이어 타입을 선택해주세요.",
    }),
  visible: Joi.boolean().optional(),
  locked: Joi.boolean().optional(),
  opacity: Joi.number().min(0).max(1).optional().messages({
    "number.min": "투명도는 0 이상이어야 합니다.",
    "number.max": "투명도는 1 이하여야 합니다.",
  }),
  blend_mode: Joi.string().optional(),
  order: Joi.number().integer().min(0).optional().messages({
    "number.integer": "순서는 정수여야 합니다.",
    "number.min": "순서는 0 이상이어야 합니다.",
  }),
  layer_data: layerPersistentDataSchema.optional(),
});
