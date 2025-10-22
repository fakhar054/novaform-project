import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  Filter,
  MoreVertical,
  Eye,
  Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InvoiceGenerationModal from "./InvoiceGenerationModal";
import {
  supabase,
  SUPABASE_PUBLISHABLE_KEY,
} from "@/integrations/supabase/client";
import Spinner from "../Spinner";

import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import nodemailer from "nodemailer";
import { toast } from "sonner";

const invoicesData = [
  {
    id: "INV-2024-001",
    customer: "Farmacia Centrale Milano",
    email: "admin@farmaciacentrale.it",
    amount: 243.78,
    netAmount: 199.0,
    vatAmount: 44.78,
    status: "paid",
    dueDate: "2024-01-15",
    issueDate: "2024-01-01",
    plan: "Premium Monthly",
    paymentMethod: "Credit Card",
  },
  {
    id: "INV-2024-002",
    customer: "Parafarmacia Benessere",
    email: "info@parafarmaciabenessere.it",
    amount: 120.78,
    netAmount: 99.0,
    vatAmount: 21.78,
    status: "paid",
    dueDate: "2024-01-14",
    issueDate: "2024-01-01",
    plan: "Standard Monthly",
    paymentMethod: "Credit Card",
  },
  {
    id: "INV-2024-003",
    customer: "Farmacia San Marco",
    email: "contact@sanmarco.it",
    amount: 243.78,
    netAmount: 199.0,
    vatAmount: 44.78,
    status: "overdue",
    dueDate: "2024-01-13",
    issueDate: "2024-01-01",
    plan: "Premium Monthly",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "INV-2024-004",
    customer: "Pharmacy Plus",
    email: "hello@pharmacyplus.com",
    amount: 59.78,
    netAmount: 49.0,
    vatAmount: 10.78,
    status: "unpaid",
    dueDate: "2024-01-20",
    issueDate: "2024-01-05",
    plan: "Basic Monthly",
    paymentMethod: "Credit Card",
  },
];

export const SuperAdminInvoices: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // const [thisMonth, sethisMonth] = useState(0);
  const [countInvoicesThisMont, setThisMonthInvoices] = useState(0);

  //for invoices
  const [allInvoices, setAllinvoices] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalInvoiceValue, setTotalInvoiceValue] = useState(0);
  const [invoiceData, setInvoiceData] = useState();
  const [total_price, setTotal_Price] = useState();
  const [userInfo, setUserInfo] = useState();

  const [noOfOverDue, setNoOfOverDue] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const getThisMonthInvoiceCount = (invoices) => {
    const now = new Date();

    return invoices.filter((invoice) => {
      const createdAt = new Date(invoice.created_at);
      return (
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    }).length;
  };

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching invoices:", error.message);
    } else {
      // console.log("Data coming in Invoices Table: ", data);
      setAllinvoices(data);
      setTotalInvoices(data.length);
      const total_Amount = data?.reduce(
        (sum, invoice) => sum + (invoice.amount_total || 0),
        0
      );
      const overDue = data.filter((singObj) => singObj.status === false).length;
      setTotalInvoiceValue(total_Amount);
      setNoOfOverDue(overDue);
    }

    const count = getThisMonthInvoiceCount(data);
    setThisMonthInvoices(count);

    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const generateInvoice = (invoice) => {
    const tax_total = (invoice.tax_percentage / 100) * invoice.amount_total;

    const priceAfterTax = invoice.amount_total + tax_total;

    const doc = new jsPDF();
    // Company Header
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
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

    doc.setFont("helvetica", "bold");

    const formatted = formatCreatedAt(invoice.created_at);

    doc.text(`Fattura N.:${invoice.invoice_no}`, 140, 20);
    doc.text(`Data: ${formatted}`, 140, 28);

    // Client Info
    doc.setFontSize(14);
    doc.text("Cliente", 140, 40);
    doc.setFont("helvetica", "bold");
    doc.text(`${invoice.customer_name}`, 140, 48);
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
        formatCurrencyItalian(invoice.amount_total),
        invoice.tax_percentage + "%",
        formatCurrencyItalian(priceAfterTax),
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

    const summaryY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 150;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Riepilogo", 14, summaryY);

    autoTable(doc, {
      startY: summaryY + 5,
      body: [
        ["Imponibile", formatCurrencyItalian(invoice.amount_total)],
        [
          "IVA " + invoice.tax_percentage + "%",
          formatCurrencyItalian(
            invoice.amount_total * (invoice.tax_percentage / 100)
          ),
        ],
        ["Totale Fattura", formatCurrencyItalian(priceAfterTax)],
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

    doc.setFont("helvetica", "bold");
    doc.text("Stato della fattura:", 14, finalY + 36);
    headingWidth = doc.getTextWidth("Stato della fattura: ") + 2;

    doc.setFont("helvetica", "normal");
    doc.text("Saldata", 14 + headingWidth, finalY + 36);

    // Save
    doc.save(`invoice-${invoice.invoice_no}.pdf`);
  };

  const downloadInvoioceLatest = (payment) => {
    const userId = payment?.user_id;
    // console.log("I am clicked", payment?.user_id);
    fetchInvoicesByUser(userId);
  };

  const fetchInvoicesByUser = async (userId) => {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .single();

    if (error) {
      console.error("Error fetching invoices:", error.message);
      return [];
    }

    setInvoiceData(data);

    generateInvoice(data);

    return data;
  };

  const filteredInvoices = invoicesData.filter((invoice) => {
    const matchesSearch =
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Paid
          </Badge>
        );
      case "unpaid":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Unpaid
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Overdue
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Draft
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalInvoiced = invoicesData.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoicesData
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const formatCreatedAt = (iso?: string) =>
    iso ? fmtDateOnly.format(new Date(iso)).replaceAll("/", "-") : "";

  const fmtDateOnly = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });

  async function uploadInvoice(userId, pdfBlob) {
    try {
      const fileName = `invoice-${userId}-${Date.now()}.pdf`;
      const filePath = `invoiceFiles/${fileName}`;

      const { data, error } = await supabase.storage
        .from("myinvoices")
        .upload(filePath, pdfBlob, {
          cacheControl: "3600",
          upsert: true,
          contentType: "application/pdf",
        });

      if (error) {
        console.error("Upload error:", error.message);
        return null;
      }

      console.log("Uploaded successfully:", data);

      sendEmail(filePath);
      return filePath;
    } catch (err) {
      console.error("Unexpected error:", err);
      return null;
    }
  }

  const sendEmail = async (filePath: string) => {
    const bucketName = "myinvoices";
    const publicUrl = `https://ajbxscredobhqfksaqrk.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`;

    console.log(
      "user email while sending invoices: ",
      userInfo?.personal_email
    );

    // console.log("File Path coming in sendFile: ", publicUrl);

    try {
      const response = await fetch(
        "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/send-email-with-attchment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            to: userInfo?.personal_email,
            subject: "Here is your invoice",
            text: "Please find attached.",
            pdfUrl: publicUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Failed to send email: ${errorText}`);
      } else {
        toast.success("Email sent successfully!");
      }
    } catch (err: any) {
      console.error("Email error:", err);
      toast.error("Something went wrong while sending the email.");
    }
  };

  const formatCurrencyItalian = (amount) => {
    const formatted = new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

    return formatted.replace("€", "").trim().replace(/^/, "€ ");
  };

  const handleShowInvoice = (id) => {
    navigate(`/invoice/${id}`);
  };

  const displayInvoices = useMemo(() => {
    return allInvoices.filter((invoice) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        invoice.customer_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.personal_email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.invoice_no?.toString().includes(searchTerm);

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== "all") {
        if (statusFilter === "paid") {
          matchesStatus = invoice.status === true;
        } else if (statusFilter === "overdue") {
          matchesStatus = invoice.status === false;
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [allInvoices, searchTerm, statusFilter]);

  const generateInvoiceforSend = (invoice, userId) => {
    console.log("I am invoice::", invoice);
    const tax_total = (invoice.tax_percentage / 100) * invoice.amount_total;

    const priceAfterTax = invoice.amount_total + tax_total;
    setTotal_Price(priceAfterTax);

    const doc = new jsPDF();
    // Company Header
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
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

    const formatted = formatCreatedAt(invoice.created_at);

    doc.text(`Fattura N.:${invoice.invoice_no}`, 140, 20);
    doc.text(`Data: ${formatted}`, 140, 28);

    // Client Info
    doc.setFontSize(14);
    doc.text("Cliente", 140, 40);
    doc.setFont("helvetica", "bold");
    doc.text(`${invoice.customer_name}`, 140, 48);
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
        formatCurrencyItalian(invoice.amount_total),
        invoice.tax_percentage + "%",
        formatCurrencyItalian(priceAfterTax),
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
        ["Imponibile", formatCurrencyItalian(invoice.amount_total)],
        [
          "IVA " + invoice.tax_percentage + "%",
          formatCurrencyItalian(
            invoice.amount_total * (invoice.tax_percentage / 100)
          ),
        ],
        ["Totale Fattura", formatCurrencyItalian(priceAfterTax)],
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
    // doc.save(`invoice-${invoice.invoice_no}.pdf`);
    const pdfBlob = doc.output("blob");
    uploadInvoice(userId, pdfBlob);
  };

  const getLastestPdf = (invoice) => {
    const userId = invoice.user_id;
    const latestInvoice = invoice;
    console.log("The latest Invoice: ", latestInvoice);
    generateInvoiceforSend(latestInvoice, userId);
  };

  const handleSendtoCustomer = (invoice) => {
    console.log("I am clicked to email: ", invoice.personal_email);
    setUserInfo(invoice);

    getLastestPdf(invoice);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-left">
            Invoice Management
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage all EU-compliant invoices
          </p>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Invoiced</p>
              <p className="text-2xl font-bold text-[#1C9B7A]">
                {totalInvoices}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrencyItalian(totalInvoiceValue)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{noOfOverDue}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-blue-600">
                {countInvoicesThisMont}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search invoices by customer, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 text-left">
            Invoices ({totalInvoices})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto text-left">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="font-semibold text-gray-900">
                    Invoice
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Customer
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Due Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Plan
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* {allInvoices.map((invoice) => ( */}
                {displayInvoices
                  .slice(indexOfFirstItem, indexOfLastItem)
                  .map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {invoice?.invoice_no}
                          </div>
                          <div className="text-sm text-gray-500">
                            Issued: {formatCreatedAt(invoice?.created_at)}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {invoice?.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice?.personal_email}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatCurrencyItalian(invoice?.amount_total)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status ? "Paid" : "overdue")}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatCreatedAt(invoice?.due_Date)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {invoice?.plan_name}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleShowInvoice(invoice?.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => downloadInvoioceLatest(invoice)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSendtoCustomer(invoice)}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send to Customer
                            </DropdownMenuItem>
                            {invoice.status === "overdue" && (
                              <DropdownMenuItem className="text-red-600">
                                <Send className="w-4 h-4 mr-2" />
                                Send Reminder
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center p-4">
              <Button
                className="border border-green-600 p-2 cursor-pointer rounded-sm"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div>
                Page {currentPage} of {Math.ceil(totalInvoices / itemsPerPage)}
              </div>

              <Button
                variant="outline"
                className="border border-green-600 p-2 cursor-pointer rounded-sm"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, Math.ceil(totalInvoices / itemsPerPage))
                  )
                }
                disabled={
                  currentPage === Math.ceil(totalInvoices / itemsPerPage)
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EU Compliance Notice */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2 text-left">
            EU Invoice Compliance
          </h3>
          <p className="text-sm text-blue-800 text-left">
            All invoices are generated in compliance with EU regulations and
            include: VAT breakdown (22%), sequential numbering, company details,
            and proper causale notation. Invoices are stored securely and
            available for audit purposes.
          </p>
        </CardContent>
      </Card>

      {/* Invoice Generation Modal */}
      <InvoiceGenerationModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
    </div>
  );
};

//code update only for search becasue it was not searching

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Search,
//   Download,
//   Filter,
//   MoreVertical,
//   Eye,
//   Send,
// } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import InvoiceGenerationModal from "./InvoiceGenerationModal";
// import {
//   supabase,
//   SUPABASE_PUBLISHABLE_KEY,
// } from "@/integrations/supabase/client";
// import Spinner from "../Spinner";

// import { useNavigate } from "react-router-dom";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import nodemailer from "nodemailer";
// import { toast } from "sonner";

// const invoicesData = [
//   {
//     id: "INV-2024-001",
//     customer: "Farmacia Centrale Milano",
//     email: "admin@farmaciacentrale.it",
//     amount: 243.78,
//     netAmount: 199.0,
//     vatAmount: 44.78,
//     status: "paid",
//     dueDate: "2024-01-15",
//     issueDate: "2024-01-01",
//     plan: "Premium Monthly",
//     paymentMethod: "Credit Card",
//   },
//   {
//     id: "INV-2024-002",
//     customer: "Parafarmacia Benessere",
//     email: "info@parafarmaciabenessere.it",
//     amount: 120.78,
//     netAmount: 99.0,
//     vatAmount: 21.78,
//     status: "paid",
//     dueDate: "2024-01-14",
//     issueDate: "2024-01-01",
//     plan: "Standard Monthly",
//     paymentMethod: "Credit Card",
//   },
//   {
//     id: "INV-2024-003",
//     customer: "Farmacia San Marco",
//     email: "contact@sanmarco.it",
//     amount: 243.78,
//     netAmount: 199.0,
//     vatAmount: 44.78,
//     status: "overdue",
//     dueDate: "2024-01-13",
//     issueDate: "2024-01-01",
//     plan: "Premium Monthly",
//     paymentMethod: "Bank Transfer",
//   },
//   {
//     id: "INV-2024-004",
//     customer: "Pharmacy Plus",
//     email: "hello@pharmacyplus.com",
//     amount: 59.78,
//     netAmount: 49.0,
//     vatAmount: 10.78,
//     status: "unpaid",
//     dueDate: "2024-01-20",
//     issueDate: "2024-01-05",
//     plan: "Basic Monthly",
//     paymentMethod: "Credit Card",
//   },
// ];

// export const SuperAdminInvoices: React.FC = () => {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [showInvoiceModal, setShowInvoiceModal] = useState(false);
//   const [loading, setLoading] = useState(true);
//   // const [thisMonth, sethisMonth] = useState(0);
//   const [countInvoicesThisMont, setThisMonthInvoices] = useState(0);

//   //for invoices
//   const [allInvoices, setAllinvoices] = useState([]);
//   const [totalInvoices, setTotalInvoices] = useState(0);
//   const [totalInvoiceValue, setTotalInvoiceValue] = useState(0);
//   const [invoiceData, setInvoiceData] = useState();
//   const [total_price, setTotal_Price] = useState();
//   const [userInfo, setUserInfo] = useState();

//   const [noOfOverDue, setNoOfOverDue] = useState(0);

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;

//   const getThisMonthInvoiceCount = (invoices) => {
//     const now = new Date();

//     return invoices.filter((invoice) => {
//       const createdAt = new Date(invoice.created_at);
//       return (
//         createdAt.getMonth() === now.getMonth() &&
//         createdAt.getFullYear() === now.getFullYear()
//       );
//     }).length;
//   };

//   const fetchInvoices = async () => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from("invoices")
//       .select("*")
//       .order("created_at", { ascending: false });
//     if (error) {
//       console.error("Error fetching invoices:", error.message);
//     } else {
//       // console.log("Data coming in Invoices Table: ", data);
//       setAllinvoices(data);
//       setTotalInvoices(data.length);
//       const total_Amount = data?.reduce(
//         (sum, invoice) => sum + (invoice.amount_total || 0),
//         0
//       );
//       const overDue = data.filter((singObj) => singObj.status === false).length;
//       setTotalInvoiceValue(total_Amount);
//       setNoOfOverDue(overDue);
//     }

//     const count = getThisMonthInvoiceCount(data);
//     setThisMonthInvoices(count);

//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchInvoices();
//   }, []);

//   const generateInvoice = (invoice) => {
//     const tax_total = (invoice.tax_percentage / 100) * invoice.amount_total;

//     const priceAfterTax = invoice.amount_total + tax_total;

//     const doc = new jsPDF();
//     // Company Header
//     doc.setFontSize(16);
//     doc.setTextColor(41, 128, 185);
//     doc.text("NovaFarm", 14, 20);

//     doc.setFontSize(11);
//     doc.setTextColor(0, 0, 0);
//     doc.text("Fornitore", 14, 30);
//     doc.setFont("helvetica", "bold");
//     doc.text("NovaFarm S.r.l", 14, 37);
//     doc.setFont("helvetica", "normal");
//     doc.text("Via delle Scienze 42, 10100 Turin (TO)", 14, 44);
//     doc.text("VAT number: 11223344556", 14, 51);
//     doc.text("SDI: ABC1234", 14, 58);
//     doc.text("PEC: novafarm@pec.it", 14, 65);

//     doc.setFont("helvetica", "bold");

//     const formatted = formatCreatedAt(invoice.created_at);

//     doc.text(`Fattura N.:${invoice.invoice_no}`, 140, 20);
//     doc.text(`Data: ${formatted}`, 140, 28);

//     // Client Info
//     doc.setFontSize(14);
//     doc.text("Cliente", 140, 40);
//     doc.setFont("helvetica", "bold");
//     doc.text(`${invoice.customer_name}`, 140, 48);
//     doc.setFontSize(11);
//     doc.setFont("helvetica", "normal");

//     doc.text(`${invoice.address}`, 140, 55);
//     doc.text(`VAT number: ${invoice.vat}`, 140, 62);
//     doc.text(`SDI number: ${invoice.sdi}`, 140, 69);
//     doc.text(`PEC: ${invoice.personal_email}`, 140, 76);

//     // Services Table
//     doc.setFontSize(14);
//     doc.setFont("helvetica", "bold");
//     doc.text("Descrizione Servizi", 14, 85);
//     const head = [
//       ["Prodotto / Servizio", "Quantità", "Prezzo Unitario", "IVA", "Totale"],
//     ];

//     const body = [
//       [
//         invoice.plan_name,
//         invoice.quantity,
//         formatCurrencyItalian(invoice.amount_total),
//         invoice.tax_percentage + "%",
//         formatCurrencyItalian(priceAfterTax),
//       ],
//     ];

//     autoTable(doc, {
//       startY: 90,
//       head: head,
//       body: body,
//       theme: "grid",
//       styles: {
//         halign: "center",
//         valign: "middle",
//       },
//       columnStyles: {
//         0: { cellWidth: 60, halign: "left" },
//         1: { cellWidth: 30 },
//         2: { cellWidth: 30 },
//         3: { cellWidth: 30 },
//         4: { cellWidth: 30 },
//       },
//     });

//     const summaryY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 150;

//     doc.setFontSize(14);
//     doc.setFont("helvetica", "bold");
//     doc.text("Riepilogo", 14, summaryY);

//     autoTable(doc, {
//       startY: summaryY + 5,
//       body: [
//         ["Imponibile", formatCurrencyItalian(invoice.amount_total)],
//         [
//           "IVA " + invoice.tax_percentage + "%",
//           formatCurrencyItalian(
//             invoice.amount_total * (invoice.tax_percentage / 100)
//           ),
//         ],
//         ["Totale Fattura", formatCurrencyItalian(priceAfterTax)],
//       ],
//       theme: "grid",
//       styles: {
//         halign: "left",
//         valign: "middle",
//         fontStyle: "bold",
//       },
//       headStyles: {
//         fillColor: [255, 255, 255],
//         textColor: [0, 0, 0],
//         lineColor: [0, 0, 0],
//         lineWidth: 0.3,
//       },
//       columnStyles: {
//         0: { cellWidth: 100, halign: "left" },
//         1: { cellWidth: 60, halign: "right" },
//       },
//     });

//     const finalY = doc.lastAutoTable.finalY + 10;
//     doc.setFontSize(11);

//     doc.setFont("helvetica", "bold");
//     doc.text("Pagamento:", 14, finalY);

//     let headingWidth = doc.getTextWidth("Pagamento: ") + 2;
//     doc.setFont("helvetica", "normal");
//     doc.text(
//       "Bonifico bancario – IBAN: IT99A0123412341234123412345 – Intesa Sanpaolo",
//       14 + headingWidth,
//       finalY
//     );

//     // Termini di pagamento
//     doc.setFont("helvetica", "bold");
//     doc.text("Termini di pagamento:", 14, finalY + 8);
//     headingWidth = doc.getTextWidth("Termini di pagamento: ") + 2;

//     doc.setFont("helvetica", "normal");
//     doc.text(
//       "Pagamento anticipato. Il servizio viene attivato solo a saldo ricevuto.",
//       14 + headingWidth,
//       finalY + 8,
//       { maxWidth: 170 }
//     );

//     doc.setFont("helvetica", "bold");
//     doc.text("In caso di ritardo nel pagamento:", 14, finalY + 16);
//     headingWidth = doc.getTextWidth("In caso di ritardo nel pagamento: ") + 2;

//     doc.setFont("helvetica", "normal");
//     doc.text(
//       "saranno applicati gli interessi legali ai sensi del D.lgs. 231/2002.",
//       14 + headingWidth,
//       finalY + 16,
//       { maxWidth: 170 }
//     );

//     doc.setFont("helvetica", "bold");
//     doc.text("Nota:", 14, finalY + 24);
//     headingWidth = doc.getTextWidth("Nota: ") + 2;

//     doc.setFont("helvetica", "normal");
//     doc.text(
//       "La presente è una copia della fattura elettronica inviata tramite Sistema di Interscambio (SDI). " +
//         "Il documento originale è consultabile accedendo con SPID al portale dell’Agenzia delle Entrate.",
//       14 + headingWidth,
//       finalY + 24,
//       { maxWidth: 170 }
//     );

//     doc.setFont("helvetica", "bold");
//     doc.text("Stato della fattura:", 14, finalY + 36);
//     headingWidth = doc.getTextWidth("Stato della fattura: ") + 2;

//     doc.setFont("helvetica", "normal");
//     doc.text("Saldata", 14 + headingWidth, finalY + 36);

//     // Save
//     doc.save(`invoice-${invoice.invoice_no}.pdf`);
//   };

//   const downloadInvoioceLatest = (payment) => {
//     const userId = payment?.user_id;
//     // console.log("I am clicked", payment?.user_id);
//     fetchInvoicesByUser(userId);
//   };

//   const fetchInvoicesByUser = async (userId) => {
//     const { data, error } = await supabase
//       .from("invoices")
//       .select("*")
//       .eq("user_id", userId)
//       .order("created_at", { ascending: false })
//       .single();

//     if (error) {
//       console.error("Error fetching invoices:", error.message);
//       return [];
//     }

//     setInvoiceData(data);

//     generateInvoice(data);

//     return data;
//   };

//   const filteredInvoices = invoicesData.filter((invoice) => {
//     const matchesSearch =
//       invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       invoice.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus =
//       statusFilter === "all" || invoice.status === statusFilter;

//     return matchesSearch && matchesStatus;
//   });

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "paid":
//         return (
//           <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
//             Paid
//           </Badge>
//         );
//       case "unpaid":
//         return (
//           <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
//             Unpaid
//           </Badge>
//         );
//       case "overdue":
//         return (
//           <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
//             Overdue
//           </Badge>
//         );
//       case "draft":
//         return (
//           <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
//             Draft
//           </Badge>
//         );
//       default:
//         return <Badge variant="secondary">{status}</Badge>;
//     }
//   };

//   const totalInvoiced = invoicesData.reduce((sum, inv) => sum + inv.amount, 0);
//   const totalPaid = invoicesData
//     .filter((inv) => inv.status === "paid")
//     .reduce((sum, inv) => sum + inv.amount, 0);

//   const formatCreatedAt = (iso?: string) =>
//     iso ? fmtDateOnly.format(new Date(iso)).replaceAll("/", "-") : "";

//   const fmtDateOnly = new Intl.DateTimeFormat("en-GB", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     timeZone: "Asia/Karachi",
//   });

//   async function uploadInvoice(userId, pdfBlob) {
//     try {
//       const fileName = `invoice-${userId}-${Date.now()}.pdf`;
//       const filePath = `invoiceFiles/${fileName}`;

//       const { data, error } = await supabase.storage
//         .from("myinvoices")
//         .upload(filePath, pdfBlob, {
//           cacheControl: "3600",
//           upsert: true,
//           contentType: "application/pdf",
//         });

//       if (error) {
//         console.error("Upload error:", error.message);
//         return null;
//       }

//       console.log("Uploaded successfully:", data);

//       sendEmail(filePath);
//       return filePath;
//     } catch (err) {
//       console.error("Unexpected error:", err);
//       return null;
//     }
//   }

//   const sendEmail = async (filePath: string) => {
//     const bucketName = "myinvoices";
//     const publicUrl = `https://ajbxscredobhqfksaqrk.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`;

//     // console.log("File Path coming in sendFile: ", publicUrl);

//     try {
//       const response = await fetch(
//         "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/send-email-with-attchment",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
//           },
//           body: JSON.stringify({
//             to: userInfo?.personal_email,
//             subject: "Here is your invoice",
//             text: "Please find attached.",
//             pdfUrl: publicUrl,
//           }),
//         }
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         toast.error(`Failed to send email: ${errorText}`);
//       } else {
//         toast.success("Email sent successfully!");
//       }
//     } catch (err: any) {
//       console.error("Email error:", err);
//       toast.error("Something went wrong while sending the email.");
//     }
//   };

//   const formatCurrencyItalian = (amount) => {
//     const formatted = new Intl.NumberFormat("it-IT", {
//       style: "currency",
//       currency: "EUR",
//     }).format(amount);

//     return formatted.replace("€", "").trim().replace(/^/, "€ ");
//   };

//   const handleShowInvoice = (id) => {
//     navigate(`/invoice/${id}`);
//   };

//   const displayInvoices = useMemo(() => {
//     const q = searchTerm.trim().toLowerCase();

//     return allInvoices.filter((invoice) => {
//       // Search filter (case-insensitive for invoice_no and allow id)
//       const matchesSearch =
//         q === "" ||
//         invoice.customer_name?.toLowerCase().includes(q) ||
//         invoice.personal_email?.toLowerCase().includes(q) ||
//         invoice.invoice_no?.toString().toLowerCase().includes(q) ||
//         invoice.id?.toString().toLowerCase().includes(q);

//       // Status filter
//       let matchesStatus = true;
//       if (statusFilter !== "all") {
//         if (statusFilter === "paid") {
//           matchesStatus = invoice.status === true;
//         } else if (statusFilter === "overdue") {
//           matchesStatus = invoice.status === false;
//         }
//       }

//       return matchesSearch && matchesStatus;
//     });
//   }, [allInvoices, searchTerm, statusFilter]);

//   // Reset to first page when filters/search change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, statusFilter]);

//   // Use filtered length for pagination controls
//   const totalFilteredPages = Math.max(
//     1,
//     Math.ceil(displayInvoices.length / itemsPerPage)
//   );

//   const generateInvoiceforSend = (invoice, userId) => {
//     console.log("I am invoice::", invoice);
//     const tax_total = (invoice.tax_percentage / 100) * invoice.amount_total;

//     const priceAfterTax = invoice.amount_total + tax_total;
//     setTotal_Price(priceAfterTax);

//     const doc = new jsPDF();
//     // Company Header
//     doc.setFontSize(16);
//     doc.setTextColor(41, 128, 185);
//     doc.text("NovaFarm", 14, 20);

//     doc.setFontSize(11);
//     doc.setTextColor(0, 0, 0);
//     doc.text("Fornitore", 14, 30);
//     doc.setFont("helvetica", "bold");
//     doc.text("NovaFarm S.r.l", 14, 37);
//     doc.setFont("helvetica", "normal");
//     doc.text("Via delle Scienze 42, 10100 Turin (TO)", 14, 44);
//     doc.text("VAT number: 11223344556", 14, 51);
//     doc.text("SDI: ABC1234", 14, 58);
//     doc.text("PEC: novafarm@pec.it", 14, 65);

//     // Invoice Info (Right side)
//     doc.setFont("helvetica", "bold");

//     const formatted = formatCreatedAt(invoice.created_at);

//     doc.text(`Fattura N.:${invoice.invoice_no}`, 140, 20);
//     doc.text(`Data: ${formatted}`, 140, 28);

//     // Client Info
//     doc.setFontSize(14);
//     doc.text("Cliente", 140, 40);
//     doc.setFont("helvetica", "bold");
//     doc.text(`${invoice.customer_name}`, 140, 48);
//     doc.setFontSize(11);
//     doc.setFont("helvetica", "normal");

//     doc.text(`${invoice.address}`, 140, 55);
//     doc.text(`VAT number: ${invoice.vat}`, 140, 62);
//     doc.text(`SDI number: ${invoice.sdi}`, 140, 69);
//     doc.text(`PEC: ${invoice.personal_email}`, 140, 76);

//     // Services Table
//     doc.setFontSize(14);
//     doc.setFont("helvetica", "bold");
//     doc.text("Descrizione Servizi", 14, 85);
//     const head = [
//       ["Prodotto / Servizio", "Quantità", "Prezzo Unitario", "IVA", "Totale"],
//     ];

//     const body = [
//       [
//         invoice.plan_name,
//         invoice.quantity,
//         formatCurrencyItalian(invoice.amount_total),
//         invoice.tax_percentage + "%",
//         formatCurrencyItalian(priceAfterTax),
//       ],
//     ];

//     autoTable(doc, {
//       startY: 90,
//       head: head,
//       body: body,
//       theme: "grid",
//       styles: {
//         halign: "center",
//         valign: "middle",
//       },
//       columnStyles: {
//         0: { cellWidth: 60, halign: "left" },
//         1: { cellWidth: 30 },
//         2: { cellWidth: 30 },
//         3: { cellWidth: 30 },
//         4: { cellWidth: 30 },
//       },
//     });

//     //summary table
//     const summaryY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 150;

//     doc.setFontSize(14);
//     doc.setFont("helvetica", "bold");
//     doc.text("Riepilogo", 14, summaryY);

//     autoTable(doc, {
//       startY: summaryY + 5,
//       body: [
//         ["Imponibile", formatCurrencyItalian(invoice.amount_total)],
//         [
//           "IVA " + invoice.tax_percentage + "%",
//           formatCurrencyItalian(
//             invoice.amount_total * (invoice.tax_percentage / 100)
//           ),
//         ],
//         ["Totale Fattura", formatCurrencyItalian(priceAfterTax)],
//       ],
//       theme: "grid",
//       styles: {
//         halign: "left",
//         valign: "middle",
//         fontStyle: "bold",
//       },
//       headStyles: {
//         fillColor: [255, 255, 255],
//         textColor: [0, 0, 0],
//         lineColor: [0, 0, 0],
//         lineWidth: 0.3,
//       },
//       columnStyles: {
//         0: { cellWidth: 100, halign: "left" },
//         1: { cellWidth: 60, halign: "right" },
//       },
//     });

//     const finalY = doc.lastAutoTable.finalY + 10;
//     doc.setFontSize(11);

//     doc.setFont("helvetica", "bold");
//     doc.text("Pagamento:", 14, finalY);

//     let headingWidth = doc.getTextWidth("Pagamento: ") + 2;
//     doc.setFont("helvetica", "normal");
//     doc.text(
//       "Bonifico bancario – IBAN: IT99A0123412341234123412345 – Intesa Sanpaolo",
//       14 + headingWidth,
//       finalY
//     );

//     // Termini di pagamento
//     doc.setFont("helvetica", "bold");
//     doc.text("Termini di pagamento:", 14, finalY + 8);
//     headingWidth = doc.getTextWidth("Termini di pagamento: ") + 2;

//     doc.setFont("helvetica", "normal");
//     doc.text(
//       "Pagamento anticipato. Il servizio viene attivato solo a saldo ricevuto.",
//       14 + headingWidth,
//       finalY + 8,
//       { maxWidth: 170 }
//     );

//     // Ritardo nel pagamento
//     doc.setFont("helvetica", "bold");
//     doc.text("In caso di ritardo nel pagamento:", 14, finalY + 16);
//     headingWidth = doc.getTextWidth("In caso di ritardo nel pagamento: ") + 2;

//     doc.setFont("helvetica", "normal");
//     doc.text(
//       "saranno applicati gli interessi legali ai sensi del D.lgs. 231/2002.",
//       14 + headingWidth,
//       finalY + 16,
//       { maxWidth: 170 }
//     );

//     // Nota
//     doc.setFont("helvetica", "bold");
//     doc.text("Nota:", 14, finalY + 24);
//     headingWidth = doc.getTextWidth("Nota: ") + 2;

//     doc.setFont("helvetica", "normal");
//     doc.text(
//       "La presente è una copia della fattura elettronica inviata tramite Sistema di Interscambio (SDI). " +
//         "Il documento originale è consultabile accedendo con SPID al portale dell’Agenzia delle Entrate.",
//       14 + headingWidth,
//       finalY + 24,
//       { maxWidth: 170 }
//     );

//     // Stato della fattura
//     doc.setFont("helvetica", "bold");
//     doc.text("Stato della fattura:", 14, finalY + 36);
//     headingWidth = doc.getTextWidth("Stato della fattura: ") + 2;

//     doc.setFont("helvetica", "normal");
//     doc.text("Saldata", 14 + headingWidth, finalY + 36);

//     // Save
//     // doc.save(`invoice-${invoice.invoice_no}.pdf`);
//     const pdfBlob = doc.output("blob");
//     uploadInvoice(userId, pdfBlob);
//   };

//   const getLastestPdf = (invoice) => {
//     const userId = invoice.user_id;
//     const latestInvoice = invoice;
//     console.log("The latest Invoice: ", latestInvoice);
//     generateInvoiceforSend(latestInvoice, userId);
//   };

//   const handleSendtoCustomer = (invoice) => {
//     console.log("I am clicked to email: ", invoice.personal_email);
//     setUserInfo(invoice);

//     getLastestPdf(invoice);
//   };

//   if (loading) {
//     return <Spinner />;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-left">
//             Invoice Management
//           </h1>
//           <p className="text-gray-600 mt-1">
//             View and manage all EU-compliant invoices
//           </p>
//         </div>
//       </div>

//       {/* Invoice Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card className="bg-white border border-gray-200">
//           <CardContent className="p-4">
//             <div className="text-center">
//               <p className="text-sm text-gray-600">Total Invoiced</p>
//               <p className="text-2xl font-bold text-[#1C9B7A]">
//                 {totalInvoices}
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="bg-white border border-gray-200">
//           <CardContent className="p-4">
//             <div className="text-center">
//               <p className="text-sm text-gray-600">Total Paid</p>
//               <p className="text-2xl font-bold text-green-600">
//                 {formatCurrencyItalian(totalInvoiceValue)}
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="bg-white border border-gray-200">
//           <CardContent className="p-4">
//             <div className="text-center">
//               <p className="text-sm text-gray-600">Overdue</p>
//               <p className="text-2xl font-bold text-red-600">{noOfOverDue}</p>
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="bg-white border border-gray-200">
//           <CardContent className="p-4">
//             <div className="text-center">
//               <p className="text-sm text-gray-600">This Month</p>
//               <p className="text-2xl font-bold text-blue-600">
//                 {countInvoicesThisMont}
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Search and Filters */}
//       <Card className="bg-white border border-gray-200">
//         <CardContent className="p-6">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <Input
//                 placeholder="Search invoices by customer, ID, or email..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>

//             <Select value={statusFilter} onValueChange={setStatusFilter}>
//               <SelectTrigger className="w-full sm:w-48">
//                 <SelectValue placeholder="Filter by status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Invoices</SelectItem>
//                 <SelectItem value="paid">Paid</SelectItem>
//                 <SelectItem value="overdue">Overdue</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Invoices Table */}
//       <Card className="bg-white border border-gray-200">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold text-gray-900 text-left">
//             Invoices ({totalInvoices})
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-0">
//           <div className="overflow-x-auto text-left">
//             <Table>
//               <TableHeader>
//                 <TableRow className="border-gray-200">
//                   <TableHead className="font-semibold text-gray-900">
//                     Invoice
//                   </TableHead>
//                   <TableHead className="font-semibold text-gray-900">
//                     Customer
//                   </TableHead>
//                   <TableHead className="font-semibold text-gray-900">
//                     Amount
//                   </TableHead>
//                   <TableHead className="font-semibold text-gray-900">
//                     Status
//                   </TableHead>
//                   <TableHead className="font-semibold text-gray-900">
//                     Due Date
//                   </TableHead>
//                   <TableHead className="font-semibold text-gray-900">
//                     Plan
//                   </TableHead>
//                   <TableHead className="font-semibold text-gray-900 text-right">
//                     Actions
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {displayInvoices
//                   .slice(indexOfFirstItem, indexOfLastItem)
//                   .map((invoice) => (
//                     <TableRow
//                       key={invoice.id}
//                       className="border-gray-200 hover:bg-gray-50"
//                     >
//                       <TableCell>
//                         <div>
//                           <div className="font-medium text-gray-900">
//                             {invoice?.invoice_no}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             Issued: {formatCreatedAt(invoice?.created_at)}
//                           </div>
//                         </div>
//                       </TableCell>

//                       <TableCell>
//                         <div>
//                           <div className="font-medium text-gray-900">
//                             {invoice?.customer_name}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {invoice?.personal_email}
//                           </div>
//                         </div>
//                       </TableCell>

//                       <TableCell>
//                         <div>
//                           <div className="font-medium text-gray-900">
//                             {formatCurrencyItalian(invoice?.amount_total)}
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         {getStatusBadge(invoice.status ? "paid" : "overdue")}
//                       </TableCell>
//                       <TableCell className="text-sm text-gray-500">
//                         {formatCreatedAt(invoice?.due_Date)}
//                       </TableCell>
//                       <TableCell className="text-sm text-gray-500">
//                         {invoice?.plan_name}
//                       </TableCell>

//                       <TableCell className="text-right">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="sm">
//                               <MoreVertical className="w-4 h-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end" className="w-48">
//                             <DropdownMenuItem
//                               onClick={() => handleShowInvoice(invoice?.id)}
//                             >
//                               <Eye className="w-4 h-4 mr-2" />
//                               View Invoice
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={() => downloadInvoioceLatest(invoice)}
//                             >
//                               <Download className="w-4 h-4 mr-2" />
//                               Download PDF
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={() => handleSendtoCustomer(invoice)}
//                             >
//                               <Send className="w-4 h-4 mr-2" />
//                               Send to Customer
//                             </DropdownMenuItem>
//                             {invoice.status === "overdue" && (
//                               <DropdownMenuItem className="text-red-600">
//                                 <Send className="w-4 h-4 mr-2" />
//                                 Send Reminder
//                               </DropdownMenuItem>
//                             )}
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//               </TableBody>
//             </Table>

//             {/* Pagination Controls */}
//             <div className="flex justify-between items-center p-4">
//               <Button
//                 className="border border-green-600 p-2 cursor-pointer rounded-sm"
//                 variant="outline"
//                 onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//               >
//                 Previous
//               </Button>

//               <div>
//                 Page {currentPage} of {totalFilteredPages}
//               </div>

//               <Button
//                 variant="outline"
//                 className="border border-green-600 p-2 cursor-pointer rounded-sm"
//                 onClick={() =>
//                   setCurrentPage((prev) =>
//                     Math.min(prev + 1, totalFilteredPages)
//                   )
//                 }
//                 disabled={currentPage === totalFilteredPages}
//               >
//                 Next
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* EU Compliance Notice */}
//       <Card className="bg-blue-50 border border-blue-200">
//         <CardContent className="p-4">
//           <h3 className="font-semibold text-blue-900 mb-2 text-left">
//             EU Invoice Compliance
//           </h3>
//           <p className="text-sm text-blue-800 text-left">
//             All invoices are generated in compliance with EU regulations and
//             include: VAT breakdown (22%), sequential numbering, company details,
//             and proper causale notation. Invoices are stored securely and
//             available for audit purposes.
//           </p>
//         </CardContent>
//       </Card>

//       {/* Invoice Generation Modal */}
//       <InvoiceGenerationModal
//         isOpen={showInvoiceModal}
//         onClose={() => setShowInvoiceModal(false)}
//       />
//     </div>
//   );
// };
