import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Check } from "lucide-react";
import Header from "@/components/Header";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BookDemoFormData {
  firstName: string;
  lastName: string;
  email: string;
  vatNumber: string;
  usagePlan: string;
  problemToSolve: string;
}

const BookDemo = () => {
  const form = useForm<BookDemoFormData>();
  const [plateFormName, setPlateForm] = useState("NovaForm");

  const [formData, SetFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    vatNumber: "",
    plan: "",
    problemSolve: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    SetFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const emailwithTemplate = async () => {
    console.log(
      "email with template called and information of formData is : ",
      formData
    );
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;
    const currentDate = getCurrentDate();
    const route =
      "https://ajbxscredobhqfksaqrk.supabase.co/storage/v1/object/public/emailTemplate/client_email.html";

    const res = await fetch(
      "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/email-with-template",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          to: "fakharali054@gmail.com",
          subject: "User asking for Booking Demo",
          route,
          templateName: "emailFile",
          data: {
            title: "Welcome!",
            heading: "User asking for Booking Demo",
            date: currentDate,
            // message: emailData.message,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            vatNumber: formData.vatNumber,
            plan: formData.plan,
            problem: formData.problemSolve,
            platform_name: plateFormName,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    emailwithTemplate();
    console.log("i am clicked: ", formData);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-20 sm:pt-24 md:pt-32 pb-8 sm:pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left 50% - Contact Form */}
            <div className="w-full order-2 lg:order-1 text-left">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8 shadow-sm">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4 leading-tight">
                  Book Your Free{" "}
                  <span className="text-[#078147]">NovaFarm Demo</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  Discover how NovaFarm can transform your pharmacy operations
                  in just 30 minutes.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* First Name */}
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Mario"
                    className="border p-2 w-full h-10 sm:h-12 rounded-md"
                  />

                  {/* Last Name */}
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Rossi"
                    className="border p-2 w-full h-10 sm:h-12 rounded-md"
                  />

                  {/* Email */}
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="mario.rossi@farmacia.it"
                    className="border p-2 w-full h-10 sm:h-12 rounded-md"
                  />

                  {/* VAT Number */}
                  <input
                    type="text"
                    name="vatNumber"
                    value={formData.vatNumber}
                    onChange={handleChange}
                    placeholder="IT12345678901"
                    className="border p-2 w-full h-10 sm:h-12 rounded-md"
                  />

                  {/* Plan Dropdown */}
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    className="border p-2 w-full h-10 sm:h-12 rounded-md"
                  >
                    <option value="">Select a plan</option>
                    <option value="appointment-booking">
                      For appointment booking only
                    </option>
                    <option value="marketing-reviews">
                      For marketing and reviews
                    </option>
                    <option value="centralize-operations">
                      To centralize all pharmacy operations
                    </option>
                    <option value="not-sure">Not sure yet</option>
                  </select>

                  {/* Problem Dropdown */}
                  <select
                    name="problemSolve"
                    value={formData.problemSolve}
                    onChange={handleChange}
                    className="border p-2 w-full h-10 sm:h-12 rounded-md"
                  >
                    <option value="">Select a problem</option>
                    <option value="reduce-phone-calls">
                      Reduce phone calls for appointments
                    </option>
                    <option value="more-reviews">
                      Get more customer reviews
                    </option>
                    <option value="automate-followups">
                      Automate follow-ups and reminders
                    </option>
                    <option value="team-communication">
                      Simplify team communication
                    </option>
                    <option value="other">Other</option>
                  </select>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full bg-[#078147] hover:bg-[#066139] text-white py-3 sm:py-4 text-base sm:text-lg font-semibold h-12 sm:h-14  rounded-md"
                  >
                    Book My Free Demo
                  </button>
                </form>

                {/* Reassuring Note */}
                <p className="text-xs sm:text-sm text-gray-500 text-center mt-3 sm:mt-4 px-2">
                  We'll get back to you within 24 hours to schedule your
                  personalized demo. No obligation – just clarity.
                </p>
              </div>
            </div>

            {/* Right 50% - Textual Content */}
            <div className="w-full order-1 lg:order-2 text-left">
              <div className="bg-white p-4 sm:p-6 lg:p-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4 sm:mb-6 leading-tight text-left">
                  Why book a demo with NovaFarm?
                </h2>

                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  See firsthand how NovaFarm can streamline your pharmacy
                  operations, boost customer engagement, and save you hours
                  every week. Our personalized demo will show you exactly how
                  our platform fits your specific needs.
                </p>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-[#078147] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-800 font-medium leading-relaxed">
                      Save hours with smart automations
                    </span>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-[#078147] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-800 font-medium leading-relaxed">
                      Boost appointment requests and client engagement
                    </span>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-[#078147] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-800 font-medium leading-relaxed">
                      Eliminate no-shows with automatic reminders
                    </span>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-[#078147] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-800 font-medium leading-relaxed">
                      Centralize messaging across SMS, email, and social
                    </span>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-[#078147] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-800 font-medium leading-relaxed">
                      Monitor everything from one intuitive dashboard
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDemo;
