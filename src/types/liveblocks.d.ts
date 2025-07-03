export type PdfObject = {
  id?: string;
  type: 'image' | 'label' | 'text' | 'date' | 'signature';
  content?: string;
  sourceUrl?: string;
  text?: string;
  fontfamily?: string;
  page: number;
  position: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
};
