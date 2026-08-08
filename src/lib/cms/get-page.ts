import { connectDB } from "@/lib/db/connect";
import { PageContent } from "@/models/PageContent";
import {
  DEFAULT_PAGES,
  mergePageWithDefaults,
  fieldMap,
  type PageSlug,
  PAGE_LIST,
} from "@/lib/cms/default-pages";
import { Settings } from "@/models/Settings";
import { CONTACT } from "@/lib/data/fallback";

export async function getPage(slug: PageSlug) {
  try {
    await connectDB();
    const doc = await PageContent.findOne({ slug }).lean();
    return mergePageWithDefaults(slug, doc);
  } catch (err) {
    console.error(`[cms] getPage("${slug}") failed:`, err);
    return structuredClone(DEFAULT_PAGES[slug]);
  }
}

export async function getPageFields(slug: PageSlug, sectionKey: string) {
  const page = await getPage(slug);
  return fieldMap(page.sections, sectionKey);
}

export async function ensureDefaultPages() {
  await connectDB();
  for (const { slug } of PAGE_LIST) {
    const exists = await PageContent.findOne({ slug }).select("_id").lean();
    if (!exists) {
      await PageContent.create(structuredClone(DEFAULT_PAGES[slug]));
    }
  }
}

export type SiteContact = {
  brandName: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  city: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };
};

export async function getSiteContact(): Promise<SiteContact> {
  try {
    await connectDB();
    const s = await Settings.findOne().lean();
    if (!s) {
      return {
        brandName: "Yummilicious",
        phone: CONTACT.phone,
        email: CONTACT.email,
        whatsapp: CONTACT.whatsapp,
        address: "",
        city: "Islamabad",
        socialLinks: {},
      };
    }
    return {
      brandName: s.brandName || "Yummilicious",
      phone: s.phone || CONTACT.phone,
      email: s.email || CONTACT.email,
      whatsapp: s.whatsappNumber || CONTACT.whatsapp,
      address: s.address || "",
      city: s.city || "Islamabad",
      socialLinks: {
        instagram: s.socialLinks?.instagram,
        facebook: s.socialLinks?.facebook,
        tiktok: s.socialLinks?.tiktok,
        youtube: s.socialLinks?.youtube,
      },
    };
  } catch {
    return {
      brandName: "Yummilicious",
      phone: CONTACT.phone,
      email: CONTACT.email,
      whatsapp: CONTACT.whatsapp,
      address: "",
      city: "Islamabad",
      socialLinks: {},
    };
  }
}
