"use client";

import { useState } from "react";
 
import { useQuery, useMutation } from "@apollo/client/react";
import { CUSTOMER_QUERY } from "@/lib/graphql/queries/customer";
import {
  UPDATE_CUSTOMER,
  CHANGE_CUSTOMER_PASSWORD,
} from "@/lib/graphql/mutations/customer";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <ProfileInfoCard />
      <ChangePasswordCard />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile Info
// ---------------------------------------------------------------------------

function ProfileInfoCard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error, refetch } = useQuery<any>(CUSTOMER_QUERY);
  const [editing, setEditing] = useState(false);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [updateCustomer, { loading: saving }] = useMutation<any>(UPDATE_CUSTOMER);

  function startEditing() {
    if (!data?.customer) return;
    setFirstname(data.customer.firstname);
    setLastname(data.customer.lastname);
    setEditing(true);
    setSuccessMsg(null);
    setErrorMsg(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await updateCustomer({
        variables: { firstname, lastname },
      });
      await refetch();
      setEditing(false);
      setSuccessMsg("Profile updated successfully.");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to update profile.",
      );
    }
  }

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
          <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
          <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
            Account Information
          </h2>
        </div>
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-4 w-48 rounded bg-gray-200" />
          <div className="h-4 w-64 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Error loading account information. Please try again.
      </div>
    );
  }

  const customer = data?.customer;
  if (!customer) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-gray-900 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
          <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
            Account Information
          </h2>
        </div>
        {!editing && (
          <button
            onClick={startEditing}
            className="text-xs font-medium text-gray-400 transition hover:text-white"
          >
            Edit
          </button>
        )}
      </div>

      <div className="p-6">
        {successMsg && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-900">
              <span className="font-medium">Name:</span>{" "}
              {customer.firstname} {customer.lastname}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Email:</span> {customer.email}
            </p>
            <p className="mt-3 text-xs text-gray-400">
              Member since{" "}
              {new Date(customer.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Change Password
// ---------------------------------------------------------------------------

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [changePassword, { loading }] = useMutation<any>(
    CHANGE_CUSTOMER_PASSWORD,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    try {
      await changePassword({
        variables: {
          currentPassword,
          newPassword,
        },
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg("Password changed successfully.");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to change password.",
      );
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
        <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
        <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
          Change Password
        </h2>
      </div>

      <div className="p-6">
        {successMsg && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter current password"
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Confirm new password"
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
