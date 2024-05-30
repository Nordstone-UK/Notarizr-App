export type PdfObject = {
  type: 'image' | 'label' | 'text' | 'date';
  sourceUrl?: string;
  text?:string;
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
