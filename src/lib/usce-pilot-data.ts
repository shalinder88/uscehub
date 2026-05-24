import type { UsceCard } from "@/lib/usce-maine-data";
import {
  PILOT_USCE_CARDS,
  PILOT_IMG_RELEVANT_COUNT,
  PILOT_US_ONLY_COUNT,
  PILOT_TOTAL_COUNT,
} from "@/data/usce/public-listings-pilot.generated";

export type { UsceCard } from "@/lib/usce-maine-data";

export const USCE_PILOT_CARDS: UsceCard[] = PILOT_USCE_CARDS;

const _nonPublic = USCE_PILOT_CARDS.filter(
  (c) =>
    c.display_bucket !== "READY_PUBLIC_IMG_RELEVANT" &&
    c.display_bucket !== "READY_PUBLIC_US_STUDENT_ONLY"
);
if (_nonPublic.length > 0) {
  throw new Error(
    `usce-pilot-data: non-public buckets detected: ${_nonPublic.map((c) => c.listing_id).join(", ")}`
  );
}

export {
  PILOT_IMG_RELEVANT_COUNT,
  PILOT_US_ONLY_COUNT,
  PILOT_TOTAL_COUNT,
};
