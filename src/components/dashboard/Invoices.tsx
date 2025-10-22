import React, { useEffect, useState } from "react";
import { Download, Calendar, FileText, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Spinner from "../Spinner";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoicesDynamic, setInvoicesDynamic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total_price, setTotal_Price] = useState();
  const [total_Invoices, setTotal_Invoices] = useState();
  const [total_subscription_amount, set_total_subscription_amount] = useState();

  const invoices = [
    {
      id: "INV-2024-001",
      date: "2024-01-15",
      amount: 199.0,
      status: "paid",
      description: "Premium Plan - Annual",
    },
    {
      id: "INV-2023-012",
      date: "2023-01-15",
      amount: 199.0,
      status: "paid",
      description: "Premium Plan - Annual",
    },
    {
      id: "INV-2022-024",
      date: "2022-12-15",
      amount: 19.99,
      status: "paid",
      description: "Premium Plan - Monthly",
    },
    {
      id: "INV-2022-023",
      date: "2022-11-15",
      amount: 19.99,
      status: "paid",
      description: "Premium Plan - Monthly",
    },
    {
      id: "INV-2022-022",
      date: "2022-10-15",
      amount: 19.99,
      status: "paid",
      description: "Premium Plan - Monthly",
    },
  ];

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        // 1. Get logged-in user
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError) {
          console.error("Error fetching user:", userError.message);
          setLoading(false);
          return;
        }

        const user_id = userData.user?.id;
        if (!user_id) {
          console.error("No logged-in user found.");
          setLoading(false);
          return;
        }

        // 2. Fetch invoices for that user
        const { data: invoiceData, error: invoiceError } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user_id);

        if (invoiceError) {
          console.error("Error fetching invoices:", invoiceError.message);
        } else {
          setInvoicesDynamic(invoiceData || []);
          console.log("Invoices:", invoiceData);
          setTotal_Invoices(invoiceData?.length || 0);
        }
      } catch (err: any) {
        console.error("Unexpected error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const totalAmountPaid = invoicesDynamic?.reduce((acc, single_invoice) => {
    return acc + single_invoice.amount_total;
  }, 0);

  console.log("Total Amount Paid:", totalAmountPaid);

  const getDayOfYear = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // main formatter
  const formatNFDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const dayOfYear = getDayOfYear(date);
    return `NF-${year}-${dayOfYear}`;
  };

  const generateInvoice = (invoice) => {
    console.log("I am invoice::", invoice);
    const tax_total = invoice.tax_percentage * invoice.amount_total;
    const priceAfterTax = invoice.amount_total + tax_total;
    setTotal_Price(priceAfterTax);

    const doc = new jsPDF();

    // Company Header
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185); // blue
    doc.text("NovaFarm", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Fornitore", 14, 30);
    doc.setFont("helvetica", "bold");
    doc.text("NovaFarm S.r.l", 14, 37);
    doc.setFont("helvetica", "normal");
    doc.text("Via delle Scienze 42, 10100 Turin (TO)", 14, 44);
    doc.text("VAT number: 11223344556", 14, 51);
    doc.text("SDI: ABC1234", 14, 58);
    doc.text("PEC: novafarm@pec.it", 14, 65);

    // Invoice Info (Right side)
    doc.setFont("helvetica", "bold");

    const formatted = formatNFDate(invoice.created_at);

    doc.text(`Fattura N.:${invoice.invoice_no}`, 140, 20);
    doc.text(`Data: ${formatted}`, 140, 28);

    // Client Info
    doc.setFontSize(14);
    doc.text("Cliente", 140, 40);
    doc.setFont("helvetica", "bold");
    doc.text(`${invoice?.customer_name}`, 140, 48);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(`${invoice.address}`, 140, 55);
    doc.text(`VAT number: ${invoice.vat}`, 140, 62);
    doc.text(`SDI number: ${invoice.sdi}`, 140, 69);
    doc.text(`PEC: ${invoice.personal_email}`, 140, 76);

    // Services Table
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Descrizione Servizi", 14, 85);
    const head = [
      ["Prodotto / Servizio", "Quantità", "Prezzo Unitario", "IVA", "Totale"],
    ];

    const body = [
      [
        invoice.plan_name,
        invoice.quantity,
        invoice.amount_total,
        invoice.tax_percentage * 100 + "%",
        priceAfterTax,
      ],
    ];

    autoTable(doc, {
      startY: 90,
      head: head,
      body: body,
      theme: "grid",
      styles: {
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 60, halign: "left" },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
    });

    //summary table
    const summaryY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 150;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Riepilogo", 14, summaryY);

    autoTable(doc, {
      startY: summaryY + 5,
      body: [
        ["Imponibile", invoice.amount_total],
        [
          "IVA " + invoice.tax_percentage * 100 + "%",
          invoice.amount_total * invoice.tax_percentage,
        ],
        ["Totale Fattura", priceAfterTax],
      ],
      theme: "grid",
      styles: {
        halign: "left",
        valign: "middle",
        fontStyle: "bold",
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      columnStyles: {
        0: { cellWidth: 100, halign: "left" },
        1: { cellWidth: 60, halign: "right" },
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);

    doc.setFont("helvetica", "bold");
    doc.text("Pagamento:", 14, finalY);

    let headingWidth = doc.getTextWidth("Pagamento: ") + 2;
    doc.setFont("helvetica", "normal");
    doc.text(
      "Bonifico bancario – IBAN: IT99A0123412341234123412345 – Intesa Sanpaolo",
      14 + headingWidth,
      finalY
    );

    // Termini di pagamento
    doc.setFont("helvetica", "bold");
    doc.text("Termini di pagamento:", 14, finalY + 8);
    headingWidth = doc.getTextWidth("Termini di pagamento: ") + 2;

    doc.setFont("helvetica", "normal");
    doc.text(
      "Pagamento anticipato. Il servizio viene attivato solo a saldo ricevuto.",
      14 + headingWidth,
      finalY + 8,
      { maxWidth: 170 }
    );

    // Ritardo nel pagamento
    doc.setFont("helvetica", "bold");
    doc.text("In caso di ritardo nel pagamento:", 14, finalY + 16);
    headingWidth = doc.getTextWidth("In caso di ritardo nel pagamento: ") + 2;

    doc.setFont("helvetica", "normal");
    doc.text(
      "saranno applicati gli interessi legali ai sensi del D.lgs. 231/2002.",
      14 + headingWidth,
      finalY + 16,
      { maxWidth: 170 }
    );

    // Nota
    doc.setFont("helvetica", "bold");
    doc.text("Nota:", 14, finalY + 24);
    headingWidth = doc.getTextWidth("Nota: ") + 2;

    doc.setFont("helvetica", "normal");
    doc.text(
      "La presente è una copia della fattura elettronica inviata tramite Sistema di Interscambio (SDI). " +
        "Il documento originale è consultabile accedendo con SPID al portale dell’Agenzia delle Entrate.",
      14 + headingWidth,
      finalY + 24,
      { maxWidth: 170 }
    );

    // Stato della fattura
    doc.setFont("helvetica", "bold");
    doc.text("Stato della fattura:", 14, finalY + 36);
    headingWidth = doc.getTextWidth("Stato della fattura: ") + 2;

    doc.setFont("helvetica", "normal");
    doc.text("Saldata", 14 + headingWidth, finalY + 36);

    // Save
    doc.save(`invoice-${invoice.invoice_no}.pdf`);
  };

  if (loading)
    return (
      <div>
        <Spinner />
      </div>
    );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownload = (invoiceId: string) => {
    // Simulate PDF download
    console.log(`Downloading invoice ${invoiceId}`);
  };

  const handleShowInvoice = (id) => {
    navigate(`/invoice/${id}`);
  };

  const formatCurrencyItalian = (amount) => {
    const formatted = new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

    // Force symbol in front
    return formatted.replace("€", "").trim().replace(/^/, "€ ");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2 text-left">
          Invoices
        </h1>
        <p className="text-gray-600 text-left">
          View and download your billing history
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#078147]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#078147]" />
            </div>
          </div>
          <h3 className="font-semibold text-black mb-1 text-left">
            Total Invoices
          </h3>
          <p className="text-2xl font-bold text-[#078147] text-left">
            {total_Invoices}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#078147]/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#078147] text-left" />
            </div>
          </div>
          <h3 className="font-semibold text-black mb-1 text-left">This Year</h3>
          <p className="text-2xl font-bold text-[#078147] text-left">
            {formatCurrencyItalian(totalAmountPaid)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <h3 className="font-semibold text-black mb-1 text-left">Status</h3>
          <p className="text-2xl font-bold text-green-600 text-left">
            All Paid
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-black text-left ">
            Invoice History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoicesDynamic.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 text-left">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black">
                      {invoice?.invoice_no}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {formatDate(invoice?.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {/* {invoice.description} */}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black">
                      {/* €{invoice.amount_total.toFixed(2)} */}
                      {formatCurrencyItalian(invoice?.amount_total)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {invoice?.status ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      // onClick={() => handleDownload(invoice.id)}
                      className="flex items-center space-x-1 text-[#078147] hover:text-[#066139] font-medium"
                    >
                      <Download
                        className="w-4 h-4"
                        onClick={() => generateInvoice(invoice)}
                      />
                      <Eye
                        className="w-5 h-5 "
                        onClick={() => handleShowInvoice(invoice.id)}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download All */}
      {/* <div className="flex justify-end">
        <button className="bg-[#078147] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#066139] transition-colors flex items-center space-x-2">
          <Download className="w-5 h-5" />
        </button>
      </div> */}
    </div>
  );
};
