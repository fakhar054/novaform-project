import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  List,
  Upload,
  X,
  FileText,
  Image,
  Loader2,
  Mail,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Spinner from "../Spinner";
import { log } from "console";

interface SendEmailModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [emailData, setEmailData] = useState({
    to: user.email,
    subject: "",
    message: "",
    template: "",
  });

  console.log("User information: ", user);

  const [selected_template, set_selected_template] = useState();
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [dispalaySpinner, setDisplaySpinner] = useState(true);
  const [plateFormName, setPlateForm] = useState();
  const [supportEmail, setSupportEmail] = useState();
  const [route, setRoute] = useState("");
  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amountPaid, setAmountPaid] = useState();
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState();
  // Fetch email templates from Supabase
  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from("email_template_table")
        .select("*");
      if (error) {
        console.error("Failed to fetch templates:", error.message);
      } else {
        setEmailTemplates(data);
      }
    };
    fetchSettings();
    getInvoicesByUser(user?.user_id);
    fetchSubscription(user?.user_id);

    console.log("User Email is: ", user);

    if (isOpen) fetchTemplates();
  }, [isOpen]);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .single();
    if (error) {
      console.error("Error fetching settings:", error);
    } else {
      // console.log("Data coming from Settings: ", data);
      setPlateForm(data?.platform_name);
      setSupportEmail(data?.reply_to_email);
    }
  };

  console.log("plan name of user", planName);

  const getInvoicesByUser = async (userId) => {
    console.log("get invoice is running");
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching invoices:", error.message);
      return [];
    } else {
      console.log("Data in invoice: ", data);
      const isoDate = data?.created_at;
      const formattedDate = new Date(isoDate).toISOString().split("T")[0];
      setPaymentDate(formattedDate);
      setInvoiceNo(data?.invoice_no);
      setInvoiceAmount(data?.amount_total);

      const dateString2 = data?.created_at;
      const formatted2 = dateString2.split("T")[0];
      setInvoiceDate(formatted2);

      const dateString = data?.due_Date;
      const [year, month, day] = dateString.split("T")[0].split("-");
      const formatted = `${year}-${day}-${month}`;
      setEndDate(formatted);
      console.log(formatted);
      return data;
    }
  };

  const fetchSubscription = async (userId) => {
    if (paymentDate === null) {
      console.log("i am waiting for date");
      return;
    }
    console.log("date comign from invoice in subscription: ", paymentDate);
    setLoading(true);
    const { data, error } = await supabase
      .from("subscription")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching subscription:", error);
    } else {
      setPlanName(data?.plan_name || "no plan name");
      setAmountPaid(data?.amount_paid);
    }
    setLoading(false);
  };

  // console.log("data coming from email template", emailTemplates);

  const handleTemplateChange = (selectedTemplateName) => {
    const selectedTemplate = emailTemplates.find(
      (template) => template.template_name === selectedTemplateName
    );

    console.log("Selected Template is : ", selectedTemplate);
    setRoute(selectedTemplate?.route);

    if (selectedTemplate) {
      setEmailData((prev) => ({
        ...prev,
        template: selectedTemplateName,
        subject: selectedTemplate.subject_Line || "",
        message: selectedTemplate.description || "",
      }));
    }
  };

  const formatText = (
    command: "bold" | "italic" | "underline" | "insertUnorderedList"
  ) => {
    document.execCommand(command, false);
  };

  const currentYear = new Date().getFullYear();

  const emailwithTemplate = async () => {
    console.log("Data coming in email: ", emailData);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;
    setIsSending(true);
    const fullRoute = `"${route}"`;

    const res = await fetch(
      "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/email-with-template",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          to: user.email,
          // to: "fakharali054@gmail.com",
          subject: emailData.subject,
          route,
          templateName: "emailFile",
          data: {
            title: "Welcome!",
            heading: emailData.subject,
            payment_amount: amountPaid,
            payment_date: paymentDate,
            invoice_number: invoiceNo,
            invoice_amount: invoiceAmount,
            invoice_date: invoiceDate,
            subscription_end_date: endDate,
            plan_name: planName,
            year: currentYear,
            message: emailData.message,
            user_email: user.email,
            userName: user.businessName,
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
      setIsSending(false);
      onClose();
    } else {
      console.log("Function success:", text);
      toast.success("Email send successfully");
      setIsSending(false);
      onClose();
    }
  };

  // console.log("selected Route: ", route);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mail className="w-5 h-5 text-[#1C9B7A]" />
            Send Email to {user.businessName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Dropdown */}
          <div>
            <Label>Email Template</Label>

            <Select
              value={emailData.template}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.template_name}>
                    {template.template_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Subject</Label>
            <Input
              value={emailData.subject}
              onChange={(e) =>
                setEmailData((prev) => ({
                  ...prev,
                  subject: e.target.value,
                }))
              }
            />
          </div>

          {/* Message */}
          <div>
            <Label>Message</Label>
            <Card className="mt-2 p-2 bg-gray-50 border">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => formatText("bold")}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => formatText("italic")}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => formatText("underline")}
              >
                <Underline className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => formatText("insertUnorderedList")}
              >
                <List className="w-4 h-4" />
              </Button>
            </Card>

            {/* <Textarea
              ref={textareaRef}
              rows={10}
              value={emailData.message}
              onChange={(e) =>
                setEmailData((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
            /> */}
            {/* Rich editor area */}

            <div
              ref={textareaRef as any}
              contentEditable
              className="min-h-[200px] border rounded p-3 bg-white focus:outline-none"
              onInput={(e) =>
                setEmailData((prev) => ({
                  ...prev,
                  message: (e.target as HTMLDivElement).innerHTML,
                }))
              }
              dangerouslySetInnerHTML={{ __html: emailData.message }}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            // onClick={handleSend}
            onClick={emailwithTemplate}
            disabled={!emailData.subject || !emailData.message || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
