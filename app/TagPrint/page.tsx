"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { usePrint } from "@/context/print/usePrintContext";
import { Spinner, Text, VStack, Button } from "@chakra-ui/react";

export default function TagPrintPage() {
  const { data } = usePrint();
  const qrRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [isPrintReady, setIsPrintReady] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Generate QR codes
  useEffect(() => {
    if (!data || data.length === 0) return;

    data.forEach((item: any, i: number) => {
      const canvas = qrRefs.current[i];
      if (canvas && item.tagNo) {
        QRCode.toCanvas(canvas, item.tagNo, {
          width: 30,
          margin: 0,
          errorCorrectionLevel: "H",
        });
      }
    });

    setIsPrintReady(true);
  }, [data]);

  // Generate TSPL commands for your printer
  const generatePrinterCommands = () => {
    if (!data) return "";

    let commands = `
SIZE 97.5 mm, 25 mm
DIRECTION 0,0
REFERENCE 0,0
OFFSET 0 mm
SET PEEL OFF
SET CUTTER OFF
SET PARTIAL_CUTTER OFF
SET TEAR ON
CLS
`;

    data.forEach((item, i) => {
      const x = 20 + i * 100; // adjust horizontal spacing per label if needed
      commands += `
TEXT ${x},5,"0",0,12,12,"RANGAS"
QRCODE ${x},20,L,3,A,0,M2,S7,"${item.tagNo}"
TEXT ${x + 70},20,"0",0,12,12,"${item.size || "S-2"}"
TEXT ${x},85,"0",0,10,10,"${item.batch || "B2520"}"
TEXT ${x},100,"0",0,10,10,"${item.addressLine1 || "BRS KAMATCHI VILAKKU"}"
TEXT ${x},115,"0",0,10,10,"${item.addressLine2 || "KAMAKSHI CROSS"}"
TEXT ${x},130,"0",0,14,14,"Rs.${Number(item.price || 0).toFixed(2)}"
TEXT ${x + 90},40,"0",90,10,10,"${item.sideCode || "BRBL4"}"
`;
    });

    commands += "PRINT 1,1";
    return commands;
  };

const handlePrint = () => {
  if (!data || data.length === 0) return;

  // Create printable HTML
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const htmlContent = `
    <html>
      <head>
        <title>Print Labels</title>
        <style>
          body { margin: 0; font-family: Arial, sans-serif; }
          .label {
            width: 97.5mm;
            height: 25mm;
            border: 1px solid #000;
            display: inline-block;
            margin: 0.5mm;
            padding: 2mm;
            box-sizing: border-box;
          }
          canvas { width: 12mm; height: 12mm; }
        </style>
      </head>
      <body>
        ${data
          .map(
            (item) => `
          <div class="label">
            <div>RANGAS</div>
            <canvas id="qr-${item.tagNo}"></canvas>
            <div>Size: ${item.size || "S-2"}</div>
            <div>Batch: ${item.batch || "B2520"}</div>
            <div>${item.addressLine1 || "BRS KAMATCHI VILAKKU"}</div>
            <div>${item.addressLine2 || "KAMAKSHI CROSS"}</div>
            <div>Rs.${Number(item.price || 0).toFixed(2)}</div>
            <div style="writing-mode: vertical-rl; text-orientation: mixed;">${
              item.sideCode || "BRBL4"
            }</div>
          </div>`
          )
          .join("")}
        <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
        <script>
          ${data
            .map(
              (item) => `
            QRCode.toCanvas(document.getElementById('qr-${item.tagNo}'), '${
                item.tagNo
              }', { width: 100 });
          `
            )
            .join("")}
          window.onload = () => { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

  if (!data || data.length === 0) {
    return (
      <VStack justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
        <Text mt={4}>No data to print</Text>
      </VStack>
    );
  }

  return (
    <VStack p={4} align="stretch">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)", // 4 columns
          gap: "1mm", // space between labels
        }}
      >
        {data.map((item: any, i: number) => (
          <div
            key={`${item.tagNo}-${i}`}
            style={{
              width: "25mm",
              height: "25mm",
              display: "flex",
              flexDirection: "column",
              padding: "1.5mm",
              background: "white",
              position: "relative",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {/* Header */}
            <Text
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                textAlign: "left",
                margin: 0,
                lineHeight: 1,
              }}
            >
              RANGAS
            </Text>

            {/* QR + Size/Batch */}
            <div
              style={{ display: "flex", alignItems: "flex-start", marginTop: "0.5mm" }}
            >
              <canvas
                ref={(el) => {
                  qrRefs.current[i] = el; // assign element to ref
                }}
                style={{
                  width: "12mm",
                  height: "12mm",
                  margin: 0,
                  display: "block",
                }}
              />
              <div
                style={{
                  marginLeft: "1mm",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "12mm",
                }}
              >
                <Text style={{ fontSize: "10px", lineHeight: 1, margin: 0 }}>
                  {item.size || "S-2"}
                </Text>
                <Text style={{ fontSize: "9px", lineHeight: 1, marginBottom: "5mm" }}>
                  {item.batch || "B2520"}
                </Text>
              </div>
            </div>

            {/* Address */}
            <Text style={{ fontSize: "8px", lineHeight: 1, marginTop: "-2.5mm" }}>
              {item.addressLine1 || "BRS KAMATCHI VILAKKU"}
            </Text>
            <Text style={{ fontSize: "8px", lineHeight: 1, margin: "0 0 0.2mm 0" }}>
              {item.addressLine2 || "KAMAKSHI CROSS"}
            </Text>

            {/* Price */}
            <Text
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                textAlign: "center",
                margin: "0.2mm 0",
              }}
            >
              Rs.{Number(item.price || 0).toFixed(2)}
            </Text>

            {/* Side Code Vertical */}
            <Text
              style={{
                fontSize: "9px",
                position: "absolute",
                right: "1mm",
                top: "2mm",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                fontWeight: "bold",
                margin: 0,
                lineHeight: 1,
              }}
            >
              {item.sideCode || "BRBL4"}
            </Text>
          </div>
        ))}
      </div>

      <Button colorScheme="blue" onClick={handlePrint} loading={isPrinting}>
        Print Labels
      </Button>
    </VStack>
  );
}