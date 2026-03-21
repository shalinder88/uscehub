import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

export const US_STATES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
  CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"Washington DC",FL:"Florida",
  GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",
  IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",
  MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",
  MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",
  NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",
  OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",
  SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",
  VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"
};

export const SPECIALTIES = [
  "Internal Medicine","Family Medicine","Pediatrics","Surgery","Cardiology",
  "Neurology","Psychiatry","Radiology","Pathology","Emergency Medicine",
  "Obstetrics & Gynecology","Orthopedics","Dermatology","Ophthalmology",
  "Gastroenterology","Pulmonology","Nephrology","Oncology","Endocrinology",
  "Infectious Disease","Hematology","Rheumatology","Urology","Anesthesiology",
  "Critical Care","Public Health","Research","Multiple Specialties"
];

export const LISTING_TYPE_LABELS: Record<string, string> = {
  OBSERVERSHIP: "Observership",
  EXTERNSHIP: "Externship",
  RESEARCH: "Research Fellowship",
  POSTDOC: "Research Fellowship",
  ELECTIVE: "Elective",
  VOLUNTEER: "Volunteer",
};

export const LISTING_TYPE_COLORS: Record<string, string> = {
  OBSERVERSHIP: "bg-blue-50 text-blue-700",
  EXTERNSHIP: "bg-emerald-50 text-emerald-700",
  RESEARCH: "bg-violet-50 text-violet-700",
  POSTDOC: "bg-violet-50 text-violet-700",
  ELECTIVE: "bg-cyan-50 text-cyan-700",
  VOLUNTEER: "bg-pink-50 text-pink-700",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  HIDDEN: "bg-red-50 text-red-700",
  PAUSED: "bg-slate-100 text-slate-600",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
  WITHDRAWN: "Withdrawn",
};
