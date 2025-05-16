import React, { useEffect, useState } from "react";

interface AffiliateEditFormProps {
  affiliateId: string;
  onClose: () => void;
}

const AffiliateEditForm: React.FC<AffiliateEditFormProps> = ({
  affiliateId,
  onClose,
}) => {
  const [affiliate, setAffiliate] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Simulate fetching affiliate data
  useEffect(() => {
    const fetchAffiliate = async () => {
      const data = await fetch(`/api/affiliates/${affiliateId}`).then((res) =>
        res.json()
      );
      setAffiliate(data);
    };

    fetchAffiliate();
  }, [affiliateId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAffiliate({ ...affiliate, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    await fetch(`/api/affiliates/${affiliateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(affiliate),
    });

    setIsSaving(false);
    onClose(); // Go back to the table
  };

  if (!affiliate) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: "auto" }}>
      <h2>Edit Affiliate</h2>

      <label>
        Company Name:
        <input
          name="companyName"
          value={affiliate.companyName || ""}
          onChange={handleChange}
          required
        />
      </label>
      <br />

      <label>
        Contact Name:
        <input
          name="contactName"
          value={affiliate.contactName || ""}
          onChange={handleChange}
          required
        />
      </label>
      <br />

      <button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
      <button type="button" onClick={onClose} style={{ marginLeft: 10 }}>
        Cancel
      </button>
    </form>
  );
};

export default AffiliateEditForm;
