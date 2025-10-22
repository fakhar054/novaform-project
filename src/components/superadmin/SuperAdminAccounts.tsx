// import React, { useState } from "react";
// import { Plus, Save, X, Eye, EyeOff } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Checkbox } from "@/components/ui/checkbox";
// import { PasswordStrength } from "@/components/ui/password-strength";
// // import { useToast } from "@/hooks/use-toast";
// import { toast } from "sonner";
// import { supabase } from "@/integrations/supabase/client";

// import supabaseAdmin from "@/integrations/supabase/superadmin";

// export const SuperAdminAccounts: React.FC = () => {
//   // const { toast } = useToast();
//   const [isCreating, setIsCreating] = useState(false);

//   const [showPassword, setShowPassword] = useState(false);
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [plan_id, set_plan_id] = useState();
//   const [price, setPrice] = useState();

//   const [uuid_user, setUser_uuid] = useState("");
//   const [manualPlan, setManualPlan] = useState();
//   const [manualPlanType, setManualPlanType] = useState("");

//   const [formData, setFormData] = useState({
//     // General Info
//     businessName: "",
//     contactPerson: "",
//     phone: "",
//     email: "",
//     //extra
//     language: "it",
//     customDomain: "",
//     notes: "",
//     sur_name: "",

//     //company tax info
//     tax_code: "",
//     sdi_code: "",
//     vatNumber: "",
//     billingEmail: "",
//     companyName: "",

//     //Registered Office Address
//     address: "",
//     cap: "",
//     city: "",
//     province: "",
//     country: "IT",

//     // Billing Information
//     legalOwnerFirstName: "",
//     legalOwnerLastName: "",
//     streetAddress: "",
//     zipCode: "",

//     // Account Access & Subscription
//     password: "",
//     plan: "",
//     billing_type: "",
//     accountStatus: true,
//     sendOnboardingEmail: true,
//   });

//   const italianProvinces = [
//     { code: "AG", name: "Agrigento" },
//     { code: "AL", name: "Alessandria" },
//     { code: "AN", name: "Ancona" },
//     { code: "AO", name: "Aosta" },
//     { code: "AR", name: "Arezzo" },
//     { code: "AP", name: "Ascoli Piceno" },
//     { code: "AT", name: "Asti" },
//     { code: "AV", name: "Avellino" },
//     { code: "BA", name: "Bari" },
//     { code: "BT", name: "Barletta-Andria-Trani" },
//     { code: "BL", name: "Belluno" },
//     { code: "BN", name: "Benevento" },
//     { code: "BG", name: "Bergamo" },
//     { code: "BI", name: "Biella" },
//     { code: "BO", name: "Bologna" },
//     { code: "BZ", name: "Bolzano" },
//     { code: "BS", name: "Brescia" },
//     { code: "BR", name: "Brindisi" },
//     { code: "CA", name: "Cagliari" },
//     { code: "CL", name: "Caltanissetta" },
//     { code: "CB", name: "Campobasso" },
//     { code: "CS", name: "Cosenza" },
//     { code: "CT", name: "Catania" },
//     { code: "CZ", name: "Catanzaro" },
//     { code: "CH", name: "Chieti" },
//     { code: "CO", name: "Como" },
//     { code: "CR", name: "Cremona" },
//     { code: "KR", name: "Crotone" },
//     { code: "CN", name: "Cuneo" },
//     { code: "EN", name: "Enna" },
//     { code: "FM", name: "Fermo" },
//     { code: "FE", name: "Ferrara" },
//     { code: "FI", name: "Firenze" },
//     { code: "FG", name: "Foggia" },
//     { code: "FC", name: "Forlì-Cesena" },
//     { code: "FR", name: "Frosinone" },
//     { code: "GE", name: "Genova" },
//     { code: "GO", name: "Gorizia" },
//     { code: "GR", name: "Grosseto" },
//     { code: "IM", name: "Imperia" },
//     { code: "IS", name: "Isernia" },
//     { code: "AQ", name: "L'Aquila" },
//     { code: "SP", name: "La Spezia" },
//     { code: "LT", name: "Latina" },
//     { code: "LE", name: "Lecce" },
//     { code: "LC", name: "Lecco" },
//     { code: "LI", name: "Livorno" },
//     { code: "LO", name: "Lodi" },
//     { code: "LU", name: "Lucca" },
//     { code: "MC", name: "Macerata" },
//     { code: "MN", name: "Mantova" },
//     { code: "MS", name: "Massa-Carrara" },
//     { code: "MT", name: "Matera" },
//     { code: "ME", name: "Messina" },
//     { code: "MI", name: "Milano" },
//     { code: "MO", name: "Modena" },
//     { code: "MB", name: "Monza e Brianza" },
//     { code: "NA", name: "Napoli" },
//     { code: "NO", name: "Novara" },
//     { code: "NU", name: "Nuoro" },
//     { code: "OR", name: "Oristano" },
//     { code: "PD", name: "Padova" },
//     { code: "PA", name: "Palermo" },
//     { code: "PR", name: "Parma" },
//     { code: "PV", name: "Pavia" },
//     { code: "PG", name: "Perugia" },
//     { code: "PU", name: "Pesaro e Urbino" },
//     { code: "PE", name: "Pescara" },
//     { code: "PC", name: "Piacenza" },
//     { code: "PI", name: "Pisa" },
//     { code: "PT", name: "Pistoia" },
//     { code: "PN", name: "Pordenone" },
//     { code: "PZ", name: "Potenza" },
//     { code: "PO", name: "Prato" },
//     { code: "RG", name: "Ragusa" },
//     { code: "RA", name: "Ravenna" },
//     { code: "RC", name: "Reggio Calabria" },
//     { code: "RE", name: "Reggio Emilia" },
//     { code: "RI", name: "Rieti" },
//     { code: "RN", name: "Rimini" },
//     { code: "RM", name: "Roma" },
//     { code: "RO", name: "Rovigo" },
//     { code: "SA", name: "Salerno" },
//     { code: "SS", name: "Sassari" },
//     { code: "SV", name: "Savona" },
//     { code: "SI", name: "Siena" },
//     { code: "SR", name: "Siracusa" },
//     { code: "SO", name: "Sondrio" },
//     { code: "SU", name: "Sud Sardegna" },
//     { code: "TA", name: "Taranto" },
//     { code: "TE", name: "Teramo" },
//     { code: "TR", name: "Terni" },
//     { code: "TO", name: "Torino" },
//     { code: "TP", name: "Trapani" },
//     { code: "TN", name: "Trento" },
//     { code: "TV", name: "Treviso" },
//     { code: "TS", name: "Trieste" },
//     { code: "UD", name: "Udine" },
//     { code: "VA", name: "Varese" },
//     { code: "VE", name: "Venezia" },
//     { code: "VB", name: "Verbano-Cusio-Ossola" },
//     { code: "VC", name: "Vercelli" },
//     { code: "VR", name: "Verona" },
//     { code: "VV", name: "Vibo Valentia" },
//     { code: "VI", name: "Vicenza" },
//     { code: "VT", name: "Viterbo" },
//   ];

//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const validateVAT = (vat: string) => {
//     return /^\d{11}$/.test(vat);
//   };

//   const validatePEC = (email: string) => {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   };
//   const validateSDI = (sdi: string) => {
//     return /^[A-Z0-9]{7}$/.test(sdi.toUpperCase());
//   };

//   const validateCognome = (contactPerson) => {
//     return /^[A-Za-z\s]{3,}$/.test(contactPerson);
//   };
//   const validatePhone = (phone: string) => {
//     return /^[0-9]+$/.test(phone.trim());
//   };

//   const validateZipCode = (zip: string) => {
//     return /^[0-9]{5,}$/.test(zip.trim());
//   };

//   const incrementSubscriberCount = async (planId: number) => {
//     const { error } = await supabase.rpc("increment_subscriber_count", {
//       plan_id_input: planId,
//     });

//     if (error) {
//       console.error("Error incrementing subscriber count:", error);
//     } else {
//       console.log("Subscriber count updated successfully!");
//     }
//   };

//   const handleInputChange = async (field: string, value: string | boolean) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));

//     const newErrors = { ...errors };
//     if (
//       field === "vatNumber" &&
//       typeof value === "string" &&
//       value &&
//       !validateVAT(value)
//     ) {
//       newErrors.vatNumber = "VAT number must be 11 digits";
//     } else if (field === "vatNumber") {
//       delete newErrors.vatNumber;
//     }

//     if (
//       field === "billingEmail" &&
//       typeof value === "string" &&
//       value &&
//       !validatePEC(value)
//     ) {
//       newErrors.pecEmail = "Please enter a valid email address";
//     } else if (field === "billingEmail") {
//       delete newErrors.pecEmail;
//     }

//     if (
//       field === "sdi_code" &&
//       typeof value === "string" &&
//       value &&
//       !validateSDI(value)
//     ) {
//       newErrors.sdiCode = "SDI code must be 7 alphanumeric characters";
//     } else if (field === "sdi_code") {
//       delete newErrors.sdiCode;
//     }

//     // Validation

//     if (
//       field === "contactPerson" &&
//       typeof value === "string" &&
//       value &&
//       !validateCognome(value)
//     ) {
//       newErrors.contactPerson =
//         "Cognome must be at least 3 letters, only letters";
//     } else if (field === "contactPerson") {
//       delete newErrors.contactPerson;
//     }

//     if (
//       field === "phone" &&
//       typeof value === "string" &&
//       value &&
//       !validatePhone(value)
//     ) {
//       newErrors.phone = "Phone number must be only numbers 0-9";
//     } else if (field === "phone") {
//       delete newErrors.phone;
//     }

//     if (
//       field === "zipCode" &&
//       typeof value === "string" &&
//       value && // <-- important
//       !validateZipCode(value)
//     ) {
//       newErrors.zipCode =
//         "Zip code must be at least 5 digits long and contain only numbers";
//     } else if (field === "zipCode") {
//       delete newErrors.zipCode;
//     }

//     setErrors(newErrors);
//   };

//   const resetForm = () => {
//     setFormData({
//       businessName: "",
//       contactPerson: "",
//       phone: "",
//       email: "",
//       language: "it",
//       customDomain: "",
//       notes: "",
//       legalOwnerFirstName: "",
//       legalOwnerLastName: "",
//       billingEmail: "",
//       vatNumber: "",
//       streetAddress: "",
//       city: "",
//       zipCode: "",
//       province: "",
//       country: "IT",
//       password: "",
//       plan: "standard",
//       accountStatus: true,
//       sendOnboardingEmail: true,
//     });
//   };

//   function generateInvoiceNo() {
//     const year = new Date().getFullYear();
//     const randomNum = Math.floor(100 + Math.random() * 900);
//     return `NF:${year}-${randomNum}`;
//   }

//   function getDateAfterOneMonth() {
//     const today = new Date();
//     const nextMonth = new Date(today);
//     nextMonth.setMonth(today.getMonth() + 1);

//     const year = nextMonth.getFullYear();
//     const month = String(nextMonth.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
//     const day = String(nextMonth.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
//   }

//   function getDateAfterOneYear() {
//     const today = new Date();
//     const nextYear = new Date(today);
//     nextYear.setFullYear(today.getFullYear() + 1);

//     const year = nextYear.getFullYear();
//     const month = String(nextYear.getMonth() + 1).padStart(2, "0");
//     const day = String(nextYear.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
//   }

//   const insertInvoice = async (
//     userId,
//     EmailPerson,
//     PlanName,
//     AmountPaid,
//     VatNumber,
//     Sdi,
//     customerName,
//     CityName,
//     ProvinceName,
//     duration
//   ) => {
//     const invoiceNo = generateInvoiceNo();
//     console.log("Function for inset into invoice has been called");
//     const fullAddress = `${CityName}, ${ProvinceName}`;

//     const { data, error } = await supabase.from("invoices").insert([
//       {
//         user_id: userId,
//         invoice_no: invoiceNo,
//         personal_email: EmailPerson,
//         vat: VatNumber,
//         sdi: Sdi,
//         customer_name: customerName,
//         amount_total: AmountPaid,
//         plan_name: PlanName,
//         city: CityName,
//         province: ProvinceName,
//         duration,
//         tax_percentage: 22,
//         address: fullAddress,
//         status: formData.accountStatus,
//       },
//     ]);

//     if (error) {
//       console.error("Error inserting invoice:", error.message);
//     } else {
//       console.log("Invoice inserted:", data);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const PlanName = formData.plan;
//     const AmountPaid = manualPlan?.price_monthly;
//     const EmailPerson = formData.email;
//     const VatNumber = formData.vatNumber;
//     const Sdi = formData.sdi_code;
//     const customerName = formData.businessName;
//     const CityName = formData.city;
//     const ProvinceName = formData.province;
//     const statusSubscripion = formData.accountStatus;

//     const monthEndPeriod = getDateAfterOneMonth();
//     const yearEndPeriod = getDateAfterOneYear();

//     console.log("Creating account:", formData);
//     // Step 1: Create user in Supabase Auth
//     const { data: authData, error: authError } =
//       await supabaseAdmin.auth.admin.createUser({
//         email: formData.email,
//         password: formData.password || undefined,
//         email_confirm: true,
//       });

//     if (authError) {
//       console.error("Error creating auth user:", authError.message);
//       toast.error("Error creating user");
//       return;
//     }

//     const userId = authData.user.id;
//     console.log("Created User Id: ", userId);
//     setUser_uuid(userId);

//     const { error: dbError } = await supabaseAdmin.from("users").insert({
//       user_id: userId,
//       businessName: formData.businessName || null,
//       contactPerson: formData.contactPerson || null,
//       phone: formData.phone || null,
//       email: formData.email || null,
//       language: formData.language || null,
//       customDomain: formData.customDomain || null,

//       notes: formData.notes || null,
//       legalOwnerFirstName: formData.legalOwnerFirstName || null,
//       legalOwnerLastName: formData.legalOwnerLastName || null,
//       billingEmail: formData.billingEmail || null,
//       vatNumber: formData.vatNumber || null,
//       streetAddress: formData.streetAddress || null,
//       city: formData.city || null,
//       province: formData.province || null,
//       country: formData.country || null,
//       plan: formData.plan || null,
//       accountStatus: formData.accountStatus,
//       sendOnboardingEmail: formData.sendOnboardingEmail,
//       sur_name: formData.sur_name || null,
//       companyName: formData.companyName || null,
//       tax_code: formData.tax_code || null,
//       sdi_code: formData.sdi_code || null,
//       zipCode: formData.zipCode || null,
//     });

//     if (dbError) {
//       console.error("Error inserting to users table:", dbError.message);
//       toast.error("User created in auth, but failed in DB");
//       return;
//     }

//     if (manualPlanType === "monthly") {
//       console.log(
//         "Please insert Monthly Data into supabase and userId is : ",
//         userId
//       );
//       const { data, error } = await supabase.from("subscription").upsert(
//         {
//           user_id: userId,
//           plan_name: formData.plan,
//           amount_paid: manualPlan?.price_monthly,
//           plan_id: manualPlan?.plan_product_id,
//           price_id: manualPlan?.stripe_price_monthly_id,
//           selected_plan_id: manualPlan?.stripe_price_monthly_id,
//           current_period_end: monthEndPeriod,
//           customer_name: customerName,
//           customer_email: EmailPerson,
//           subscription_status: statusSubscripion,
//         },
//         { onConflict: "user_id" }
//       );
//       await incrementSubscriberCount(plan_id);

//       if (error) {
//         console.error("Insert error:", error.message);
//       } else {
//         console.log("Inserted:", data);

//         const duration = "monthly";

//         insertInvoice(
//           userId,
//           EmailPerson,
//           PlanName,
//           AmountPaid,
//           VatNumber,
//           Sdi,
//           customerName,
//           CityName,
//           ProvinceName,
//           duration
//         );
//       }
//     } else if (manualPlanType === "yearly") {
//       console.log(
//         "Please insert Yearly Data into supabase and userId is : ",
//         userId
//       );
//       const { data, error } = await supabase.from("subscription").upsert(
//         {
//           user_id: userId,
//           plan_name: formData.plan,
//           price_id: manualPlan?.stripe_price_yearly_id,
//           plan_id: manualPlan?.plan_product_id,
//           amount_paid: manualPlan?.price_yearly,
//           selected_plan_id: manualPlan?.stripe_price_yearly_id,
//           current_period_end: yearEndPeriod,
//           customer_name: customerName,
//           customer_email: EmailPerson,
//           subscription_status: statusSubscripion,
//         },
//         { onConflict: "user_id" }
//       );
//       await incrementSubscriberCount(plan_id);

//       if (error) {
//         console.error("Insert error:", error.message);
//       } else {
//         console.log("Inserted:", data);
//         const duration = "yearly";

//         insertInvoice(
//           userId,
//           EmailPerson,
//           PlanName,
//           AmountPaid,
//           VatNumber,
//           Sdi,
//           customerName,
//           CityName,
//           ProvinceName,
//           duration
//         );
//       }
//     }

//     console.log("User created and saved to DB");
//     console.log("User selected plan:", formData.plan);

//     toast("Account Created Successfully");

//     // Reset form
//     setFormData({
//       businessName: "",
//       contactPerson: "",
//       phone: "",
//       email: "",
//       language: "it",
//       customDomain: "",
//       notes: "",
//       legalOwnerFirstName: "",
//       legalOwnerLastName: "",
//       billingEmail: "",
//       vatNumber: "",
//       streetAddress: "",
//       city: "",
//       zipCode: "",
//       province: "",
//       country: "IT",
//       password: "",
//       plan: "standard",
//       accountStatus: true,
//       sendOnboardingEmail: true,
//       sur_name: "",
//       companyName: "",
//       tax_code: "",
//       sdi_code: "",
//       address: "",
//       cap: "",
//     });
//   };

//   const handleCancel = () => {
//     // setIsCreating(false);
//     setFormData({
//       businessName: "",
//       contactPerson: "",
//       phone: "",
//       email: "",
//       language: "it",
//       customDomain: "",
//       notes: "",
//       legalOwnerFirstName: "",
//       legalOwnerLastName: "",
//       billingEmail: "",
//       vatNumber: "",
//       streetAddress: "",
//       city: "",
//       zipCode: "",
//       province: "",
//       country: "IT",
//       password: "",
//       plan: "standard",
//       accountStatus: true,
//       sendOnboardingEmail: true,
//       sur_name: "",
//       companyName: "",
//       tax_code: "",
//       sdi_code: "",
//       address: "",
//       cap: "",
//     });
//   };

//   const fetchPlans = async () => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from("subscription_plan")
//       .select("*");
//     if (error) {
//       console.log("The error while fetch plans in form :", error);
//       setPlans([]);
//     } else {
//       setPlans(data);
//     }
//     setLoading(false);
//   };

//   const handleCreateAccount = () => {
//     console.log("Clicked");
//     setIsCreating(true);
//     fetchPlans();
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-left">
//             Account Management
//           </h1>
//           <p className="text-gray-600 mt-1">
//             Create and manage pharmacy accounts manually
//           </p>
//         </div>

//         {!isCreating && (
//           <Button
//             onClick={handleCreateAccount}
//             className="bg-[#1C9B7A] hover:bg-[#158a69] mt-4 sm:mt-0"
//           >
//             <Plus className="w-4 h-4 mr-2" />
//             Create New Account
//           </Button>
//         )}
//       </div>

//       {isCreating ? (
//         <form onSubmit={handleSubmit} className="space-y-6 text-left">
//           {/* General Info Section */}
//           <Card className="bg-white border border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold text-gray-900">
//                 Referent Detail123
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="businessName">
//                     Nome <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="businessName"
//                     value={formData.businessName}
//                     onChange={(e) =>
//                       handleInputChange("businessName", e.target.value)
//                     }
//                     placeholder="e.g., Farmacia Centrale Milano"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="contactPerson">
//                     Cognome <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="contactPerson"
//                     value={formData.contactPerson}
//                     onChange={(e) =>
//                       handleInputChange("contactPerson", e.target.value)
//                     }
//                     placeholder="Dr. Mario Rossi"
//                     required
//                   />
//                   {errors.contactPerson && (
//                     <p className="mt-1 text-sm text-red-600">
//                       {errors.contactPerson}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="email">
//                     Email Personale <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => handleInputChange("email", e.target.value)}
//                     placeholder="admin@pharmacy.com"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="phone">
//                     Numero di Telefono <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="phone"
//                     value={formData.phone}
//                     onChange={(e) => handleInputChange("phone", e.target.value)}
//                     placeholder="+39 02 1234567"
//                     required
//                   />
//                   {errors.phone && (
//                     <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Billing Information Section */}
//           <Card className="bg-white border border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold text-gray-900">
//                 Company Tax Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="companyName">
//                     Ragione Sociale / Nome Legale{" "}
//                     <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="companyName"
//                     value={formData.companyName}
//                     onChange={(e) =>
//                       handleInputChange("companyName", e.target.value)
//                     }
//                     placeholder="Mario"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="vatNumber">
//                     Partita IVA <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="vatNumber"
//                     value={formData.vatNumber}
//                     onChange={(e) =>
//                       handleInputChange("vatNumber", e.target.value)
//                     }
//                     placeholder="IT12345678901"
//                     maxLength={11}
//                     required
//                   />
//                   {errors.vatNumber && (
//                     <p className="mt-1 text-sm text-red-600">
//                       {errors.vatNumber}
//                     </p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="tax_code">
//                     Codice Fiscale (se diverso dalla P.IVA)
//                     <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="tax_code"
//                     value={formData.tax_code}
//                     onChange={(e) =>
//                       handleInputChange("tax_code", e.target.value)
//                     }
//                     placeholder="IT12345678901"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="sdi_code">
//                     Codice SDI <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="sdi_code"
//                     value={formData.sdi_code}
//                     onChange={(e) =>
//                       handleInputChange("sdi_code", e.target.value)
//                     }
//                     placeholder="ABC1234"
//                     maxLength={7}
//                     required
//                   />
//                   {errors.sdiCode && (
//                     <p className="mt-1 text-sm text-red-600">
//                       {errors.sdiCode}
//                     </p>
//                   )}
//                 </div>

//                 <div className="space-y-2 text-left">
//                   <Label htmlFor="billingEmail">
//                     Email PEC <span className="text-red-500 text-left">*</span>
//                   </Label>
//                   <Input
//                     id="billingEmail"
//                     type="email"
//                     value={formData.billingEmail}
//                     onChange={(e) =>
//                       handleInputChange("billingEmail", e.target.value)
//                     }
//                     placeholder="pec@example.pec.it"
//                     required
//                   />
//                   {errors.pecEmail && (
//                     <p className="mt-1 text-sm text-red-600 ">
//                       {errors.pecEmail}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Registered Office Address Section */}
//           <Card className="bg-white border border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold text-gray-900">
//                 Registered Office Address
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="streetAddress">
//                     Indirizzo123 <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="address"
//                     value={formData.streetAddress}
//                     onChange={(e) =>
//                       handleInputChange("streetAddress", e.target.value)
//                     }
//                     placeholder="Via Roma 123"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="zipCode">
//                     CAP <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="zipCode"
//                     value={formData.zipCode}
//                     onChange={(e) =>
//                       handleInputChange("zipCode", e.target.value)
//                     }
//                     placeholder="234561"
//                     required
//                   />
//                   {errors.zipCode && (
//                     <p className="mt-1 text-sm text-red-600">
//                       {errors.zipCode}
//                     </p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="vatNumber">
//                     Città <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="city"
//                     value={formData.city}
//                     onChange={(e) => handleInputChange("city", e.target.value)}
//                     placeholder="IT12345678901"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="province">Provincia *</Label>

//                   <Select
//                     value={formData.province || ""}
//                     onValueChange={(value) => {
//                       handleInputChange("province", value);
//                     }}
//                   >
//                     <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent">
//                       <SelectValue placeholder="Select Province" />
//                     </SelectTrigger>

//                     <SelectContent>
//                       {italianProvinces.map((province) => (
//                         <SelectItem key={province.code} value={province.code}>
//                           {province.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="country">
//                     Paese <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="country"
//                     value={formData.country}
//                     onChange={(e) =>
//                       handleInputChange("country", e.target.value)
//                     }
//                     placeholder="ABC1234"
//                     readOnly
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Additional Account Settings Section */}
//           <Card className="bg-white border border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold text-gray-900">
//                 Additional Account Settings
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="language">Default Language</Label>
//                   <Select
//                     value={formData.language}
//                     onValueChange={(value) =>
//                       handleInputChange("language", value)
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="it">Italian</SelectItem>
//                       {/* <SelectItem value="en">English</SelectItem>
//                           <SelectItem value="fr">French</SelectItem>
//                           <SelectItem value="de">German</SelectItem>
//                           <SelectItem value="es">Spanish</SelectItem> */}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="customDomain">Custom Domain</Label>
//                   <Input
//                     id="customDomain"
//                     value={formData.customDomain}
//                     onChange={(e) =>
//                       handleInputChange("customDomain", e.target.value)
//                     }
//                     placeholder="pharmacy.novafarm.it"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="notes">Internal Notes</Label>
//                   <Textarea
//                     id="notes"
//                     value={formData.notes}
//                     onChange={(e) => handleInputChange("notes", e.target.value)}
//                     placeholder="Any additional notes about this account..."
//                     rows={3}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Account Access & Subscription Section */}
//           <Card className="bg-white border border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold text-gray-900">
//                 Account Access & Subscription
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-2">
//                 <Label htmlFor="password">
//                   Password (Optional - Auto-generated if empty)
//                 </Label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     value={formData.password}
//                     onChange={(e) =>
//                       handleInputChange("password", e.target.value)
//                     }
//                     placeholder="Leave empty for auto-generation"
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     className="absolute right-2 top-1/2 -translate-y-1/2 px-2 h-auto"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="w-4 h-4" />
//                     ) : (
//                       <Eye className="w-4 h-4" />
//                     )}
//                   </Button>
//                 </div>
//                 {formData.password && (
//                   <PasswordStrength
//                     password={formData.password}
//                     className="mt-3"
//                   />
//                 )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="plan">Subscription Plan *</Label>

//                   <Select
//                     value={formData.plan || ""}
//                     onValueChange={(value) => {
//                       console.log("value from select ", value);
//                       const selectedPlan = plans.find(
//                         (p) => p.plan_name === value
//                       );
//                       setManualPlan(selectedPlan);

//                       if (selectedPlan) {
//                         setFormData((prev) => ({
//                           ...prev,
//                           plan: selectedPlan.plan_name,
//                         }));

//                         set_plan_id(selectedPlan.id);
//                       }
//                       console.log("Selected Plan id:: ", plan_id);
//                       console.log("Selected Plan is:: ", manualPlan);
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a plan" />
//                     </SelectTrigger>

//                     <SelectContent>
//                       {plans.map((plan) => (
//                         <SelectItem key={plan.id} value={plan.plan_name}>
//                           {plan.plan_name.trim()}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="plan">Billing Plan Type</Label>
//                   <Select
//                     value={formData.billing_type}
//                     onValueChange={(value) => {
//                       handleInputChange("billing_type", value);
//                       console.log("selected type from value: ", value);
//                       setManualPlanType(value);
//                       console.log("selected type from state: ", manualPlanType);
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="monthly">Monthly </SelectItem>
//                       <SelectItem value="yearly">Yearly </SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="accountStatus">Account Status</Label>
//                   <div className="flex items-center space-x-3 pt-2">
//                     <Switch
//                       id="accountStatus"
//                       checked={formData.accountStatus}
//                       onCheckedChange={(checked) =>
//                         handleInputChange("accountStatus", checked)
//                       }
//                     />
//                     <span
//                       className={`text-sm font-medium ${
//                         formData.accountStatus
//                           ? "text-green-600"
//                           : "text-red-600"
//                       }`}
//                     >
//                       {formData.accountStatus ? "Active" : "Suspended"}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="sendOnboardingEmail"
//                   checked={formData.sendOnboardingEmail}
//                   onCheckedChange={(checked) =>
//                     handleInputChange("sendOnboardingEmail", checked)
//                   }
//                 />
//                 <Label htmlFor="sendOnboardingEmail" className="text-sm">
//                   Send Onboarding Email with login credentials
//                 </Label>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Action Buttons */}
//           <div className="flex flex-col sm:flex-row gap-4 pt-4">
//             <Button
//               type="submit"
//               className="bg-[#1C9B7A] hover:bg-[#158a69] flex-1 sm:flex-none"
//             >
//               <Save className="w-4 h-4 mr-2" />
//               Create Account
//             </Button>

//             <Button
//               type="button"
//               variant="outline"
//               onClick={handleCancel}
//               className="flex-1 sm:flex-none"
//             >
//               <X className="w-4 h-4 mr-2" />
//               Cancel
//             </Button>
//           </div>
//         </form>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Quick Stats */}
//           <Card className="bg-white border border-gray-200">
//             <CardContent className="p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 Account Creation
//               </h3>
//               <p className="text-gray-600 mb-4">
//                 Create new pharmacy accounts with automatic onboarding email
//                 delivery.
//               </p>
//               <ul className="text-sm text-gray-500 space-y-1">
//                 <li>• Automatic credentials generation</li>
//                 <li>• Custom domain setup</li>
//                 <li>• Plan assignment</li>
//                 <li>• Onboarding email with login details</li>
//               </ul>
//             </CardContent>
//           </Card>

//           <Card className="bg-white border border-gray-200">
//             <CardContent className="p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 Features Included
//               </h3>
//               <ul className="text-sm text-gray-600 space-y-2">
//                 <li>✓ Multi-language support</li>
//                 <li>✓ Custom domain configuration</li>
//                 <li>✓ Flexible plan assignment</li>
//                 <li>✓ Business information management</li>
//                 <li>✓ VAT/Tax ID tracking</li>
//                 <li>✓ Internal notes system</li>
//               </ul>
//             </CardContent>
//           </Card>

//           <Card className="bg-white border border-gray-200">
//             <CardContent className="p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 Automation
//               </h3>
//               <p className="text-gray-600 mb-4">
//                 Once created, the system automatically:
//               </p>
//               <ul className="text-sm text-gray-500 space-y-1">
//                 <li>• Generates secure login credentials</li>
//                 <li>• Sets up the pharmacy dashboard</li>
//                 <li>• Sends welcome email with access details</li>
//                 <li>• Configures billing and subscription</li>
//               </ul>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// };
/////////////////////////////////////////
import React, { useEffect, useRef, useState } from "react";
import { Plus, Save, X, Eye, EyeOff } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordStrength } from "@/components/ui/password-strength";
import { toast } from "sonner";
import supabaseAdmin from "@/integrations/supabase/superadmin";
import { supabase } from "@/integrations/supabase/client";

// Define the type for your form data
export interface AccountFormData {
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  language: string;
  customDomain: string;
  notes: string;
  legalOwnerFirstName: string;
  legalOwnerLastName: string;
  billingEmail: string;
  vatNumber: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  province: string;
  country: string;
  password?: string;
  plan: string;
  accountStatus: boolean;
  sendOnboardingEmail: boolean;
}

interface CreateAccountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SuperAdminAccounts: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plan_id, set_plan_id] = useState();
  const [price, setPrice] = useState();

  const [uuid_user, setUser_uuid] = useState("");
  const [manualPlan, setManualPlan] = useState();
  const [manualPlanType, setManualPlanType] = useState("");
  const [plateFormName, setPlateForm] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState();
  //for authnitication

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("subscription_plan")
        .select("*");
      if (error) {
        console.log("The error while fetch plans in form :", error);
        setPlans([]);
      } else {
        setPlans(data);
      }
      setLoading(false);
    };
    fetchPlans();
    fetchSettings();
    fetchEmailTemplate();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("settings")
      .select("platform_name,support_email")
      .single();

    if (error) {
      console.error("Error fetching platform_name:", error);
    } else {
      // console.log("Platform name:", data);
      setPlateForm(data?.platform_name);
      setSupportEmail(data?.support_email);
    }
  };

  const fetchEmailTemplate = async () => {
    const { data, error } = await supabase
      .from("email_template_table")
      .select("template_name,description")
      .eq("template_name", "Account successfully created")
      .single();

    if (error) {
      console.error("Error fetching template:", error);
    } else {
      setTemplateName(data?.template_name);
      // console.log("Template Name:", data);
      setDescription(data?.description);
    }
  };

  const [formData, setFormData] = useState({
    // General Info
    businessName: "",
    contactPerson: "",
    phone: "",
    email: "",
    //extra
    language: "it",
    customDomain: "",
    notes: "",
    sur_name: "",

    //company tax info
    tax_code: "",
    sdi_code: "",
    vatNumber: "",
    billingEmail: "",
    companyName: "",

    //Registered Office Address
    address: "",
    cap: "",
    city: "",
    province: "",
    country: "IT",

    // Billing Information
    legalOwnerFirstName: "",
    legalOwnerLastName: "",
    streetAddress: "",
    zipCode: "",

    // Account Access & Subscription
    password: "",
    plan: "",
    billing_type: "",
    accountStatus: true,
    sendOnboardingEmail: true,
  });
  const italianProvinces = [
    { code: "AG", name: "Agrigento" },
    { code: "AL", name: "Alessandria" },
    { code: "AN", name: "Ancona" },
    { code: "AO", name: "Aosta" },
    { code: "AR", name: "Arezzo" },
    { code: "AP", name: "Ascoli Piceno" },
    { code: "AT", name: "Asti" },
    { code: "AV", name: "Avellino" },
    { code: "BA", name: "Bari" },
    { code: "BT", name: "Barletta-Andria-Trani" },
    { code: "BL", name: "Belluno" },
    { code: "BN", name: "Benevento" },
    { code: "BG", name: "Bergamo" },
    { code: "BI", name: "Biella" },
    { code: "BO", name: "Bologna" },
    { code: "BZ", name: "Bolzano" },
    { code: "BS", name: "Brescia" },
    { code: "BR", name: "Brindisi" },
    { code: "CA", name: "Cagliari" },
    { code: "CL", name: "Caltanissetta" },
    { code: "CB", name: "Campobasso" },
    { code: "CS", name: "Cosenza" },
    { code: "CT", name: "Catania" },
    { code: "CZ", name: "Catanzaro" },
    { code: "CH", name: "Chieti" },
    { code: "CO", name: "Como" },
    { code: "CR", name: "Cremona" },
    { code: "KR", name: "Crotone" },
    { code: "CN", name: "Cuneo" },
    { code: "EN", name: "Enna" },
    { code: "FM", name: "Fermo" },
    { code: "FE", name: "Ferrara" },
    { code: "FI", name: "Firenze" },
    { code: "FG", name: "Foggia" },
    { code: "FC", name: "Forlì-Cesena" },
    { code: "FR", name: "Frosinone" },
    { code: "GE", name: "Genova" },
    { code: "GO", name: "Gorizia" },
    { code: "GR", name: "Grosseto" },
    { code: "IM", name: "Imperia" },
    { code: "IS", name: "Isernia" },
    { code: "AQ", name: "L'Aquila" },
    { code: "SP", name: "La Spezia" },
    { code: "LT", name: "Latina" },
    { code: "LE", name: "Lecce" },
    { code: "LC", name: "Lecco" },
    { code: "LI", name: "Livorno" },
    { code: "LO", name: "Lodi" },
    { code: "LU", name: "Lucca" },
    { code: "MC", name: "Macerata" },
    { code: "MN", name: "Mantova" },
    { code: "MS", name: "Massa-Carrara" },
    { code: "MT", name: "Matera" },
    { code: "ME", name: "Messina" },
    { code: "MI", name: "Milano" },
    { code: "MO", name: "Modena" },
    { code: "MB", name: "Monza e Brianza" },
    { code: "NA", name: "Napoli" },
    { code: "NO", name: "Novara" },
    { code: "NU", name: "Nuoro" },
    { code: "OR", name: "Oristano" },
    { code: "PD", name: "Padova" },
    { code: "PA", name: "Palermo" },
    { code: "PR", name: "Parma" },
    { code: "PV", name: "Pavia" },
    { code: "PG", name: "Perugia" },
    { code: "PU", name: "Pesaro e Urbino" },
    { code: "PE", name: "Pescara" },
    { code: "PC", name: "Piacenza" },
    { code: "PI", name: "Pisa" },
    { code: "PT", name: "Pistoia" },
    { code: "PN", name: "Pordenone" },
    { code: "PZ", name: "Potenza" },
    { code: "PO", name: "Prato" },
    { code: "RG", name: "Ragusa" },
    { code: "RA", name: "Ravenna" },
    { code: "RC", name: "Reggio Calabria" },
    { code: "RE", name: "Reggio Emilia" },
    { code: "RI", name: "Rieti" },
    { code: "RN", name: "Rimini" },
    { code: "RM", name: "Roma" },
    { code: "RO", name: "Rovigo" },
    { code: "SA", name: "Salerno" },
    { code: "SS", name: "Sassari" },
    { code: "SV", name: "Savona" },
    { code: "SI", name: "Siena" },
    { code: "SR", name: "Siracusa" },
    { code: "SO", name: "Sondrio" },
    { code: "SU", name: "Sud Sardegna" },
    { code: "TA", name: "Taranto" },
    { code: "TE", name: "Teramo" },
    { code: "TR", name: "Terni" },
    { code: "TO", name: "Torino" },
    { code: "TP", name: "Trapani" },
    { code: "TN", name: "Trento" },
    { code: "TV", name: "Treviso" },
    { code: "TS", name: "Trieste" },
    { code: "UD", name: "Udine" },
    { code: "VA", name: "Varese" },
    { code: "VE", name: "Venezia" },
    { code: "VB", name: "Verbano-Cusio-Ossola" },
    { code: "VC", name: "Vercelli" },
    { code: "VR", name: "Verona" },
    { code: "VV", name: "Vibo Valentia" },
    { code: "VI", name: "Vicenza" },
    { code: "VT", name: "Viterbo" },
  ];

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateVAT = (vat: string) => {
    return /^\d{11}$/.test(vat);
  };

  const validatePEC = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const validateSDI = (sdi: string) => {
    return /^[A-Z0-9]{7}$/.test(sdi.toUpperCase());
  };

  const validateCognome = (contactPerson) => {
    return /^[A-Za-z\s]{3,}$/.test(contactPerson);
  };
  const validatePhone = (phone: string) => {
    return /^[0-9]+$/.test(phone.trim());
  };

  const validateZipCode = (zip: string) => {
    return /^[0-9]{5,}$/.test(zip.trim());
  };

  const emailwithTemplate = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;
    const route =
      "https://ajbxscredobhqfksaqrk.supabase.co/storage/v1/object/public/emailTemplate/accountSuccessfullycreated.html";

    const res = await fetch(
      "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/email-with-template",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          // to: "fakharali054@gmail.com",
          to: formData.email,
          subject: templateName,
          route,
          templateName: "emailFile",
          data: {
            title: "Welcome!",
            heading: "Welcome to NovaFarm",
            message: description,
            user_email: formData.email,
            userName: formData.businessName,
            platform_name: plateFormName,
            support_email: supportEmail,
            bodyText: "Thanks for joining. We're glad to have you!",
            footerText: "© 2025 Your Company. All rights reserved.",
          },
        }),
      }
    );
    const text = await res.text();
    if (!res.ok) {
      console.error("Function error:", res.status, text);
      toast.error("Failed to send Email");
    } else {
      console.log("Function success:", text);
      toast.success("Email send successfully");
    }
  };

  const handleInputChange = async (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    const newErrors = { ...errors };
    if (
      field === "vatNumber" &&
      typeof value === "string" &&
      value &&
      !validateVAT(value)
    ) {
      newErrors.vatNumber = "VAT number must be 11 digits";
    } else if (field === "vatNumber") {
      delete newErrors.vatNumber;
    }

    if (
      field === "billingEmail" &&
      typeof value === "string" &&
      value &&
      !validatePEC(value)
    ) {
      newErrors.pecEmail = "Please enter a valid email address";
    } else if (field === "billingEmail") {
      delete newErrors.pecEmail;
    }

    if (
      field === "sdi_code" &&
      typeof value === "string" &&
      value &&
      !validateSDI(value)
    ) {
      newErrors.sdiCode = "SDI code must be 7 alphanumeric characters";
    } else if (field === "sdi_code") {
      delete newErrors.sdiCode;
    }

    // Validation

    if (
      field === "contactPerson" &&
      typeof value === "string" &&
      value &&
      !validateCognome(value)
    ) {
      newErrors.contactPerson =
        "Cognome must be at least 3 letters, only letters";
    } else if (field === "contactPerson") {
      delete newErrors.contactPerson;
    }

    if (
      field === "phone" &&
      typeof value === "string" &&
      value &&
      !validatePhone(value)
    ) {
      newErrors.phone = "Phone number must be only numbers 0-9";
    } else if (field === "phone") {
      delete newErrors.phone;
    }

    if (
      field === "zipCode" &&
      typeof value === "string" &&
      value && // <-- important
      !validateZipCode(value)
    ) {
      newErrors.zipCode =
        "Zip code must be at least 5 digits long and contain only numbers";
    } else if (field === "zipCode") {
      delete newErrors.zipCode;
    }

    setErrors(newErrors);
  };

  const incrementSubscriberCount = async (planId: number) => {
    const { error } = await supabase.rpc("increment_subscriber_count", {
      plan_id_input: planId,
    });

    if (error) {
      console.error("Error incrementing subscriber count:", error);
    } else {
      console.log("Subscriber count updated successfully!");
    }
  };

  const resetForm = () => {
    setFormData({
      businessName: "",
      contactPerson: "",
      phone: "",
      email: "",
      language: "it",
      customDomain: "",
      notes: "",
      legalOwnerFirstName: "",
      legalOwnerLastName: "",
      billingEmail: "",
      vatNumber: "",
      streetAddress: "",
      city: "",
      zipCode: "",
      province: "",
      country: "IT",
      password: "",
      plan: "standard",
      accountStatus: true,
      sendOnboardingEmail: true,
    });
  };

  function generateInvoiceNo() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `NF:${year}-${randomNum}`;
  }

  function getDateAfterOneMonth() {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    const year = nextMonth.getFullYear();
    const month = String(nextMonth.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const day = String(nextMonth.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getDateAfterOneYear() {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    const year = nextYear.getFullYear();
    const month = String(nextYear.getMonth() + 1).padStart(2, "0");
    const day = String(nextYear.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const insertInvoice = async (
    userId,
    EmailPerson,
    PlanName,
    AmountPaid,
    VatNumber,
    Sdi,
    customerName,
    CityName,
    ProvinceName,
    duration
  ) => {
    const invoiceNo = generateInvoiceNo();
    console.log("Function for inset into invoice has been called");
    const fullAddress = `${CityName}, ${ProvinceName}`;

    const { data, error } = await supabase.from("invoices").insert([
      {
        user_id: userId,
        invoice_no: invoiceNo,
        personal_email: EmailPerson,
        vat: VatNumber,
        sdi: Sdi,
        customer_name: customerName,
        amount_total: AmountPaid,
        plan_name: PlanName,
        city: CityName,
        province: ProvinceName,
        duration,
        tax_percentage: 22,
        address: fullAddress,
        status: formData.accountStatus,
      },
    ]);

    if (error) {
      console.error("Error inserting invoice:", error.message);
    } else {
      console.log("Invoice inserted:", data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const PlanName = formData.plan;
    const AmountPaid = manualPlan?.price_monthly;
    const EmailPerson = formData.email;
    const VatNumber = formData.vatNumber;
    const Sdi = formData.sdi_code;
    const customerName = formData.businessName;
    const CityName = formData.city;
    const ProvinceName = formData.province;
    const statusSubscripion = formData.accountStatus;

    const monthEndPeriod = getDateAfterOneMonth();
    const yearEndPeriod = getDateAfterOneYear();

    console.log("Creating account:", formData);
    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password || undefined,
        email_confirm: true,
      });

    if (authError) {
      console.error("Error creating auth user:", authError.message);
      toast.error("Error creating user");
      return;
    }

    const userId = authData.user.id;
    console.log("Created User Id: ", userId);
    setUser_uuid(userId);

    const { error: dbError } = await supabaseAdmin.from("users").insert({
      user_id: userId,
      businessName: formData.businessName || null,
      contactPerson: formData.contactPerson || null,
      phone: formData.phone || null,
      email: formData.email || null,
      language: formData.language || null,
      customDomain: formData.customDomain || null,

      notes: formData.notes || null,
      legalOwnerFirstName: formData.legalOwnerFirstName || null,
      legalOwnerLastName: formData.legalOwnerLastName || null,
      billingEmail: formData.billingEmail || null,
      vatNumber: formData.vatNumber || null,
      streetAddress: formData.streetAddress || null,
      city: formData.city || null,
      province: formData.province || null,
      country: formData.country || null,
      plan: formData.plan || null,
      accountStatus: formData.accountStatus,
      sendOnboardingEmail: formData.sendOnboardingEmail,
      // sur_name: formData.sur_name || null,
      companyName: formData.companyName || null,
      tax_code: formData.tax_code || null,
      sdi_code: formData.sdi_code || null,
      zipCode: formData.zipCode || null,
    });

    if (dbError) {
      console.error("Error inserting to users table:", dbError.message);
      toast.error("User created in auth, but failed in DB");
      return;
    }

    if (manualPlanType === "monthly") {
      console.log(
        "Please insert Monthly Data into supabase and userId is : ",
        userId
      );
      const { data, error } = await supabase.from("subscription").upsert(
        {
          user_id: userId,
          plan_name: formData.plan,
          amount_paid: manualPlan?.price_monthly,
          plan_id: manualPlan?.plan_product_id,
          price_id: manualPlan?.stripe_price_monthly_id,
          selected_plan_id: manualPlan?.stripe_price_monthly_id,
          current_period_end: monthEndPeriod,
          customer_name: customerName,
          customer_email: EmailPerson,
          subscription_status: statusSubscripion,
        },
        { onConflict: "user_id" }
      );
      await incrementSubscriberCount(plan_id);

      if (error) {
        console.error("Insert error:", error.message);
      } else {
        console.log("Inserted:", data);

        const duration = "monthly";

        insertInvoice(
          userId,
          EmailPerson,
          PlanName,
          AmountPaid,
          VatNumber,
          Sdi,
          customerName,
          CityName,
          ProvinceName,
          duration
        );
      }
    } else if (manualPlanType === "yearly") {
      console.log(
        "Please insert Yearly Data into supabase and userId is : ",
        userId
      );
      const { data, error } = await supabase.from("subscription").upsert(
        {
          user_id: userId,
          plan_name: formData.plan,
          price_id: manualPlan?.stripe_price_yearly_id,
          plan_id: manualPlan?.plan_product_id,
          amount_paid: manualPlan?.price_yearly,
          selected_plan_id: manualPlan?.stripe_price_yearly_id,
          current_period_end: yearEndPeriod,
          customer_name: customerName,
          customer_email: EmailPerson,
          subscription_status: statusSubscripion,
        },
        { onConflict: "user_id" }
      );

      await incrementSubscriberCount(plan_id);

      if (error) {
        console.error("Insert error:", error.message);
      } else {
        console.log("Inserted:", data);
        const duration = "yearly";

        insertInvoice(
          userId,
          EmailPerson,
          PlanName,
          AmountPaid,
          VatNumber,
          Sdi,
          customerName,
          CityName,
          ProvinceName,
          duration
        );
      }
    }

    console.log("User created and saved to DB");
    console.log("User selected plan:", formData.plan);

    toast("Account Created Successfully");
    emailwithTemplate();

    // Reset form
    setFormData({
      businessName: "",
      contactPerson: "",
      phone: "",
      email: "",
      language: "it",
      customDomain: "",
      notes: "",
      legalOwnerFirstName: "",
      legalOwnerLastName: "",
      billingEmail: "",
      vatNumber: "",
      streetAddress: "",
      city: "",
      zipCode: "",
      province: "",
      country: "IT",
      password: "",
      plan: "standard",
      accountStatus: true,
      sendOnboardingEmail: true,
      sur_name: "",
      companyName: "",
      tax_code: "",
      sdi_code: "",
      address: "",
      cap: "",
    });
  };

  const handleCancel = () => {
    // setIsCreating(false);
    setFormData({
      businessName: "",
      contactPerson: "",
      phone: "",
      email: "",
      language: "it",
      customDomain: "",
      notes: "",
      legalOwnerFirstName: "",
      legalOwnerLastName: "",
      billingEmail: "",
      vatNumber: "",
      streetAddress: "",
      city: "",
      zipCode: "",
      province: "",
      country: "IT",
      password: "",
      plan: "standard",
      accountStatus: true,
      sendOnboardingEmail: true,
      sur_name: "",
      companyName: "",
      tax_code: "",
      sdi_code: "",
      address: "",
      cap: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {/* General Info Section */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Referent Detail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) =>
                  handleInputChange("businessName", e.target.value)
                }
                placeholder="e.g., Farmacia Centrale Milano"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">
                Cognome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) =>
                  handleInputChange("contactPerson", e.target.value)
                }
                placeholder="Dr. Mario Rossi"
                required
              />
              {errors.contactPerson && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.contactPerson}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Personale <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="admin@pharmacy.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Numero di Telefono <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+39 02 1234567"
                required
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information Section */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Company Tax Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Ragione Sociale / Nome Legale{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
                placeholder="Mario"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vatNumber">
                Partita IVA <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vatNumber"
                value={formData.vatNumber}
                onChange={(e) => handleInputChange("vatNumber", e.target.value)}
                placeholder="IT12345678901"
                maxLength={11}
                required
              />
              {errors.vatNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.vatNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_code">
                Codice Fiscale (se diverso dalla P.IVA)
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tax_code"
                value={formData.tax_code}
                onChange={(e) => handleInputChange("tax_code", e.target.value)}
                placeholder="IT12345678901"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sdi_code">
                Codice SDI <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sdi_code"
                value={formData.sdi_code}
                onChange={(e) => handleInputChange("sdi_code", e.target.value)}
                placeholder="ABC1234"
                maxLength={7}
                required
              />
              {errors.sdiCode && (
                <p className="mt-1 text-sm text-red-600">{errors.sdiCode}</p>
              )}
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="billingEmail">
                Email PEC <span className="text-red-500 text-left">*</span>
              </Label>
              <Input
                id="billingEmail"
                type="email"
                value={formData.billingEmail}
                onChange={(e) =>
                  handleInputChange("billingEmail", e.target.value)
                }
                placeholder="pec@example.pec.it"
                required
              />
              {errors.pecEmail && (
                <p className="mt-1 text-sm text-red-600 ">{errors.pecEmail}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registered Office Address Section */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Registered Office Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="streetAddress">
                Indirizzo123 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                value={formData.streetAddress}
                onChange={(e) =>
                  handleInputChange("streetAddress", e.target.value)
                }
                placeholder="Via Roma 123"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="zipCode">
                CAP <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                placeholder="234561"
                required
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatNumber">
                Città <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="IT12345678901"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Provincia *</Label>

              <Select
                value={formData.province || ""}
                onValueChange={(value) => {
                  handleInputChange("province", value); // only store code in formData
                }}
              >
                <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent">
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>

                <SelectContent>
                  {italianProvinces.map((province) => (
                    <SelectItem key={province.code} value={province.code}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="country">
                Paese <span className="text-red-500">*</span>
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="ABC1234"
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Account Settings Section */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Additional Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language">Default Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => handleInputChange("language", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">Italian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customDomain">Custom Domain</Label>
              <Input
                id="customDomain"
                value={formData.customDomain}
                onChange={(e) =>
                  handleInputChange("customDomain", e.target.value)
                }
                placeholder="pharmacy.novafarm.it"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional notes about this account..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Access & Subscription Section */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Account Access & Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">
              Password (Optional - Auto-generated if empty)
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Leave empty for auto-generation"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 h-auto"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            {formData.password && (
              <PasswordStrength password={formData.password} className="mt-3" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="plan">Subscription Plan *</Label>
              <Select
                value={formData.plan || ""}
                onValueChange={(value) => {
                  console.log("value from select ", value);
                  const selectedPlan = plans.find((p) => p.plan_name === value);
                  setManualPlan(selectedPlan);

                  if (selectedPlan) {
                    setFormData((prev) => ({
                      ...prev,
                      plan: selectedPlan.plan_name,
                    }));

                    set_plan_id(selectedPlan.id);
                  }
                  console.log("Selected Plan id:: ", plan_id);
                  console.log("Selected Plan is:: ", manualPlan);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>

                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.plan_name}>
                      {plan.plan_name.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Billing Plan Type</Label>
              <Select
                value={formData.billing_type}
                onValueChange={(value) => {
                  handleInputChange("billing_type", value);
                  console.log("selected type from value: ", value);
                  setManualPlanType(value);
                  console.log("selected type from state: ", manualPlanType);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly </SelectItem>
                  <SelectItem value="yearly">Yearly </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountStatus">Account Status</Label>
              <div className="flex items-center space-x-3 pt-2">
                <Switch
                  id="accountStatus"
                  checked={formData.accountStatus}
                  onCheckedChange={(checked) =>
                    handleInputChange("accountStatus", checked)
                  }
                />
                <span
                  className={`text-sm font-medium ${
                    formData.accountStatus ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formData.accountStatus ? "Active" : "Suspended"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendOnboardingEmail"
              checked={formData.sendOnboardingEmail}
              onCheckedChange={(checked) =>
                handleInputChange("sendOnboardingEmail", checked)
              }
            />
            <Label htmlFor="sendOnboardingEmail" className="text-sm">
              Send Onboarding Email with login credentials
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          type="submit"
          className="bg-[#1C9B7A] hover:bg-[#158a69] flex-1 sm:flex-none"
        >
          <Save className="w-4 h-4 mr-2" />
          Create Account
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="flex-1 sm:flex-none"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
};
