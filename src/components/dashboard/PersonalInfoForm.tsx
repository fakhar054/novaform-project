import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PersonalInfoData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
}

interface PersonalInfoFormProps {
  data: PersonalInfoData;
  onSave: (data: PersonalInfoData) => void;
  isLoading: boolean;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  data,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState(data);
  const [email, setEmail] = useState();

  const [error, setError] = useState({ email: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Update form data
    setFormData({
      ...formData,
      [name]: value,
    });

    // Email validation
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        setError({ ...error, email: "Email is required" });
      } else if (!emailRegex.test(value)) {
        setError({ ...error, email: "Please enter a valid email address" });
      } else {
        setError({ ...error, email: "" });
      }
    }
  };

  useEffect(() => {
    setFormData(data);
  }, [data]);

  useEffect(() => {
    const fetchUser = async () => {
      let newEmail;
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
      } else if (user) {
        setEmail(user.email);
        newEmail = user?.email;
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const checkEmail = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user:", userError.message);
        return;
      }

      const user_id = user?.id;
      if (!user_id) return;

      // fetch the stored email
      const { data, error: dbError } = await supabase
        .from("users")
        .select("email")
        .eq("user_id", user_id)
        .single();

      if (dbError) {
        console.error("Error fetching user data:", dbError.message);
        return;
      }

      if (data?.email && data?.email !== email) {
        const today = new Date().toISOString().split("T")[0];

        console.log("Emails are not same, updating...");

        const { error: updateUserError } = await supabase
          .from("users")
          .update({
            email,
          })
          .eq("user_id", user_id);

        if (updateUserError) {
          console.error("Error updating users table:", updateUserError.message);
          return;
        }

        const { error: updateProfileError } = await supabase
          .from("profile_Update")
          .update({
            email_changed: true,
            email_date: today,
          })
          .eq("user_id", user_id);

        if (updateProfileError) {
          console.error(
            "Error updating profile_Update table:",
            updateProfileError.message
          );
        } else {
          console.log("Email updated successfully in both tables!");
        }
      } else {
        console.log("Emails are same, no update needed.");
      }
    };

    if (email) {
      checkEmail();
    }
  }, []);

  // const handleSave = async (e) => {
  //   e.preventDefault();
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   if (!formData.email) {
  //     setError({ ...error, email: "Email is required" });
  //     // Focus the input
  //     const emailInput = document.getElementsByName(
  //       "email"
  //     )[0] as HTMLInputElement;
  //     emailInput.focus();
  //     return;
  //   } else if (!emailRegex.test(formData.email)) {
  //     setError({ ...error, email: "Please enter a valid email address" });
  //     const emailInput = document.getElementsByName(
  //       "email"
  //     )[0] as HTMLInputElement;
  //     emailInput.focus();
  //     return;
  //   }

  //   if (email !== formData.email) {
  //     // Update email
  //     console.log("Emial ::", email);
  //     const { data, error } = await supabase.auth.updateUser({
  //       email: formData.email,
  //     });

  //     if (error) {
  //       console.log("Email update error:", error.message);
  //     } else {
  //       console.log("Confirmation link sent to new email.", data);
  //       toast.success("Please check your new email to confirm the change.");
  //     }
  //   }

  //   onSave(formData);
  // };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear old errors
    let newErrors: any = {};
    let firstInvalidField: HTMLInputElement | null = null;

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      if (!firstInvalidField) {
        firstInvalidField = document.getElementsByName(
          "firstName"
        )[0] as HTMLInputElement;
      }
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      if (!firstInvalidField) {
        firstInvalidField = document.getElementsByName(
          "lastName"
        )[0] as HTMLInputElement;
      }
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      if (!firstInvalidField) {
        firstInvalidField = document.getElementsByName(
          "email"
        )[0] as HTMLInputElement;
      }
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      if (!firstInvalidField) {
        firstInvalidField = document.getElementsByName(
          "email"
        )[0] as HTMLInputElement;
      }
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      if (!firstInvalidField) {
        firstInvalidField = document.getElementsByName(
          "phone"
        )[0] as HTMLInputElement;
      }
    }

    // If errors → stop and show
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      return;
    }

    // ✅ If no errors, proceed
    if (email !== formData.email) {
      const { data, error } = await supabase.auth.updateUser({
        email: formData.email,
      });

      if (error) {
        console.log("Email update error:", error.message);
      } else {
        console.log("Confirmation link sent to new email.", data);
        toast.success("Please check your new email to confirm the change.");
      }
    }

    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-bold text-black mb-6 text-left">
        Referent Details
      </h2>
      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
            />
            {error.firstName && (
              <p className="text-red-500 text-sm mt-1 text-left">
                {error.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Cognome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
            />
            {error.lastName && (
              <p className="text-red-500 text-sm mt-1 text-left">
                {error.lastName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Email Personale <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
            />
            {error.email && (
              <p className="text-red-500 text-sm mt-1 text-left">
                {error.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Numero di Telefono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
            />

            {error.phone && (
              <p className="text-red-500 text-sm mt-1 text-left">
                {error.phone}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-[#078147] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#066139] transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{isLoading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
