import xss from 'xss';

export const sanitizePlainText = (text: string): string => {
  return xss(text, {
    whiteList: {},
    stripIgnoreTag: false,
    stripIgnoreTagBody: ['script', 'style'],
    allowCommentTag: false,
  });
};

const ALLOWED_QUILL_CLASS_PREFIXES = ['ql-', 'quill-'];

export const sanitizeQuillContent = (html: string): string => {
  return xss(html, {
    whiteList: {
      p: [],
      br: [],
      strong: [],
      em: [],
      ol: ['start'],
      ul: [],
      li: ['data-list'],
      b: [],
      i: [],
      span: ['class'],
      div: ['class', 'contenteditable', 'data-placeholder'],
    },
    stripIgnoreTag: true,
    allowCommentTag: false,
    onIgnoreTagAttr: (name, value) => {
      // Allow Quill-specific classes
      if (name === 'class' && value) {
        const classList = value.split(/\s+/);
        const allowed = classList.filter((cls) =>
          ALLOWED_QUILL_CLASS_PREFIXES.some((prefix) => cls.startsWith(prefix))
        );
        return allowed.length ? `class="${allowed.join(' ')}"` : '';
      }
      return '';
    },
  });
};
