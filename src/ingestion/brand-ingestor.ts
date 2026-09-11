import { Brand, BrandSchema } from "../schema";

export interface BrandInput {
  name: string;
  websiteUrl?: string;
  tagline?: string;
  logo?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    muted?: string;
  };
  font?: string;
}

export class BrandIngestor {
  /**
   * Ingests brand details from structured input or scrapes public website metadata.
   */
  async ingest(input: BrandInput): Promise<Brand> {
    let extractedDetails: Partial<BrandInput> = {};

    if (input.websiteUrl) {
      try {
        console.log(`🌐 Ingesting brand metadata from ${input.websiteUrl}...`);
        extractedDetails = await this.scrapeWebsiteMetadata(input.websiteUrl);
      } catch (err: any) {
        console.warn(`⚠️ Website scraping failed for ${input.websiteUrl} (${err.message}). Using manual inputs.`);
      }
    }

    const brandName = input.name || extractedDetails.name || "Innovate Corp";
    const tagline = input.tagline || extractedDetails.tagline;
    const logo = input.logo || extractedDetails.logo;

    const brandColors = {
      primary: input.colors?.primary || extractedDetails.colors?.primary || "#6366F1",
      secondary: input.colors?.secondary || extractedDetails.colors?.secondary || "#4338CA",
      accent: input.colors?.accent || extractedDetails.colors?.accent || "#10B981",
      background: input.colors?.background || extractedDetails.colors?.background || "#090D16",
      text: input.colors?.text || extractedDetails.colors?.text || "#F8FAFC",
      muted: input.colors?.muted || extractedDetails.colors?.muted || "#94A3B8",
    };

    const font = input.font || extractedDetails.font || "system-ui, -apple-system, sans-serif";

    return BrandSchema.parse({
      name: brandName,
      tagline,
      logo,
      colors: brandColors,
      font,
    });
  }

  /**
   * Simple, robust HTML metadata scraper using regex
   */
  private async scrapeWebsiteMetadata(url: string): Promise<Partial<BrandInput>> {
    let cleanUrl = url;
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const resp = await fetch(cleanUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AdCraftBrandIngestor/1.0",
        },
      });

      clearTimeout(timeout);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const html = await resp.text();

      // Title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
      const title = (ogTitleMatch?.[1] || titleMatch?.[1] || "").trim();

      // Description / Tagline
      const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
      const description = (ogDescMatch?.[1] || descMatch?.[1] || "").trim();

      // Favicon / Logo
      const iconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i);
      let logoUrl: string | undefined = undefined;
      if (iconMatch?.[1]) {
        logoUrl = iconMatch[1].startsWith("http")
          ? iconMatch[1]
          : new URL(iconMatch[1], cleanUrl).toString();
      }

      // Theme Color
      const themeColorMatch = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i);
      const themeColor = themeColorMatch?.[1];

      // Extract brand name from title (e.g. "Stripe | Financial Infrastructure" -> "Stripe")
      let name = "";
      if (title) {
        const parts = title.split(/[|•–—:\-]/);
        name = parts[0]?.trim() || "";
      }

      return {
        name: name || undefined,
        tagline: description || undefined,
        logo: logoUrl,
        colors: themeColor ? { primary: themeColor } : undefined,
      };
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  }
}
