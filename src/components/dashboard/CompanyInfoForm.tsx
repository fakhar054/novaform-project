import React, { useEffect, useState } from "react";
import { Save, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompanyInfoData {
  pec_email: string;
  sdi_code: string;
  companyName: string;
  vatNumber: string;
}

interface CompanyInfoFormProps {
  data: CompanyInfoData;
  onSave: (data: CompanyInfoData) => void;
  isLoading: boolean;
}

export const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({
  data,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState(data);
  console.log("compnay from data from company component", data);
  useEffect(() => {
    setFormData(data);
  }, [data]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    const newErrors = { ...errors };

    if (name === "vatNumber" && value && !validateVAT(value)) {
      newErrors.vatNumber = "VAT number must be 11 digits";
    } else if (name === "vatNumber") {
      delete newErrors.vatNumber;
    }

    if (name === "pec_email" && value && !validatePEC(value)) {
      newErrors.pec_email = "Please enter a valid email address";
    } else if (name === "pec_email") {
      delete newErrors.pec_email;
    }

    if (name === "sdi_code" && value && !validateSDI(value)) {
      newErrors.sdi_code = "SDI code must be 7 alphanumeric characters";
    } else if (name === "sdi_code") {
      delete newErrors.sdi_code;
    }

    setErrors(newErrors);
  };

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value,
  //   });
  // };

  const handleSave = () => {
    // Validate required fields and at least one of SDI/PEC
    const newErrors: Record<string, string> = {};

    if (!formData.companyName)
      newErrors.companyName = "Company name is required";
    if (!formData.vatNumber) newErrors.vatNumber = "VAT number is required";
    if (formData.vatNumber && !validateVAT(formData.vatNumber)) {
      newErrors.vatNumber = "VAT number must be 11 digits";
    }

    if (!formData.sdi_code && !formData.pec_email) {
      newErrors.general =
        "Either SDI Code or PEC Email is required for electronic invoicing";
    }

    if (formData.pec_email && !validatePEC(formData.pec_email)) {
      newErrors.pec_email = "Please enter a valid email address";
    }

    if (formData.sdi_code && !validateSDI(formData.sdi_code)) {
      newErrors.sdi_code = "SDI code must be 7 alphanumeric characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave({
      ...formData,
      sdi_code: formData.sdi_code.toUpperCase(),
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-bold text-black mb-6 text-left">
        Company Tax Information
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
            Ragione Sociale / Nome Legale
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            placeholder="Company Name / Legal Entity Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600 text-left">
              {errors.companyName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Partita IVA <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vatNumber"
              value={formData.vatNumber}
              onChange={handleInputChange}
              placeholder="11 digits"
              maxLength={11}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
            />
            {errors.vatNumber && (
              <p className="mt-1 text-sm text-red-600 text-left">
                {errors.vatNumber}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Codice Fiscale (se diverso dalla P.IVA)
            </label>
            <input
              type="text"
              name="taxCode"
              value={formData.taxCode}
              onChange={handleInputChange}
              placeholder="Tax Code (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2 text-left">
              Codice SDI
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 ml-1 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    At least one of SDI Code or PEC email is required for
                    electronic invoicing in Italy.
                  </p>
                </TooltipContent>
              </Tooltip>
            </label>
            <input
              type="text"
              name="sdi_code"
              value={formData.sdi_code}
              onChange={handleInputChange}
              placeholder="7-character code"
              maxLength={7}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
            />
            {errors.sdi_code && (
              <p className="mt-1 text-sm text-red-600 text-left">
                {errors.sdi_code}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2 text-left">
              Email PEC
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 ml-1 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    At least one of SDI Code or PEC email is required for
                    electronic invoicing in Italy.
                  </p>
                </TooltipContent>
              </Tooltip>
            </label>
            <input
              type="email"
              name="pec_email"
              value={formData.pec_email}
              onChange={handleInputChange}
              placeholder="pec@example.pec.it"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
            />
            {errors.pec_email && (
              <p className="mt-1 text-sm text-red-600 text-left">
                {errors.pec_email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 mb-6 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
            VAT Number
          </label>
          <input
            type="text"
            name="vatNumber"
            value={formData.vatNumber}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
          />
        </div>
      </div> */}

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
    </div>
  );
};
