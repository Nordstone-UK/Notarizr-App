import { PDFDocument, rgb } from 'pdf-lib';

// Function to convert points to SVG path data
const convertPointsToSvgPath = (points, pageWidth, pageHeight) => {
  const svgPath = points.map((point, index) => {
    const x = point.x * (pageWidth / 100);
    const y = (pageHeight - point.y) * (pageHeight / 100); // Invert y-axis
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return svgPath;
};

// Function to convert RGB string to pdf-lib RGB color
const rgbStringToRgb = (colorString) => {
  const match = colorString.match(/rgb\((\d+), (\d+), (\d+)\)/);
  if (match) {
    const [, r, g, b] = match;
    return rgb(parseInt(r), parseInt(g), parseInt(b));
  }
  return rgb(0, 0, 0); // Default color if parsing fails
};

const drawPathsOnPdf = async (paths, pdfBase64, currentPage) => {
  const pdfDoc = await PDFDocument.load(pdfBase64, {
    ignoreEncryption: true,
  });

  const page = pdfDoc.getPages()[currentPage - 1];
  const { width, height } = page.getSize();

  paths.forEach((path, index) => {
    if (path.type === 'pen' && Array.isArray(path.points) && path.points.length > 0) {
      console.log(`Path ${index}:`, JSON.stringify(path)); // Log the path object

      const svgPath = convertPointsToSvgPath(path.points, width, height);
      const color = rgbStringToRgb(path.color);

      // Draw the SVG path on the PDF page
      page.drawSvgPath(svgPath, {
        borderColor: color,
        borderWidth: 2, // Adjust the width as needed
      });
    }
    // Add handling for other path types like 'line', 'arrow', 'rectangle' here
  });

  const pdfBytesWithDrawing = await pdfDoc.save();
  return pdfBytesWithDrawing;
};

export default drawPathsOnPdf;
