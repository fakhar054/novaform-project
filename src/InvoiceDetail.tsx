import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./integrations/supabase/client";
import Spinner from "./components/Spinner";

export default function InvoiceDetail() {
  const { invoice_Id } = useParams();
  const [formattedDate, setFormattedDate] = useState("");
  const [total, setTotal] = useState(null);
  const [final_tax, setFinal_tax] = useState();
  const [loading, setLoading] = useState(true);

  // const { invoiceId } = useParams<{ invoiceId: string }>();
  const [invoicesData, setInvoicesData] = useState([]);

  useEffect(() => {
    const fetchInvoice = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("Not logged in");
        return;
      }

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoice_Id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.log("Error fetching invoice:", error);
      } else {
        setInvoicesData(data);
        const price = data?.amount_total;
        const newTax = data?.tax_percentage / 100; //0.22
        const total_tax = price * newTax;
        setFinal_tax(total_tax);
        const total = price + total_tax;
        setTotal(total);

        console.log(data);
        const formatted = new Date(data.created_at).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }
        );
        setFormattedDate(formatted);
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoice_Id]);

  const formatCurrencyItalian = (amount) => {
    const formatted = new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

    return formatted.replace("€", "").trim().replace(/^/, "€ ");
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="bg-[#F6F8FA] w-[100%] h-[100%] p-6">
      <div className="w-[70%] mx-auto rounded bg-white py-6 px-5 text-left my-6">
        <h1 className="text-2xl font-bold text-[#0369a1]">NovaFarm</h1>
        <div className="flex_div flex justify-between">
          <div className="left-div">
            <h3 className="text-xl font-bold my-3">Fornitore</h3>
            <div className="supplier-info my-3">
              <h5 className="text-lg font-semibold">NovaFarm S.r.l</h5>
              <p>Via delle Scienze 42, 10100 Turin (TO)</p>
              <div className="vatnum">
                VAT number: <span>11223344556</span>
              </div>
              <div className="sdi">
                SDI:<span>ABC1234</span>
              </div>
              <div className="pec">
                PEC: <span>novafarm@pec.it</span>
              </div>
            </div>
          </div>
          <div className="right-div">
            <div className="flex items-center">
              <p className="font-semibold">Fattura N.:</p>
              <p className="">{invoicesData?.invoice_no}</p>
            </div>
            <div className="flex items-center">
              <p className="font-semibold">Data:</p>
              <p className=""> {formattedDate}</p>
            </div>
            <h1 className="text-2xl my-4 font-bold">Cliente</h1>
            <div className="compnay-legel-info">
              <h2 className="font-semibold">{invoicesData.customer_name}</h2>
              <p className="address">{invoicesData.address}</p>
              <div className="vat-div">
                VAT number:<span>{invoicesData.vat}</span>
              </div>
              <div className="sdi">
                SDI number:<span>{invoicesData.sdi}</span>
              </div>
              <div className="pec">
                PEC:<span>{invoicesData.personal_email}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="table-start mt-8">
          <h1 className="text-2xl font-semibold mb-1">Descrizione Servizi </h1>

          <table className="w-full border border-collapse table-fixed">
            <thead>
              <tr className="bg-[#DEF6E7]">
                <th
                  className="border px-2 py-3 text-left"
                  style={{ width: "33.33%" }}
                >
                  {/* Product / Service */}
                  Prodotto / Servizio
                </th>
                <th
                  className="border px-2 py-3 text-left"
                  style={{ width: "16.66%" }}
                >
                  {/* Amount */}
                  Quantità
                </th>
                <th
                  className="border px-2 py-3 text-left"
                  style={{ width: "16.66%" }}
                >
                  {/* Unit price */}
                  Prezzo Unitario
                </th>
                <th
                  className="border px-2 py-3 text-left"
                  style={{ width: "16.66%" }}
                >
                  {/* VAT */}
                  IVA
                </th>
                <th
                  className="border px-2 py-3 text-left"
                  style={{ width: "16.66%" }}
                >
                  {/* Total */}
                  Totale
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-3">{invoicesData?.plan_name}</td>
                <td className="border px-2 py-3">{invoicesData?.quantity}</td>
                <td className="border px-2 py-3">
                  {formatCurrencyItalian(invoicesData?.amount_total)}
                </td>
                <td className="border px-2 py-3">
                  {invoicesData?.tax_percentage}%
                </td>
                <td className="border px-2 py-3">
                  {formatCurrencyItalian(total)}
                </td>
              </tr>
            </tbody>
          </table>

          <h1 className="text-2xl font-semibold mb-1 mt-4">Riepilogo</h1>
          <table className="w-full border border-collapse ">
            <thead>
              <tr>
                <td className="border py-3 px-2">Imponibile </td>
                <td className="border py-3 px-3 text-right">
                  {formatCurrencyItalian(invoicesData.amount_total)}
                </td>
              </tr>
              <tr>
                <td className="border py-3 px-2">
                  {invoicesData.tax_percentage}%
                </td>
                <td className="border py-3 px-3 text-right">
                  {formatCurrencyItalian(final_tax)}
                </td>
              </tr>
              <tr>
                <td className="border py-3 px-2 font-semibold">
                  {/* Invoice Total */}
                  Totale Fattura
                </td>
                <td className="border py-3 px-3 text-right font-semibold">
                  {formatCurrencyItalian(total)}
                </td>
              </tr>
            </thead>
          </table>
          <div className="bottom-div my-5">
            <h1 className="my-2">
              <span className="font-semibold">Pagamento: </span>
              <span>
                Bonifico bancario – IBAN: IT99A0123412341234123412345 – Intesa
                Sanpaolo
              </span>
            </h1>

            <h1 className="my-2">
              <span className="font-semibold">Termini di pagamento:: </span>
              <span>
                Pagamento anticipato. Il servizio viene attivato solo a saldo
                ricevuto.
              </span>
            </h1>
            <h1 className="my-2">
              <span className="font-semibold">
                In caso di ritardo nel pagamento:
              </span>
              <span>
                saranno applicati gli interessi legali ai sensi del D.lgs.
                231/2002.
              </span>
            </h1>
            <h1 className="my-2">
              <span className="font-semibold">Nota: </span>
              <span>
                La presente è una copia della fattura elettronica inviata
                tramite Sistema di Interscambio (SDI). Il documento originale è
                consultabile accedendo con SPID al portale dell’Agenzia delle
                Entrate.
              </span>
            </h1>
            <h1 className="my-2">
              <span className="font-semibold">Stato della fattura: </span>
              <span>Saldata</span>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
