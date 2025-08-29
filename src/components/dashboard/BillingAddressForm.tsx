// import React, { useEffect, useState } from "react";
// import { Save } from "lucide-react";

// interface BillingAddressData {
//   streetAddress: string;
//   city: string;
//   province: string;
//   zipCode: string;
//   country: string;
// }

// interface BillingAddressFormProps {
//   data: BillingAddressData;
//   onSave: (data: BillingAddressData) => void;
//   isLoading: boolean;
// }

// export const BillingAddressForm: React.FC<BillingAddressFormProps> = ({
//   data,
//   onSave,
//   isLoading,
// }) => {
//   const [formData, setFormData] = useState(data);
//   const [errors, setErrors] = useState({});

//   console.log("g", data);

//   useEffect(() => {
//     setFormData(data);
//   }, [data]);

//   console.log("Province coming in billing", data);

//   const italianCities = [
//     "Roma",
//     "Milano",
//     "Napoli",
//     "Torino",
//     "Palermo",
//     "Genova",
//     "Bologna",
//     "Firenze",
//     "Bari",
//     "Catania",
//     "Venezia",
//     "Verona",
//     "Messina",
//     "Padova",
//     "Trieste",
//     "Brescia",
//     "Prato",
//     "Taranto",
//     "Modena",
//     "Reggio Calabria",
//     "Reggio Emilia",
//     "Perugia",
//     "Livorno",
//     "Ravenna",
//     "Cagliari",
//     "Foggia",
//     "Rimini",
//     "Salerno",
//     "Ferrara",
//     "Sassari",
//   ];

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

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSave = () => {
//     onSave(formData);
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border p-6">
//       <h2 className="text-xl font-bold text-black mb-6 text-left">
//         Registered Office Address
//       </h2>

//       <div className="space-y-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
//             Indirizzo <span className="text-red-500"> *</span>
//           </label>
//           <input
//             type="text"
//             name="streetAddress"
//             value={formData.streetAddress}
//             onChange={handleInputChange}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
//               CAP <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="zipCode"
//               value={formData.zipCode}
//               onChange={handleInputChange}
//               pattern="[0-9]{5}"
//               maxLength={5}
//               placeholder="ZIP Code"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
//               Città <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="city"
//               value={formData.city}
//               onChange={handleInputChange}
//               placeholder="City"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
//               Provincia <span className="text-red-500">*</span>
//             </label>
//             <select
//               name="province"
//               value={formData.province}
//               onChange={handleInputChange}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
//             >
//               <option value="">Select Province</option>
//               {italianProvinces.map((province) => (
//                 <option key={province.code} value={province.code}>
//                   {province.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Country
//             </label>
//             <select
//               name="country"
//               value={formData.country}
//               onChange={handleInputChange}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent"
//             >
//               <option value="Italy">Italy</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       <div className="mt-6 flex justify-end">
//         <button
//           onClick={handleSave}
//           disabled={isLoading}
//           className="flex items-center space-x-2 bg-[#078147] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#066139] transition-colors disabled:opacity-50"
//         >
//           <Save className="w-5 h-5" />
//           <span>{isLoading ? "Saving..." : "Save Changes"}</span>
//         </button>
//       </div>
//     </div>
//   );
// };

import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";

interface BillingAddressData {
  streetAddress: string;
  city: string;
  province: string;
  zipCode: string;
  country: string;
}

interface BillingAddressFormProps {
  data: BillingAddressData;
  onSave: (data: BillingAddressData) => void;
  isLoading: boolean;
}

export const BillingAddressForm: React.FC<BillingAddressFormProps> = ({
  data,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // useEffect(() => {
  //   if (data) {
  //     setFormData((prev) => ({ ...prev, ...data }));
  //   }
  // }, [data]);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    setErrors({ ...errors, [name]: "" });
  };

  useEffect(() => {
    console.log("Updated formData:", formData);
  }, [formData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Please fill the street address";
    }

    if (!formData.zipCode) {
      newErrors.zipCode = "Please fill the ZIP code";
    } else if (!/^\d{5}$/.test(formData.zipCode)) {
      newErrors.zipCode = "ZIP code must be 5 digits";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Please fill the city";
    }

    if (!formData.province) {
      newErrors.province = "Please select a province";
    }

    if (!formData.country) {
      newErrors.country = "Please select a country";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();

    console.log("Province: ", formData.province);
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-bold text-black mb-6 text-left">
        Registered Office Address
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
            Indirizzo <span className="text-red-500"> *</span>
          </label>
          <input
            type="text"
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent ${
              errors.streetAddress ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.streetAddress && (
            <p className="text-red-500 text-sm mt-1 text-left">
              {errors.streetAddress}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              CAP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              maxLength={5}
              placeholder="ZIP Code"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent ${
                errors.zipCode ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.zipCode && (
              <p className="text-red-500 text-sm mt-1 text-left">
                {errors.zipCode}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Città <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent ${
                errors.city ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1 text-left">
                {errors.city}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Provincia <span className="text-red-500">*</span>
            </label>
            <select
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent ${
                errors.province ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Province</option>
              {italianProvinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="text-red-500 text-sm mt-1 text-left">
                {errors.province}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#078147] focus:border-transparent ${
                errors.country ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="Italy">Italy</option>
            </select>
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country}</p>
            )}
          </div>
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
    </div>
  );
};
