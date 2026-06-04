/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useRef, useEffect, useState } from "react";
import { Download, FileImage, Check, Calendar } from "lucide-react";
import { RuleResult, EligibilityStatus } from "../types";

interface ReportCardCanvasProps {
  boy: { surname: string; yek: string };
  boyMother: { surname: string; yek: string };
  girl: { surname: string; yek: string };
  girlMother: { surname: string; yek: string };
  status: EligibilityStatus;
  results: RuleResult[];
}

export const ReportCardCanvas: React.FC<ReportCardCanvasProps> = ({
  boy,
  boyMother,
  girl,
  girlMother,
  status,
  results
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  // We redraw the canvas whenever the data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsGenerating(true);

    // Set high resolution for maximum clarity (Retina/Print quality)
    const scale = 2; 
    const width = 600;
    const height = 480;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    // 1. Background (Premium deep dark slate canvas)
    ctx.fillStyle = "#0f172a"; // slate-900
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient color glowing effect (top-right and bottom-left)
    let radialGlow = ctx.createRadialGradient(width - 50, 50, 10, width, 0, 180);
    radialGlow.addColorStop(0, "rgba(16, 185, 129, 0.08)"); // Emerald glow
    radialGlow.addColorStop(1, "transparent");
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, height);

    // 2. Traditional border (Double thin line borders in gold/amber color)
    ctx.strokeStyle = "#e2e8f0"; // slate-200
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    ctx.strokeStyle = "#d97706"; // golden amber
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // Decorative native corner motifs
    const drawCornerDecoration = (x: number, y: number, xDir: number, yDir: number) => {
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x, y + yDir * 15);
      ctx.lineTo(x, y);
      ctx.lineTo(x + xDir * 15, y);
      ctx.stroke();
    };
    drawCornerDecoration(16, 16, 1, 1);
    drawCornerDecoration(width - 16, 16, -1, 1);
    drawCornerDecoration(16, height - 16, 1, -1);
    drawCornerDecoration(width - 16, height - 16, -1, -1);

    // 3. Header Text with premium pairings
    ctx.fillStyle = "#f8fafc"; // slate-50
    ctx.font = "bold 16px Arial, system-ui-sans";
    ctx.textAlign = "center";
    ctx.fillText("MEITEI YEK SALAI CERTIFIED REPORT", width / 2, 45);

    // Separator line under Header
    ctx.strokeStyle = "rgba(217, 119, 6, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 56);
    ctx.lineTo(width - 40, 56);
    ctx.stroke();

    // 4. Status Badge Section
    let badgeColor = "#10b981"; // emerald
    let badgeBg = "rgba(16, 185, 129, 0.15)";
    let badgeBorder = "rgba(16, 185, 129, 0.35)";

    if (status === "NOT ELIGIBLE") {
      badgeColor = "#ef4444"; // red
      badgeBg = "rgba(239, 68, 68, 0.15)";
      badgeBorder = "rgba(239, 68, 68, 0.35)";
    } else if (status === "MANUAL VERIFICATION REQUIRED") {
      badgeColor = "#f59e0b"; // amber
      badgeBg = "rgba(245, 158, 11, 0.15)";
      badgeBorder = "rgba(245, 158, 11, 0.35)";
    }

    // Draw Badge Background
    ctx.fillStyle = badgeBg;
    ctx.strokeStyle = badgeBorder;
    ctx.lineWidth = 1;
    
    // Draw rounded rect
    const bx = width / 2 - 190;
    const by = 70;
    const bw = 380;
    const bh = 54;
    const r = 8;
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bw - r, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
    ctx.lineTo(bx + bw, by + bh - r);
    ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
    ctx.lineTo(bx + r, by + bh);
    ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text inside Badge
    ctx.fillStyle = badgeColor;
    ctx.font = "bold 13px Courier New, monospace";
    ctx.textAlign = "center";
    ctx.fillText("OUTCOME STATUS:", width / 2, 90);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px Arial, system-ui-sans";
    ctx.fillText(status, width / 2, 110);

    // 5. Lineages Section Columns
    ctx.textAlign = "left";
    
    // LEFT COLUMN: Grooms Details
    const lx = 40;
    const rx = width / 2 + 20;
    
    // Column 1 Box
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    ctx.fillRect(lx, 140, 240, 100);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.strokeRect(lx, 140, 240, 100);

    ctx.fillStyle = "#60a5fa"; // blue-400
    ctx.font = "bold 11px Arial";
    ctx.fillText("GROOM (BOY)", lx + 12, 160);

    ctx.fillStyle = "#f1f5f9"; // slate-100
    ctx.font = "bold 13px Arial";
    ctx.fillText(`${boy.surname}`, lx + 12, 180);
    
    ctx.fillStyle = "#94a3b8"; // slate-400
    ctx.font = "11px Arial";
    ctx.fillText(`Clan: ${boy.yek}`, lx + 12, 198);
    ctx.fillText(`Maternal Clan: ${boyMother.yek}`, lx + 12, 214);
    ctx.font = "italic 9px Arial";
    ctx.fillStyle = "#64748b";
    ctx.fillText(`(${boyMother.surname} lineage)`, lx + 12, 226);

    // RIGHT COLUMN: Brides Details
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    ctx.fillRect(rx, 140, 240, 100);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.strokeRect(rx, 140, 240, 100);

    ctx.fillStyle = "#f472b6"; // pink-400
    ctx.font = "bold 11px Arial";
    ctx.fillText("BRIDE (GIRL)", rx + 12, 160);

    ctx.fillStyle = "#f1f5f9";
    ctx.font = "bold 13px Arial";
    ctx.fillText(`${girl.surname}`, rx + 12, 180);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Arial";
    ctx.fillText(`Clan: ${girl.yek}`, rx + 12, 198);
    ctx.fillText(`Maternal Clan: ${girlMother.yek}`, rx + 12, 214);
    ctx.font = "italic 9px Arial";
    ctx.fillStyle = "#64748b";
    ctx.fillText(`(${girlMother.surname} lineage)`, rx + 12, 226);

    // 6. Checked Rules Audit Lists inside png
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 11px Arial";
    ctx.fillText("DECISION STAGE AUDIT TRACKS:", 40, 266);

    // Take top 3 rule reviews to prevent spilling
    const screenResults = results.slice(0, 3);
    let ry = 286;
    screenResults.forEach((res) => {
      let bulletColor = "#10b981";
      if (res.severity === "reject") bulletColor = "#ef4444";
      if (res.severity === "warning") bulletColor = "#f59e0b";

      // Draw bullet
      ctx.fillStyle = bulletColor;
      ctx.beginPath();
      ctx.arc(46, ry - 3, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw Title and msg
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "bold 10px Arial";
      ctx.fillText(res.title, 60, ry);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px Arial";
      const cleanMessage = res.message.length > 105 ? res.message.substring(0, 102) + "..." : res.message;
      ctx.fillText(cleanMessage, 60, ry + 12);
      
      ry += 28;
    });

    // 7. Footer Meta
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 395);
    ctx.lineTo(width - 40, 395);
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "8px Courier New, monospace";
    ctx.fillText("DECISION SUPPORT TOOL - ACCORDING TO TRADITIONAL YEK EXOGAMY LAWS", 40, 412);
    ctx.fillText(`REPORT TIMEOUT GENERATED: ${new Date().toISOString().substring(0, 10)} | MEITEI MARRIAGE PORTAL`, 40, 424);

    // Add security stamp seal visual on bottom right
    ctx.strokeStyle = "rgba(217, 119, 6, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(width - 64, 414, 22, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = "rgba(217, 119, 6, 0.05)";
    ctx.fill();

    ctx.fillStyle = "#d97706";
    ctx.font = "bold 6px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("CERTIFIED", width - 64, 411);
    ctx.fillText("YEK REPORT", width - 64, 420);

    // Export Canvas to Image Stream URL
    const url = canvas.toDataURL("image/png");
    setImagePreviewUrl(url);
    setIsGenerating(false);
  }, [boy, boyMother, girl, girlMother, status, results]);

  const handleDownload = async () => {
    if (!imagePreviewUrl) return;

    try {
      // Create a blob file from the base64 URL to feed Web Share API
      const res = await fetch(imagePreviewUrl);
      const blob = await res.blob();
      const filename = `Yek_Salai_Passport_${boy.surname}_and_${girl.surname}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      // Check if browser supports sharing files natives (e.g., mobile WhatsApp/Instagram/Telegram share)
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Yek Salai Marriage Eligibility Passport",
          text: `Certified Traditional Marriage Eligibility Passport for ${boy.surname} and ${girl.surname}. Verified online.`
        });
        return;
      }
    } catch (e) {
      console.warn("Share attempt failed/unsupported, falling back to download:", e);
    }

    // Default Fallback: Instant automated link click download
    const link = document.createElement("a");
    link.download = `Yek_Salai_Report_${boy.surname}_with_${girl.surname}.png`;
    link.href = imagePreviewUrl;
    link.click();
  };

  return (
    <div className="w-full">
      {/* Hidden high-res canvas source to render the passport card */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Sharing and Exporting Button trigger */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={!imagePreviewUrl}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
        id="btn-download-image"
      >
        <Download size={16} className="shrink-0" />
        Download & Share Eligibility Passport (PNG)
      </button>
    </div>
  );
};
