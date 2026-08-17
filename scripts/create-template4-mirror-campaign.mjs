import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const CAMPAIGN_KEY = "geonma-template4-mirror-selfie-v1";
export const CAMPAIGN_RELATIVE_ROOT = `artifacts/image-campaign/${CAMPAIGN_KEY}`;
export const CAMPAIGN_SCHEMA = "geonma-template4-mirror-selfie-campaign/v1";
export const JOB_SCHEMA = "geonma-template4-image-job/v1";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PROJECT_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const REGIONAL_OUTPUT_ROOT = "public/images/geonma-template4/regional-originals";
const ACTIVE_OUTPUT_ROOT = "public/images/geonmae-template4";

const LANES = [
  {
    key: "A",
    illumination: "bright",
    mirror: "a frameless full-height LED wall mirror with three crisp visible edges and a broad uninterrupted reflective surface",
    setting: "a pale-limestone urban fitting salon with one slim chrome console and no clutter",
    palette: "warm white, pale stone, and restrained brushed chrome",
    outfit: "a fully opaque dusty-rose long-sleeve knit with charcoal tailored trousers",
  },
  {
    key: "B",
    illumination: "bright",
    mirror: "a full-outline capsule mirror in a narrow satin-chrome frame, completely readable from top to bottom",
    setting: "a white-oak fashion studio with a clean plaster wall and one low upholstered stool",
    palette: "ivory, white oak, soft blush, and silver",
    outfit: "a modest ivory high-neck blouse with muted-plum wide-leg trousers",
  },
  {
    key: "C",
    illumination: "bright",
    mirror: "a large rounded-rectangle mirror with a brushed-chrome frame and all four corners visible",
    setting: "a bright hotel wardrobe vestibule with pale travertine and flush cabinetry",
    palette: "cream, light travertine, and cool chrome",
    outfit: "a fully buttoned taupe cardigan over an opaque cream top with black straight trousers",
  },
  {
    key: "D",
    illumination: "bright",
    mirror: "a generous circular wall mirror with its entire fine metal outline visible and a clearly reflective center",
    setting: "a blush-terrazzo dressing lounge with one floating shelf and a clean warm-white wall",
    palette: "blush stone, warm white, and pale champagne metal",
    outfit: "a modest charcoal long-sleeve jersey top with a rose-beige midi skirt below the knee",
  },
  {
    key: "E",
    illumination: "softly-dark",
    mirror: "a black-metal full-length floor mirror with three strong frame edges clearly inside the photograph",
    setting: "a graphite city loft dressing corner with one dark bench and controlled indirect light",
    palette: "graphite, black metal, muted rose, and soft amber",
    outfit: "an opaque muted-rose mock-neck top with black tailored trousers",
  },
  {
    key: "F",
    illumination: "softly-dark",
    mirror: "a smoked-bronze full-height mirror whose rectangular perimeter remains clearly visible despite the evening light",
    setting: "a rosewood hotel lobby alcove with clean stone flooring and no signage",
    palette: "rosewood, smoked bronze, cocoa, and dim gold",
    outfit: "a fully covered cocoa fine-knit top with cream straight trousers",
  },
  {
    key: "G",
    illumination: "softly-dark",
    mirror: "a floating rectangular mirror with a slim warm backlight, three visible edges, and an unmistakable reflection",
    setting: "a night-city dressing alcove with one distant window glow and a plain slate wall",
    palette: "slate, muted burgundy, warm amber, and dark glass",
    outfit: "a modest deep-plum long-sleeve blouse with charcoal wide-leg trousers",
  },
  {
    key: "H",
    illumination: "softly-dark",
    mirror: "a clean three-panel dressing mirror with both side seams and the complete upper outline visible",
    setting: "a dark boutique fitting room with matte panels, one simple stool, and no merchandise or labels",
    palette: "soft black, oxblood, brushed nickel, and warm skin-neutral light",
    outfit: "a fully opaque black turtleneck with muted-blush tailored trousers",
  },
  {
    key: "I",
    illumination: "softly-dark",
    mirror: "an asymmetric beveled mirror with a clearly traced edge and a reflective surface covering nearly half the frame",
    setting: "a slate-and-plum editorial studio with a single low stone plinth and uncluttered walls",
    palette: "slate, plum, pale stone, and low rose light",
    outfit: "a modest stone-gray long-sleeve top with a dark-plum midi skirt below the knee",
  },
  {
    key: "J",
    illumination: "softly-dark",
    mirror: "a wide panoramic dressing mirror with a complete lower edge and both side edges plainly visible",
    setting: "a deep-rose reception dressing space with a plain textured wall and one narrow console",
    palette: "deep rose, charcoal, dark walnut, and restrained amber",
    outfit: "a fully covered cream mock-neck knit with deep-burgundy tailored trousers",
  },
];

const REGIONAL_VARIANTS = [
  {
    pose: "standing in a relaxed three-quarter pose, framed from mid-thigh upward, with the free hand naturally visible",
    hair: "long softly waved dark hair with a clean center part",
    phone: "held just below eye level and covering only a small part of one cheek",
    camera: "a calm 35 mm editorial viewpoint with straight architectural lines",
  },
  {
    pose: "standing straight with both shoulders relaxed, framed from the knees upward",
    hair: "long straight dark hair tucked behind one ear",
    phone: "held at eye level in one anatomically correct hand",
    camera: "a slightly wider 32 mm viewpoint showing generous mirror outline",
  },
  {
    pose: "turning her shoulders a few degrees toward the mirror with a neutral closed-lip expression",
    hair: "collarbone-length smooth dark hair, clearly below the shoulders and never a short bob",
    phone: "held vertically near the right cheek without hiding the full face",
    camera: "a clean waist-up fashion portrait with natural perspective",
  },
  {
    pose: "standing farther from the mirror in a full-length fashion pose with both feet naturally grounded",
    hair: "long dark hair worn down with a gentle side part",
    phone: "held at upper-chest height while the face remains visible",
    camera: "a full-length composition with undistorted verticals",
  },
  {
    pose: "resting the free hand lightly near a plain console while keeping a composed posture",
    hair: "long loose dark waves with natural volume",
    phone: "held just to the side of the face rather than directly in front of it",
    camera: "a mid-length portrait with subtle depth and a clearly readable mirror frame",
  },
  {
    pose: "seated upright on a simple backless dressing stool, never on a bed, framed from the waist upward",
    hair: "long sleek dark hair with a neat center part",
    phone: "held at eye level with all visible fingers anatomically correct",
    camera: "a level seated portrait that still shows three mirror edges",
  },
  {
    pose: "standing at a slight diagonal and looking naturally at the phone screen",
    hair: "long dark hair in a low ponytail with soft face-framing strands",
    phone: "held a little below the eyes so both eyes remain readable",
    camera: "a restrained three-quarter composition with ample clean architecture",
  },
  {
    pose: "standing beside a minimal stool with one arm relaxed along the body",
    hair: "collarbone-length dark lob with softly curved ends, never chin-length",
    phone: "held vertically near the shoulder with a natural wrist angle",
    camera: "a knee-up portrait with balanced negative space",
  },
  {
    pose: "standing still in a natural just-before-the-photo moment rather than a playful pose",
    hair: "long softly layered dark hair tucked behind both shoulders",
    phone: "held at eye level with the phone reflection aligned correctly",
    camera: "a documentary-fashion composition with realistic scale and reflection",
  },
  {
    pose: "taking a composed waist-up mirror portrait with the free hand resting at the side",
    hair: "long straight dark hair with subtle face-framing layers",
    phone: "held just below eye level without covering the nose or mouth",
    camera: "a precise waist-up crop with the mirror outline still dominant",
  },
  {
    pose: "standing in a wider architectural composition that gives the mirror equal visual importance",
    hair: "long dark hair with quiet natural movement",
    phone: "held near the upper chest with the face fully visible",
    camera: "a wide 28 mm room portrait without edge distortion",
  },
  {
    pose: "seated upright on a slim vanity stool with both shoulders relaxed and both knees naturally aligned",
    hair: "long dark hair in a low neat bun with two soft face-framing strands",
    phone: "held at eye level and reflected once only",
    camera: "a centered seated portrait with a broad visible reflective surface",
  },
  {
    pose: "standing in a quiet side-facing posture and turning only the head toward the phone screen",
    hair: "long softly waved dark hair falling behind one shoulder",
    phone: "held vertically just outside the facial centerline",
    camera: "a refined mid-thigh crop with clear room geometry and mirror perimeter",
  },
];

const EDITORIAL_SLOTS = [
  {
    id: "gmb-t4-home-hero-v1",
    slot: "home.hero",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/hero-mirror.webp`,
    illumination: "softly-dark",
    aspectRatio: "16:9",
    cropProfile: "responsive-wide-hero",
    mirror: "a wide frameless mirror with three crisp visible edges and a clean softly lit reflective surface",
    setting: "a refined graphite-and-rose urban dressing lounge with pale stone flooring",
    outfit: "an opaque muted-rose long-sleeve knit with charcoal tailored trousers",
    pose: "standing on the right in a calm knee-up three-quarter pose",
    overlay: "Reserve the LEFT 40% as quiet low-detail copy space; keep the TOP 20% and BOTTOM 18% calm for the overlay header and search dock.",
  },
  {
    id: "gmb-t4-feature-01-v1",
    slot: "home.feature-01",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/feature-01.webp`,
    illumination: "bright",
    aspectRatio: "4:3",
    cropProfile: "feature-card",
    mirror: "a full-outline capsule mirror in satin chrome",
    setting: "a white-oak fitting studio with a pale plaster wall",
    outfit: "a fully opaque cream mock-neck top with plum tailored trousers",
    pose: "standing centered-right in a composed mid-thigh portrait",
    overlay: "Keep the TOP-RIGHT 20% and BOTTOM-LEFT 24% visually quiet for card labels.",
  },
  {
    id: "gmb-t4-feature-02-v1",
    slot: "home.feature-02",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/feature-02.webp`,
    illumination: "bright",
    aspectRatio: "4:3",
    cropProfile: "feature-card",
    mirror: "a rounded-rectangle mirror with all four brushed-chrome corners visible",
    setting: "a bright travertine hotel wardrobe vestibule",
    outfit: "a modest dusty-rose blouse with black straight trousers",
    pose: "standing a step back from the mirror so the complete outline reads clearly",
    overlay: "Keep the TOP-RIGHT 20% and BOTTOM-LEFT 24% visually quiet for card labels.",
  },
  {
    id: "gmb-t4-feature-03-v1",
    slot: "home.feature-03",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/feature-03.webp`,
    illumination: "bright",
    aspectRatio: "4:3",
    cropProfile: "feature-card",
    mirror: "a large circular mirror with its complete slim champagne-metal perimeter visible",
    setting: "a blush-terrazzo dressing room with a single floating shelf",
    outfit: "an opaque charcoal long-sleeve jersey top with a rose-beige skirt below the knee",
    pose: "standing slightly right of center in a relaxed waist-up portrait",
    overlay: "Keep the TOP-RIGHT 20% and BOTTOM-LEFT 24% visually quiet for card labels.",
  },
  {
    id: "gmb-t4-feature-04-v1",
    slot: "home.feature-04",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/feature-04.webp`,
    illumination: "softly-dark",
    aspectRatio: "4:3",
    cropProfile: "feature-card",
    mirror: "a black-metal floor mirror with three firm frame edges inside the crop",
    setting: "a graphite loft dressing corner with one narrow bench",
    outfit: "a modest muted-plum turtleneck with cream trousers",
    pose: "standing in a quiet knee-up pose with the free hand visible",
    overlay: "Keep the TOP-RIGHT 20% and BOTTOM-LEFT 24% visually quiet for card labels.",
  },
  {
    id: "gmb-t4-feature-05-v1",
    slot: "home.feature-05",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/feature-05.webp`,
    illumination: "softly-dark",
    aspectRatio: "4:3",
    cropProfile: "feature-card",
    mirror: "a smoked-bronze full-height mirror with both side edges and upper edge visible",
    setting: "a rosewood reception alcove with clean dark-stone flooring",
    outfit: "a fully covered taupe fine-knit top with dark-burgundy trousers",
    pose: "standing diagonally and looking at the phone with a neutral expression",
    overlay: "Keep the TOP-RIGHT 20% and BOTTOM-LEFT 24% visually quiet for card labels.",
  },
  {
    id: "gmb-t4-feature-06-v1",
    slot: "home.feature-06",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/feature-06.webp`,
    illumination: "softly-dark",
    aspectRatio: "4:3",
    cropProfile: "feature-card",
    mirror: "a floating rectangular mirror with a complete warm backlit outline",
    setting: "a slate dressing alcove with distant city light through one window",
    outfit: "an opaque cream high-neck blouse with charcoal wide-leg trousers",
    pose: "standing farther from the mirror in a restrained full-length pose",
    overlay: "Keep the TOP-RIGHT 20% and BOTTOM-LEFT 24% visually quiet for card labels.",
  },
  {
    id: "gmb-t4-feature-07-v1",
    slot: "home.feature-07",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/feature-07.webp`,
    illumination: "softly-dark",
    aspectRatio: "4:3",
    cropProfile: "feature-card",
    mirror: "a three-panel boutique mirror with both seams and the entire upper frame visible",
    setting: "a dark fitting salon with matte plum wall panels and no retail signs",
    outfit: "a modest black long-sleeve top with blush tailored trousers",
    pose: "seated upright on a simple stool, never on a bed, in a calm waist-up portrait",
    overlay: "Keep the TOP-RIGHT 20% and BOTTOM-LEFT 24% visually quiet for card labels.",
  },
  {
    id: "gmb-t4-feature-08-v1",
    slot: "home.feature-08",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/feature-08.webp`,
    illumination: "softly-dark",
    aspectRatio: "4:3",
    cropProfile: "feature-card",
    mirror: "an asymmetric beveled mirror with a clearly traced edge and broad reflection",
    setting: "a slate-and-rose editorial studio with one low stone plinth",
    outfit: "a fully opaque stone-gray knit with a deep-rose midi skirt below the knee",
    pose: "standing slightly right of center in a natural just-before-the-photo moment",
    overlay: "Keep the TOP-RIGHT 20% and BOTTOM-LEFT 24% visually quiet for card labels.",
  },
  {
    id: "gmb-t4-category-01-v1",
    slot: "home.category-01",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/category-01.webp`,
    illumination: "bright",
    aspectRatio: "4:5",
    cropProfile: "responsive-category-card",
    mirror: "a tall frameless LED mirror with three edges clearly visible",
    setting: "a pale-stone vertical dressing nook with one small chrome shelf",
    outfit: "an opaque blush long-sleeve top with charcoal trousers",
    pose: "standing centered-right in a compact waist-up portrait",
    overlay: "Keep a low-detail CENTRAL horizontal band for the category title and keep the face, phone, and mirror within the middle 54%.",
  },
  {
    id: "gmb-t4-category-02-v1",
    slot: "home.category-02",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/category-02.webp`,
    illumination: "bright",
    aspectRatio: "4:5",
    cropProfile: "responsive-category-card",
    mirror: "a complete pale-metal capsule mirror with a bright clean reflection",
    setting: "a warm-white and oak dressing niche without objects or signs",
    outfit: "a modest cream mock-neck knit with muted-plum trousers",
    pose: "standing straight in a central mid-thigh portrait",
    overlay: "Keep a low-detail CENTRAL horizontal band for the category title and keep the face, phone, and mirror within the middle 54%.",
  },
  {
    id: "gmb-t4-category-03-v1",
    slot: "home.category-03",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/category-03.webp`,
    illumination: "softly-dark",
    aspectRatio: "4:5",
    cropProfile: "responsive-category-card",
    mirror: "a black-metal floor mirror whose two sides and top remain visible",
    setting: "a graphite boutique fitting alcove with a plain wall",
    outfit: "a fully covered rose-beige top with black tailored trousers",
    pose: "standing centered in a calm knee-up reflection",
    overlay: "Keep a low-detail CENTRAL horizontal band for the category title and keep the face, phone, and mirror within the middle 54%.",
  },
  {
    id: "gmb-t4-category-04-v1",
    slot: "home.category-04",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/category-04.webp`,
    illumination: "softly-dark",
    aspectRatio: "4:5",
    cropProfile: "responsive-category-card",
    mirror: "a smoked-bronze rounded mirror with its full upper outline and both side edges visible",
    setting: "a dark rosewood dressing niche with controlled amber light",
    outfit: "an opaque charcoal turtleneck with cream trousers",
    pose: "standing slightly right of center with a relaxed free hand",
    overlay: "Keep a low-detail CENTRAL horizontal band for the category title and keep the face, phone, and mirror within the middle 54%.",
  },
  {
    id: "gmb-t4-category-05-v1",
    slot: "home.category-05",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/category-05.webp`,
    illumination: "softly-dark",
    aspectRatio: "4:5",
    cropProfile: "responsive-category-card",
    mirror: "an asymmetric beveled mirror with a broad clean reflection and clearly traced perimeter",
    setting: "a slate-plum studio corner with one low pale-stone block",
    outfit: "a modest muted-plum blouse with dark tailored trousers",
    pose: "standing in a composed three-quarter reflection kept within the central crop",
    overlay: "Keep a low-detail CENTRAL horizontal band for the category title and keep the face, phone, and mirror within the middle 54%.",
  },
  {
    id: "gmb-t4-home-contact-v1",
    slot: "home.contact",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/contact.webp`,
    illumination: "softly-dark",
    aspectRatio: "16:9",
    cropProfile: "responsive-contact-banner",
    mirror: "a wide rounded-rectangle mirror with its complete pale-chrome outline visible",
    setting: "a quiet deep-rose and graphite consultation lounge with one plain stone console",
    outfit: "a fully opaque ivory mock-neck knit with charcoal tailored trousers",
    pose: "standing on the right in a composed waist-up mirror portrait",
    overlay: "Reserve the LEFT 45% as calm low-detail copy space and keep the TOP and BOTTOM 16% visually quiet.",
  },
  {
    id: "gmb-t4-blog-note-01-v1",
    slot: "blog.note-01",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/blog/note-01.webp`,
    illumination: "bright",
    aspectRatio: "16:9",
    cropProfile: "editorial-blog-banner",
    mirror: "a wide rounded-rectangle mirror with three pale-chrome frame edges visible",
    setting: "a daylight limestone dressing lounge with a plain oak console",
    outfit: "a fully opaque ivory long-sleeve blouse with charcoal trousers",
    pose: "standing on the right in a natural waist-up mirror portrait",
    overlay: "Reserve the LEFT 42% as uncluttered copy space and keep the TOP 18% low detail.",
  },
  {
    id: "gmb-t4-blog-note-02-v1",
    slot: "blog.note-02",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/blog/note-02.webp`,
    illumination: "softly-dark",
    aspectRatio: "16:9",
    cropProfile: "editorial-blog-banner",
    mirror: "a panoramic smoked-bronze mirror with both side edges and lower edge visible",
    setting: "a softly dark rosewood dressing lounge with one distant city-light reflection",
    outfit: "a modest dusty-rose mock-neck knit with black trousers",
    pose: "standing on the right in a composed mid-thigh mirror portrait",
    overlay: "Reserve the LEFT 42% as uncluttered copy space and keep the TOP 18% low detail.",
  },
];

const BRAND_JOB = {
  id: "gmb-t4-brand-mark-v1",
  slot: "brand.mark",
  outputFile: `${ACTIVE_OUTPUT_ROOT}/brand/mark.png`,
  aspectRatio: "1:1",
};

const REPLACEMENT_SLOTS = [
  {
    id: "gmb-t4-feature-04-v2",
    slot: "home.feature-04",
    outputFile: `${ACTIVE_OUTPUT_ROOT}/home/feature-04.webp`,
    illumination: "softly-dark",
    aspectRatio: "4:3",
    cropProfile: "feature-card",
    mirror: "a freestanding black-metal floor mirror placed far enough back that its complete rectangular frame, all four corners, and all four edges are visible with clear wall margin",
    setting: "a graphite loft dressing corner with one narrow bench",
    outfit: "a modest muted-plum turtleneck with cream trousers",
    pose: "standing centered-right in a quiet knee-up pose with the free hand visible",
    overlay: "Keep the TOP-RIGHT 20% and BOTTOM-LEFT 24% visually quiet for card labels.",
    replacesJobId: "gmb-t4-feature-04-v1",
    replacementReason: "The first generation did not show three mirror-frame edges or the complete mirror outline inside the crop.",
    attempt: 2,
  },
];

const PHOTO_NEGATIVES = [
  "a person who looks under 25 or ambiguous in age",
  "a copied reference identity or recognizable celebrity",
  "cleavage, lingerie, transparent fabric, exposed midriff, or suggestive pose",
  "a bed, toilet, shower, cluttered bathroom, merchandise, or venue signage",
  "letters, numbers, captions, logos, brand marks, UI, borders, or watermarks",
  "duplicate person, duplicate reflection, extra limb, malformed hand, warped phone, or impossible mirror geometry",
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function publicUrlFor(outputFile) {
  if (!outputFile.startsWith("public/")) {
    throw new Error(`PUBLIC_OUTPUT_PATH_INVALID:${outputFile}`);
  }
  return `/${outputFile.slice("public/".length)}`;
}

function promptFileFor(jobClass, id) {
  return `${CAMPAIGN_RELATIVE_ROOT}/prompts/${jobClass}/${id}.txt`;
}

function jobFileFor(jobClass, id) {
  return `${CAMPAIGN_RELATIVE_ROOT}/jobs/${jobClass}/${id}.job.json`;
}

function createPhotoPrompt({ aspectRatio, illumination, mirror, setting, palette, outfit, pose, hair, phone, camera, overlay }) {
  const lightDirection = illumination === "bright"
    ? "Use bright, soft, natural-looking illumination with clean highlights and readable detail; never overexpose the mirror."
    : "Use softly dark, controlled evening illumination with readable skin, clothing, mirror edges, and room detail; never crush the shadows.";

  return [
    `Generate ONLY one clean edge-to-edge ${aspectRatio} PHOTOGRAPH, not a poster, advertisement, website mockup, collage, or interface.`,
    "Show exactly one clearly adult Korean woman age 26-34 taking a tasteful indoor mirror selfie with a plain modern black smartphone. One person only.",
    `The room must contain ${mirror}. The real physical mirror must be unmistakable: its reflective surface occupies at least 45% of the full image, and at least three frame edges or the complete mirror outline are plainly visible.`,
    `Setting: ${setting}.${palette ? ` Palette: ${palette}.` : ""}`,
    `Outfit: ${outfit}. Pose: ${pose}.`,
    hair ? `Hair: ${hair}.` : "Hair: long or below-shoulder natural dark hair, never a pixie cut or chin-length bob.",
    phone ? `Phone placement: ${phone}.` : "Phone placement: natural and vertical, covering no more than one small part of one cheek.",
    camera ? `Camera: ${camera}.` : "Camera: photorealistic editorial perspective with straight architectural lines and anatomically correct proportions.",
    lightDirection,
    "Keep the woman, face, phone, and the important mirror outline inside the central x=18%-82% and y=10%-92% crop-safe zone so both desktop and mobile object-cover crops remain usable.",
    overlay,
    "Mood is calm, polished urban fashion and wellness, never romantic, sensual, medical, or nightlife advertising.",
    "Use realistic Korean facial features, skin texture, hands, phone, fabric, room geometry, and a physically correct single reflection.",
    `Exclude: ${PHOTO_NEGATIVES.join("; ")}.`,
  ].join(" ");
}

function createBrandPrompt() {
  return [
    "Create ONLY one original transparent-background RGBA brand symbol for the Korean platform name 건마에반하다; do not render the Korean name or any other text inside the image.",
    "Design a compact, premium abstract mark built from two balanced mirror-like curved forms and one small negative-space glint, suggesting reflection, care, and a calm connection without using a literal heart, human body, face, phone, massage hands, or generic spa leaf.",
    "Use flat vector-like geometry in deep ink #292629 and vivid rose #D52656 with at most one pale blush accent #FBE8EE.",
    "The canvas must be square, the background fully transparent, the outer silhouette clean, and the symbol centered with 14% transparent padding on every side.",
    "No letters, numbers, words, badge tile, rounded-square container, drop shadow, glow, bevel, photo texture, mockup, watermark, or extra objects.",
    "It must remain distinct and legible at 32x32 pixels and also work as the source for a favicon derivative after human review.",
  ].join(" ");
}

function createBaseJob({ id, jobClass, slot, outputFile, aspectRatio, prompt, ...rest }) {
  const promptFile = promptFileFor(jobClass, id);
  const jobFile = jobFileFor(jobClass, id);
  return {
    schemaVersion: JOB_SCHEMA,
    campaign: CAMPAIGN_KEY,
    id,
    jobClass,
    slot,
    aspectRatio,
    prompt,
    promptFile,
    promptSha256: sha256(`${prompt}\n`),
    jobFile,
    outputFile,
    publicUrl: publicUrlFor(outputFile),
    generationStatus: "NOT_GENERATED",
    reviewStatus: "PENDING",
    approvalStatus: "NOT_APPROVED",
    releaseStatus: "NOT_RELEASED",
    ...rest,
  };
}

function createRegionalJobs() {
  const jobs = [];
  for (const [laneIndex, lane] of LANES.entries()) {
    for (const [variantIndex, variant] of REGIONAL_VARIANTS.entries()) {
      const sequence = laneIndex * REGIONAL_VARIANTS.length + variantIndex + 1;
      const id = `gmb-t4-rgn-${String(sequence).padStart(3, "0")}-v1`;
      const prompt = createPhotoPrompt({
        aspectRatio: "16:9",
        illumination: lane.illumination,
        mirror: lane.mirror,
        setting: lane.setting,
        palette: lane.palette,
        outfit: lane.outfit,
        pose: variant.pose,
        hair: variant.hair,
        phone: variant.phone,
        camera: variant.camera,
        overlay: "Reserve the LEFT 38% as calm low-detail copy space, keep the TOP 20% clean for the header, and keep the BOTTOM 18% quiet for page controls.",
      });

      jobs.push(createBaseJob({
        id,
        jobClass: "regional",
        slot: "regional.hero-original",
        outputFile: `${REGIONAL_OUTPUT_ROOT}/lane-${lane.key.toLowerCase()}/${id}.png`,
        aspectRatio: "16:9",
        prompt,
        lane: lane.key,
        laneOrdinal: variantIndex + 1,
        illumination: lane.illumination,
        cropProfile: "responsive-regional-hero",
        maxRouteReuse: 10,
        qaContract: {
          minimumVisibleMirrorArea: 0.45,
          minimumVisibleMirrorEdges: 3,
          centralCropSafeX: [0.18, 0.82],
          centralCropSafeY: [0.1, 0.92],
          leftCopySafeArea: 0.38,
          topHeaderSafeArea: 0.2,
          bottomControlSafeArea: 0.18,
          ownerExceptionAllowed: false,
        },
      }));
    }
  }
  return jobs;
}

function createEditorialJobs() {
  return EDITORIAL_SLOTS.map((slot) => createBaseJob({
    ...slot,
    jobClass: "editorial",
    prompt: createPhotoPrompt({
      ...slot,
      hair: "long naturally styled dark hair with no short pixie or chin-length bob",
      phone: "held vertically in one anatomically correct hand while leaving most of the adult face visible",
      camera: "photorealistic premium editorial photography with straight room lines, realistic proportions, and no artificial beauty-filter look",
    }),
    qaContract: {
      minimumVisibleMirrorArea: 0.45,
      minimumVisibleMirrorEdges: 3,
      centralCropSafeX: [0.18, 0.82],
      centralCropSafeY: [0.1, 0.92],
      ownerExceptionAllowed: false,
    },
  }));
}

function createBrandJob() {
  return createBaseJob({
    ...BRAND_JOB,
    jobClass: "brand",
    prompt: createBrandPrompt(),
    qaContract: {
      transparentBackgroundRequired: true,
      transparentPadding: 0.14,
      minimumLegibilitySize: "32x32",
      textInsideMarkAllowed: false,
      faviconDerivativeAllowedOnlyAfterHumanReview: true,
      ownerExceptionAllowed: false,
    },
  });
}

function createReplacementJobs() {
  return REPLACEMENT_SLOTS.map((slot) => createBaseJob({
    ...slot,
    jobClass: "replacement",
    prompt: createPhotoPrompt({
      ...slot,
      hair: "long naturally styled dark hair with no short pixie or chin-length bob",
      phone: "held vertically in one anatomically correct hand while leaving most of the adult face visible",
      camera: "photorealistic premium editorial photography with straight room lines, realistic proportions, and no artificial beauty-filter look",
    }),
    qaContract: {
      minimumVisibleMirrorArea: 0.45,
      minimumVisibleMirrorEdges: 3,
      completeMirrorOutlinePreferred: true,
      centralCropSafeX: [0.18, 0.82],
      centralCropSafeY: [0.1, 0.92],
      ownerExceptionAllowed: false,
    },
  }));
}

function manifestJob(job) {
  const record = { ...job };
  delete record.prompt;
  delete record.schemaVersion;
  return record;
}

export function validateCampaign(campaign) {
  const { jobs } = campaign;
  const regional = jobs.filter((job) => job.jobClass === "regional");
  const editorial = jobs.filter((job) => job.jobClass === "editorial");
  const replacement = jobs.filter((job) => job.jobClass === "replacement");
  const brand = jobs.filter((job) => job.jobClass === "brand");
  const ids = jobs.map((job) => job.id);
  const outputs = jobs.map((job) => job.outputFile);
  const prompts = jobs.map((job) => job.prompt);

  if (regional.length !== 130 || editorial.length !== 17 || replacement.length !== 1 || brand.length !== 1 || jobs.length !== 149) {
    throw new Error("CAMPAIGN_JOB_COUNT_INVALID");
  }
  if (new Set(ids).size !== jobs.length || new Set(outputs).size !== jobs.length - 1 || new Set(prompts).size !== jobs.length) {
    throw new Error("CAMPAIGN_UNIQUENESS_INVALID");
  }
  const repeatedOutputs = [...new Set(outputs.filter((output, index) => outputs.indexOf(output) !== index))];
  if (JSON.stringify(repeatedOutputs) !== JSON.stringify([`${ACTIVE_OUTPUT_ROOT}/home/feature-04.webp`])) {
    throw new Error("CAMPAIGN_REPLACEMENT_OUTPUT_INVALID");
  }

  const expectedRegionalIds = Array.from({ length: 130 }, (_, index) => `gmb-t4-rgn-${String(index + 1).padStart(3, "0")}-v1`);
  if (JSON.stringify(regional.map((job) => job.id)) !== JSON.stringify(expectedRegionalIds)) {
    throw new Error("REGIONAL_ID_SEQUENCE_INVALID");
  }

  for (const lane of LANES) {
    const laneJobs = regional.filter((job) => job.lane === lane.key);
    if (laneJobs.length !== 13 || laneJobs.some((job, index) => job.laneOrdinal !== index + 1 || job.illumination !== lane.illumination)) {
      throw new Error(`REGIONAL_LANE_INVALID:${lane.key}`);
    }
  }

  const brightRegional = regional.filter((job) => job.illumination === "bright");
  const softlyDarkRegional = regional.filter((job) => job.illumination === "softly-dark");
  if (brightRegional.length !== 52 || softlyDarkRegional.length !== 78) {
    throw new Error("REGIONAL_ILLUMINATION_DISTRIBUTION_INVALID");
  }

  const expectedEditorialOutputs = [
    `${ACTIVE_OUTPUT_ROOT}/home/hero-mirror.webp`,
    ...Array.from({ length: 8 }, (_, index) => `${ACTIVE_OUTPUT_ROOT}/home/feature-${String(index + 1).padStart(2, "0")}.webp`),
    ...Array.from({ length: 5 }, (_, index) => `${ACTIVE_OUTPUT_ROOT}/home/category-${String(index + 1).padStart(2, "0")}.webp`),
    `${ACTIVE_OUTPUT_ROOT}/home/contact.webp`,
    `${ACTIVE_OUTPUT_ROOT}/blog/note-01.webp`,
    `${ACTIVE_OUTPUT_ROOT}/blog/note-02.webp`,
  ];
  if (JSON.stringify(editorial.map((job) => job.outputFile)) !== JSON.stringify(expectedEditorialOutputs)) {
    throw new Error("EDITORIAL_SLOT_OUTPUT_INVALID");
  }
  if (brand[0].outputFile !== `${ACTIVE_OUTPUT_ROOT}/brand/mark.png`) {
    throw new Error("BRAND_SLOT_OUTPUT_INVALID");
  }
  if (replacement[0].id !== "gmb-t4-feature-04-v2" || replacement[0].replacesJobId !== "gmb-t4-feature-04-v1" || replacement[0].attempt !== 2) {
    throw new Error("REPLACEMENT_RELATION_INVALID");
  }
  for (const job of [...regional, ...editorial, ...replacement]) {
    const requiredPhrases = [
      "clearly adult Korean woman age 26-34",
      "reflective surface occupies at least 45%",
      "at least three frame edges or the complete mirror outline",
      "central x=18%-82% and y=10%-92% crop-safe zone",
      "One person only",
    ];
    if (!requiredPhrases.every((phrase) => job.prompt.includes(phrase))) {
      throw new Error(`PHOTO_PROMPT_CONTRACT_MISSING:${job.id}`);
    }
  }

  for (const job of jobs) {
    if (job.promptSha256 !== sha256(`${job.prompt}\n`)) {
      throw new Error(`PROMPT_DIGEST_INVALID:${job.id}`);
    }
    if (job.generationStatus !== "NOT_GENERATED" || job.approvalStatus !== "NOT_APPROVED" || job.releaseStatus !== "NOT_RELEASED") {
      throw new Error(`PREMATURE_STATUS_INVALID:${job.id}`);
    }
  }

  return campaign;
}

export function buildCampaign() {
  const regionalJobs = createRegionalJobs();
  const editorialJobs = createEditorialJobs();
  const replacementJobs = createReplacementJobs();
  const brandJob = createBrandJob();
  const jobs = [...regionalJobs, ...editorialJobs, ...replacementJobs, brandJob];
  const promptDigest = sha256(jobs.map((job) => `${job.id}\n${job.promptSha256}\n`).join(""));

  const manifest = {
    schemaVersion: CAMPAIGN_SCHEMA,
    campaign: CAMPAIGN_KEY,
    platform: {
      name: "건마에반하다",
      id: "geonmae-banhada",
      template: "Template4",
    },
    status: "READY_FOR_GENERATION",
    generationStatus: "NOT_GENERATED",
    reviewStatus: "PENDING",
    approvalStatus: "NOT_APPROVED",
    releaseStatus: "NOT_RELEASED",
    counts: {
      regionalPhotos: 130,
      editorialPhotos: 17,
      replacementPhotos: 1,
      brandMarks: 1,
      photographicJobs: 148,
      totalJobs: 149,
    },
    visualDirection: {
      concept: "clean indoor urban-fashion mirror selfie with the real mirror visibly dominant",
      subject: "one clearly adult Korean woman age 26-34",
      distinction: "chrome, pale stone, blush glass, graphite, and rosewood; not the prior warm spa-lounge mirror campaign",
      mirrorContract: "reflective surface >=45%; >=3 frame edges or complete outline; clean, beautiful physical mirror required",
      responsiveCropContract: "face, phone, subject, and important mirror outline remain within central x=18%-82%, y=10%-92%",
      safetyContract: "fully opaque modest clothing; no minor appearance, suggestive styling, copied identity, text, logo, watermark, duplicate reflection, malformed anatomy, bed, toilet, shower, or cluttered bathroom",
      ownerExceptionAllowed: false,
    },
    regionalPlan: {
      regionalRoutes: 1291,
      maxReusePerOriginal: 10,
      requiredOriginals: 130,
      exactReuseDistribution: { "10": 121, "9": 9 },
      laneSize: 13,
      lanes: Object.fromEntries(LANES.map((lane) => [lane.key, {
        illumination: lane.illumination,
        ids: regionalJobs.filter((job) => job.lane === lane.key).map((job) => job.id),
      }])),
      illuminationDistribution: {
        bright: 52,
        "softly-dark": 78,
      },
      originalsRoot: REGIONAL_OUTPUT_ROOT,
    },
    activeUiSlotPlan: {
      note: "The active Template4 UI contains 17 photographic non-regional slots, including the contact banner. One separate brand mark makes 18 non-regional jobs.",
      hero: 1,
      features: 8,
      categories: 5,
      blog: 2,
      contact: 1,
      brand: 1,
      editorialIlluminationDistribution: {
        bright: editorialJobs.filter((job) => job.illumination === "bright").length,
        "softly-dark": editorialJobs.filter((job) => job.illumination === "softly-dark").length,
      },
      outputs: [...editorialJobs, brandJob].map((job) => job.outputFile),
    },
    replacementPlan: {
      reason: "The original feature-04 generation failed the immutable mirror-frame QA contract and remains preserved as REJECTED.",
      relationships: replacementJobs.map((job) => ({
        rejectedJobId: job.replacesJobId,
        replacementJobId: job.id,
        activeOutput: job.outputFile,
        attempt: job.attempt,
      })),
    },
    promptDigest,
    jobs: jobs.map(manifestJob),
  };

  return validateCampaign({ manifest, jobs });
}

export async function writeNewOrExact(filePath, contents) {
  await mkdir(path.dirname(filePath), { recursive: true });
  try {
    await writeFile(filePath, contents, { flag: "wx" });
    return "created";
  } catch (error) {
    if (error?.code !== "EEXIST") {
      throw error;
    }
    const existing = await readFile(filePath, "utf8");
    if (existing !== contents) {
      throw new Error(`CAMPAIGN_DRIFT_REFUSED:${filePath}`);
    }
    return "exact";
  }
}

export async function writeCampaign(campaign = buildCampaign(), { projectRoot = DEFAULT_PROJECT_ROOT } = {}) {
  validateCampaign(campaign);
  const documents = [];

  for (const job of campaign.jobs) {
    documents.push({
      relativePath: job.promptFile,
      contents: `${job.prompt}\n`,
    });
    documents.push({
      relativePath: job.jobFile,
      contents: `${JSON.stringify(job, null, 2)}\n`,
    });
  }
  documents.push({
    relativePath: `${CAMPAIGN_RELATIVE_ROOT}/campaign.v1.json`,
    contents: `${JSON.stringify(campaign.manifest, null, 2)}\n`,
  });

  documents.sort((left, right) => left.relativePath.localeCompare(right.relativePath, "en"));
  const result = { created: 0, exact: 0 };
  for (const document of documents) {
    const outcome = await writeNewOrExact(path.join(projectRoot, document.relativePath), document.contents);
    result[outcome] += 1;
  }

  return {
    ...result,
    documents: documents.length,
    promptFiles: campaign.jobs.length,
    jobFiles: campaign.jobs.length,
    manifestFiles: 1,
    output: path.join(projectRoot, CAMPAIGN_RELATIVE_ROOT, "campaign.v1.json"),
    promptDigest: campaign.manifest.promptDigest,
  };
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const result = await writeCampaign();
  console.log(JSON.stringify(result, null, 2));
}
