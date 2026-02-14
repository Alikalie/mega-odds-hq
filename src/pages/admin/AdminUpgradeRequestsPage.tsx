import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Check, X, Eye, ArrowUpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UpgradeRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  user_phone: string | null;
  user_country: string | null;
  current_tier: string;
  requested_tier: string;
  requested_package_name: string | null;
  status: string;
  payment_proof_url: string | null;
  admin_notes: string | null;
  created_at: string;
}

const AdminUpgradeRequestsPage = () => {
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofDialogOpen, setProofDialogOpen] = useState(false);

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("upgrade-requests-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "upgrade_requests" }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("upgrade_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setRequests(data as UpgradeRequest[]);
    setIsLoading(false);
  };

  const handleAction = async (id: string, action: "approved" | "rejected", userId: string, tier: string) => {
    const { error } = await supabase
      .from("upgrade_requests")
      .update({ status: action })
      .eq("id", id);

    if (error) { toast.error("Failed to update request"); return; }

    if (action === "approved") {
      // Update user's subscription tier
      await supabase.from("profiles").update({ subscription: tier as any }).eq("id", userId);
      
      // Notify user
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Upgrade Approved! 🎉",
        message: `Your upgrade to ${tier.toUpperCase()} has been approved. Enjoy your new benefits!`,
      });
    } else {
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Upgrade Request Update",
        message: `Your upgrade request to ${tier.toUpperCase()} was not approved. Please contact support for more info.`,
      });
    }

    toast.success(`Request ${action}`);
    fetchRequests();
  };

  const viewProof = async (url: string) => {
    // Generate signed URL for private bucket
    const path = url.replace(/.*payment-proofs\//, "");
    const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 300);
    if (data?.signedUrl) {
      setProofUrl(data.signedUrl);
      setProofDialogOpen(true);
    } else {
      toast.error("Could not load payment proof");
    }
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500",
      approved: "bg-green-500/10 text-green-500",
      rejected: "bg-red-500/10 text-red-500",
    };
    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  return (
    <AdminGuard>
      <AdminLayout title="Upgrade Requests">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ArrowUpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No upgrade requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{req.user_name || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{req.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{req.user_phone || "N/A"}</TableCell>
                    <TableCell className="text-sm">{req.user_country || "N/A"}</TableCell>
                    <TableCell><Badge variant="outline">{req.current_tier}</Badge></TableCell>
                    <TableCell><Badge variant="default">{req.requested_tier}</Badge></TableCell>
                    <TableCell className="text-sm">{req.requested_package_name || "N/A"}</TableCell>
                    <TableCell>
                      {req.payment_proof_url ? (
                        <Button variant="ghost" size="sm" onClick={() => viewProof(req.payment_proof_url!)}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>{statusBadge(req.status)}</TableCell>
                    <TableCell className="text-xs">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {req.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="default" onClick={() => handleAction(req.id, "approved", req.user_id, req.requested_tier)}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleAction(req.id, "rejected", req.user_id, req.requested_tier)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Payment Proof</DialogTitle>
            </DialogHeader>
            {proofUrl && <img src={proofUrl} alt="Payment proof" className="w-full rounded-lg" />}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminUpgradeRequestsPage;
