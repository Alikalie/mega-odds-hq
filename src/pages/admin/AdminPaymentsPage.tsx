import { useState, useEffect } from "react";
import { CreditCard, Plus, Edit, Trash2, Phone, MessageCircle, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Loader2 } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  account_number: string;
  account_name: string | null;
  icon: string;
  country_code: string;
  is_active: boolean;
  display_order: number;
}

interface SupportContact {
  id: string;
  type: string;
  value: string;
  label: string | null;
  is_active: boolean;
  display_order: number;
}

const iconOptions = [
  { value: "CreditCard", label: "Credit Card" },
  { value: "Smartphone", label: "Mobile Money" },
  { value: "Wallet", label: "Wallet" },
  { value: "Phone", label: "Phone" },
];

const contactTypes = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "telegram", label: "Telegram" },
  { value: "phone", label: "Phone" },
];

const AdminPaymentsPage = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [supportContacts, setSupportContacts] = useState<SupportContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [contactDialog, setContactDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [editingContact, setEditingContact] = useState<SupportContact | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    name: "",
    account_number: "",
    account_name: "",
    icon: "CreditCard",
    country_code: "SL",
    is_active: true,
    display_order: 0,
  });
  const [contactForm, setContactForm] = useState({
    type: "whatsapp",
    value: "",
    label: "",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [{ data: methods }, { data: contacts }] = await Promise.all([
        supabase.from("payment_methods").select("*").order("display_order"),
        supabase.from("support_contacts").select("*").order("display_order"),
      ]);
      setPaymentMethods(methods || []);
      setSupportContacts(contacts || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePayment = async () => {
    if (!paymentForm.name.trim() || !paymentForm.account_number.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editingPayment) {
        const { error } = await supabase
          .from("payment_methods")
          .update(paymentForm)
          .eq("id", editingPayment.id);
        if (error) throw error;
        toast.success("Payment method updated");
      } else {
        const { error } = await supabase.from("payment_methods").insert(paymentForm);
        if (error) throw error;
        toast.success("Payment method added");
      }
      setPaymentDialog(false);
      resetPaymentForm();
      fetchData();
    } catch (err) {
      console.error("Error saving payment method:", err);
      toast.error("Failed to save payment method");
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      const { error } = await supabase.from("payment_methods").delete().eq("id", id);
      if (error) throw error;
      toast.success("Payment method deleted");
      fetchData();
    } catch (err) {
      console.error("Error deleting payment method:", err);
      toast.error("Failed to delete payment method");
    }
  };

  const handleSaveContact = async () => {
    if (!contactForm.value.trim()) {
      toast.error("Please fill in contact value");
      return;
    }

    try {
      if (editingContact) {
        const { error } = await supabase
          .from("support_contacts")
          .update(contactForm)
          .eq("id", editingContact.id);
        if (error) throw error;
        toast.success("Support contact updated");
      } else {
        const { error } = await supabase.from("support_contacts").insert(contactForm);
        if (error) throw error;
        toast.success("Support contact added");
      }
      setContactDialog(false);
      resetContactForm();
      fetchData();
    } catch (err) {
      console.error("Error saving support contact:", err);
      toast.error("Failed to save support contact");
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabase.from("support_contacts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Support contact deleted");
      fetchData();
    } catch (err) {
      console.error("Error deleting support contact:", err);
      toast.error("Failed to delete support contact");
    }
  };

  const resetPaymentForm = () => {
    setEditingPayment(null);
    setPaymentForm({
      name: "",
      account_number: "",
      account_name: "",
      icon: "CreditCard",
      country_code: "SL",
      is_active: true,
      display_order: 0,
    });
  };

  const resetContactForm = () => {
    setEditingContact(null);
    setContactForm({
      type: "whatsapp",
      value: "",
      label: "",
      is_active: true,
      display_order: 0,
    });
  };

  const openEditPayment = (method: PaymentMethod) => {
    setEditingPayment(method);
    setPaymentForm({
      name: method.name,
      account_number: method.account_number,
      account_name: method.account_name || "",
      icon: method.icon,
      country_code: method.country_code,
      is_active: method.is_active,
      display_order: method.display_order,
    });
    setPaymentDialog(true);
  };

  const openEditContact = (contact: SupportContact) => {
    setEditingContact(contact);
    setContactForm({
      type: contact.type,
      value: contact.value,
      label: contact.label || "",
      is_active: contact.is_active,
      display_order: contact.display_order,
    });
    setContactDialog(true);
  };

  return (
    <AdminGuard>
      <AdminLayout title="Payment Settings">
        <div className="space-y-8">
          {/* Payment Methods Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Methods
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage payment options for Sierra Leone users
                </p>
              </div>
              <Button onClick={() => { resetPaymentForm(); setPaymentDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Method
              </Button>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Account Number</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell>{method.account_number}</TableCell>
                        <TableCell>{method.account_name || "-"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            method.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            {method.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditPayment(method)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePayment(method.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Support Contacts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Support Contacts
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage support contact information
                </p>
              </div>
              <Button onClick={() => { resetContactForm(); setContactDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supportContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium capitalize">{contact.type}</TableCell>
                      <TableCell>{contact.value}</TableCell>
                      <TableCell>{contact.label || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          contact.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {contact.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditContact(contact)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Payment Method Dialog */}
        <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPayment ? "Edit" : "Add"} Payment Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={paymentForm.name}
                  onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                  placeholder="e.g., Orange Money"
                />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  value={paymentForm.account_number}
                  onChange={(e) => setPaymentForm({ ...paymentForm, account_number: e.target.value })}
                  placeholder="e.g., 079926121"
                />
              </div>
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input
                  value={paymentForm.account_name}
                  onChange={(e) => setPaymentForm({ ...paymentForm, account_name: e.target.value })}
                  placeholder="e.g., Mega Odds"
                />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select
                  value={paymentForm.icon}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={paymentForm.is_active}
                  onCheckedChange={(checked) => setPaymentForm({ ...paymentForm, is_active: checked })}
                />
              </div>
              <Button onClick={handleSavePayment} className="w-full">
                {editingPayment ? "Update" : "Add"} Payment Method
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Support Contact Dialog */}
        <Dialog open={contactDialog} onOpenChange={setContactDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingContact ? "Edit" : "Add"} Support Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={contactForm.type}
                  onValueChange={(value) => setContactForm({ ...contactForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  value={contactForm.value}
                  onChange={(e) => setContactForm({ ...contactForm, value: e.target.value })}
                  placeholder="e.g., +232 79 926121"
                />
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={contactForm.label}
                  onChange={(e) => setContactForm({ ...contactForm, label: e.target.value })}
                  placeholder="e.g., WhatsApp Support"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={contactForm.is_active}
                  onCheckedChange={(checked) => setContactForm({ ...contactForm, is_active: checked })}
                />
              </div>
              <Button onClick={handleSaveContact} className="w-full">
                {editingContact ? "Update" : "Add"} Support Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminPaymentsPage;
