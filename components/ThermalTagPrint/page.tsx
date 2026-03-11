// "use client";

// import { useEffect, useRef } from "react";
// import JsBarcode from "jsbarcode";
// import QRCode from "qrcode";

// type LabelSize = "2x1" | "3x1" | "4x2";

// interface TagItem {
//   tagNo: string;
//   billNo: number;
//   sellingRate: number;
//   productName?: string;
//   weight?: string;
// }

// interface Props {
//   data: TagItem[];
//   labelSize?: LabelSize;
//   showQR?: boolean;
// }

// export default function ThermalTagPrinter({
//   data,
//   labelSize = "3x1",
//   showQR = false,
// }: Props) {
//   const barcodeRefs = useRef<(SVGSVGElement | null)[]>([]);
//   const qrRefs = useRef<(HTMLCanvasElement | null)[]>([]);

//   const sizes = {
//     "2x1": { width: "50mm", height: "25mm" },
//     "3x1": { width: "75mm", height: "25mm" },
//     "4x2": { width: "100mm", height: "50mm" },
//   };

//   const size = sizes[labelSize];

//   useEffect(() => {
//     data.forEach((item, i) => {
//       if (barcodeRefs.current[i]) {
//         JsBarcode(barcodeRefs.current[i], item.tagNo, {
//           format: "CODE128",
//           width: 1.4,
//           height: 30,
//           displayValue: false,
//           margin: 0,
//         });
//       }

//       if (showQR && qrRefs.current[i]) {
//         QRCode.toCanvas(qrRefs.current[i], item.tagNo, {
//           width: 40,
//         });
//       }
//     });

//     setTimeout(() => window.print(), 300);
//   }, [data, showQR]);

//   return (
//     <div className="thermal-root">
//       {data.map((item, i) => (
//         <div
//           key={i}
//           className="label"
//           style={{ width: size.width, height: size.height }}
//         >
//           <div className="top">
//             <span className="tag">{item.tagNo}</span>
//             <span className="price">₹{item.sellingRate}</span>
//           </div>

//           <div className="product">{item.productName}</div>

//           <svg
//             ref={(el) => (barcodeRefs.current[i] = el)}
//             className="barcode"
//           />

//           <div className="bottom">
//             <span>Bill: {item.billNo}</span>
//             <span>{item.weight}</span>
//           </div>

//           {showQR && <canvas ref={(el) => (qrRefs.current[i] = el)} />}
//         </div>
//       ))}

//       <style jsx global>{`

// body{
//  margin:0;
//  padding:0;
// }

// .thermal-root{
//  display:flex;
//  flex-direction:column;
// }

// .label{
//  border:1px solid #000;
//  font-family:Arial;
//  padding:2mm;
//  box-sizing:border-box;
//  display:flex;
//  flex-direction:column;
//  justify-content:center;
// }

// .top{
//  display:flex;
//  justify-content:space-between;
//  font-size:10pt;
//  font-weight:bold;
// }

// .product{
//  font-size:8pt;
//  text-align:center;
// }

// .barcode{
//  width:100%;
//  height:14mm;
// }

// .bottom{
//  display:flex;
//  justify-content:space-between;
//  font-size:8pt;
// }

// @media print{

// @page{
//  size:auto;
//  margin:0;
// }

// .label{
//  page-break-inside:avoid;
// }

// }

//       `}</style>
//     </div>
//   );
// }