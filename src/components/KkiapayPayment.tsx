import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

// Clé publique live KKiaPay (définie dans .env → VITE_KKIAPAY_API_KEY)
const KKIAPAY_PUBLIC_KEY =
  import.meta.env.VITE_KKIAPAY_API_KEY || "f19f84bbf2bbe4249947974bc0929691d3afd5ae";

interface KkiapayProps {
  amount: number;          // Montant en FCFA
  reason?: string;         // Libellé de la transaction
  phone?: string;          // Numéro pré-rempli (optionnel)
  email?: string;          // Email pré-rempli (optionnel)
  theme?: string;          // Couleur du widget
  onSuccess: (transactionId: string) => void;
  onFailed?: () => void;
  label?: string;          // Texte du bouton
  className?: string;
  disabled?: boolean;
}

export default function KkiapayPayment({
  amount,
  reason = "Paiement Nexora",
  phone,
  email,
  theme = "#7c3aed",
  onSuccess,
  onFailed,
  label,
  className,
  disabled = false,
}: KkiapayProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const successHandler = (response: { transactionId: string }) => {
      if (!mountedRef.current) return;
      setLoading(false);
      onSuccess(response.transactionId);
      toast({
        title: "✅ Paiement réussi !",
        description: `Transaction : ${response.transactionId}`,
      });
    };

    const failedHandler = () => {
      if (!mountedRef.current) return;
      setLoading(false);
      onFailed?.();
      toast({
        title: "❌ Paiement échoué",
        description: "Le paiement a été annulé ou a échoué.",
        variant: "destructive",
      });
    };

    if (window.addKkiapayListener) {
      window.addKkiapayListener("success", successHandler);
      window.addKkiapayListener("failed", failedHandler);
    }

    return () => {
      mountedRef.current = false;
      if (window.removeKkiapayListener) {
        window.removeKkiapayListener("success");
        window.removeKkiapayListener("failed");
      }
    };
  }, [onSuccess, onFailed]);

  const handlePay = () => {
    if (disabled || loading) return;

    if (!window.openKkiapayWidget) {
      toast({
        title: "SDK non chargé",
        description: "Vérifiez votre connexion internet et rechargez la page.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    window.openKkiapayWidget({
      amount,
      key: KKIAPAY_PUBLIC_KEY,
      sandbox: false,           // ← COMPTE LIVE
      data: reason,
      theme,
      position: "center",
      ...(phone ? { phone: phone.replace(/\s/g, "") } : {}),
      ...(email ? { email } : {}),
    });
  };

  const btnLabel = label ?? `PAYER ${amount.toLocaleString("fr-FR")} FCFA`;

  return (
    <button
      onClick={handlePay}
      disabled={disabled || loading}
      className={
        className ??
        `w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-sm shadow-lg transition-all
         hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100`
      }
      style={
        !className
          ? {
              background: disabled
                ? undefined
                : `linear-gradient(135deg, ${theme}, #4f46e5)`,
            }
          : undefined
      }
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Ouverture du paiement…
        </>
      ) : (
        btnLabel
      )}
    </button>
  );
}
