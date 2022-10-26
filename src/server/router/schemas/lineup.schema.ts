import { z } from "zod";
import { Agent, Map } from "../../../../utils/enums";

/**
 * notes on how to handle file sizes
 * Could limit 1 img to be up to 4mb
 *
 * videos should be like 10-15 sec, equating up to around 150 MB
 *
 * IF possible make the above mentioned rules the standard
 *
 * If not: assume worst case scen: around 5 img and 1 vid, 180 MB w/wiggle room
 */
const MAX_FILE_SIZE = 1024 * 1024 * 4; // 4MB

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

// describes the form object for creating & editing lineups
export const lineupFormValues = z.object({
  title: z.string().min(1, { message: "Required" }),
  agent: z.string().min(1, { message: "An Agent has to be selected" }),
  map: z.string().min(1, { message: "A Map has to be selected" }),
  text: z.string().min(1, { message: "Required" }),
  isSetup: z.boolean(),
  image: z.any(),
});

export const createLineupSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  creator: z.string(),
  userId: z.string(),
  // TODO: double chek the refine behavior
  agent: z.string().min(1, { message: "An Agent has to be selected" }),
  map: z.string().min(1, { message: "A Map has to be selected" }),
  text: z.string().min(1, { message: "Text is required" }),
  isSetup: z.boolean(),
  // TODO: force multiple files to be selected
  image: z.any(),
});

export const editLineupSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  agent: z.string().min(1, { message: "An Agent has to be selected" }),
  map: z.string().min(1, { message: "A Map has to be selected" }),
  text: z.string().min(1, { message: "Text is required" }),
  isSetup: z.boolean(),
  // TODO: force multiple files to be selected
  image: z.any(),
});

/**
 * Attempt at file upload validationF
 * any()
    .refine((files) => files?.length == 1, "Image is required")
    .refine((files) => files?.[0].size <= MAX_FILE_SIZE, "Max file size is 5MB")
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "only jpg, jpeg, png and webp files are accepted"
    ),
 */

// For images this might be an option
// images: typeof window === 'undefined' ? z.any() : z.instanceof(File),
