"use client";

import React, { useState } from "react";

interface GatewaysTabProps {
  organization: any;
  token?: string;
  onUpdateOrg?: () => void;
}

export const GatewaysTab: React.FC<GatewaysTabProps> = ({
  organization,
  token,
  onUpdateOrg,
}) => {
  const [stripeAccountId, setStripeAccountId] = useState(
    organization?.stripeAccountId || ""
  );
  const [razorpayKeyId, setRazorpayKeyId] = useState(
    organization?.razorpayKeyId || ""
  );
  const [razorpayKeySecret, setRazorpayKeySecret] = useState(
    organization?.razorpayKeySecret || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/organization/gateways", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          stripeAccountId,
          razorpayKeyId,
          razorpayKeySecret,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        if (onUpdateOrg) onUpdateOrg();
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save gateway settings", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div>
        <h2 className="text-2xl font-bold text-[#1E293B] tracking-tight">
          Payment Gateways (Direct Transfers)
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Connect your Stripe or Razorpay accounts. All ticket revenue is transferred directly into your own bank account with 0% EventsPlug escrow.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* US / Global: Stripe Connect */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg">
                S
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Stripe Connect (United States & Global)
                </h3>
                <p className="text-xs text-slate-500">
                  Accept Credit/Debit Cards, Apple Pay, and Google Pay in USD, EUR, GBP.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              Direct Charges
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Stripe Account ID (acct_...)
            </label>
            <input
              type="text"
              placeholder="acct_1N9x..."
              value={stripeAccountId}
              onChange={(e) => setStripeAccountId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
            />
            <p className="text-[11px] text-slate-400">
              Found in your Stripe Dashboard under Settings → Account Details.
            </p>
          </div>
        </div>

        {/* India: Razorpay Credentials */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg">
                R
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Razorpay Direct (India UPI & Netbanking)
                </h3>
                <p className="text-xs text-slate-500">
                  Accept Google Pay, PhonePe, Paytm, BHIM, Netbanking, and Indian Cards in INR (₹).
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              India Gateway
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Razorpay Key ID
              </label>
              <input
                type="text"
                placeholder="rzp_live_..."
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Razorpay Key Secret
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={razorpayKeySecret}
                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              ✓ Gateway settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="ml-auto text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Save Gateway Credentials"
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
