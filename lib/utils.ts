// Utility to parse Wikipedia JSON response
export const parseWikipediaDefinition = (jsonString: string) => {
  // Check if it's an error message (plain string, not JSON)
  if (!jsonString || !jsonString.startsWith('{')) {
    return [];
  }

  try {
    const data = JSON.parse(jsonString);
    if (!data.extract || data.extract === '') return [];
    const sections: { heading: string; content: string }[] = [];

    if (data.extract) {
      sections.push({
        heading: data.title || '',
        content: data.extract,
      });
    }

    return sections;
  } catch (error) {
    console.error('Error parsing Wikipedia JSON:', error);
    return [];
  }
};

// Utility to parse Wiktionary JSON response
export const parseWiktionaryDefinition = (jsonString: string) => {
  // Check if it's an error message (plain string, not JSON)
  if (!jsonString || !jsonString.startsWith('{')) {
    return [];
  }

  try {
    const data = JSON.parse(jsonString);
    const sections: { heading: string; content: string }[] = [];

    // Strip HTML tags helper
    const stripHtml = (html: string) => {
      // Loop until no more tags can be removed — prevents crafted inputs
      // like <scr<script>ipt> from surviving a single-pass strip
      let result = html;
      let prev: string;
      do {
        prev = result;
        result = result
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags and content
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags and content
          .replace(/<[^>]*>/g, ''); // Remove remaining HTML tags
      } while (result !== prev);
      return result
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .trim();
    };

    if (data.en && Array.isArray(data.en)) {
      data.en.forEach(
        (entry: {
          partOfSpeech?: string;
          definitions?: { definition: string }[];
        }) => {
          const partOfSpeech = entry.partOfSpeech || '';
          const definitions = entry.definitions || [];

          if (definitions.length > 0) {
            const content = definitions
              .map((def: { definition: string }) => stripHtml(def.definition))
              .filter((cleanDef: string) => cleanDef.length > 0)
              .map((cleanDef: string, idx: number) => `${idx + 1}. ${cleanDef}`)
              .join('\n');

            if (content) {
              sections.push({
                heading: partOfSpeech,
                content: content,
              });
            }
          }
        },
      );
    }

    return sections;
  } catch (error) {
    console.error('Error parsing Wiktionary JSON:', error);
    return [];
  }
};

export const detectIsMobile = (): boolean => {
  if (typeof navigator === 'undefined') return false; // SSR guard

  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };

  if (nav.userAgentData?.mobile !== undefined) {
    return nav.userAgentData.mobile;
  }

  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const detectIsSafariDesktop = (): boolean => {
  if (typeof navigator === 'undefined') return false; // SSR guard

  const ua = navigator.userAgent;

  // Check for Safari and exclude Chrome, Edge, and mobile Safari
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua);
  const isDesktop = !/iPhone|iPad|iPod/.test(ua);

  return isSafari && isDesktop;
};
