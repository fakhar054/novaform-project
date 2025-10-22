// import React, { useEffect, useState } from "react";
// import {
//   Search,
//   Filter,
//   MoreVertical,
//   Download,
//   RefreshCw,
//   ExternalLink,
//   Copy,
//   Mail,
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
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/integrations/supabase/client";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const paymentsData = [
//   {
//     id: "pay_1234567890",
//     customer: "Farmacia Centrale Milano",
//     email: "admin@farmaciacentrale.it",
//     amount: 199.0,
//     status: "paid",
//     method: "Credit Card (****4242)",
//     date: "2024-01-15",
//     plan: "Premium Monthly",
//     stripeId: "pi_1234567890",
//   },
//   {
//     id: "pay_1234567891",
//     customer: "Parafarmacia Benessere",
//     email: "info@parafarmaciabenessere.it",
//     amount: 99.0,
//     status: "paid",
//     method: "Credit Card (****1234)",
//     date: "2024-01-14",
//     plan: "Standard Monthly",
//     stripeId: "pi_1234567891",
//   },
//   {
//     id: "pay_1234567892",
//     customer: "Farmacia San Marco",
//     email: "contact@sanmarco.it",
//     amount: 199.0,
//     status: "failed",
//     method: "Credit Card (****5678)",
//     date: "2024-01-13",
//     plan: "Premium Monthly",
//     stripeId: "pi_1234567892",
//   },
//   {
//     id: "pay_1234567893",
//     customer: "Pharmacy Plus",
//     email: "hello@pharmacyplus.com",
//     amount: 49.0,
//     status: "pending",
//     method: "Bank Transfer",
//     date: "2024-01-12",
//     plan: "Basic Monthly",
//     stripeId: "pi_1234567893",
//   },
// ];

// export const SuperAdminPayments: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
//   const [generatedLink, setGeneratedLink] = useState("");
//   const [showGeneratedLink, setShowGeneratedLink] = useState(false);
//   const [fetchedData, setFetchedData] = useState([]);
//   const [invoiceData, setInvoiceData] = useState();
//   const [totalRevenueDynamic, setTotalRevenueDynamic] = useState();
//   const [noOfPayments, setNoOfPayments] = useState(0);
//   //pagination
//   const [dataDynamic, setDataDynamic] = useState([]);

//   const { toast } = useToast();

//   const fetchPaymentTable = async () => {
//     const { data, error } = await supabase.from("subscription").select("*");
//     if (error) {
//       console.error("Error fetching subscriptions:", error.message);
//       return;
//     }
//     console.log("Fetched subscriptions:", data);
//     setFetchedData(data);
//     setDataDynamic(data);
//   };

//   const fetchAmountPaid = async () => {
//     const { data, error } = await supabase
//       .from("subscription")
//       .select("amount_paid");

//     if (error) {
//       console.error("Error fetching amount_paid:", error.message);
//       return [];
//     }

//     const total = data.reduce((acc, item) => acc + (item.amount_paid || 0), 0);
//     setTotalRevenueDynamic(total);
//     setNoOfPayments(data?.length);
//     return total;
//   };

//   useEffect(() => {
//     fetchPaymentTable();
//     fetchAmountPaid();
//   }, []);

//   // 24‑hour "DD‑MM‑YYYY HH:MM" in Asia/Karachi
//   const fmtDateOnly = new Intl.DateTimeFormat("en-GB", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     timeZone: "Asia/Karachi",
//   });

//   const formatCreatedAt = (iso?: string) =>
//     iso ? fmtDateOnly.format(new Date(iso)).replaceAll("/", "-") : "";

//   // Payment link form state
//   const [linkForm, setLinkForm] = useState({
//     amount: "",
//     description: "",
//     planType: "",
//     recipientEmail: "",
//     expiration: "7 days",
//   });

//   const formatCurrencyItalian = (amount) => {
//     const formatted = new Intl.NumberFormat("it-IT", {
//       style: "currency",
//       currency: "EUR",
//     }).format(amount);

//     return formatted.replace("€", "").trim().replace(/^/, "€ ");
//   };

//   const filteredPayments = fetchedData.filter((payment) => {
//     // Search filter
//     const matchesSearch =
//       !searchTerm ||
//       payment?.customer_name
//         ?.toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       payment?.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());

//     // Status filter
//     const matchesStatus =
//       statusFilter === "all" ||
//       (statusFilter === "paid" && payment.subscription_status === true) ||
//       (statusFilter === "unpaid" && payment.subscription_status === false);

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
//       case "failed":
//         return (
//           <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
//             Failed
//           </Badge>
//         );
//       case "pending":
//         return (
//           <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
//             Pending
//           </Badge>
//         );
//       case "refunded":
//         return (
//           <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
//             Refunded
//           </Badge>
//         );
//       default:
//         return <Badge variant="secondary">{status}</Badge>;
//     }
//   };

//   const handleGeneratePaymentLink = () => {
//     // Validate required fields
//     if (!linkForm.amount || !linkForm.description) {
//       toast({
//         title: "Validation Error",
//         description: "Please fill in all required fields.",
//         variant: "destructive",
//       });
//       return;
//     }

//     // Generate simulated payment link
//     const simulatedLink = `https://novafarm.app/payments/simulated/${Math.random()
//       .toString(36)
//       .substring(2, 15)}`;
//     setGeneratedLink(simulatedLink);
//     setShowGeneratedLink(true);

//     toast({
//       title: "Payment Link Generated",
//       description: "Payment link generated successfully (simulation only)",
//       className: "bg-green-50 border-green-200 text-green-800",
//     });
//   };

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     toast({
//       title: "Link Copied",
//       description: "Payment link copied to clipboard",
//       className: "bg-blue-50 border-blue-200 text-blue-800",
//     });
//   };

//   const closeModal = () => {
//     setShowPaymentLinkModal(false);
//     setShowGeneratedLink(false);
//     setGeneratedLink("");
//     setLinkForm({
//       amount: "",
//       description: "",
//       planType: "",
//       recipientEmail: "",
//       expiration: "7 days",
//     });
//   };

//   const downloadInvoioceLatest = (payment) => {
//     const userId = payment?.user_id;
//     // console.log("I am clicked", payment?.user_id);
//     fetchInvoicesByUser(userId);
//   };

//   const generateInvoice = (invoice) => {
//     // console.log("I am invoice::", invoice);
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
//     doc.save(`invoice-${invoice.invoice_no}.pdf`);
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

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
//             Payments & Subscriptions
//           </h1>
//           <p className="text-gray-600 mt-1 text-left">
//             Monitor all payment transactions and billing
//           </p>
//         </div>
//         {/* <Button
//           className="bg-[#1C9B7A] hover:bg-[#158a69] mt-4 sm:mt-0"
//           onClick={() => setShowPaymentLinkModal(true)}
//         >
//           Generate Payment Link
//         </Button> */}
//       </div>

//       {/* Revenue Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card className="bg-white border border-gray-200">
//           <CardContent className="p-4">
//             <div className="text-center">
//               <p className="text-sm text-gray-600">Total Revenue</p>
//               <p className="text-2xl font-bold text-[#1C9B7A]">
//                 {formatCurrencyItalian(totalRevenueDynamic)}
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="bg-white border border-gray-200">
//           <CardContent className="p-4">
//             <div className="text-center">
//               <p className="text-sm text-gray-600">Successful Payments</p>
//               <p className="text-2xl font-bold text-green-600">
//                 {noOfPayments}
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="bg-white border border-gray-200">
//           <CardContent className="p-4">
//             <div className="text-center">
//               <p className="text-sm text-gray-600">Failed Payments</p>
//               <p className="text-2xl font-bold text-red-600">
//                 {paymentsData.filter((p) => p.status === "failed").length}
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="bg-white border border-gray-200">
//           <CardContent className="p-4">
//             <div className="text-center">
//               <p className="text-sm text-gray-600">Pending</p>
//               <p className="text-2xl font-bold text-yellow-600">
//                 {paymentsData.filter((p) => p.status === "pending").length}
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
//                 placeholder="Search payments by customer or email..."
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
//                 <SelectItem value="all">All Payments</SelectItem>
//                 <SelectItem value="paid">Paid</SelectItem>
//                 <SelectItem value="unpaid">unpaid</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Payments Table */}
//       <Card className="bg-white border border-gray-200">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold text-gray-900 text-left">
//             Payment Transactions ({filteredPayments.length})
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-0">
//           <div className="overflow-x-auto">
//             <Table className="w-full ">
//               <TableHeader>
//                 <TableRow className="border-gray-200">
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
//                     Plan
//                   </TableHead>
//                   <TableHead className="font-semibold text-gray-900">
//                     Date
//                   </TableHead>
//                   <TableHead className="font-semibold text-gray-900 text-right">
//                     Actions
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {filteredPayments.map((payment) => (
//                   <TableRow
//                     key={payment.id}
//                     className="border-gray-200 hover:bg-gray-50 text-left"
//                   >
//                     <TableCell>
//                       <div>
//                         <div className="font-medium text-gray-900">
//                           {payment?.customer_name?.trim() || ""}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {payment?.customer_email}
//                         </div>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <div className="font-medium text-gray-900">
//                         ${payment?.amount_paid}
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       {getStatusBadge(
//                         payment.subscription_status ? "paid" : "unpaid"
//                       )}
//                     </TableCell>

//                     <TableCell className="text-sm text-gray-500">
//                       {payment.plan_name}
//                     </TableCell>
//                     <TableCell className="text-sm text-gray-500">
//                       {formatCreatedAt(payment.created_at)}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="sm">
//                             <MoreVertical className="w-4 h-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end" className="w-48">
//                           <DropdownMenuItem>
//                             <a
//                               href="https://stripe.com"
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="flex items-center"
//                             >
//                               <ExternalLink className="w-4 h-4 mr-2" />
//                               View in Stripe
//                             </a>
//                           </DropdownMenuItem>
//                           <DropdownMenuItem
//                             onClick={() => downloadInvoioceLatest(payment)}
//                           >
//                             <Download className="w-4 h-4 mr-2" />
//                             Download Invoice
//                           </DropdownMenuItem>

//                           {payment.status === "failed" && (
//                             <DropdownMenuItem>
//                               <RefreshCw className="w-4 h-4 mr-2" />
//                               Retry Payment
//                             </DropdownMenuItem>
//                           )}
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Generate Payment Link Modal */}
//       <Dialog
//         open={showPaymentLinkModal}
//         onOpenChange={setShowPaymentLinkModal}
//       >
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-semibold text-gray-900">
//               Generate Payment Link
//             </DialogTitle>
//             <DialogDescription className="text-gray-600">
//               Create a secure payment link for your customer
//             </DialogDescription>
//           </DialogHeader>

//           {!showGeneratedLink ? (
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label
//                   htmlFor="amount"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Amount (€) *
//                 </Label>
//                 <Input
//                   id="amount"
//                   type="number"
//                   step="0.01"
//                   placeholder="0.00"
//                   value={linkForm.amount}
//                   onChange={(e) =>
//                     setLinkForm({ ...linkForm, amount: e.target.value })
//                   }
//                   className="border-gray-300"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label
//                   htmlFor="description"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Payment Description *
//                 </Label>
//                 <Textarea
//                   id="description"
//                   placeholder="e.g., Premium subscription renewal"
//                   value={linkForm.description}
//                   onChange={(e) =>
//                     setLinkForm({ ...linkForm, description: e.target.value })
//                   }
//                   className="border-gray-300 resize-none"
//                   rows={3}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label
//                   htmlFor="planType"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Plan Type
//                 </Label>
//                 <Select
//                   value={linkForm.planType}
//                   onValueChange={(value) =>
//                     setLinkForm({ ...linkForm, planType: value })
//                   }
//                 >
//                   <SelectTrigger className="border-gray-300">
//                     <SelectValue placeholder="Select plan type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="base">Base Plan</SelectItem>
//                     <SelectItem value="premium">Premium Plan</SelectItem>
//                     <SelectItem value="custom">Custom</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label
//                   htmlFor="email"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Recipient Email
//                 </Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="customer@example.com"
//                   value={linkForm.recipientEmail}
//                   onChange={(e) =>
//                     setLinkForm({ ...linkForm, recipientEmail: e.target.value })
//                   }
//                   className="border-gray-300"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label
//                   htmlFor="expiration"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Link Expiration
//                 </Label>
//                 <Select
//                   value={linkForm.expiration}
//                   onValueChange={(value) =>
//                     setLinkForm({ ...linkForm, expiration: value })
//                   }
//                 >
//                   <SelectTrigger className="border-gray-300">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="24 hours">24 hours</SelectItem>
//                     <SelectItem value="3 days">3 days</SelectItem>
//                     <SelectItem value="7 days">7 days</SelectItem>
//                     <SelectItem value="30 days">30 days</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
//                 <h4 className="font-medium text-green-800 mb-2">
//                   Payment Link Generated
//                 </h4>
//                 <p className="text-sm text-green-700 mb-3">
//                   Your payment link has been created successfully.
//                 </p>
//                 <div className="flex items-center space-x-2">
//                   <Input
//                     value={generatedLink}
//                     readOnly
//                     className="text-sm bg-white border-green-300"
//                   />
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => copyToClipboard(generatedLink)}
//                     className="border-green-300 text-green-700 hover:bg-green-50"
//                   >
//                     <Copy className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>

//               <div className="flex space-x-2">
//                 <Button
//                   variant="outline"
//                   className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
//                 >
//                   <Mail className="w-4 h-4 mr-2" />
//                   Send via Email
//                 </Button>
//                 <Button
//                   onClick={() => copyToClipboard(generatedLink)}
//                   className="flex-1 bg-[#1C9B7A] hover:bg-[#158a69]"
//                 >
//                   <Copy className="w-4 h-4 mr-2" />
//                   Copy Link
//                 </Button>
//               </div>
//             </div>
//           )}

//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={closeModal}
//               className="border-gray-300"
//             >
//               {showGeneratedLink ? "Close" : "Cancel"}
//             </Button>
//             {!showGeneratedLink && (
//               <Button
//                 onClick={handleGeneratePaymentLink}
//                 className="bg-[#1C9B7A] hover:bg-[#158a69]"
//               >
//                 Generate Link
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

//update with pagination only

import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Download,
  RefreshCw,
  ExternalLink,
  Copy,
  Mail,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const paymentsData = [
  {
    id: "pay_1234567890",
    customer: "Farmacia Centrale Milano",
    email: "admin@farmaciacentrale.it",
    amount: 199.0,
    status: "paid",
    method: "Credit Card (****4242)",
    date: "2024-01-15",
    plan: "Premium Monthly",
    stripeId: "pi_1234567890",
  },
  {
    id: "pay_1234567891",
    customer: "Parafarmacia Benessere",
    email: "info@parafarmaciabenessere.it",
    amount: 99.0,
    status: "paid",
    method: "Credit Card (****1234)",
    date: "2024-01-14",
    plan: "Standard Monthly",
    stripeId: "pi_1234567891",
  },
  {
    id: "pay_1234567892",
    customer: "Farmacia San Marco",
    email: "contact@sanmarco.it",
    amount: 199.0,
    status: "failed",
    method: "Credit Card (****5678)",
    date: "2024-01-13",
    plan: "Premium Monthly",
    stripeId: "pi_1234567892",
  },
  {
    id: "pay_1234567893",
    customer: "Pharmacy Plus",
    email: "hello@pharmacyplus.com",
    amount: 49.0,
    status: "pending",
    method: "Bank Transfer",
    date: "2024-01-12",
    plan: "Basic Monthly",
    stripeId: "pi_1234567893",
  },
];

export const SuperAdminPayments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [showGeneratedLink, setShowGeneratedLink] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);
  const [invoiceData, setInvoiceData] = useState();
  const [totalRevenueDynamic, setTotalRevenueDynamic] = useState();
  const [noOfPayments, setNoOfPayments] = useState(0);
  //pagination
  const [dataDynamic, setDataDynamic] = useState([]);

  // same pagination approach as Users page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { toast } = useToast();

  const fetchPaymentTable = async () => {
    const { data, error } = await supabase.from("subscription").select("*");
    if (error) {
      console.error("Error fetching subscriptions:", error.message);
      return;
    }
    console.log("Fetched subscriptions:", data);
    setFetchedData(data);
    setDataDynamic(data);
  };

  const fetchAmountPaid = async () => {
    const { data, error } = await supabase
      .from("subscription")
      .select("amount_paid");

    if (error) {
      console.error("Error fetching amount_paid:", error.message);
      return [];
    }

    const total = data.reduce((acc, item) => acc + (item.amount_paid || 0), 0);
    setTotalRevenueDynamic(total);
    setNoOfPayments(data?.length);
    return total;
  };

  useEffect(() => {
    fetchPaymentTable();
    fetchAmountPaid();
  }, []);

  // 24‑hour "DD‑MM‑YYYY HH:MM" in Asia/Karachi
  const fmtDateOnly = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });

  const formatCreatedAt = (iso?: string) =>
    iso ? fmtDateOnly.format(new Date(iso)).replaceAll("/", "-") : "";

  // Payment link form state
  const [linkForm, setLinkForm] = useState({
    amount: "",
    description: "",
    planType: "",
    recipientEmail: "",
    expiration: "7 days",
  });

  const formatCurrencyItalian = (amount) => {
    const formatted = new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

    return formatted.replace("€", "").trim().replace(/^/, "€ ");
  };

  const filteredPayments = fetchedData.filter((payment) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      payment?.customer_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment?.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "paid" && payment.subscription_status === true) ||
      (statusFilter === "unpaid" && payment.subscription_status === false);

    return matchesSearch && matchesStatus;
  });

  // same pagination calculations as Users page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedPayments = filteredPayments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Paid
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "refunded":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleGeneratePaymentLink = () => {
    // Validate required fields
    if (!linkForm.amount || !linkForm.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Generate simulated payment link
    const simulatedLink = `https://novafarm.app/payments/simulated/${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    setGeneratedLink(simulatedLink);
    setShowGeneratedLink(true);

    toast({
      title: "Payment Link Generated",
      description: "Payment link generated successfully (simulation only)",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link Copied",
      description: "Payment link copied to clipboard",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });
  };

  const closeModal = () => {
    setShowPaymentLinkModal(false);
    setShowGeneratedLink(false);
    setGeneratedLink("");
    setLinkForm({
      amount: "",
      description: "",
      planType: "",
      recipientEmail: "",
      expiration: "7 days",
    });
  };

  const downloadInvoioceLatest = (payment) => {
    const userId = payment?.user_id;
    // console.log("I am clicked", payment?.user_id);
    fetchInvoicesByUser(userId);
  };

  const generateInvoice = (invoice) => {
    // console.log("I am invoice::", invoice);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Payments & Subscriptions
          </h1>
          <p className="text-gray-600 mt-1 text-left">
            Monitor all payment transactions and billing
          </p>
        </div>
        {/* <Button
          className="bg-[#1C9B7A] hover:bg-[#158a69] mt-4 sm:mt-0"
          onClick={() => setShowPaymentLinkModal(true)}
        >
          Generate Payment Link
        </Button> */}
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-[#1C9B7A]">
                {formatCurrencyItalian(totalRevenueDynamic)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Successful Payments</p>
              <p className="text-2xl font-bold text-green-600">
                {noOfPayments}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Failed Payments</p>
              <p className="text-2xl font-bold text-red-600">
                {paymentsData.filter((p) => p.status === "failed").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {paymentsData.filter((p) => p.status === "pending").length}
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
                placeholder="Search payments by customer or email..."
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
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 text-left">
            Payment Transactions ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full ">
              <TableHeader>
                <TableRow className="border-gray-200">
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
                    Plan
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="border-gray-200 hover:bg-gray-50 text-left"
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {payment?.customer_name?.trim() || ""}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment?.customer_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        ${payment?.amount_paid}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(
                        payment.subscription_status ? "paid" : "unpaid"
                      )}
                    </TableCell>

                    <TableCell className="text-sm text-gray-500">
                      {payment.plan_name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatCreatedAt(payment.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <a
                              href="https://stripe.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View in Stripe
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => downloadInvoioceLatest(payment)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Invoice
                          </DropdownMenuItem>

                          {payment.status === "failed" && (
                            <DropdownMenuItem>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Retry Payment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination - same CSS/approach as Users page */}
            <div className="btn_div flex justify-between items-center px-2">
              <div className="left_div flex justify-start items-center">
                <button
                  className="border border-green-600 p-2 cursor-pointer rounded-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Previous
                </button>
              </div>
              <span>
                Page {currentPage} of {totalPages}{" "}
              </span>
              <div className="right_div left_div flex justify-end items-center">
                <button
                  className="border border-green-600 p-2 cursor-pointer rounded-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Payment Link Modal */}
      <Dialog
        open={showPaymentLinkModal}
        onOpenChange={setShowPaymentLinkModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Generate Payment Link
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a secure payment link for your customer
            </DialogDescription>
          </DialogHeader>

          {!showGeneratedLink ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="amount"
                  className="text-sm font-medium text-gray-700"
                >
                  Amount (€) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={linkForm.amount}
                  onChange={(e) =>
                    setLinkForm({ ...linkForm, amount: e.target.value })
                  }
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700"
                >
                  Payment Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Premium subscription renewal"
                  value={linkForm.description}
                  onChange={(e) =>
                    setLinkForm({ ...linkForm, description: e.target.value })
                  }
                  className="border-gray-300 resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="planType"
                  className="text-sm font-medium text-gray-700"
                >
                  Plan Type
                </Label>
                <Select
                  value={linkForm.planType}
                  onValueChange={(value) =>
                    setLinkForm({ ...linkForm, planType: value })
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base">Base Plan</SelectItem>
                    <SelectItem value="premium">Premium Plan</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Recipient Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  value={linkForm.recipientEmail}
                  onChange={(e) =>
                    setLinkForm({ ...linkForm, recipientEmail: e.target.value })
                  }
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="expiration"
                  className="text-sm font-medium text-gray-700"
                >
                  Link Expiration
                </Label>
                <Select
                  value={linkForm.expiration}
                  onValueChange={(value) =>
                    setLinkForm({ ...linkForm, expiration: value })
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24 hours">24 hours</SelectItem>
                    <SelectItem value="3 days">3 days</SelectItem>
                    <SelectItem value="7 days">7 days</SelectItem>
                    <SelectItem value="30 days">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  Payment Link Generated
                </h4>
                <p className="text-sm text-green-700 mb-3">
                  Your payment link has been created successfully.
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    value={generatedLink}
                    readOnly
                    className="text-sm bg-white border-green-300"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedLink)}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send via Email
                </Button>
                <Button
                  onClick={() => copyToClipboard(generatedLink)}
                  className="flex-1 bg-[#1C9B7A] hover:bg-[#158a69]"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeModal}
              className="border-gray-300"
            >
              {showGeneratedLink ? "Close" : "Cancel"}
            </Button>
            {!showGeneratedLink && (
              <Button
                onClick={handleGeneratePaymentLink}
                className="bg-[#1C9B7A] hover:bg-[#158a69]"
              >
                Generate Link
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
