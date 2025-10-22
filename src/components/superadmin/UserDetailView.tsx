import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Download,
  Send,
  Ban,
  Trash2,
  RefreshCw,
  CreditCard,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { ChangePlanModal } from "./ChangePlanModal";
import {
  supabase,
  SUPABASE_PUBLISHABLE_KEY,
} from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import nodemailer from "nodemailer";

interface UserDetailViewProps {
  user: any;
  onBack: () => void;
  onUserUpdated?: (updatedUser: any) => void;
}

export const UserDetailView: React.FC<UserDetailViewProps> = ({
  user,
  onBack,
  onUserUpdated,
}) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState();
  const [invoicesData, setInvoiceData] = useState([]);
  const [total_price, setTotal_Price] = useState();
  const [statusChanged, setStatusChanged] = useState(false);

  const [userStatus, setUserStatus] = useState("");
  const [userInfo, setUserInfo] = useState();
  const [getUserStatus, updateUserStatus] = useState();

  const fetchUserSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("subscription")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.log(
          "Error while fetching subscription table in user details component: ",
          error
        );
        return;
      }
      setSubscriptionData(data);

      console.log("Subscription response against id: ", data);
    } catch (err) {
      console.error("Error fetching subscription:", err);
      return [];
    }
  };

  const fetchUserInvoices = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Invoices Fetchingn Error");
        return;
      } else {
        setInvoiceData(data);
        console.log("Invoice Data from UserDetail interview: ", data);
      }

      return data || [];
    } catch (err) {
      console.error("Error fetching invoices:", err);
      return [];
    }
  };

  const fetchUser = async (user_id) => {
    const { data, error } = await supabase
      .from("users")
      .select("accountStatus")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
    } else {
      updateUserStatus(data?.accountStatus);
    }
  };

  useEffect(() => {
    if (user) {
      setUserInfo(user);

      const user_Id_2 = user.user_id;
      fetchUserSubscription(user_Id_2);
      fetchUserInvoices(user_Id_2);
      fetchUser(user_Id_2);

      setUserStatus(userInfo?.accountStatus ? "Suspend" : "Active");
    }
  }, [user]);

  const [formData, setFormData] = useState({
    legalOwnerFirstName: user?.legalOwnerFirstName || "",
    legalOwnerLastName: user?.legalOwnerLastName || "",
    street: user?.street || "",
    city: user?.city || "",
    zipCode: user?.zipCode || "",
    province: user?.province || "",
    country: user?.country || "",
    billingEmail: user?.billingEmail || "",
    vatNumber: user?.vatNumber || "",
    businessName: user?.businessName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    language: user?.language || "",
    address: user?.streetAddress || "",
  });

  console.log("Selected UserInfo: ", userInfo);
  const user_Id = user?.user_id;

  const [showConfirmModal, setShowConfirmModal] = useState<{
    isOpen: boolean;
    type:
      | "suspend"
      | "delete"
      | "cancel-subscription"
      | "resume-subscription"
      | "";
    title: string;
    message: string;
    confirmText: string;
    isDestructive: boolean;
  }>({
    isOpen: false,
    type: "",
    title: user?.businessName,
    message: "",
    confirmText: "",
    isDestructive: false,
  });
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);

  const handleSave = async (section: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          businessName: formData.businessName,
          phone: formData.phone,
          language: formData.language,
          streetAddress: formData.address,
        })
        .eq("user_id", user_Id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        onUserUpdated(data[0]);
        toast.success("Changes saved successfully!");
        setEditingSection(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  // const sendEmail = async (filePath) => {
  //   const bucketName = "myinvoices";
  //   const publicUrl = `https://ajbxscredobhqfksaqrk.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`;

  //   await fetch(
  //     "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/send-email-with-attchment",
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  //       },
  //       body: JSON.stringify({
  //         to: "fakharali054@gmail.com",
  //         // to: userInfo?.email,
  //         subject: "Here is your invoice",
  //         text: "Please find attached.",
  //         pdfUrl: publicUrl,
  //       }),
  //     }
  //   );
  // };

  const sendEmail = async (filePath: string) => {
    const bucketName = "myinvoices";
    const publicUrl = `https://ajbxscredobhqfksaqrk.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`;

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
            to: userInfo?.email,
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

  const handleCancel = () => {
    setFormData({
      ...user,
      legalOwnerFirstName: "",
      legalOwnerLastName: "",
      street: "",
      city: "",
      zipCode: "",
      province: "",
      country: "",
    });
    setEditingSection(null);
  };

  const openDeleteModal = () => {
    console.log("Delete Button Clicked");
    openConfirmModal("delete");
  };

  const deleteUser = async (user_id: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .delete()
        .eq("user_id", user_id);

      if (error) {
        console.error("Error deleting user:", error.message);
        toast.error("Error While Deleting User ");
        return;
      }
      console.log("User deleted successfully:", data);
      toast.success("User Deleted Successfully");
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const handleConfirmAction = async () => {
    const user_id = user?.user_id;
    // const { type } = showConfirmModal;
    console.log("Model Type", showConfirmModal.type);
    if (showConfirmModal.type === "delete") {
      deleteUser(user_id);
      return;
    } else {
      const updatedStatus = !getUserStatus;
      try {
        const { error } = await supabase
          .from("users")
          .update({ accountStatus: updatedStatus })
          .eq("user_id", user_id);

        if (error) {
          console.error("Error updating status:", error.message);
          toast.error("Error while updating User Status");
          return;
        }
        toast.success("User status updated");

        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", user_id)
          .single();

        if (data) {
          console.log("Data after updating: ", data);
          setUserInfo(data);
        }
      } catch (error) {}

      console.log("Confirmation box clicked and aginst of user_id : ", user_id);

      setShowConfirmModal({ ...showConfirmModal, isOpen: false });
    }
  };

  const openConfirmModal = (
    type: "suspend" | "delete" | "cancel-subscription" | "resume-subscription"
  ) => {
    const configs = {
      suspend: {
        title: userStatus,
        message: `Are you sure you want to ${userStatus} this user? This will temporarily ${userStatus} their access.`,
        confirmButtonText: userStatus,
        isDestructive: true,
      },
      delete: {
        title: "Delete Account",
        message:
          "This action is permanent. Are you sure you want to delete this user?",
        confirmButtonText: "Delete Account",
        isDestructive: true,
      },
      "cancel-subscription": {
        title: "Cancel Subscription",
        message:
          "Are you sure you want to cancel this subscription? The user will lose access at the end of the current billing period.",
        confirmText: "Cancel Subscription",
        isDestructive: true,
      },
      "resume-subscription": {
        title: "Resume Subscription",
        message:
          "Are you sure you want to resume this subscription? The user will be charged immediately.",
        confirmText: "Resume Subscription",
        isDestructive: false,
      },
    };

    const config = configs[type];
    setShowConfirmModal({
      isOpen: true,
      type,
      ...config,
    });
  };

  const formatCurrencyItalian = (amount) => {
    const formatted = new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

    return formatted.replace("€", "").trim().replace(/^/, "€ ");
  };

  const formatCreatedAt = (iso?: string) =>
    iso ? new Date(iso).toISOString().split("T")[0] : "";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "Suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      Basic: "bg-gray-100 text-gray-800",
      Standard: "bg-blue-100 text-blue-800",
      Premium: "bg-purple-100 text-purple-800",
    };

    return (
      <Badge className={colors[plan as keyof typeof colors]}>{plan}</Badge>
    );
  };

  const generateInvoice = (invoice) => {
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
    doc.save(`invoice-${invoice.invoice_no}.pdf`);
  };

  // async function uploadInvoice(userId, pdfBlob) {
  //   try {
  //     const fileName = `invoice-${userId}-${Date.now()}.pdf`;
  //     const filePath = `invoiceFiles/${fileName}`;

  //     const { data, error } = await supabase.storage
  //       .from("myinvoices")
  //       .upload(fileName, pdfBlob, {
  //         cacheControl: "3600",
  //         upsert: true,
  //         contentType: "application/pdf",
  //       });

  //     if (error) {
  //       console.error("Upload error:", error.message);
  //       return null;
  //     }

  //     console.log("Uploaded successfully:", data);

  //     sendEmail(filePath);
  //     return fileName;
  //   } catch (err) {
  //     console.error("Unexpected error:", err);
  //     return null;
  //   }
  // }

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

  const getLastestPdf = () => {
    // console.log("The latest User: ", user);
    const userId = user.user_id;
    console.log("The invoices data: ", invoicesData);
    const latestInvoice = invoicesData[0];
    console.log("The latest Invoice: ", latestInvoice);
    generateInvoiceforSend(latestInvoice, userId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {user?.businessName}
            </h1>
            <p className="text-gray-600 mt-1 text-left">
              User ID: {user?.id} • Created: {formatCreatedAt(user?.created_at)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          {getStatusBadge(user?.accountStatus ? "Active" : "Suspended")}
          {getPlanBadge(user?.plan)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>General Information</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editingSection === "general"
                    ? null
                    : setEditingSection("general")
                }
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              {editingSection === "general" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                    <div className="text-left">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            businessName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        readOnly
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) =>
                          setFormData({ ...formData, language: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Italian">Italian</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleSave("General")} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel} size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Business Name</Label>
                    <p className="font-medium">{user?.businessName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Phone</Label>
                    <p className="font-medium">{user?.phone}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Language</Label>
                    <p className="font-medium">{user?.language}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-gray-600">Address</Label>
                    <p className="font-medium">{user?.streetAddress}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Information - Enhanced */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Billing Information</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editingSection === "billing"
                    ? null
                    : setEditingSection("billing")
                }
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              {editingSection === "billing" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessNameBilling">Business Name</Label>
                      <Input
                        id="businessNameBilling"
                        value={formData.businessName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            businessName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingEmail">Billing Email</Label>
                      <Input
                        id="billingEmail"
                        type="email"
                        value={formData.billingEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            billingEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="legalOwnerFirstName">
                        Legal Owner First Name
                      </Label>
                      <Input
                        id="legalOwnerFirstName"
                        value={formData.legalOwnerFirstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            legalOwnerFirstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="legalOwnerLastName">
                        Legal Owner Last Name
                      </Label>
                      <Input
                        id="legalOwnerLastName"
                        value={formData.legalOwnerLastName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            legalOwnerLastName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="vatNumber">VAT Number / Tax Code</Label>
                      <Input
                        id="vatNumber"
                        value={formData.vatNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vatNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Legal Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="street">Street and Number</Label>
                        <Input
                          id="street"
                          value={formData.street}
                          onChange={(e) =>
                            setFormData({ ...formData, street: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              zipCode: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="province">Province / Region</Label>
                        <Input
                          id="province"
                          value={formData.province}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              province: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={formData.country}
                          onValueChange={(value) =>
                            setFormData({ ...formData, country: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Italy">Italy</SelectItem>
                            <SelectItem value="Spain">Spain</SelectItem>
                            <SelectItem value="France">France</SelectItem>
                            <SelectItem value="Germany">Germany</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={() => handleSave("Billing")} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel} size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Business Name</Label>
                      <p className="font-medium">{user?.businessName}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Billing Email</Label>
                      <p className="font-medium">{user?.billingEmail}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Legal Owner</Label>
                      <p className="font-medium">
                        {formData.legalOwnerFirstName}{" "}
                        {formData.legalOwnerLastName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">VAT Number</Label>
                      <p className="font-medium">{user?.vatNumber}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-gray-600">Legal Address</Label>
                    <p className="font-medium">
                      {formData.street}
                      <br />
                      {formData.city}, {formData.province} {formData.zipCode}
                      <br />
                      {formData.country}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Section - NEW */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Active Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Current Plan</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getPlanBadge(userInfo?.plan)}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge
                      className={`${
                        userInfo?.accountStatus
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {userInfo?.accountStatus ? "Active" : "Suspended"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Next Billing Date</Label>
                  <p className="font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatCreatedAt(subscriptionData?.current_period_end)}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Payment Method</Label>
                  <p className="font-medium">**** **** **** 4242</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChangePlanModal(true)}
                  >
                    Change Plan
                  </Button>

                  <Button variant="outline" size="sm" onClick={getLastestPdf}>
                    Resend Last Invoice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Invoice History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-left">
                Payment & Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="text-left">
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesData.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium text-left">
                        {invoice.invoice_no}
                      </TableCell>
                      <TableCell className="font-medium text-left">
                        {formatCreatedAt(invoice.created_at)}
                      </TableCell>
                      <TableCell className="font-medium text-left">
                        {formatCurrencyItalian(invoice.amount_total)}
                      </TableCell>
                      <TableCell className="font-medium text-left">
                        {invoice.status}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateInvoice(invoice)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-left">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div>
                <Label className="text-gray-600">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(
                    userInfo?.accountStatus ? "Active" : "Suspended"
                  )}
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Plan</Label>
                <div className="mt-1">{getPlanBadge(userInfo?.plan)}</div>
              </div>
              <div>
                <Label className="text-gray-600">Subscription Start</Label>
                <p className="font-medium">
                  {formatCreatedAt(user?.created_at)}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Next Billing</Label>
                <p className="font-medium">
                  {formatCreatedAt(subscriptionData?.current_period_end)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Access History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-left">Access History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div>
                <Label className="text-gray-600">Last Login</Label>
                <p className="font-medium">
                  {formatCreatedAt(user?.last_login)}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Account Created</Label>
                <p className="font-medium">
                  {formatCreatedAt(user?.created_at)}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Location</Label>
                <p className="font-medium">{user?.city}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-left">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowResetPasswordModal(true)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-orange-600 hover:text-orange-700"
                onClick={() => openConfirmModal("suspend")}
              >
                <Ban className="w-4 h-4 mr-2" />
                {userInfo?.accountStatus === true ? "Suspend " : "Activate "}
                Account
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={openDeleteModal}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ConfirmActionModal
        isOpen={showConfirmModal.isOpen}
        title={userInfo?.businessName}
        message={showConfirmModal.message}
        // confirmButtonText={userStatus}
        confirmButtonText={showConfirmModal.confirmButtonText}
        isDestructive={showConfirmModal.isDestructive}
        onConfirm={handleConfirmAction}
        onCancel={() =>
          setShowConfirmModal({ ...showConfirmModal, isOpen: false })
        }
      />

      <ResetPasswordModal
        user={user}
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
      />

      <ChangePlanModal
        user={user}
        isOpen={showChangePlanModal}
        onClose={() => setShowChangePlanModal(false)}
      />
    </div>
  );
};
