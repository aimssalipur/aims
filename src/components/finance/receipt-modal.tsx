"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  Share2,
  Copy,
  CheckCircle2,
  Download,
  Building2,
  Landmark,
  ShieldCheck,
  QrCode,
  X,
  FileCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { numberToWordsIndian } from "@/lib/number-to-words";
import { cn } from "@/lib/utils";

export interface ReceiptData {
  receiptNo: string;
  date: string | Date;
  type: "income" | "expense" | "fee" | "capital" | "repayment";
  title: string;
  partyName: string;
  partyRoleOrCourse?: string;
  partyContact?: string;
  category: string;
  amount: number;
  paymentMethod: string;
  referenceNo?: string;
  description: string;
  recordedBy?: string;
  verifiedBy?: string;
  status?: string;
  breakdownItems?: Array<{ label: string; amount: number; notes?: string }>;
}

interface ReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ReceiptData | null;
}

export function ReceiptModal({ open, onOpenChange, data }: ReceiptModalProps) {
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const formattedDate = new Date(data.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = new Date(data.date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const amountInWords = numberToWordsIndian(data.amount);

  const handlePrint = () => {
    const receiptElement = document.getElementById("aims-official-receipt");
    if (!receiptElement) {
      window.print();
      return;
    }

    toast({
      title: "Opening Print & PDF Preview 🖨️",
      description: "In the print dialog, select 'Save as PDF' or choose your printer.",
    });

    // Remove any previous print frame if left over
    const oldFrame = document.getElementById("aims-print-iframe");
    if (oldFrame) {
      oldFrame.remove();
    }

    // Create an isolated hidden iframe
    const iframe = document.createElement("iframe");
    iframe.id = "aims-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "-9999px";
    iframe.style.width = "210mm";
    iframe.style.height = "297mm";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all stylesheets and inline styles from the parent page
    let stylesHtml = "";
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      stylesHtml += node.outerHTML;
    });

    // Deep clone the receipt node and ensure image URLs are absolute
    const clonedReceipt = receiptElement.cloneNode(true) as HTMLElement;
    const images = clonedReceipt.querySelectorAll("img");
    images.forEach((img) => {
      const src = img.getAttribute("src");
      if (src && src.startsWith("/")) {
        img.src = window.location.origin + src;
      }
    });

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>AIMS_Receipt_${data.receiptNo}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${stylesHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              width: 100% !important;
              height: auto !important;
              min-height: auto !important;
              overflow: visible !important;
            }
            body {
              padding: 6px !important;
            }
            #aims-official-receipt {
              display: block !important;
              width: 100% !important;
              max-width: 780px !important;
              margin: 0 auto !important;
              padding: 24px 28px !important;
              background: #ffffff !important;
              color: #0f172a !important;
              border: 1.5px solid #0f172a !important;
              border-radius: 16px !important;
              box-shadow: none !important;
              overflow: visible !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          ${clonedReceipt.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    const printWindow = iframe.contentWindow;
    if (!printWindow) return;

    const triggerPrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (err) {
        console.error("Print frame error, using window.print():", err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            iframe.remove();
          }
        }, 4000);
      }
    };

    // Ensure images are fully loaded before opening print preview
    const docImages = doc.images;
    if (docImages.length > 0) {
      let loaded = 0;
      const total = docImages.length;
      let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

      const onImageLoaded = () => {
        loaded++;
        if (loaded >= total) {
          if (fallbackTimer) clearTimeout(fallbackTimer);
          setTimeout(triggerPrint, 150);
        }
      };

      for (let i = 0; i < total; i++) {
        if (docImages[i].complete) {
          loaded++;
        } else {
          docImages[i].onload = onImageLoaded;
          docImages[i].onerror = onImageLoaded;
        }
      }

      if (loaded >= total) {
        setTimeout(triggerPrint, 200);
      } else {
        fallbackTimer = setTimeout(triggerPrint, 1000);
      }
    } else {
      setTimeout(triggerPrint, 250);
    }
  };

  const handleCopySummary = () => {
    const text = `===========================================
ACHYUTANANDA INSTITUTE OF MEDICAL SCIENCE (AIMS)
OFFICIAL PAYMENT RECEIPT
===========================================
Receipt No  : ${data.receiptNo}
Date        : ${formattedDate}
Title       : ${data.title}
Party       : ${data.partyName} ${data.partyRoleOrCourse ? `(${data.partyRoleOrCourse})` : ""}
Category    : ${data.category}
Amount      : ₹${data.amount.toLocaleString("en-IN")}
In Words    : ${amountInWords}
Method      : ${data.paymentMethod}
Reference   : ${data.referenceNo || "N/A"}
Description : ${data.description}
Status      : ${data.status || "Verified & Recorded"}
===========================================
Issued by AIMS Salipur Accounting Department
aimsacademy.vercel.app | +91 94372 00000`;

    navigator.clipboard.writeText(text);
    toast({
      title: "Receipt Details Copied 📋",
      description: "Summary copied to clipboard. Ready to paste or send.",
      variant: "success",
    });
  };

  const handleShareWhatsApp = () => {
    const message = `*AIMS SALIPUR - OFFICIAL RECEIPT* 🏥
*Receipt No:* ${data.receiptNo}
*Date:* ${formattedDate}
*Party Name:* ${data.partyName}
*Purpose/Course:* ${data.partyRoleOrCourse || data.category}
*Amount Paid:* ₹${data.amount.toLocaleString("en-IN")} (${amountInWords})
*Payment Mode:* ${data.paymentMethod} ${data.referenceNo ? `(Ref: ${data.referenceNo})` : ""}
*Status:* ✅ ${data.status || "Recorded & Verified"}

_Achyutananda Institute of Medical Science (AIMS), Salipur, Cuttack, Odisha_
Official Accounts Department`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const isIncome = data.type === "income" || data.type === "fee" || data.type === "capital";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] sm:max-w-3xl max-h-[95vh] overflow-y-auto p-3 sm:p-6 bg-slate-100/90 border-slate-300 shadow-2xl">
        <DialogHeader className="no-print pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-indigo-600 shrink-0" />
                Official Receipt Preview
              </DialogTitle>
              <p className="text-xs text-slate-500 font-medium">
                High-resolution printable voucher. Click print to generate physical copy or PDF.
              </p>
            </div>

            {/* Top Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={handlePrint}
                className="h-9 px-3 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Save PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareWhatsApp}
                className="h-9 px-3 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold text-xs rounded-xl"
              >
                <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySummary}
                className="h-9 px-2.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                title="Copy text summary"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* ======================================================== */}
        {/* THE PRINTABLE RECEIPT VOUCHER (Clean A4 Paper Design)    */}
        {/* ======================================================== */}
        <div
          ref={receiptRef}
          id="aims-official-receipt"
          className="bg-white text-slate-900 p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200 relative font-sans print:shadow-none print:border-0 print:p-0 print:m-0"
        >
          {/* Subtle Watermark in Center */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
            <span className="text-[120px] font-black tracking-tighter text-slate-900 rotate-[-25deg]">
              AIMS
            </span>
          </div>

          {/* Top Header with Logo & Institute Details */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-4 border-b-2 border-slate-900">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3.5 sm:gap-4 text-center sm:text-left">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-indigo-900/20 p-1 shadow-sm bg-white shrink-0 overflow-hidden flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="AIMS Academy Logo"
                  width={80}
                  height={80}
                  className="rounded-xl object-contain"
                  priority
                  unoptimized
                />
              </div>
              <div>
                <h1 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                  Achyutananda Institute of Medical Science
                </h1>
                <p className="text-[11px] sm:text-xs font-extrabold text-indigo-700 tracking-wide uppercase mt-0.5">

                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight mt-1">
                  At/Po: Salipur, Dist: Cuttack, Odisha - 754202 
                  <br />
                  Phone: +91 94372 00000 / +91 91240 00000 · Email: aimssalipur@gmail.com
                </p>
              </div>
            </div>

            {/* Receipt Number & Date Badge */}
            <div className="flex flex-col items-center sm:items-end text-center sm:text-right shrink-0">
              <div className="px-3 py-1 rounded-lg bg-slate-900 text-white font-extrabold text-[11px] sm:text-xs tracking-wider uppercase">
                {data.title}
              </div>
              <div className="mt-2 text-xs font-mono font-bold text-slate-900">
                Receipt No: <span className="text-indigo-700 font-extrabold">{data.receiptNo}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Date: {formattedDate}
              </div>
              <div className="text-[10px] text-slate-400">
                Time: {formattedTime}
              </div>
            </div>
          </div>

          {/* Color Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-700 via-violet-600 to-emerald-500 my-4 rounded-full" />

          {/* Party & Payment Details Box */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">
                  {isIncome ? "Received From / Student / Payer:" : "Paid To / Beneficiary:"}
                </span>
              </div>
              <div className="text-sm font-black text-slate-900">
                {data.partyName}
              </div>
              {data.partyRoleOrCourse && (
                <div className="text-indigo-700 font-bold text-[11px]">
                  Course / Role: {data.partyRoleOrCourse}
                </div>
              )}
              {data.partyContact && (
                <div className="text-slate-500 text-[11px]">
                  Contact: {data.partyContact}
                </div>
              )}
            </div>

            <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">
                  Payment Mode & Reference:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-extrabold text-[10px] bg-white border-slate-300 text-slate-800">
                  {data.paymentMethod}
                </Badge>
                <span className="text-[11px] font-mono text-slate-600">
                  {data.referenceNo ? `Ref: ${data.referenceNo}` : "Direct Payment"}
                </span>
              </div>
              <div className="text-slate-600 text-[11px]">
                <span className="font-semibold text-slate-500">Category:</span>{" "}
                <span className="font-bold text-slate-900">{data.category}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                <span className="font-semibold">Recorded By:</span> {data.recordedBy || "AIMS Accounts Dept"}
              </div>
            </div>
          </div>

          {/* Line Items Table Breakdown */}
          <div className="relative z-10 mt-5 border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="py-2.5 px-3 sm:px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-3 sm:px-4">Particulars / Description</th>
                  <th className="py-2.5 px-3 sm:px-4">Category</th>
                  <th className="py-2.5 px-3 sm:px-4 text-center">Payment Mode</th>
                  <th className="py-2.5 px-3 sm:px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                <tr>
                  <td className="py-3 px-3 sm:px-4 text-center font-bold text-slate-400">01</td>
                  <td className="py-3 px-3 sm:px-4">
                    <div className="font-bold text-slate-900">{data.description}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Transaction Type: {data.type.toUpperCase()}
                      {data.referenceNo && ` · Reference ID: ${data.referenceNo}`}
                    </div>
                  </td>
                  <td className="py-3 px-3 sm:px-4">
                    <span className="font-semibold text-slate-800">{data.category}</span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-center">
                    <span className="font-medium text-slate-600">{data.paymentMethod}</span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right font-extrabold text-slate-900 text-sm whitespace-nowrap">
                    {formattedCurrency(data.amount)}
                  </td>
                </tr>

                {/* Additional breakdown if provided */}
                {data.breakdownItems?.map((item, idx) => (
                  <tr key={idx} className="bg-slate-50/50">
                    <td className="py-2 px-3 sm:px-4 text-center text-slate-400 font-bold">{idx + 2}</td>
                    <td className="py-2 px-3 sm:px-4 text-slate-600">{item.label}</td>
                    <td className="py-2 px-3 sm:px-4 text-slate-400">-</td>
                    <td className="py-2 px-3 sm:px-4 text-center text-slate-400">-</td>
                    <td className="py-2 px-3 sm:px-4 text-right font-semibold text-slate-700">
                      {formattedCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/80 font-black text-slate-900 border-t-2 border-slate-300 text-xs sm:text-sm">
                  <td colSpan={4} className="py-3 px-3 sm:px-4 text-right uppercase tracking-wider">
                    Total Amount Received / Disbursed:
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right text-base sm:text-lg font-black text-indigo-900 whitespace-nowrap">
                    {formattedCurrency(data.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in Words */}
          <div className="relative z-10 mt-3 p-2.5 sm:p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900">
                Amount in Words:
              </span>
              <div className="font-extrabold text-indigo-950 text-xs sm:text-sm italic">
                {amountInWords}
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 shrink-0">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {data.status || "Verified & Settled"}
            </Badge>
          </div>

          {/* Verification, Seal & Signatures */}
          <div className="relative z-10 mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 items-end text-xs">
            {/* Security QR / Verification Token */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg border border-slate-300 p-1 bg-white flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-slate-800" />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-slate-800 uppercase tracking-tight">
                    Digital Verification
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">
                    AIMS-SEC-{data.receiptNo.slice(-6)}
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">
                Scan or verify via AIMS Salipur Accounts portal.
              </p>
            </div>

            {/* Official Stamp graphic */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-indigo-900/40 p-1 flex items-center justify-center text-indigo-900/60 font-black text-[9px] uppercase tracking-tighter rotate-[-12deg] select-none">
                <div className="h-full w-full rounded-full border border-dashed border-indigo-900/40 flex flex-col items-center justify-center leading-none">
                  <span>AIMS</span>
                  <span className="text-[7px]">SALIPUR</span>
                  <span className="text-[6px]">ACCOUNTS</span>
                </div>
              </div>
              <span className="text-[9px] text-slate-400 font-semibold mt-1">Official Academy Seal</span>
            </div>

            {/* Authorized Signatory */}
            <div className="text-right space-y-1">
              <div className="h-10 border-b border-slate-400 w-32 sm:w-40 ml-auto flex items-end justify-center pb-1">
                <span className="font-serif italic text-xs text-indigo-950 font-bold opacity-80">
                  {data.verifiedBy || "AIMS Accounts"}
                </span>
              </div>
              <div className="text-[10px] font-extrabold text-slate-900 uppercase">
                Authorized Signatory
              </div>
              <div className="text-[9px] text-slate-400">Accounts & Finance Officer</div>
            </div>
          </div>

          {/* Bottom Disclaimer */}
          <div className="relative z-10 mt-6 pt-3 border-t border-slate-100 text-center text-[9px] text-slate-400 font-medium">
            This is an authentic, computer-generated official voucher issued by the Accounts Department of Achyutananda Institute of Medical Science (AIMS), Salipur.
            <br />
            No physical signature is required for electronic validation. For inquiries: +91 94372 00000 | accounts@aims.edu | aimsacademy.vercel.app
          </div>
        </div>

        {/* Global Print Stylesheet for Direct Keyboard Print (Ctrl+P) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 8mm 10mm;
                }
                html, body {
                  background: #ffffff !important;
                  color: #0f172a !important;
                  height: auto !important;
                  min-height: auto !important;
                  overflow: visible !important;
                }
                body > *:not([data-radix-portal]) {
                  display: none !important;
                }
                [data-radix-portal] {
                  display: block !important;
                  position: static !important;
                  height: auto !important;
                  overflow: visible !important;
                }
                [data-radix-portal] [role="dialog"],
                [data-radix-portal] [data-state="open"] {
                  position: static !important;
                  transform: none !important;
                  max-height: none !important;
                  height: auto !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  overflow: visible !important;
                  background: transparent !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  border: none !important;
                  box-shadow: none !important;
                }
                [data-radix-portal] div[class*="bg-black"],
                [data-radix-portal] div[class*="fixed"][class*="inset-0"],
                .no-print {
                  display: none !important;
                }
                #aims-official-receipt {
                  display: block !important;
                  position: relative !important;
                  width: 100% !important;
                  max-width: 780px !important;
                  height: auto !important;
                  margin: 0 auto !important;
                  padding: 24px 28px !important;
                  background: #ffffff !important;
                  color: #0f172a !important;
                  border: 1.5px solid #0f172a !important;
                  border-radius: 16px !important;
                  box-shadow: none !important;
                  overflow: visible !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
              }
            `,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
